<?php
/**
 * The parent class of all API controllers for this plugin.
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

use WP_Error;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Abstract Base API Controller class.
 */
class ApiController extends WP_REST_Controller {

	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   ApiController
	 * @access private
	 */
	private static $instance = null;

	/**
	 * Rest route namespace.
	 *
	 * @var string
	 * @since 1.0.0
	 */
	public $namespace = TUBEBAY_TEXT_DOMAIN . '/';

	/**
	 * Rest route version.
	 *
	 * @var string
	 * @since 1.0.0
	 */
	public $version = 'v1';

	/**
	 * Whether the controller supports batching.
	 *
	 * @since 1.0.0
	 * @var array
	 */
	protected $allow_batch = array( 'v1' => true );

	/**
	 * Constructor
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
	}

	/**
	 * Initialize the class — registers REST routes.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function run() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Gets an instance of this object.
	 *
	 * @static
	 * @access public
	 * @return object
	 * @since 1.0.0
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Throw error on object clone
	 *
	 * @access public
	 * @return void
	 * @since 1.0.0
	 */
	public function __clone() {
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Cloning is not allowed.', 'tubebay' ), '1.0.0' );
	}

	/**
	 * Disable unserializing of the class
	 *
	 * @access public
	 * @return void
	 * @since 1.0.0
	 */
	public function __wakeup() {
		_doing_it_wrong( __FUNCTION__, esc_html__( 'Unserializing is not allowed.', 'tubebay' ), '1.0.0' );
	}

	/**
	 * Verifies the REST nonce on a request.
	 *
	 * Extracted so that routes needing a different capability check can still
	 * reuse the same nonce handling rather than reimplementing it.
	 *
	 * @since 1.3.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True when the nonce is valid, WP_Error otherwise.
	 */
	protected function verify_rest_nonce( $request ) {
		$nonce = $request->get_header( 'X-WP-Nonce' );

		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			tubebay_log( 'ApiController: Permission denied — invalid or missing nonce', 'error' );
			return new WP_Error(
				'rest_nonce_invalid',
				__( 'The security token is invalid.', 'tubebay' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Checks if a given request has access to read items.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True if the request has read access, WP_Error otherwise.
	 */
	public function get_item_permissions_check( $request ) {
		if ( ! current_user_can( 'manage_tubebay' ) ) {
			tubebay_log( 'ApiController: Permission denied — user lacks manage_tubebay capability', 'error' );
			return new WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to access this resource.', 'tubebay' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			tubebay_log( 'ApiController: Permission denied — invalid or missing nonce', 'error' );
			return new WP_Error( 'rest_nonce_invalid', __( 'The security token is invalid.', 'tubebay' ), array( 'status' => 403 ) );
		}

		return true;
	}

	/**
	 * Checks if a given request has access to update items.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True if the request has update access, WP_Error otherwise.
	 */
	public function update_item_permissions_check( $request ) {
		if ( ! current_user_can( 'manage_tubebay' ) ) {
			tubebay_log( 'ApiController: Update permission denied — user lacks manage_tubebay capability', 'error' );
			return new WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to access this resource.', 'tubebay' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		$nonce = $request->get_header( 'X-WP-Nonce' );

		if ( ! $nonce ) {
			$nonce = isset( $_REQUEST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ) : '';
		}

		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			tubebay_log( 'ApiController: Update permission denied — invalid or missing nonce', 'error' );
			return new WP_Error(
				'rest_invalid_nonce',
				__( 'Invalid or missing nonce.', 'tubebay' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}
}
