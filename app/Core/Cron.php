<?php
/**
 * Cron class.
 *
 * Handles WP-Cron scheduling for automatic daily sync.
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
use TubeBay\Data\Entities\Channel;

/**
 * Handles WP-Cron scheduling for automatic daily sync.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Core
 */
class Cron {

	/**
	 * The single instance of the class.
	 *
	 * @var Cron|null
	 * @since 1.0.0
	 */
	private static $instance = null;

	/**
	 * Cron hook name.
	 *
	 * @var string
	 * @since 1.0.0
	 */
	const HOOK_NAME = 'tubebay_daily_sync_event';

	/**
	 * Gets an instance of this object.
	 *
	 * @return Cron
	 * @since 1.0.0
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Initial hook registration.
	 *
	 * @param \TubeBay\Core\Plugin $plugin The plugin instance.
	 * @return void
	 * @since 1.0.0
	 */
	public function run( $plugin ) {
		$loader = $plugin->get_loader();

		// Register the action that actually performs the sync.
		$loader->add_action( self::HOOK_NAME, $this, 'do_daily_sync' );

		// Check and schedule if needed on plugin load/admin init etc.
		$loader->add_action( 'init', $this, 'check_and_schedule' );
	}

	/**
	 * Schedules the daily sync if auto_sync is enabled and not already scheduled.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function check_and_schedule() {
		$auto_sync = Settings::get( 'auto_sync', true );

		if ( $auto_sync ) {
			if ( ! wp_next_scheduled( self::HOOK_NAME ) ) {
				tubebay_log( 'Scheduling daily sync event', 'debug' );
				// Schedule to start at 3:00 AM local time or soon after.
				$timestamp = strtotime( '03:00:00' );

				// If 3:00 AM today has already passed, start tomorrow.
				if ( $timestamp < time() ) {
					$timestamp += DAY_IN_SECONDS;
				}

				/**
				 * Filter the cron start timestamp.
				 *
				 * @since 1.1.0
				 * @param int $timestamp Unix timestamp for the first run.
				 */
				$timestamp = apply_filters( 'tubebay_cron_start', $timestamp );

				/**
				 * Filter the cron recurrence interval.
				 *
				 * @since 1.1.0
				 * @param string $recurrence The recurrence ('daily', 'hourly', 'twicedaily', etc.).
				 */
				$recurrence = apply_filters( 'tubebay_cron_recurrence', 'daily' );

				wp_schedule_event( $timestamp, $recurrence, self::HOOK_NAME );
			}
		} else {
			// Unschedule if auto_sync is disabled.
			tubebay_log( 'Unscheduling daily sync event', 'debug' );
			wp_clear_scheduled_hook( self::HOOK_NAME );
		}
	}

	/**
	 * The callback function for the cron event.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function do_daily_sync() {
		tubebay_log( 'Running scheduled daily sync', 'info' );
		$channel = new Channel();

		if ( ! $channel->is_configured() ) {
			tubebay_log( 'Scheduled daily sync failed: Channel not configured', 'error' );
			return;
		}

		/**
		 * Fires before the daily sync runs.
		 * Pro can use this to prepare/flush caches or enqueue background work.
		 *
		 * @since 1.1.0
		 * @param Channel $channel The channel entity.
		 */
		do_action( 'tubebay_daily_sync', $channel );

		// Force refresh from API.
		$videos = $channel->get_latest_videos( true );

		/**
		 * Fires after the daily sync completes.
		 *
		 * @since 1.1.0
		 * @param Video[]|\WP_Error $videos The fetched videos (or error).
		 * @param Channel           $channel The channel entity.
		 */
		do_action( 'tubebay_daily_sync_complete', $videos, $channel );
	}
}
