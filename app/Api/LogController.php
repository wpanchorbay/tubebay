<?php
/**
 * LogController class.
 *
 * Handles API endpoints for clearing plugin logs.
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

use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * LogController class.
 *
 * @since 1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Api
 * @author     sankarsan <wpanchorbay@gmail.com>
 */
class LogController extends ApiController {

	/**
	 * Route base.
	 *
	 * @var string
	 * @since 1.0.0
	 */
	protected $rest_base = 'logs';

	/**
	 * Instance of this class.
	 *
	 * @var LogController|null
	 * @since 1.0.0
	 */
	protected static $instance = null;

	/**
	 * Get instance of this class.
	 *
	 * @return LogController
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
	 * Only the DELETE route is exposed. The GET route that returned raw log
	 * file contents (which could contain redacted-but-sensitive context) was
	 * removed in 1.0.4. Logs should be inspected on the filesystem directly.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function register_routes() {
		tubebay_log( 'Registering routes for LogController', 'info' );

		$namespace = $this->namespace . $this->version;

		// DELETE endpoint: Clear all log files.
		register_rest_route(
			$namespace,
			'/logs',
			array(
				array(
					'methods'             => \WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_items' ),
					'permission_callback' => array( $this, 'update_items_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check if a given request has access to delete items.
	 *
	 * Uses manage_tubebay for consistency with the rest of the API.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return bool True if permitted, false otherwise.
	 * @since 1.0.4
	 */
	public function update_items_permissions_check( $request ) {
		return current_user_can( 'manage_tubebay' );
	}

	/**
	 * Clear logs.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 * @return \WP_REST_Response|\WP_Error
	 * @since 1.0.0
	 */
	public function delete_items( $request ) {
		tubebay_log( 'LogController: Handling DELETE /logs request — clearing all log files', 'info' );
		$upload_dir = wp_upload_dir();
		$log_dir    = $upload_dir['basedir'] . '/' . TUBEBAY_TEXT_DOMAIN . '-logs/';

		// Delete all log files.
		// `*.log*` covers both shapes: the .log.php files written since 1.3.0
		// and any plain .log left by an older version that never logged again
		// (the one-off migration in tubebay_log() only runs when something
		// writes a log line).
		$files = glob( $log_dir . 'plugin-log-*.log*' );
		if ( $files ) {
			foreach ( $files as $file ) {
				if ( file_exists( $file ) ) {
					wp_delete_file( $file );
				}
			}
		}

		return rest_ensure_response( array( 'success' => true ) );
	}
}
