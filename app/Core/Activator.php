<?php
/**
 * Fired during plugin activation.
 *
 * @since      1.0.0
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
 * Fired during plugin activation.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Core
 * @author     sankarsan <wpanchorbay@gmail.com>
 */
class Activator {

	/**
	 * The main activation method.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public static function activate() {
		tubebay_log( 'Running Activator sequence', 'info' );

		/*
		 * Whether this is a first-ever activation — captured BEFORE the loop
		 * below writes any defaults, because afterwards the two cases are
		 * indistinguishable. connection_status has been seeded on every
		 * install since 1.0.0, so its absence means no TubeBay data exists.
		 */
		$is_fresh_install = false === get_option( Settings::PREFIX . 'connection_status' );

		tubebay_log( 'Activator: Setting default plugin options', 'debug' );
		foreach ( Settings::get_defaults() as $key => $value ) {
			if ( get_option( Settings::PREFIX . $key ) === false ) {
				Settings::set( $key, $value );
			}
		}

		/*
		 * Record the data version, so Upgrader never runs a migration against
		 * a fresh install whose defaults were just written correctly.
		 *
		 * Gated on $is_fresh_install, NOT on the option being absent: an
		 * existing pre-1.3.2 site that is deactivated and reactivated also has
		 * no version option, and stamping it current there would silently skip
		 * the migration it actually needs.
		 */
		if ( $is_fresh_install ) {
			update_option( Upgrader::VERSION_OPTION, Upgrader::TARGET_VERSION );
			tubebay_log( 'Activator: Fresh install, seeded data version ' . Upgrader::TARGET_VERSION, 'debug' );
		}

		// Flush rewrite rules.
		tubebay_log( 'Activator: Flushing rewrite rules', 'debug' );
		flush_rewrite_rules();

		// Secure the log directory.
		tubebay_log( 'Activator: Securing log directory', 'debug' );
		self::secure_log_directory();

		// Add custom capabilities.
		tubebay_log( 'Activator: Adding custom plugin capabilities', 'debug' );
		self::add_plugin_roles_and_capabilities();

		tubebay_log( 'Activator: Activation sequence complete', 'info' );
	}

	/**
	 * Secures the log directory by creating an .htaccess file and an index.php file.
	 *
	 * @since    1.0.0
	 * @access private
	 * @return void
	 */
	private static function secure_log_directory() {
		$upload_dir = wp_upload_dir();
		$log_dir    = $upload_dir['basedir'] . '/' . TUBEBAY_TEXT_DOMAIN . '-logs/';

		if ( ! is_dir( $log_dir ) ) {
			wp_mkdir_p( $log_dir );
			tubebay_log( 'Activator: Created log directory at ' . $log_dir, 'debug' );
		}

		// Shared helper writes the .htaccess + index.php access guards.
		tubebay_write_log_dir_guards( $log_dir );
	}

	/**
	 * Adds custom roles and capabilities required by the plugin.
	 *
	 * @since 1.0.0
	 * @access private
	 * @static
	 */
	private static function add_plugin_roles_and_capabilities() {
		$custom_capability = 'manage_tubebay';

		$admin_role = get_role( 'administrator' );
		if ( $admin_role && ! $admin_role->has_cap( $custom_capability ) ) {
			$admin_role->add_cap( $custom_capability );
			tubebay_log( 'Activator: Added capability ' . $custom_capability . ' to administrator role', 'info' );
		} else {
			tubebay_log( 'Activator: Capability ' . $custom_capability . ' already exists on administrator role', 'debug' );
		}
	}
}
