<?php
/**
 * Fired when the user clicks "Delete" for the plugin.
 *
 * @since      1.0.0
 * @package    TubeBay
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

define( 'TUBEBAY_OPTION_PREFIX', 'tubebay_' );

tubebay_run_uninstall();

/**
 * The main controller function for the uninstallation process.
 *
 * @since  1.0.0
 * @return void
 */
function tubebay_run_uninstall() {
	// Only proceed if user opted in to delete all data.
	$delete_all = get_option( TUBEBAY_OPTION_PREFIX . 'advanced_deleteAllOnUninstall', false );

	if ( ! $delete_all ) {
		return;
	}

	tubebay_delete_plugin_options();
	tubebay_delete_product_meta();
	tubebay_delete_transients();
	tubebay_remove_capabilities();
	tubebay_unschedule_cron();
}

/**
 * Delete all plugin options (each stored as tubebay_{key}).
 *
 * @since  1.0.0
 * @return void
 */
function tubebay_delete_plugin_options() {
	global $wpdb;

	// Delete all options starting with our prefix.
	$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
			$wpdb->esc_like( TUBEBAY_OPTION_PREFIX ) . '%'
		)
	);

	// Also delete the legacy serialized option if it exists.
	delete_option( 'tubebay' );
}

/**
 * Delete all TubeBay product meta from all posts.
 *
 * @since  1.0.0
 * @return void
 */
function tubebay_delete_product_meta() {
	global $wpdb;

	$meta_keys = array(
		'_tubebay_video_id',
		'_tubebay_video_title',
		'_tubebay_video_thumbnail',
		'_tubebay_display_location',
		'_tubebay_muted_autoplay',
	);

	foreach ( $meta_keys as $key ) {
		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"DELETE FROM {$wpdb->postmeta} WHERE meta_key = %s",
				$key
			)
		);
	}
}

/**
 * Delete all TubeBay transients.
 *
 * @since  1.0.0
 * @return void
 */
function tubebay_delete_transients() {
	global $wpdb;

	$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
			$wpdb->esc_like( '_transient_tubebay_' ) . '%',
			$wpdb->esc_like( '_transient_timeout_tubebay_' ) . '%'
		)
	);
}

/**
 * Remove Custom Capabilities.
 *
 * @since  1.0.0
 * @return void
 */
function tubebay_remove_capabilities() {
	$editable_roles = get_editable_roles();

	foreach ( $editable_roles as $role_name => $role_info ) {
		$role = get_role( $role_name );
		if ( $role && $role->has_cap( 'manage_tubebay' ) ) {
			$role->remove_cap( 'manage_tubebay' );
		}
	}
}

/**
 * Unschedule all TubeBay cron events.
 *
 * @since  1.0.0
 * @return void
 */
function tubebay_unschedule_cron() {
	$timestamp = wp_next_scheduled( 'tubebay_daily_sync_event' );
	if ( $timestamp ) {
		wp_unschedule_event( $timestamp, 'tubebay_daily_sync_event' );
	}
}
