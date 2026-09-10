<?php
/**
 * Runs one-time data migrations when the plugin version changes.
 *
 * @since      1.3.2
 * @package    TubeBay
 * @subpackage TubeBay/Core
 */

namespace TubeBay\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use TubeBay\Helper\Settings;

/**
 * Runs one-time data migrations when the plugin version changes.
 *
 * WordPress does NOT fire register_activation_hook() on an update — it only
 * runs on activation — so Activator::activate() cannot be relied on to reach
 * an existing install. Anything that has to change stored options between
 * releases belongs here.
 *
 * The stored version is a dedicated option (`tubebay_db_version`), not
 * TUBEBAY_VERSION: the constant advances on every release including ones with
 * no data change, and comparing against it would make each migration's gate
 * ambiguous. Activator seeds it on a fresh install so migrations never run
 * against defaults that were already written correctly.
 *
 * @since      1.3.2
 * @package    TubeBay
 * @subpackage TubeBay/Core
 * @author     sankarsan <wpanchorbay@gmail.com>
 */
class Upgrader {

	/**
	 * The option holding the schema/data version this site has been migrated to.
	 *
	 * @since 1.3.2
	 * @var   string
	 */
	const VERSION_OPTION = 'tubebay_db_version';

	/**
	 * The version every migration below has been applied through.
	 *
	 * Bump this only when adding a migration, not on every release.
	 *
	 * @since 1.3.2
	 * @var   string
	 */
	const TARGET_VERSION = '1.3.2';

	/**
	 * The single instance of the class.
	 *
	 * @since 1.3.2
	 * @var   Upgrader|null
	 */
	private static $instance = null;

	/**
	 * Get the singleton instance.
	 *
	 * @since 1.3.2
	 * @return Upgrader
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register hooks with the shared loader.
	 *
	 * Hooked to admin_init rather than plugins_loaded: migrations write
	 * options, and a frontend request should never carry that cost. Any admin page view after
	 * the update triggers it, which is unavoidable before an admin can change
	 * anything anyway.
	 *
	 * @since 1.3.2
	 * @param \TubeBay\Core\Plugin $plugin The plugin instance holding the loader.
	 * @return void
	 */
	public function run( $plugin ) {
		$plugin->get_loader()->add_action( 'admin_init', $this, 'maybe_upgrade' );
	}

	/**
	 * Run any migration this site has not had yet.
	 *
	 * @since 1.3.2
	 * @return void
	 */
	public function maybe_upgrade() {
		$from = get_option( self::VERSION_OPTION, '0' );

		if ( ! is_string( $from ) || '' === $from ) {
			$from = '0';
		}

		if ( version_compare( $from, self::TARGET_VERSION, '>=' ) ) {
			return;
		}

		tubebay_log( 'Upgrader: migrating stored data from version ' . $from, 'info' );

		if ( version_compare( $from, '1.3.2', '<' ) ) {
			self::migrate_to_1_3_2();
		}

		update_option( self::VERSION_OPTION, self::TARGET_VERSION );

		tubebay_log( 'Upgrader: migration complete, now at ' . self::TARGET_VERSION, 'info' );
	}

	/**
	 * Migrations introduced in 1.3.2.
	 *
	 * @since 1.3.2
	 * @return void
	 */
	private static function migrate_to_1_3_2() {
		self::migrate_video_position();
		self::migrate_enum_values();
	}

	/*
	 * There is deliberately NO show_controls migration, though the default
	 * flipped from false to true in 1.3.2.
	 *
	 * update_option( $key, false ) on an option that does not exist yet writes
	 * NOTHING — it compares the new value against get_option()'s `false` for a
	 * missing row, finds them identical and returns early. Verified against
	 * this WordPress install, not assumed. So 1.2.0's Activator never created
	 * a tubebay_show_controls row despite seeding `false`, and those sites now
	 * read the corrected default automatically.
	 *
	 * That leaves exactly one way a falsy row can exist: the value was truthy
	 * and someone turned it off. A falsy→true migration would therefore only
	 * ever override a deliberate choice, never repair a stale default.
	 */

	/**
	 * Replace the retired `video_position` value 'mixed' with 'last'.
	 *
	 * 'mixed' was accepted before 1.3.2 and is not in SettingsController's
	 * allow-list. Left in place it fails every settings save with a 400, which
	 * also traps the onboarding wizard, since video_position is one of the keys
	 * the wizard writes.
	 *
	 * SettingsController normalises the same value on write as well: an admin
	 * whose Settings tab was already open before the update still holds 'mixed'
	 * in memory and will POST it back.
	 *
	 * @since 1.3.2
	 * @return void
	 */
	private static function migrate_video_position() {
		if ( 'mixed' === get_option( Settings::PREFIX . 'video_position', '' ) ) {
			Settings::set( 'video_position', 'last' );
			tubebay_log( "Upgrader: video_position 'mixed' is retired, migrated to 'last'", 'info' );
		}
	}

	/**
	 * Bring stored enum fields back inside their allow-lists.
	 *
	 * Up to and including 1.2.0 none of these were validated on write —
	 * SettingsController ran the value through sanitize_text_field(), which is
	 * not validation, and stored whatever arrived. From 1.3.2 the REST endpoint
	 * validates the whole payload before it writes anything, so a site left
	 * holding an out-of-range value would fail EVERY settings save: the admin
	 * screen posts the complete settings object, so the bad field rides along
	 * with every request and rejects it.
	 *
	 * Each fallback preserves the behaviour the invalid value already had:
	 * connection_status only ever mattered as "is it exactly 'connected'", and
	 * Channel.php only branches on connection_method 'oauth', treating anything
	 * else as 'api'.
	 *
	 * @since 1.3.2
	 * @return void
	 */
	private static function migrate_enum_values() {
		$enums = array(
			'connection_status' => array(
				'allowed'  => array( 'connected', 'disconnected', 'failed', 'inactive' ),
				'fallback' => 'disconnected',
			),
			'connection_method' => array(
				'allowed'  => array( 'api', 'oauth' ),
				'fallback' => 'api',
			),
			'video_position'    => array(
				'allowed'  => array( 'first', 'last' ),
				'fallback' => 'last',
			),
		);

		global $wpdb;

		foreach ( $enums as $key => $enum ) {
			/*
			 * Ask the table, not get_option(). A missing row and a row holding
			 * NULL both come back as `false` from get_option(), and passing a
			 * `null` default cannot separate them either — but only the first
			 * is safe to skip. A NULL-valued connection_status row left in
			 * place would fail every settings save from 1.3.2 onward, which is
			 * the lockout this whole method exists to prevent.
			 */
			$option_name = Settings::PREFIX . $key;

			$exists = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$wpdb->options} WHERE option_name = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $wpdb->options is a core table name, not user input.
					$option_name
				)
			);

			// No row — get_option() serves the default, which is in range.
			if ( ! $exists ) {
				continue;
			}

			$stored = get_option( $option_name, '' );
			$value  = is_scalar( $stored ) ? (string) $stored : '';

			if ( in_array( $value, $enum['allowed'], true ) ) {
				continue;
			}

			Settings::set( $key, $enum['fallback'] );
			tubebay_log(
				'Upgrader: ' . $key . ' held out-of-range value ' . wp_json_encode( $stored )
					. ', migrated to ' . $enum['fallback'],
				'info'
			);
		}
	}
}
