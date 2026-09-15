<?php
/**
 * SettingsController class.
 *
 * Handles API endpoints for saving and retrieving TubeBay settings.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Api
 */

namespace TubeBay\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use TubeBay\Core\Cron;
use TubeBay\Data\Entities\Channel;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use TubeBay\Helper\Settings;

/**
 * SettingsController class.
 *
 * Handles API endpoints for saving and retrieving TubeBay settings.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Api
 */
class SettingsController extends ApiController {

	/**
	 * The only values connection_status may hold.
	 *
	 * These are every value the plugin itself writes: 'inactive' is the
	 * default (Settings::$defaults), Channel::disconnect() writes
	 * 'disconnected', a failed handshake writes 'failed', and a successful one
	 * writes 'connected'. Only 'connected' is ever tested for — the other
	 * three are all "not connected" by falling through — but each must stay
	 * accepted here, or the plugin would reject a value it wrote itself.
	 *
	 * @var string[]
	 * @since 1.3.0
	 */
	const CONNECTION_STATUSES = array( 'connected', 'disconnected', 'failed', 'inactive' );

	/**
	 * The only values connection_method may hold.
	 *
	 * The /connect route already declares this same enum in its args, but the
	 * settings-save path below did not, so a value could reach the option that
	 * the UI cannot represent: src/utils/types.ts declares 'oauth' | 'api' and
	 * ConnectionTab renders radios for exactly those two, while Channel.php
	 * branches only on 'oauth' — so anything else behaved as 'api' while
	 * leaving the radio group with nothing selected.
	 *
	 * @var string[]
	 * @since 1.3.0
	 */
	const CONNECTION_METHODS = array( 'api', 'oauth' );

	/**
	 * The only values video_position may hold.
	 *
	 * 'mixed' was accepted and offered in the UI until 1.3.0 but was never
	 * implemented: the drag/drop order it named has no reader, and the gallery
	 * treated every non-'first' value as 'last'. New writes are refused; values
	 * already stored are normalised to 'last' where they are read, so no site
	 * is left holding a value its own dropdown cannot display.
	 *
	 * @var string[]
	 * @since 1.3.0
	 */
	const VIDEO_POSITIONS = array( 'first', 'last' );

	/**
	 * Instance of this class.
	 *
	 * @var SettingsController|null
	 * @since 1.0.0
	 */
	private static $instance = null;

	/**
	 * Get instance of this class.
	 *
	 * @return SettingsController
	 * @since 1.0.0
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register the routes for the objects of the controller.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/settings',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_settings' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
		);

		// Add this to register_routes()
		register_rest_route(
			$namespace,
			'/auth/connect',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_connect' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
				'args'                => array(
					'connection_method' => array(
						'required' => true,
						'type'     => 'string',
						'enum'     => array( 'api', 'oauth' ),
					),
					'api_key'           => array(
						'required' => false,
						'type'     => 'string',
					),
					'channel_id'        => array(
						'required' => false,
						'type'     => 'string',
					),
					'refresh_token'     => array(
						'required' => false,
						'type'     => 'string',
					),
				),
			)
		);

		register_rest_route(
			$namespace,
			'/settings/delete-all-data',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_all_data' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
		);
	}



	// The Callback Method
	/**
	 * Handle request to connect a YouTube account (OAuth or API Key).
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response|\WP_Error
	 * @since 1.0.0
	 */
	public function handle_connect( $request ) {
		$params        = $request->get_json_params();
		$method        = sanitize_text_field( $params['connection_method'] ?? 'oauth' );
		$refresh_token = sanitize_text_field( $params['refresh_token'] ?? '' );

		if ( 'oauth' === $method ) {
			if ( empty( $refresh_token ) && ! empty( $params['connection_string'] ) ) {
				$decoded = json_decode( base64_decode( $params['connection_string'] ), true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
				if ( $decoded && isset( $decoded['refresh_token'] ) ) {
					$refresh_token = sanitize_text_field( $decoded['refresh_token'] );
				}
			}

			if ( empty( $refresh_token ) ) {
				return new \WP_Error( 'invalid_data', __( 'Refresh token is missing.', 'tubebay' ) );
			}

			// Clear API Key when switching to OAuth
			Settings::set( 'api_key', '' );
			Settings::set( 'refresh_token', $refresh_token );
		} else {
			// Manual API Method
			$api_key    = sanitize_text_field( $params['api_key'] ?? '' );
			$channel_id = sanitize_text_field( $params['channel_id'] ?? '' );

			if ( empty( $api_key ) || empty( $channel_id ) ) {
				return new \WP_Error( 'invalid_data', __( 'API Key and Channel ID are required for manual connection.', 'tubebay' ) );
			}

			// Clear OAuth when switching to API
			Settings::set( 'refresh_token', '' );
			Settings::set( 'access_token', '' );
			Settings::set( 'token_expires', '' );

			Settings::set( 'api_key', $api_key );
			Settings::set( 'channel_id', $channel_id );
		}

		Settings::set( 'connection_method', $method );

		tubebay_log( "handle_connect: Attempting to connect via {$method}", 'info' );

		$channel = new Channel();
		$result  = $channel->test_connection();

		if ( is_wp_error( $result ) ) {
			tubebay_log( 'handle_connect: Connection test failed - ' . $result->get_error_message(), 'error' );
			Settings::set( 'connection_status', 'failed' );
			return $result;
		}

		// Success! Save discovered metadata and final state
		Settings::set( 'channel_id', $result['channel_id'] ?? Settings::get( 'channel_id' ) );
		Settings::set( 'channel_name', $result['title'] ?? '' );
		Settings::set( 'thumbnails_default', $result['thumbnails_default'] ?? '' );
		Settings::set( 'thumbnails_medium', $result['thumbnails_medium'] ?? '' );
		Settings::set( 'connection_status', 'connected' );
		Settings::set( 'last_sync_time', time() );

		tubebay_log( 'handle_connect: Successfully connected to channel: ' . ( $result['title'] ?? 'Unknown' ), 'info' );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Connected successfully!', 'tubebay' ),
				'data'    => Settings::get_all_settings(),
			),
			200
		);
	}

	/**
	 * Handle GET request for settings.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response
	 * @since 1.0.0
	 */
	public function get_settings( $request ) {
		return new WP_REST_Response( Settings::get_all_settings(), 200 );
	}

	/**
	 * Repair values that were valid in an earlier release but are not now.
	 *
	 * Deliberately narrow: it rewrites ONE known retired value and touches
	 * nothing else, so genuinely unrecognised input still reaches
	 * validate_enums() and is rejected. Coercing everything to a default would
	 * throw away the validation instead of complementing it.
	 *
	 * Core\Upgrader migrates the same value in the database on update, but that
	 * is not sufficient on its own: an admin whose Settings screen was loaded
	 * before the update still holds 'mixed' in the React state and POSTs it
	 * back. Without this, that save would 400 and — because video_position is
	 * one of the keys the onboarding wizard writes — the wizard would never be
	 * able to complete.
	 *
	 * @since 1.3.2
	 * @param array $body The raw request body.
	 * @return array The body with retired values replaced.
	 */
	private static function normalize_legacy_values( $body ) {
		if ( ! is_array( $body ) ) {
			return $body;
		}

		if ( isset( $body['video_position'] ) && 'mixed' === $body['video_position'] ) {
			tubebay_log( "SettingsController: video_position 'mixed' is retired, saving as 'last'", 'info' );
			$body['video_position'] = 'last';
		}

		return $body;
	}

	/**
	 * Check every enum field in the payload against its allow-list.
	 *
	 * Runs before anything is persisted, so a rejected request leaves the
	 * stored settings exactly as they were.
	 *
	 * @since 1.3.2
	 * @param array $body The raw request body.
	 * @return \WP_Error|null WP_Error on the first invalid value, null if all pass.
	 */
	private static function validate_enums( $body ) {
		if ( ! is_array( $body ) ) {
			return null;
		}

		$enums = array(
			'connection_method' => array(
				'allowed' => self::CONNECTION_METHODS,
				'code'    => 'tubebay_invalid_connection_method',
				'message' => __( 'The connection method value is not one this plugin recognises.', 'tubebay' ),
			),
			'video_position'    => array(
				'allowed' => self::VIDEO_POSITIONS,
				'code'    => 'tubebay_invalid_video_position',
				'message' => __( 'The video position value is not one this plugin recognises.', 'tubebay' ),
			),

			/*
			 * connection_status is an enum, not free text.
			 *
			 * Every consumer compares it to the literal 'connected' — the
			 * Library screen, Onboarding, the Connection and Sync tabs, and
			 * ProductMetabox at three points. sanitize_text_field() is not
			 * validation, so any string used to land here: a value like
			 * 'active' left Channel::is_configured() satisfied and the video
			 * cache warm while every one of those screens rendered its
			 * disconnected branch, and nothing logged a warning.
			 */
			'connection_status' => array(
				'allowed' => self::CONNECTION_STATUSES,
				'code'    => 'tubebay_invalid_connection_status',
				'message' => __( 'The connection status value is not one this plugin recognises.', 'tubebay' ),
			),
		);

		foreach ( $enums as $key => $enum ) {
			if ( ! isset( $body[ $key ] ) ) {
				continue;
			}

			$value = is_scalar( $body[ $key ] ) ? sanitize_text_field( (string) $body[ $key ] ) : '';

			if ( ! in_array( $value, $enum['allowed'], true ) ) {
				tubebay_log(
					'SettingsController: rejected out-of-range ' . $key . ' ' . wp_json_encode( $body[ $key ] ),
					'error'
				);

				// \WP_Error, not WP_Error: this file has no `use WP_Error`
				// and every other error here is fully qualified too.
				return new \WP_Error(
					$enum['code'],
					$enum['message'],
					array( 'status' => 400 )
				);
			}
		}

		return null;
	}

	/**
	 * Handle POST request to update settings.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response
	 * @since 1.0.0
	 */
	public function update_settings( $request ) {
		$body = $request->get_json_params();
		tubebay_log( 'Updating settings with payload: ' . wp_json_encode( $body ), 'debug' );

		/*
		 * Validate every enum BEFORE the first Settings::set() below.
		 *
		 * Each of these checks used to sit beside the field it guards, part way
		 * down the method — so a payload carrying one good field and one bad
		 * one persisted the good field and then returned 400. The caller saw a
		 * failed save while the options had already moved, which is the worst
		 * of both. Nothing is written until the whole payload is known good.
		 *
		 * Normalisation runs first, so a legacy value is repaired rather than
		 * rejected. The conditional WRITE of connection_status stays where it
		 * was: its `! $creds_changed` guard is about persistence, not validity.
		 */
		$body = self::normalize_legacy_values( $body );

		$invalid = self::validate_enums( $body );
		if ( is_wp_error( $invalid ) ) {
			return $invalid;
		}

		$creds_changed = false;

		if ( isset( $body['api_key'] ) ) {
			$old = Settings::get( 'api_key' );
			$new = sanitize_text_field( $body['api_key'] );
			if ( $old !== $new ) {
				Settings::set( 'api_key', $new );
				$creds_changed = true;
			}
		}

		if ( isset( $body['channel_id'] ) ) {
			$old = Settings::get( 'channel_id' );
			$new = sanitize_text_field( $body['channel_id'] );
			if ( $old !== $new ) {
				Settings::set( 'channel_id', $new );
				$creds_changed = true;
			}
		}

		if ( isset( $body['refresh_token'] ) ) {
			$old = Settings::get( 'refresh_token' );
			$new = sanitize_text_field( $body['refresh_token'] );
			if ( $old !== $new ) {
				Settings::set( 'refresh_token', $new );
				$creds_changed = true;
			}
		}

		if ( isset( $body['connection_method'] ) ) {
			$old = Settings::get( 'connection_method' );
			$new = sanitize_text_field( $body['connection_method'] );

			// Already validated at the top of this method.
			if ( $old !== $new ) {
				Settings::set( 'connection_method', $new );
				$creds_changed = true;
			}
		}

		if ( $creds_changed ) {
			// Credentials changed — verify the new connection.
			$channel = new Channel();

			if ( $channel->is_configured() ) {
				$result = $channel->test_connection();

				if ( ! is_wp_error( $result ) ) {
					tubebay_log( 'Connection successful, updating settings', 'info' );
					tubebay_log( 'Connection result: ' . wp_json_encode( $result ), 'info' );
					Settings::set( 'channel_name', $result['title'] ?? '' );
					Settings::set( 'thumbnails_default', $result['thumbnails_default'] ?? '' );
					Settings::set( 'thumbnails_medium', $result['thumbnails_medium'] ?? '' );
					Settings::set( 'connection_status', 'connected' );
					Settings::set( 'last_sync_time', time() );
				} else {
					Settings::set( 'channel_name', '' );
					Settings::set( 'thumbnails_default', '' );
					Settings::set( 'thumbnails_medium', '' );
					Settings::set( 'connection_status', 'failed' );
					Settings::set( 'last_sync_time', '' );
				}
			} else {
				Settings::set( 'channel_name', '' );
				Settings::set( 'thumbnails_default', '' );
				Settings::set( 'thumbnails_medium', '' );
				Settings::set( 'connection_status', 'disconnected' );
				Settings::set( 'last_sync_time', '' );
			}
		}

		// --- Filterable saveable-keys loop ---
		// Pro can register additional keys via add_filter('tubebay_settings_saveable_keys', ...).
		$simple_settings = array(
			'cache_duration'                => 'absint',
			'video_placement'               => 'sanitize_text_field',
			'debug_enableMode'              => 'bool',
			'muted_autoplay'                => 'bool',
			'show_controls'                 => 'bool',
			'max_videos'                    => 'absint',
			'video_position'                => 'sanitize_text_field',
			'autoplay_first'                => 'bool',
			'show_duration'                 => 'bool',
			'privacy_mode'                  => 'bool',
			'is_onboarding_completed'       => 'bool',
			'advanced_deleteAllOnUninstall' => 'bool',
		);

		$simple_settings = apply_filters( 'tubebay_settings_saveable_keys', $simple_settings );

		foreach ( $simple_settings as $key => $sanitizer ) {
			if ( isset( $body[ $key ] ) ) {
				$value = $body[ $key ];
				if ( 'bool' === $sanitizer ) {
					$value = (bool) $value;
				} elseif ( 'absint' === $sanitizer ) {
					$value = absint( $value );
				} else {
					$value = call_user_func( $sanitizer, $value );
				}
				Settings::set( $key, $value );
			}
		}

		// auto_sync has a side effect (cron reschedule) so handle it outside the loop.
		if ( isset( $body['auto_sync'] ) ) {
			Settings::set( 'auto_sync', (bool) $body['auto_sync'] );
			Cron::get_instance()->check_and_schedule();
		}

		$channel = new Channel();
		if ( ! $channel->is_configured() ) {
			Settings::set( 'connection_status', 'disconnected' );
			Settings::set( 'channel_name', '' );
			Settings::set( 'thumbnails_default', '' );
			Settings::set( 'thumbnails_medium', '' );
		} elseif ( ! $creds_changed && isset( $body['connection_status'] ) ) {
			/*
			 * connection_status is an enum, not free text.
			 *
			 * Every consumer compares it to the literal 'connected' — the
			 * Library screen, Onboarding, the Connection and Sync tabs, and
			 * ProductMetabox at three points. sanitize_text_field() is not
			 * validation, so any string used to land here: a value like
			 * 'active' left Channel::is_configured() satisfied and the video
			 * cache warm while every one of those screens rendered its
			 * disconnected branch, and nothing logged a warning.
			 */
			// Already validated at the top of this method.
			Settings::set( 'connection_status', sanitize_text_field( $body['connection_status'] ) );
		}

		/**
		 * Fires after all saveable settings have been persisted.
		 * Pro hooks this to persist its own keys (license_key, license_status, ...)
		 * that it registered via tubebay_settings_saveable_keys.
		 *
		 * @since 1.1.0
		 * @param array $body The raw request body.
		 */
		do_action( 'tubebay_settings_saved', $body );

		tubebay_log( 'Settings updated successfully', 'info' );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => Settings::get_all_settings(),
				'message' => __( 'Settings saved successfully.', 'tubebay' ),
			),
			200
		);
	}

	/**
	 * Delete all TubeBay data (options, tables, product meta, transients).
	 * The plugin remains installed but all data is wiped clean.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response
	 * @since 1.0.0
	 */
	public function delete_all_data( $request ) {
		global $wpdb;

		tubebay_log( 'Delete All Data: Starting complete data wipe', 'info' );

		// 1. Delete all tubebay_ options, except those an active add-on owns.
		// This used to sweep pro's keys too, which meant the FREE plugin's
		// "Delete All Data" button silently deactivated a PAID licence.
		$protected = tubebay_protected_option_names();

		$option_names = $wpdb->get_col( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( 'tubebay_' ) . '%'
			)
		);

		foreach ( (array) $option_names as $option_name ) {
			if ( in_array( $option_name, $protected, true ) ) {
				continue;
			}

			delete_option( $option_name );
		}
		// Also delete legacy serialized option.
		delete_option( 'tubebay' );
		tubebay_log( 'Delete All Data: Deleted all plugin options', 'debug' );

		/*
		 * 2. Delete the product meta THIS plugin owns.
		 *
		 * Not pro's. Pro writes _tubebay_video_position, _tubebay_autoplay_first,
		 * _tubebay_max_videos and _tubebay_show_duration from its own metabox;
		 * free only ever reads them. Pro removes them in its own uninstall.php,
		 * the same division of labour that keeps free from deleting a paid
		 * licence key. This comment previously claimed to cover "free + premium
		 * keys" while listing none of them.
		 */
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
		tubebay_log( 'Delete All Data: Deleted all product meta', 'debug' );

		// 3. Delete transients
		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
				$wpdb->esc_like( '_transient_tubebay_' ) . '%',
				$wpdb->esc_like( '_transient_timeout_tubebay_' ) . '%'
			)
		);
		tubebay_log( 'Delete All Data: Deleted all transients', 'debug' );

		// 4. Unschedule cron
		wp_clear_scheduled_hook( 'tubebay_daily_sync_event' );
		tubebay_log( 'Delete All Data: Unscheduled cron events', 'debug' );

		/*
		 * 6. Re-initialize defaults so the plugin is in a clean state.
		 *
		 * Skip the protected keys here as well. get_defaults() runs through the
		 * `tubebay_settings_defaults` filter, which is precisely where an
		 * add-on registers its own keys — so restoring defaults blindly writes
		 * pro's EMPTY default over the licence that step 1 just went to the
		 * trouble of preserving. The licence ended up '' rather than deleted,
		 * which is why this looked like the sweep was still at fault.
		 */
		$defaults = Settings::get_defaults();
		foreach ( $defaults as $key => $value ) {
			if ( in_array( Settings::PREFIX . $key, $protected, true ) ) {
				continue;
			}

			Settings::set( $key, $value );
		}

		tubebay_log( 'Delete All Data: Complete data wipe finished, defaults restored', 'info' );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => Settings::get_all_settings(),
				'message' => __( 'All TubeBay data has been deleted and settings reset to defaults.', 'tubebay' ),
			),
			200
		);
	}
}
