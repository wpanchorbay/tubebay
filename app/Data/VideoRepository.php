<?php
/**
 * Storage for YouTube video metadata, one row per video.
 *
 * @since      1.4.0
 * @package    TubeBay
 * @subpackage TubeBay/Data
 */

namespace TubeBay\Data;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads and writes the `{prefix}tubebay_videos` table.
 *
 * The table is a cache of what the YouTube API returned (title, description,
 * duration and so on), keyed by video ID. Every read is safe to call before
 * the table exists — it returns an empty result rather than erroring — so a
 * caller can always fall back to whatever it had before the table existed.
 *
 * The table name is built from `$wpdb->prefix` on every call, never cached in
 * a property, so it stays correct across multisite switch_to_blog() calls.
 *
 * @since      1.4.0
 * @package    TubeBay
 * @subpackage TubeBay/Data
 * @author     sankarsan <wpanchorbay@gmail.com>
 */
class VideoRepository {

	/**
	 * The table name without the site prefix.
	 *
	 * @since 1.4.0
	 * @var   string
	 */
	const TABLE = 'tubebay_videos';

	/**
	 * Largest number of IDs put in a single IN() list.
	 *
	 * @since 1.4.0
	 * @var   int
	 */
	const SELECT_CHUNK = 500;

	/**
	 * Largest number of rows put in a single INSERT.
	 *
	 * Smaller than SELECT_CHUNK because descriptions are LONGTEXT and the
	 * whole statement has to fit in max_allowed_packet.
	 *
	 * @since 1.4.0
	 * @var   int
	 */
	const INSERT_CHUNK = 50;

	/**
	 * Per-request memo of whether each table exists, keyed by full table name.
	 *
	 * Keyed by table name (not a single flag) so a multisite
	 * switch_to_blog() cannot read another site's answer.
	 *
	 * @since 1.4.0
	 * @var   array<string, bool>
	 */
	private static $exists_cache = array();

	/**
	 * The full table name for the current site.
	 *
	 * @since 1.4.0
	 * @return string
	 */
	public static function table_name() {
		global $wpdb;

		return $wpdb->prefix . self::TABLE;
	}

	/**
	 * Whether the table exists on the current site.
	 *
	 * The answer is memoised for the request; ensure_table() and drop()
	 * keep the memo honest.
	 *
	 * @since 1.4.0
	 * @return bool
	 */
	public static function table_exists() {
		global $wpdb;

		$table = self::table_name();

		if ( ! isset( self::$exists_cache[ $table ] ) ) {
			$found = $wpdb->get_var(
				$wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) )
			);

			self::$exists_cache[ $table ] = ( $found === $table );
		}

		return self::$exists_cache[ $table ];
	}

	/**
	 * Create the table if it is missing. Idempotent and cheap once it exists.
	 *
	 * Runs dbDelta, so it also brings an older copy of the table up to the
	 * current definition if the columns ever change.
	 *
	 * @since 1.4.0
	 * @return void
	 */
	public static function ensure_table() {
		global $wpdb;

		if ( self::table_exists() ) {
			return;
		}

		if ( ! function_exists( 'dbDelta' ) ) {
			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		}

		$table           = self::table_name();
		$charset_collate = $wpdb->get_charset_collate();

		/*
		 * video_id is utf8mb4_bin on purpose: YouTube IDs are case-sensitive,
		 * and the table's default (case-insensitive) collation would treat
		 * "abcDEFghijk" and "ABCdefGHIJK" as the same primary key.
		 *
		 * dbDelta is picky: two spaces before PRIMARY KEY, one definition per
		 * line, and KEY (not INDEX) with the index name spelled out.
		 */
		$sql = "CREATE TABLE {$table} (
			video_id varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
			channel_id varchar(64) NOT NULL DEFAULT '',
			title text,
			description longtext,
			thumbnail_url text,
			duration varchar(32) NOT NULL DEFAULT '',
			duration_seconds int(10) unsigned NOT NULL DEFAULT 0,
			uploaded_at datetime DEFAULT NULL,
			synced_at datetime DEFAULT NULL,
			PRIMARY KEY  (video_id),
			KEY channel_id (channel_id)
		) {$charset_collate};";

		dbDelta( $sql );

		// Re-ask the database rather than assume dbDelta worked.
		unset( self::$exists_cache[ $table ] );
		self::table_exists();
	}

	/**
	 * Insert or update many videos at once.
	 *
	 * Each row is an array keyed by column name; only `video_id` is required.
	 * Rows without a valid video ID are skipped. If the same ID appears twice
	 * in one call the later row wins. Dates may be MySQL datetimes, any string
	 * strtotime() understands (RFC 3339 included), or Unix timestamps, and are
	 * stored as UTC. `synced_at` defaults to now; `duration_seconds` is derived
	 * from `duration` when not supplied.
	 *
	 * Creates the table first, so a cron sync that runs before anyone has
	 * visited wp-admin still works.
	 *
	 * @since 1.4.0
	 * @param array $rows List of rows keyed by column name.
	 * @return int Number of rows written (inserted or updated).
	 */
	public static function upsert_many( $rows ) {
		global $wpdb;

		if ( ! is_array( $rows ) || empty( $rows ) ) {
			return 0;
		}

		self::ensure_table();

		if ( ! self::table_exists() ) {
			return 0;
		}

		$now    = gmdate( 'Y-m-d H:i:s' );
		$values = array();

		foreach ( $rows as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}

			$video_id = isset( $row['video_id'] ) && is_scalar( $row['video_id'] ) ? trim( (string) $row['video_id'] ) : '';

			if ( ! self::is_valid_id( $video_id ) ) {
				continue;
			}

			$duration = self::text_field( $row, 'duration', 32 );

			if ( isset( $row['duration_seconds'] ) && is_numeric( $row['duration_seconds'] ) ) {
				$seconds = max( 0, (int) $row['duration_seconds'] );
			} else {
				$seconds = self::parse_duration( $duration );
			}

			$synced = self::normalize_datetime( isset( $row['synced_at'] ) ? $row['synced_at'] : null );

			// Keyed by ID so a duplicate inside the batch collapses to one row.
			$values[ $video_id ] = array(
				'video_id'         => $video_id,
				'channel_id'       => self::text_field( $row, 'channel_id', 64 ),
				'title'            => self::text_field( $row, 'title' ),
				'description'      => self::text_field( $row, 'description' ),
				'thumbnail_url'    => self::text_field( $row, 'thumbnail_url' ),
				'duration'         => $duration,
				'duration_seconds' => $seconds,
				'uploaded_at'      => self::normalize_datetime( isset( $row['uploaded_at'] ) ? $row['uploaded_at'] : null ),
				'synced_at'        => null === $synced ? $now : $synced,
			);
		}

		if ( empty( $values ) ) {
			return 0;
		}

		$table   = self::table_name();
		$written = 0;

		foreach ( array_chunk( array_values( $values ), self::INSERT_CHUNK ) as $chunk ) {
			$tuples = array();

			foreach ( $chunk as $v ) {
				$args = array(
					$v['video_id'],
					$v['channel_id'],
					$v['title'],
					$v['description'],
					$v['thumbnail_url'],
					$v['duration'],
					$v['duration_seconds'],
				);

				// NULL cannot go through a %s placeholder, so it gets its own literal format.
				if ( null === $v['uploaded_at'] ) {
					$args[]   = $v['synced_at'];
					$tuples[] = $wpdb->prepare( '(%s, %s, %s, %s, %s, %s, %d, NULL, %s)', $args ); // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- $args is an array.
				} else {
					$args[]   = $v['uploaded_at'];
					$args[]   = $v['synced_at'];
					$tuples[] = $wpdb->prepare( '(%s, %s, %s, %s, %s, %s, %d, %s, %s)', $args ); // phpcs:ignore WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- $args is an array.
				}
			}

			$sql = "INSERT INTO {$table} (video_id, channel_id, title, description, thumbnail_url, duration, duration_seconds, uploaded_at, synced_at) VALUES " // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is prefix + constant; values are prepared above.
				. implode( ', ', $tuples )
				. ' ON DUPLICATE KEY UPDATE channel_id = VALUES(channel_id), title = VALUES(title), description = VALUES(description), thumbnail_url = VALUES(thumbnail_url), duration = VALUES(duration), duration_seconds = VALUES(duration_seconds), uploaded_at = VALUES(uploaded_at), synced_at = VALUES(synced_at)';

			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- every value was prepared above.
			if ( false !== $wpdb->query( $sql ) ) {
				$written += count( $chunk );
			}
		}

		return $written;
	}

	/**
	 * Fetch stored rows for the given video IDs.
	 *
	 * Never errors: returns an empty array if the table is missing or no IDs
	 * match. IDs that are not in the table are simply absent from the result.
	 *
	 * @since 1.4.0
	 * @param array $ids Video IDs.
	 * @return array<string, array> Rows keyed by video_id. Each row is an
	 *                              associative array of the table's columns.
	 */
	public static function get_many( $ids ) {
		global $wpdb;

		$ids = self::clean_ids( $ids );

		if ( empty( $ids ) || ! self::table_exists() ) {
			return array();
		}

		$table  = self::table_name();
		$result = array();

		foreach ( array_chunk( $ids, self::SELECT_CHUNK ) as $chunk ) {
			$placeholders = implode( ', ', array_fill( 0, count( $chunk ), '%s' ) );

			$rows = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM {$table} WHERE video_id IN ({$placeholders})", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- table name is prefix + constant; $placeholders is only '%s' tokens.
					$chunk
				),
				ARRAY_A
			);

			if ( ! is_array( $rows ) ) {
				continue;
			}

			foreach ( $rows as $row ) {
				$result[ $row['video_id'] ] = $row;
			}
		}

		return $result;
	}

	/**
	 * Which of the given IDs have no row in the table.
	 *
	 * If the table is missing, every (valid) ID is missing.
	 *
	 * @since 1.4.0
	 * @param array $ids Video IDs.
	 * @return string[] IDs not present, in the order given, de-duplicated.
	 */
	public static function missing_ids( $ids ) {
		$ids = self::clean_ids( $ids );

		if ( empty( $ids ) ) {
			return array();
		}

		$found = self::get_many( $ids );

		return array_values( array_diff( $ids, array_keys( $found ) ) );
	}

	/**
	 * Remove every row but keep the table.
	 *
	 * @since 1.4.0
	 * @return void
	 */
	public static function truncate() {
		global $wpdb;

		if ( ! self::table_exists() ) {
			return;
		}

		$table = self::table_name();
		$wpdb->query( "TRUNCATE TABLE {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.SchemaChange -- table name is prefix + constant.
	}

	/**
	 * Drop the table.
	 *
	 * It is recreated by ensure_table() (Upgrader, Activator, or the next
	 * upsert_many()).
	 *
	 * @since 1.4.0
	 * @return void
	 */
	public static function drop() {
		global $wpdb;

		$table = self::table_name();
		$wpdb->query( "DROP TABLE IF EXISTS {$table}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.SchemaChange -- table name is prefix + constant.

		self::$exists_cache[ $table ] = false;
	}

	/**
	 * Whether a string looks like a YouTube video ID.
	 *
	 * Real IDs are 11 characters; the check is looser (6 to 20, the column
	 * width) so a format change on YouTube's side cannot silently drop rows.
	 *
	 * @since 1.4.0
	 * @param string $id Candidate ID.
	 * @return bool
	 */
	private static function is_valid_id( $id ) {
		return 1 === preg_match( '/^[A-Za-z0-9_-]{6,20}$/', $id );
	}

	/**
	 * Reduce a mixed list to unique, valid video IDs, order preserved.
	 *
	 * @since 1.4.0
	 * @param mixed $ids Candidate IDs.
	 * @return string[]
	 */
	private static function clean_ids( $ids ) {
		if ( ! is_array( $ids ) ) {
			return array();
		}

		$clean = array();

		foreach ( $ids as $id ) {
			if ( is_scalar( $id ) && self::is_valid_id( trim( (string) $id ) ) ) {
				$clean[ trim( (string) $id ) ] = true;
			}
		}

		return array_map( 'strval', array_keys( $clean ) );
	}

	/**
	 * Read a row field as a string, optionally truncated to a column width.
	 *
	 * @since 1.4.0
	 * @param array  $row    The row.
	 * @param string $key    Field name.
	 * @param int    $length Maximum length in characters, 0 for no limit.
	 * @return string
	 */
	private static function text_field( $row, $key, $length = 0 ) {
		$value = isset( $row[ $key ] ) && is_scalar( $row[ $key ] ) ? (string) $row[ $key ] : '';

		if ( $length > 0 && mb_strlen( $value ) > $length ) {
			$value = mb_substr( $value, 0, $length );
		}

		return $value;
	}

	/**
	 * Convert a date to a UTC MySQL datetime, or null if it is empty/invalid.
	 *
	 * @since 1.4.0
	 * @param mixed $value Unix timestamp, or a date string.
	 * @return string|null
	 */
	private static function normalize_datetime( $value ) {
		if ( null === $value || '' === $value || ! is_scalar( $value ) ) {
			return null;
		}

		if ( is_numeric( $value ) ) {
			$timestamp = (int) $value;
		} else {
			$timestamp = strtotime( (string) $value );
		}

		if ( false === $timestamp || $timestamp <= 0 ) {
			return null;
		}

		return gmdate( 'Y-m-d H:i:s', $timestamp );
	}

	/**
	 * Length in seconds of an ISO 8601 duration such as PT1H2M3S.
	 *
	 * @since 1.4.0
	 * @param string $duration ISO 8601 duration.
	 * @return int 0 when the string is empty or not a duration.
	 */
	private static function parse_duration( $duration ) {
		if ( ! preg_match( '/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/', $duration, $m ) ) {
			return 0;
		}

		return ( (int) ( $m[1] ?? 0 ) * DAY_IN_SECONDS )
			+ ( (int) ( $m[2] ?? 0 ) * HOUR_IN_SECONDS )
			+ ( (int) ( $m[3] ?? 0 ) * MINUTE_IN_SECONDS )
			+ (int) ( $m[4] ?? 0 );
	}
}
