<?php
/**
 * Channel class.
 *
 * Handles YouTube channel-related data operations.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Data/Entities
 */

namespace TubeBay\Data\Entities;

use TubeBay\Helper\Settings;
use TubeBay\Data\Entities\Video;
use TubeBay\Data\VideoRepository;

/**
 * Channel class.
 *
 * Handles YouTube channel-related data operations.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Data/Entities
 */
class Channel {

	/**
	 * Thumbnail sizes YouTube may return, best first.
	 *
	 * @since 1.4.0
	 * @var   string[]
	 */
	const THUMBNAIL_CHAIN = array( 'maxres', 'standard', 'high', 'medium', 'default' );

	/**
	 * Most IDs videos.list accepts in one request.
	 *
	 * @since 1.4.0
	 * @var   int
	 */
	const VIDEOS_LIST_BATCH = 50;

	/**
	 * Most assigned-but-missing video IDs fetched during a single sync.
	 *
	 * Each batch of 50 costs 1 quota unit, so 500 IDs is at most 10 units.
	 *
	 * @since 1.4.0
	 * @var   int
	 */
	const BACKFILL_LIMIT = 500;

	/**
	 * YouTube API key.
	 *
	 * @var string
	 */
	private $api_key;

	/**
	 * YouTube channel ID.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $channel_id;

	/**
	 * OAuth Refresh Token.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $refresh_token;

	/**
	 * Connection method: api or oauth.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $method = 'api';

	/**
	 * Constructor.
	 *
	 * @param array $data {
	 *     Optional. Data to initialize the channel.
	 *
	 *     @type string $api_key    YouTube API key.
	 *     @type string $channel_id YouTube channel ID.
	 * }
	 */
	public function __construct( $data = array() ) {
		if ( empty( $data ) ) {
			$this->api_key       = Settings::get_api_key();
			$this->channel_id    = Settings::get_channel_id();
			$this->refresh_token = Settings::get_refresh_token();
			$this->method        = Settings::get_connection_method();
			return;
		}

		$this->method = ! empty( $data['connection_method'] ) ? $data['connection_method'] : 'api';

		if ( 'oauth' === $this->method ) {
			$this->refresh_token = ! empty( $data['refresh_token'] ) ? $data['refresh_token'] : '';
			$this->channel_id    = ! empty( $data['channel_id'] ) ? $data['channel_id'] : '';
			$this->api_key       = '';
		} else {
			$this->api_key       = ! empty( $data['api_key'] ) ? $data['api_key'] : '';
			$this->channel_id    = ! empty( $data['channel_id'] ) ? $data['channel_id'] : '';
			$this->refresh_token = '';
		}
	}

	/**
	 * Check if the API is correctly configured.
	 *
	 * @return bool True if configured, false otherwise.
	 */
	public function is_configured() {
		if ( 'oauth' === $this->method ) {
			// OAuth mode strictly requires the refresh token for operation.
			// channel_id is optional during discovery but usually required for fetching videos.
			return ! empty( $this->refresh_token );
		}

		// Manual API Mode requires both the key and the specific channel ID.
		return ! empty( $this->api_key ) && ! empty( $this->channel_id );
	}

	/**
	 * Fetch and return the latest 50 videos from the channel.
	 * Wraps around the transient cache.
	 *
	 * @param bool $force_refresh Whether to force fresh data from the API.
	 * @return Video[]|\WP_Error
	 */
	public function get_latest_videos( $force_refresh = false ) {
		if ( ! $this->is_configured() ) {
			return new \WP_Error( 'not_configured', __( 'TubeBay API Key or Channel ID is missing.', 'tubebay' ) );
		}

		$transient_key = 'tubebay_videos_cache_' . $this->channel_id;

		if ( ! $force_refresh ) {
			$cached = get_transient( $transient_key );
			if ( false !== $cached && is_array( $cached ) ) {
				tubebay_log( 'get_latest_videos: Returning cached videos', 'debug' );
				$videos = array();
				foreach ( $cached as $v ) {
					$videos[] = new Video( $v );
				}
				return $videos;
			}
		}

		tubebay_log( 'get_latest_videos: Fetching fresh videos from API', 'info' );
		// Need to fetch fresh data.
		$videos = $this->fetch_videos_from_api();

		if ( is_wp_error( $videos ) ) {
			tubebay_log( 'get_latest_videos: Failed to fetch videos - ' . $videos->get_error_message(), 'error' );
			return $videos;
		}

		// Cache the raw array format.
		$to_cache = array();
		foreach ( $videos as $video ) {
			$to_cache[] = $video->to_array();
		}

		set_transient( $transient_key, $to_cache, Settings::get_cache_duration() );
		Settings::set_last_sync_time( time() );

		// Fill the video table (duration, upload date, full description). Never fails the sync.
		$this->enrich_video_table( $videos );

		return $videos;
	}

	/**
	 * Get a valid access token. Requests a new one from the connector if expired.
	 *
	 * @return string|false Valid access token or false on failure.
	 */
	private function get_access_token() {
		if ( empty( $this->refresh_token ) ) {
			return false;
		}

		$access_token  = Settings::get( 'access_token' );
		$token_expires = (int) Settings::get( 'token_expires' );

		// Add a 5-minute buffer to expiration check
		if ( ! empty( $access_token ) && $token_expires > ( time() + 300 ) ) {
			return $access_token;
		}

		tubebay_log( 'get_access_token: Token expired or missing, requesting new one from connector', 'info' );

		// Request new access token from the connector server.
		$connector_url = apply_filters( 'tubebay_oauth_proxy_url', 'https://wpanchorbay.com/oauth/index.php' );
		$response      = wp_remote_post(
			$connector_url,
			array(
				'body'    => array(
					'action'        => 'refresh',
					'refresh_token' => $this->refresh_token,
				),
				'timeout' => 15,
			)
		);

		if ( is_wp_error( $response ) ) {
			tubebay_log( 'get_access_token: Connector request failed - ' . $response->get_error_message(), 'error' );
			return false;
		}

		$raw_body = wp_remote_retrieve_body( $response );
		$body     = json_decode( $raw_body, true );

		if ( empty( $body['success'] ) || empty( $body['data']['access_token'] ) ) {
			$response_code = wp_remote_retrieve_response_code( $response );
			$error_msg     = isset( $body['message'] ) ? sanitize_text_field( $body['message'] ) : 'Unknown error';
			tubebay_log( "get_access_token: Connector request failed. Response code: {$response_code}. Error: {$error_msg}", 'error' );
			return false;
		}

		$new_access_token = $body['data']['access_token'];
		// Default to 1 hour expiration if expires_in not provided
		$expires_in = isset( $body['data']['expires_in'] ) ? (int) $body['data']['expires_in'] : 3599;
		$expires_at = time() + $expires_in;

		Settings::set( 'access_token', $new_access_token );
		Settings::set( 'token_expires', $expires_at );

		tubebay_log( 'get_access_token: Successfully refreshed access token', 'info' );

		return $new_access_token;
	}

	/**
	 * Build common YouTube API request arguments.
	 *
	 * @return array
	 */
	private function get_api_request_args() {
		$args = array( 'headers' => array( 'Accept' => 'application/json' ) );

		if ( ! empty( $this->refresh_token ) ) {
			$access_token = $this->get_access_token();
			if ( $access_token ) {
				$args['headers']['Authorization'] = 'Bearer ' . $access_token;
			}
		}

		/**
		 * Filter the YouTube API request arguments (headers, timeout, etc.).
		 * Pro can add custom headers or modify request params.
		 *
		 * @since 1.1.0
		 * @param array $args The request args.
		 */
		return apply_filters( 'tubebay_youtube_api_args', $args );
	}

	/**
	 * Perform the actual API call to YouTube.
	 * Phase 1 format.
	 *
	 * @return Video[]|\WP_Error Array of Video objects or a WP_Error on failure.
	 */
	private function fetch_videos_from_api() {
		// 1. Get the uploads playlist ID.
		tubebay_log( 'fetch_videos_from_api: Requesting channel details for uploads playlist', 'debug' );
		$args = array(
			'part' => 'snippet,contentDetails',
		);

		// If we don't have a channel ID yet but we are using OAuth, ask Google for "mine"
		if ( empty( $this->channel_id ) && 'oauth' === $this->method ) {
			$args['mine'] = 'true';
		} else {
			$args['id'] = $this->channel_id;
		}

		if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
			$args['key'] = $this->api_key;
		}

		$channel_url = add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/channels' );

		$channel_response = wp_remote_get( $channel_url, $this->get_api_request_args() );

		if ( is_wp_error( $channel_response ) ) {
			tubebay_log( 'fetch_videos_from_api: Network error fetching channel details - ' . $channel_response->get_error_message(), 'error' );
			return $channel_response;
		}

		$channel_body = json_decode( wp_remote_retrieve_body( $channel_response ), true );

		if ( isset( $channel_body['error'] ) ) {
			tubebay_log( 'fetch_videos_from_api: API error fetching channel details - ' . ( $channel_body['error']['message'] ?? 'Unknown Error' ), 'error' );
			return new \WP_Error( 'api_error', $channel_body['error']['message'] ?? 'Unknown API Error' );
		}

		if ( empty( $channel_body['items'][0]['contentDetails']['relatedPlaylists']['uploads'] ) ) {
			tubebay_log( 'fetch_videos_from_api: No uploads playlist found', 'error' );
			return new \WP_Error( 'no_uploads_playlist', __( 'Could not find the uploads playlist for this channel.', 'tubebay' ) );
		}

		$channel_data        = $channel_body['items'][0];
		$uploads_playlist_id = $channel_data['contentDetails']['relatedPlaylists']['uploads'];

		// Sync channel snippet info.
		if ( ! empty( $channel_data['snippet'] ) ) {
			$snippet = $channel_data['snippet'];
			Settings::set( 'channel_name', $snippet['title'] ?? '' );
			Settings::set( 'thumbnails_default', $snippet['thumbnails']['default']['url'] ?? '' );
			Settings::set( 'thumbnails_medium', $snippet['thumbnails']['medium']['url'] ?? '' );
			tubebay_log( 'fetch_videos_from_api: Synced channel details: ' . ( $snippet['title'] ?? 'no title' ), 'debug' );
		}

		// 2. Get up to 50 videos from the uploads playlist.
		tubebay_log( "fetch_videos_from_api: Fetching videos from playlist {$uploads_playlist_id}", 'debug' );
		$args = array(
			'playlistId' => $uploads_playlist_id,
			'part'       => 'snippet',
			'maxResults' => 50,
		);

		if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
			$args['key'] = $this->api_key;
		}

		$playlist_url = add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/playlistItems' );

		$playlist_response = wp_remote_get( $playlist_url, $this->get_api_request_args() );

		if ( is_wp_error( $playlist_response ) ) {
			tubebay_log( 'fetch_videos_from_api: Network error fetching playlist items - ' . $playlist_response->get_error_message(), 'error' );
			return $playlist_response;
		}

		$playlist_body = json_decode( wp_remote_retrieve_body( $playlist_response ), true );

		if ( isset( $playlist_body['error'] ) ) {
			tubebay_log( 'fetch_videos_from_api: API error fetching playlist items - ' . ( $playlist_body['error']['message'] ?? 'Unknown Error' ), 'error' );
			return new \WP_Error( 'api_error', $playlist_body['error']['message'] ?? 'Unknown API Error' );
		}

		if ( empty( $playlist_body['items'] ) ) {
			tubebay_log( 'fetch_videos_from_api: Playlist is empty', 'info' );
			return array();
		}

		// 3. Map to Entity.
		$videos = array();
		foreach ( $playlist_body['items'] as $item ) {
			$snippet = $item['snippet'];

			$thumb_url = self::pick_thumbnail_url( $snippet['thumbnails'] ?? array() );

			// Real video ID is stored in snippet.resourceId.videoId for playlistItems.
			$videos[] = new Video(
				array(
					'id'            => $snippet['resourceId']['videoId'] ?? '',
					'title'         => $snippet['title'] ?? '',
					'thumbnail_url' => $thumb_url,
					'published_at'  => $snippet['publishedAt'] ?? '',
					'description'   => $snippet['description'] ?? '',
				)
			);
		}

		return $videos;
	}

	/**
	 * Pick the best thumbnail URL from a YouTube `thumbnails` object.
	 *
	 * Order: maxres, standard, high, medium, default. Sizes that are missing
	 * or have an empty URL are skipped.
	 *
	 * @since 1.4.0
	 * @param mixed $thumbnails The `snippet.thumbnails` value from the API.
	 * @return string The URL, or an empty string if there is none.
	 */
	public static function pick_thumbnail_url( $thumbnails ) {
		if ( ! is_array( $thumbnails ) ) {
			return '';
		}

		foreach ( self::THUMBNAIL_CHAIN as $size ) {
			if ( ! empty( $thumbnails[ $size ]['url'] ) && is_string( $thumbnails[ $size ]['url'] ) ) {
				return $thumbnails[ $size ]['url'];
			}
		}

		return '';
	}

	/**
	 * Turn a decoded `videos.list` (part=contentDetails,snippet) response into
	 * rows ready for VideoRepository::upsert_many().
	 *
	 * Pure: no HTTP, no database. `snippet.publishedAt` here is the real upload
	 * date (the playlist item's publishedAt is when it was added to a playlist).
	 *
	 * @since 1.4.0
	 * @param mixed  $body                Decoded JSON body.
	 * @param string $fallback_channel_id Used when an item has no snippet.channelId.
	 * @return array[] Rows with video_id, channel_id, title, description,
	 *                 thumbnail_url, duration and uploaded_at.
	 */
	public static function parse_videos_list_response( $body, $fallback_channel_id = '' ) {
		$rows = array();

		if ( ! is_array( $body ) || empty( $body['items'] ) || ! is_array( $body['items'] ) ) {
			return $rows;
		}

		foreach ( $body['items'] as $item ) {
			if ( ! is_array( $item ) || empty( $item['id'] ) || ! is_string( $item['id'] ) ) {
				continue;
			}

			$snippet = isset( $item['snippet'] ) && is_array( $item['snippet'] ) ? $item['snippet'] : array();
			$details = isset( $item['contentDetails'] ) && is_array( $item['contentDetails'] ) ? $item['contentDetails'] : array();

			$rows[] = array(
				'video_id'      => sanitize_text_field( $item['id'] ),
				'channel_id'    => sanitize_text_field( $snippet['channelId'] ?? $fallback_channel_id ),
				'title'         => sanitize_text_field( $snippet['title'] ?? '' ),
				'description'   => sanitize_textarea_field( $snippet['description'] ?? '' ),
				'thumbnail_url' => esc_url_raw( self::pick_thumbnail_url( $snippet['thumbnails'] ?? array() ) ),
				'duration'      => sanitize_text_field( $details['duration'] ?? '' ),
				'uploaded_at'   => sanitize_text_field( $snippet['publishedAt'] ?? '' ),
			);
		}

		return $rows;
	}

	/**
	 * Fetch duration, upload date and full description for a list of videos.
	 *
	 * One `videos.list` call (1 quota unit) per 50 IDs, authenticated exactly
	 * like the other calls in this class. Never throws: on a network or API
	 * error it logs, stops, and returns the rows gathered so far (possibly none).
	 *
	 * @since 1.4.0
	 * @param string[] $ids  Video IDs.
	 * @param int      $max  Most IDs to look up in this call.
	 * @return array[] Rows as returned by parse_videos_list_response().
	 */
	public function fetch_video_details( $ids, $max = self::BACKFILL_LIMIT ) {
		$ids  = array_slice( array_values( array_unique( array_filter( array_map( 'strval', (array) $ids ) ) ) ), 0, max( 0, (int) $max ) );
		$rows = array();

		if ( empty( $ids ) || ! $this->is_configured() ) {
			return $rows;
		}

		foreach ( array_chunk( $ids, self::VIDEOS_LIST_BATCH ) as $batch ) {
			$args = array(
				'part'       => 'contentDetails,snippet',
				'id'         => implode( ',', $batch ),
				'maxResults' => self::VIDEOS_LIST_BATCH,
			);

			if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
				$args['key'] = $this->api_key;
			}

			$response = wp_remote_get(
				add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/videos' ),
				$this->get_api_request_args()
			);

			if ( is_wp_error( $response ) ) {
				tubebay_log( 'fetch_video_details: Network error - ' . $response->get_error_message(), 'error' );
				break;
			}

			$body = json_decode( wp_remote_retrieve_body( $response ), true );

			if ( ! is_array( $body ) || isset( $body['error'] ) ) {
				tubebay_log( 'fetch_video_details: API error - ' . ( is_array( $body ) ? ( $body['error']['message'] ?? 'Unknown Error' ) : 'Invalid response' ), 'error' );
				break;
			}

			$rows = array_merge( $rows, self::parse_videos_list_response( $body, (string) $this->channel_id ) );
		}

		return $rows;
	}

	/**
	 * Video IDs currently assigned to any product.
	 *
	 * Reads `_tubebay_video_ids` (JSON list of objects or bare IDs) and the
	 * legacy `_tubebay_video_id` with a single query. Non-YouTube entries are
	 * ignored.
	 *
	 * @since 1.4.0
	 * @return string[] Unique IDs.
	 */
	public static function get_assigned_video_ids() {
		global $wpdb;

		$values = $wpdb->get_col( "SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key IN ( '_tubebay_video_ids', '_tubebay_video_id' )" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Read-only lookup of our own meta keys, no user input.

		$ids = array();

		foreach ( (array) $values as $value ) {
			$decoded = json_decode( (string) $value, true );

			if ( is_array( $decoded ) ) {
				foreach ( $decoded as $entry ) {
					if ( is_array( $entry ) ) {
						if ( isset( $entry['type'] ) && 'youtube' !== $entry['type'] ) {
							continue;
						}
						$entry = $entry['id'] ?? '';
					}
					if ( is_string( $entry ) && '' !== $entry ) {
						$ids[ $entry ] = true;
					}
				}
			} elseif ( is_string( $value ) && '' !== $value ) {
				$ids[ $value ] = true; // Legacy single ID.
			}
		}

		return array_map( 'strval', array_keys( $ids ) );
	}

	/**
	 * After a sync: refresh the table rows for the synced videos and backfill
	 * assigned videos the table does not have yet.
	 *
	 * Swallows every failure so the sync result is never affected.
	 *
	 * @since 1.4.0
	 * @param Video[] $videos Videos returned by the playlist fetch.
	 * @return void
	 */
	private function enrich_video_table( $videos ) {
		try {
			$ids = wp_list_pluck( (array) $videos, 'id' );

			// Assigned IDs that are not in the table (older than the latest 50 uploads).
			$assigned_missing = array_slice( VideoRepository::missing_ids( self::get_assigned_video_ids() ), 0, self::BACKFILL_LIMIT );

			// Playlist IDs are always refreshed; the cap applies to the backfill part only.
			$ids  = array_values( array_unique( array_merge( array_map( 'strval', $ids ), $assigned_missing ) ) );
			$rows = $this->fetch_video_details( $ids, count( $ids ) );

			if ( ! empty( $rows ) ) {
				VideoRepository::upsert_many( $rows );
			}
		} catch ( \Throwable $e ) {
			tubebay_log( 'enrich_video_table: ' . $e->getMessage(), 'error' );
		}
	}

	/**
	 * Fetch and store details for those of the given IDs the table lacks.
	 *
	 * Used by search so existing rows (with duration and a full description)
	 * are never overwritten by thinner search data. Never throws; if the
	 * lookup fails the IDs stay missing and the next sync backfills them.
	 *
	 * @since 1.4.0
	 * @param string[] $ids Video IDs.
	 * @return void
	 */
	private function enrich_video_table_for_ids( $ids ) {
		try {
			$missing = VideoRepository::missing_ids( $ids );

			if ( empty( $missing ) ) {
				return;
			}

			$rows = $this->fetch_video_details( $missing, self::VIDEOS_LIST_BATCH );

			if ( ! empty( $rows ) ) {
				VideoRepository::upsert_many( $rows );
			}
		} catch ( \Throwable $e ) {
			tubebay_log( 'enrich_video_table_for_ids: ' . $e->getMessage(), 'error' );
		}
	}

	/**
	 * Search and sort videos using the YouTube Search API.
	 * Supports pagination via pageToken.
	 *
	 * @param string $query       Search term.
	 * @param string $sort        Sorting order ('date_desc', 'date_asc', 'title_asc', 'title_desc', 'view_count').
	 * @param string $page_token  Next page token.
	 * @param int    $limit       Max results per request (1-50).
	 * @return array|\WP_Error    Array with 'videos' (Video[]) and 'next_page_token' (string|null).
	 */
	public function search_videos( $query = '', $sort = 'date_desc', $page_token = '', $limit = 50 ) {
		if ( ! $this->is_configured() ) {
			return new \WP_Error( 'not_configured', __( 'TubeBay API Key or Channel ID is missing.', 'tubebay' ) );
		}

		// Map our internal sort keys to YouTube API 'order'.
		$order = 'date'; // Default: Resources are sorted in reverse chronological order.
		switch ( $sort ) {
			case 'date_desc':
			case 'date_asc': // YouTube Search API doesn't support proper chronological ascending, so we fallback.
				$order = 'date';
				break;
			case 'title_asc':
			case 'title_desc':
				$order = 'title';
				break;
			case 'view_count':
				$order = 'viewCount';
				break;
			default:
				$order = 'date';
				break;
		}

		$args = array(
			'channelId'  => $this->channel_id,
			'part'       => 'snippet',
			'type'       => 'video', // Limit to videos only.
			'maxResults' => max( 1, min( (int) $limit, 50 ) ),
			'order'      => $order,
		);

		if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
			$args['key'] = $this->api_key;
		}

		if ( ! empty( $query ) ) {
			$args['q'] = sanitize_text_field( $query );
		}

		if ( ! empty( $page_token ) ) {
			$args['pageToken'] = sanitize_text_field( $page_token );
		}

		$search_url = add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/search' );

		// Never log the API key; redaction is a backstop, but drop it at the source too.
		$loggable_args = array_diff_key( $args, array( 'key' => '' ) );
		tubebay_log( 'search_videos: Querying YouTube search API. URL params: ' . wp_json_encode( $loggable_args ), 'debug' );

		$response = wp_remote_get( $search_url, $this->get_api_request_args() );

		if ( is_wp_error( $response ) ) {
			tubebay_log( 'search_videos: Network error - ' . $response->get_error_message(), 'error' );
			return $response;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $body['error'] ) ) {
			tubebay_log( 'search_videos: API error - ' . ( $body['error']['message'] ?? 'Unknown Error' ), 'error' );
			return new \WP_Error( 'api_error', $body['error']['message'] ?? 'Unknown API Error' );
		}

		$videos = array();
		if ( ! empty( $body['items'] ) ) {
			foreach ( $body['items'] as $item ) {
				$snippet = $item['snippet'];

				$thumb_url = self::pick_thumbnail_url( $snippet['thumbnails'] ?? array() );

				// In Search API, ID is in id.videoId.
				$video_id = $item['id']['videoId'] ?? '';

				if ( empty( $video_id ) ) {
					continue; // Skip rare cases where it's not a video.
				}

				$videos[] = new Video(
					array(
						'id'            => $video_id,
						'title'         => $snippet['title'] ?? '',
						'thumbnail_url' => $thumb_url,
						'published_at'  => $snippet['publishedAt'] ?? '',
						'description'   => $snippet['description'] ?? '',
					)
				);
			}
		}

		// Search API reverse sort fix
		// YouTube API doesn't support reverse sorts for title or date ascending natively.
		// We'll flip the array manually for the specific page if requested.
		if ( 'date_asc' === $sort || 'title_desc' === $sort ) {
			$videos = array_reverse( $videos );
		}

		// Record videos the table has not seen yet, with real duration and upload date.
		$this->enrich_video_table_for_ids( wp_list_pluck( $videos, 'id' ) );

		$next_page_token = $body['nextPageToken'] ?? null;

		return array(
			'videos'          => $videos,
			'next_page_token' => $next_page_token,
		);
	}


	/**
	 * Fetch channel details (like title) from the API.
	 *
	 * @return array|\WP_Error
	 */
	public function get_channel_details() {
		if ( ! $this->is_configured() ) {
			return new \WP_Error( 'not_configured', __( 'TubeBay API Key or Channel ID is missing.', 'tubebay' ) );
		}

		tubebay_log( 'get_channel_details: Fetching fresh details from API', 'info' );

		$args = array(
			'part' => 'snippet',
		);

		if ( empty( $this->channel_id ) && ! empty( $this->refresh_token ) ) {
			$args['mine'] = 'true';
		} else {
			$args['id'] = $this->channel_id;
		}

		if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
			$args['key'] = $this->api_key;
		}

		$channel_url = add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/channels' );

		$channel_response = wp_remote_get( $channel_url, $this->get_api_request_args() );

		if ( is_wp_error( $channel_response ) ) {
			tubebay_log( 'get_channel_details: Network error fetching details - ' . $channel_response->get_error_message(), 'error' );
			return $channel_response;
		}

		$channel_body = json_decode( wp_remote_retrieve_body( $channel_response ), true );

		if ( isset( $channel_body['error'] ) ) {
			tubebay_log( 'get_channel_details: API error - ' . ( $channel_body['error']['message'] ?? 'Unknown API Error' ), 'error' );
			return new \WP_Error( 'api_error', $channel_body['error']['message'] ?? 'Unknown API Error' );
		}

		if ( empty( $channel_body['items'][0]['snippet'] ) ) {
			tubebay_log( 'get_channel_details: Could not find channel snippet', 'error' );
			return new \WP_Error( 'api_error', __( 'Could not fetch channel details.', 'tubebay' ) );
		}

		$snippet    = $channel_body['items'][0]['snippet'];
		$channel_id = $channel_body['items'][0]['id'] ?? $this->channel_id;

		tubebay_log( 'get_channel_details: Channel details fetched successfully', 'debug' );
		tubebay_log( 'get_channel_details: Channel details - ' . wp_json_encode( $snippet ), 'debug' );

		$details = array(
			'channel_id'         => $channel_id,
			'title'              => $snippet['title'] ?? '',
			'description'        => $snippet['description'] ?? '',
			'thumbnails_default' => $snippet['thumbnails']['default']['url'] ?? '',
			'thumbnails_medium'  => $snippet['thumbnails']['medium']['url'] ?? '',
		);

		tubebay_log( 'get_channel_details: Success, setting transient cache', 'debug' );
		// Results are not cached locally for now.

		return $details;
	}

	/**
	 * Test the connection to YouTube using current credentials.
	 * Does NOT modify any stored settings — purely a read-only check.
	 *
	 * @return array|\WP_Error  Channel details array on success, WP_Error on failure.
	 */
	public function test_connection() {
		if ( ! $this->is_configured() ) {
			return new \WP_Error( 'not_configured', __( 'API Key or Channel ID is missing.', 'tubebay' ) );
		}

		if ( 'oauth' === $this->method ) {
			return $this->test_oauth_connection();
		}

		$details = $this->get_channel_details();

		if ( is_wp_error( $details ) ) {
			return $details;
		}

		return $details;
	}

	/**
	 * Test the OAuth connection using the refresh token.
	 *
	 * @return array|\WP_Error
	 */
	public function test_oauth_connection() {
		tubebay_log( 'Testing OAuth connection...', 'info' );

		// 1. Force token generation/refresh to prove the proxy & token work
		$token = $this->get_access_token();
		if ( ! $token ) {
			return new \WP_Error( 'oauth_failed', __( 'Failed to validate OAuth connection. Could not generate access token.', 'tubebay' ) );
		}

		// 2. Fetch the channel details.
		// Since channel_id might be empty initially, get_channel_details() will safely use mine=true
		$details = $this->get_channel_details();

		if ( is_wp_error( $details ) ) {
			return $details;
		}

		// 3. Populate the class instance with the newly discovered channel ID
		if ( empty( $this->channel_id ) && ! empty( $details['channel_id'] ) ) {
			$this->channel_id = $details['channel_id'];
		}

		return $details;
	}

	/**
	 * Reconnect: save the current credentials to Settings and re-test.
	 *
	 * @return true|\WP_Error
	 */
	public function reconnect() {
		Settings::set( 'api_key', $this->api_key );
		Settings::set( 'channel_id', $this->channel_id );

		return $this->test_connection();
	}

	/**
	 * Disconnect: clear connection state in Settings.
	 *
	 * @return void
	 */
	public function disconnect() {
		Settings::set( 'connection_status', 'disconnected' );
		Settings::set( 'channel_name', '' );
	}
}
