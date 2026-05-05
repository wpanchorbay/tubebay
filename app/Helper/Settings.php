<?php
/**
 * The single Settings class for TubeBay.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Helper
 */

namespace TubeBay\Helper;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings class for the plugin.
 */
class Settings {

	/**
	 * The single instance of the class.
	 *
	 * @var Settings|null
	 * @since 1.0.0
	 */
	private static $instance = null;

	/**
	 * Option key prefix.
	 *
	 * @since 1.0.0
	 */
	const PREFIX = 'tubebay_';

	/**
	 * Default values for every setting.
	 * Every key here maps to wp_option "tubebay_{key}".
	 *
	 * @var array
	 */
	private static $defaults = array(

		/*
		 * ==================================================
		 * YouTube / Connection Settings
		 * ==================================================
		 */
		'api_key'                       => '',
		'channel_id'                    => '',
		'channel_name'                  => '',
		'thumbnails_default'            => '',
		'thumbnails_medium'             => '',
		'connection_status'             => 'inactive',
		'cache_duration'                => 12,
		'auto_sync'                     => true,
		'video_placement'               => 'add_to_gallery_last',
		'muted_autoplay'                => false,
		'show_controls'                 => false,
		'is_onboarding_completed'       => false,
		'last_sync_time'                => 0,
		'connection_method'             => 'oauth',


		/*
		 * ==================================================
		 * Global Settings
		 * ==================================================
		 */
		'global_enableFeature'          => true,
		'global_exampleText'            => 'Hello from TubeBay!',


		/*
		 * ==================================================
		 * OAuth / Token Settings
		 * ==================================================
		 */
		'access_token'                  => '',
		'refresh_token'                 => '',
		'token_expires'                 => 0,


		/*
		 * ==================================================
		 * Advanced Settings
		 * ==================================================
		 */
		'advanced_deleteAllOnUninstall' => false,
		'debug_enableMode'              => false,
	);

	/**
	 * Get singleton instance.
	 *
	 * @return Settings
	 * @since 1.0.0
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	// ─── Core get / set ─────────────────────────────────────────────

	/**
	 * Get a plugin option value.
	 * Falls back to the default defined in $defaults.
	 *
	 * @param string $key           Setting key (without prefix).
	 * @param mixed  $default_value Override default (optional).
	 * @return mixed
	 */
	public static function get( $key, $default_value = null ) {
		// Use the class default when no explicit default is passed.
		if ( null === $default_value ) {
			$default_value = isset( self::$defaults[ $key ] ) ? self::$defaults[ $key ] : null;
		}
		return get_option( self::PREFIX . $key, $default_value );
	}

	/**
	 * Set a plugin option value.
	 *
	 * @param string $key   The setting key.
	 * @param mixed  $value The setting value.
	 * @return bool
	 */
	public static function set( $key, $value ) {
		return update_option( self::PREFIX . $key, $value );
	}

	/**
	 * Delete a plugin option.
	 *
	 * @param string $key The setting key.
	 * @return bool
	 */
	public static function delete( $key ) {
		return delete_option( self::PREFIX . $key );
	}

	// ─── Convenience getters ────────────────────────────────────────

	/**
	 * Get the configured API Key.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_api_key() {
		return self::get( 'api_key' );
	}

	/**
	 * Get the configured Channel ID.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_channel_id() {
		return self::get( 'channel_id' );
	}

	/**
	 * Get the configured Connection Method.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_connection_method() {
		return self::get( 'connection_method' );
	}

	/**
	 * Get the Channel Name.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_channel_name() {
		return self::get( 'channel_name' );
	}

	/**
	 * Get the Connection Status.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_connection_status() {
		return self::get( 'connection_status' );
	}

	/**
	 * Get the cache duration in seconds.
	 * The stored value is in hours; this converts to seconds.
	 *
	 * @return int
	 * @since 1.0.0
	 */
	public static function get_cache_duration() {
		$hours = (int) self::get( 'cache_duration' );
		return $hours * HOUR_IN_SECONDS;
	}

	/**
	 * Get the cache duration in hours (raw stored value).
	 *
	 * @return int
	 * @since 1.0.0
	 */
	public static function get_cache_duration_hours() {
		return (int) self::get( 'cache_duration' );
	}

	/**
	 * Get the Auto Sync setting.
	 *
	 * @return bool
	 * @since 1.0.0
	 */
	public static function get_auto_sync() {
		return (bool) self::get( 'auto_sync', true );
	}

	/**
	 * Get the Global Video Placement setting.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_video_placement() {
		return self::get( 'video_placement', 'below_gallery' );
	}

	/**
	 * Get the last sync time (unix timestamp).
	 *
	 * @return int
	 * @since 1.0.0
	 */
	public static function get_last_sync_time() {
		return (int) self::get( 'last_sync_time', 0 );
	}

	/**
	 * Set the last sync time (unix timestamp).
	 *
	 * @param int $timestamp The unix timestamp.
	 * @return bool
	 */
	public static function set_last_sync_time( $timestamp ) {
		return self::set( 'last_sync_time', (int) $timestamp );
	}

	/**
	 * Get the OAuth Access Token.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_access_token() {
		return self::get( 'access_token', '' );
	}

	/**
	 * Get the OAuth Refresh Token.
	 *
	 * @return string
	 * @since 1.0.0
	 */
	public static function get_refresh_token() {
		return self::get( 'refresh_token', '' );
	}

	/**
	 * Get the OAuth Token Expiration time.
	 *
	 * @return int
	 * @since 1.0.0
	 */
	public static function get_token_expires() {
		return self::get( 'token_expires', 0 );
	}

	// ─── Bulk access ────────────────────────────────────────────────

	/**
	 * Get the default settings map.
	 *
	 * @return array
	 */
	public static function get_defaults() {
		return self::$defaults;
	}

	/**
	 * Get all settings as an associative array.
	 * Reads each key from wp_options individually.
	 *
	 * @return array
	 */
	public static function get_all() {
		$settings = array();
		foreach ( self::$defaults as $key => $default ) {
			$settings[ $key ] = get_option( self::PREFIX . $key, $default );
		}
		return $settings;
	}

	/**
	 * Get all plugin settings as an associative array.
	 *
	 * @return array
	 * @since 1.0.0
	 */
	public static function get_all_settings() {
		return self::get_all();
	}

	/**
	 * Backward-compat: get_settings() works like get_all(),
	 * or returns a single value when a key is provided.
	 *
	 * @param string $key Optional key.
	 * @return mixed
	 */
	public function get_settings( $key = '' ) {
		if ( ! empty( $key ) ) {
			return self::get( $key );
		}
		return self::get_all();
	}

	// ─── Hook registration (called from Plugin via config/core.php) ─

	/**
	 * Register hooks.
	 *
	 * @param \TubeBay\Core\Plugin $plugin The plugin instance.
	 */
	public function run( $plugin ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		// Nothing to register for individual options.
		// Schema/sanitization is handled in the REST controllers.
	}
}
