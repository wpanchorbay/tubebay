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

	$protected = tubebay_protected_option_names();

	if ( empty( $protected ) ) {
		// Delete all options starting with our prefix.
		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( TUBEBAY_OPTION_PREFIX ) . '%'
			)
		);
	} else {
		/*
		 * Read the names first, then skip the protected ones. Building a
		 * NOT IN list would mean interpolating generated placeholders into the
		 * query string, and delete_option() keeps the options cache correct
		 * besides — this runs once, at uninstall, so the extra queries are free.
		 */
		$names = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( TUBEBAY_OPTION_PREFIX ) . '%'
			)
		);

		foreach ( (array) $names as $name ) {
			if ( in_array( $name, $protected, true ) ) {
				continue;
			}

			delete_option( $name );
		}
	}

	// Also delete the legacy serialized option if it exists.
	delete_option( 'tubebay' );
}

/**
 * Option names this uninstall must leave alone.
 *
 * Every TubeBay option shares the `tubebay_` prefix, add-ons included — so the
 * blanket prefix delete above also took `tubebay_license_key` and
 * `tubebay_license_status` with it. Uninstalling the FREE plugin with "delete
 * all data" enabled therefore destroyed the licence of a paid add-on that was
 * still installed and running, with no warning and no way back short of
 * re-entering the key.
 *
 * An add-on is expected to clean up after itself in its own uninstall.php, so
 * free simply steps around anything an active add-on claims here.
 *
 * @since  1.3.0
 * @return string[] Fully-prefixed option names to preserve.
 */
function tubebay_protected_option_names() {
	// NOTE: app/functions.php carries the same function for the runtime
	// "Delete All Data" path. WordPress loads this file without bootstrapping
	// the plugin, so it cannot be shared. Keep the two in step.
	$protected = array();

	// TUBEBAY_PRO_VERSION is defined only while the pro add-on is active, and
	// active plugins are loaded during this request — so this is true exactly
	// when there is still a licence worth protecting.
	if ( defined( 'TUBEBAY_PRO_VERSION' ) ) {
		$protected = array(
			TUBEBAY_OPTION_PREFIX . 'license_key',
			TUBEBAY_OPTION_PREFIX . 'license_status',
		);
	}

	/**
	 * Filter the options the free plugin's uninstall must not delete.
	 *
	 * Add-ons should append their own option names here rather than rely on
	 * the hardcoded list above.
	 *
	 * @since 1.3.0
	 * @param string[] $protected Fully-prefixed option names.
	 */
	$protected = apply_filters( 'tubebay_uninstall_protected_options', $protected );

	return array_values( array_unique( array_filter( array_map( 'strval', (array) $protected ) ) ) );
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
		'_tubebay_video_ids',
		'_tubebay_video_order',
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
	wp_clear_scheduled_hook( 'tubebay_daily_sync_event' );
}
