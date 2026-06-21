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
if (!defined('ABSPATH')) {
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
class SettingsController extends ApiController
{


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
	public static function get_instance()
	{
		if (null === self::$instance) {
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
	public function register_routes()
	{
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/settings',
			array(
				array(
					'methods' => WP_REST_Server::READABLE,
					'callback' => array($this, 'get_settings'),
					'permission_callback' => array($this, 'get_item_permissions_check'),
				),
				array(
					'methods' => WP_REST_Server::CREATABLE,
					'callback' => array($this, 'update_settings'),
					'permission_callback' => array($this, 'update_item_permissions_check'),
				),
			)
		);

		// Add this to register_routes()
		register_rest_route(
			$namespace,
			'/auth/connect',
			array(
				'methods' => 'POST',
				'callback' => array($this, 'handle_connect'),
				'permission_callback' => array($this, 'update_item_permissions_check'),
				'args' => array(
					'connection_method' => array(
						'required' => true,
						'type' => 'string',
						'enum' => array('api', 'oauth'),
					),
					'api_key' => array(
						'required' => false,
						'type' => 'string',
					),
					'channel_id' => array(
						'required' => false,
						'type' => 'string',
					),
					'refresh_token' => array(
						'required' => false,
						'type' => 'string',
					),
				),
			)
		);

		register_rest_route(
			$namespace,
			'/settings/delete-all-data',
			array(
				array(
					'methods' => WP_REST_Server::DELETABLE,
					'callback' => array($this, 'delete_all_data'),
					'permission_callback' => array($this, 'update_item_permissions_check'),
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
	public function handle_connect($request)
	{
		$params = $request->get_json_params();
		$method = $params['connection_method'] ?? 'oauth';
		$refresh_token = $params['refresh_token'] ?? '';

		if ('oauth' === $method) {
			if (empty($refresh_token) && !empty($params['connection_string'])) {
				$decoded = json_decode(base64_decode($params['connection_string']), true); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
				if ($decoded && isset($decoded['refresh_token'])) {
					$refresh_token = $decoded['refresh_token'];
				}
			}

			if (empty($refresh_token)) {
				return new \WP_Error('invalid_data', __('Refresh token is missing.', 'tubebay'));
			}

			// Clear API Key when switching to OAuth
			Settings::set('api_key', '');
			Settings::set('refresh_token', $refresh_token);
		} else {
			// Manual API Method
			$api_key = $params['api_key'] ?? '';
			$channel_id = $params['channel_id'] ?? '';

			if (empty($api_key) || empty($channel_id)) {
				return new \WP_Error('invalid_data', __('API Key and Channel ID are required for manual connection.', 'tubebay'));
			}

			// Clear OAuth when switching to API
			Settings::set('refresh_token', '');
			Settings::set('access_token', '');
			Settings::set('token_expires', '');

			Settings::set('api_key', $api_key);
			Settings::set('channel_id', $channel_id);
		}

		Settings::set('connection_method', $method);

		tubebay_log("handle_connect: Attempting to connect via {$method}", 'info');

		$channel = new Channel();
		$result = $channel->test_connection();

		if (is_wp_error($result)) {
			tubebay_log('handle_connect: Connection test failed - ' . $result->get_error_message(), 'error');
			Settings::set('connection_status', 'failed');
			return $result;
		}

		// Success! Save discovered metadata and final state
		Settings::set('channel_id', $result['channel_id'] ?? Settings::get('channel_id'));
		Settings::set('channel_name', $result['title'] ?? '');
		Settings::set('thumbnails_default', $result['thumbnails_default'] ?? '');
		Settings::set('thumbnails_medium', $result['thumbnails_medium'] ?? '');
		Settings::set('connection_status', 'connected');
		Settings::set('last_sync_time', time());

		tubebay_log('handle_connect: Successfully connected to channel: ' . ($result['title'] ?? 'Unknown'), 'info');

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __('Connected successfully!', 'tubebay'),
				'data' => Settings::get_all_settings(),
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
	public function get_settings($request)
	{
		return new WP_REST_Response(Settings::get_all_settings(), 200);
	}

	/**
	 * Handle POST request to update settings.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response
	 * @since 1.0.0
	 */
	public function update_settings($request)
	{
		$body = $request->get_json_params();
		tubebay_log('Updating settings with payload: ' . wp_json_encode($body), 'debug');

		$creds_changed = false;

		if (isset($body['api_key'])) {
			$old = Settings::get('api_key');
			$new = sanitize_text_field($body['api_key']);
			if ($old !== $new) {
				Settings::set('api_key', $new);
				$creds_changed = true;
			}
		}

		if (isset($body['channel_id'])) {
			$old = Settings::get('channel_id');
			$new = sanitize_text_field($body['channel_id']);
			if ($old !== $new) {
				Settings::set('channel_id', $new);
				$creds_changed = true;
			}
		}

		if (isset($body['refresh_token'])) {
			$old = Settings::get('refresh_token');
			$new = sanitize_text_field($body['refresh_token']);
			if ($old !== $new) {
				Settings::set('refresh_token', $new);
				$creds_changed = true;
			}
		}

		if (isset($body['connection_method'])) {
			$old = Settings::get('connection_method');
			$new = sanitize_text_field($body['connection_method']);
			if ($old !== $new) {
				Settings::set('connection_method', $new);
				$creds_changed = true;
			}
		}

		if ($creds_changed) {
			// Credentials changed — verify the new connection.
			$channel = new Channel();

			if ($channel->is_configured()) {
				$result = $channel->test_connection();

				if (!is_wp_error($result)) {
					tubebay_log('Connection successful, updating settings', 'info');
					tubebay_log('Connection result: ' . wp_json_encode($result), 'info');
					Settings::set('channel_name', $result['title'] ?? '');
					Settings::set('thumbnails_default', $result['thumbnails_default'] ?? '');
					Settings::set('thumbnails_medium', $result['thumbnails_medium'] ?? '');
					Settings::set('connection_status', 'connected');
					Settings::set('last_sync_time', time());
				} else {
					Settings::set('channel_name', '');
					Settings::set('thumbnails_default', '');
					Settings::set('thumbnails_medium', '');
					Settings::set('connection_status', 'failed');
					Settings::set('last_sync_time', '');
				}
			} else {
				Settings::set('channel_name', '');
				Settings::set('thumbnails_default', '');
				Settings::set('thumbnails_medium', '');
				Settings::set('connection_status', 'disconnected');
				Settings::set('last_sync_time', '');
			}
		}

		if (isset($body['cache_duration'])) {
			Settings::set('cache_duration', absint($body['cache_duration']));
		}

		if (isset($body['auto_sync'])) {
			Settings::set('auto_sync', (bool) $body['auto_sync']);
			Cron::get_instance()->check_and_schedule();
		}

		if (isset($body['video_placement'])) {
			Settings::set('video_placement', sanitize_text_field($body['video_placement']));
		}

		if (isset($body['debug_enableMode'])) {
			Settings::set('debug_enableMode', (bool) $body['debug_enableMode']);
		}

		if (isset($body['muted_autoplay'])) {
			Settings::set('muted_autoplay', (bool) $body['muted_autoplay']);
		}

		if (isset($body['show_controls'])) {
			Settings::set('show_controls', (bool) $body['show_controls']);
		}

		if (isset($body['is_onboarding_completed'])) {
			Settings::set('is_onboarding_completed', (bool) $body['is_onboarding_completed']);
		}

		if (isset($body['advanced_deleteAllOnUninstall'])) {
			Settings::set('advanced_deleteAllOnUninstall', (bool) $body['advanced_deleteAllOnUninstall']);
		}

		if (!$creds_changed && isset($body['connection_status'])) {
			Settings::set('connection_status', sanitize_text_field($body['connection_status']));
		}

		tubebay_log('Settings updated successfully', 'info');

		return new WP_REST_Response(
			array(
				'success' => true,
				'data' => Settings::get_all_settings(),
				'message' => __('Settings saved successfully.', 'tubebay'),
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
	public function delete_all_data($request)
	{
		global $wpdb;

		tubebay_log('Delete All Data: Starting complete data wipe', 'info');

		// 1. Drop custom tables
		$table_name = $wpdb->prefix . 'tubebay_items';
		$wpdb->query("DROP TABLE IF EXISTS {$table_name}"); // phpcs:ignore
		tubebay_log('Delete All Data: Dropped table ' . $table_name, 'debug');

		// 2. Delete all tubebay_ options
		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like('tubebay_') . '%'
			)
		);
		// Also delete legacy serialized option.
		delete_option('tubebay');
		tubebay_log('Delete All Data: Deleted all plugin options', 'debug');

		// 3. Delete all product meta
		$meta_keys = array(
			'_tubebay_video_id',
			'_tubebay_video_title',
			'_tubebay_video_thumbnail',
			'_tubebay_display_location',
			'_tubebay_muted_autoplay',
		);
		foreach ($meta_keys as $key) {
			$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->prepare(
					"DELETE FROM {$wpdb->postmeta} WHERE meta_key = %s",
					$key
				)
			);
		}
		tubebay_log('Delete All Data: Deleted all product meta', 'debug');

		// 4. Delete transients
		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
				$wpdb->esc_like('_transient_tubebay_') . '%',
				$wpdb->esc_like('_transient_timeout_tubebay_') . '%'
			)
		);
		tubebay_log('Delete All Data: Deleted all transients', 'debug');

		// 5. Unschedule cron
		$timestamp = wp_next_scheduled('tubebay_daily_sync_event');
		if ($timestamp) {
			wp_unschedule_event($timestamp, 'tubebay_daily_sync_event');
		}
		tubebay_log('Delete All Data: Unscheduled cron events', 'debug');

		// 6. Re-create the table and re-initialize defaults
		$db_manager = \TubeBay\Data\DbManager::get_instance();
		$db_manager->create_tables();

		// Re-set defaults so the plugin is in a clean state.
		$defaults = Settings::get_defaults();
		foreach ($defaults as $key => $value) {
			Settings::set($key, $value);
		}

		tubebay_log('Delete All Data: Complete data wipe finished, defaults restored', 'info');

		return new WP_REST_Response(
			array(
				'success' => true,
				'data' => Settings::get_all_settings(),
				'message' => __('All TubeBay data has been deleted and settings reset to defaults.', 'tubebay'),
			),
			200
		);
	}
}

