<?php
/**
 * Fired during plugin deactivation.
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

/**
 * Fired during plugin deactivation.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Core
 * @author     sankarsan <wpanchorbay@gmail.com>
 */
class Deactivator {

	/**
	 * Fired during plugin deactivation.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public static function deactivate() {
		tubebay_log( 'Running Deactivator sequence', 'info' );
		self::remove_custom_capabilities();
		self::clear_cron_events();
	}

	/**
	 * Unschedule any pending cron events.
	 *
	 * @since 1.0.4
	 * @access private
	 * @return void
	 */
	private static function clear_cron_events() {
		wp_clear_scheduled_hook( 'tubebay_daily_sync_event' );
		tubebay_log( 'Deactivator: Cleared scheduled cron events', 'debug' );
	}

	/**
	 * Removes the custom plugin capabilities from all roles.
	 *
	 * @since 1.0.0
	 * @access private
	 * @return void
	 */
	private static function remove_custom_capabilities() {
		$roles             = get_editable_roles();
		$custom_capability = 'manage_tubebay';
		tubebay_log( 'Deactivator: Removing capability ' . $custom_capability . ' from all roles', 'info' );

		foreach ( $roles as $role_name => $role_info ) {
			$role = get_role( $role_name );
			if ( $role && $role->has_cap( $custom_capability ) ) {
				$role->remove_cap( $custom_capability );
				tubebay_log( 'Deactivator: Removed capability from role: ' . $role_name, 'debug' );
			}
		}

		tubebay_log( 'Deactivator: Capability removal complete', 'debug' );
	}
}
