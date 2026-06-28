<?php
/**
 * The core plugin class.
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

use TubeBay\Admin\Admin;
use TubeBay\Helper\Loader;

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * @since 1.0.0
 */
class Plugin {

	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   Plugin
	 * @access private
	 */
	private static $instance = null;

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * Get the instance of the Plugin class.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return Plugin
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Define the core functionality of the plugin.
	 *
	 * @since    1.0.0
	 * @access public
	 * @return void
	 */
	public function __construct() {
		tubebay_log( 'Plugin: Initializing core, admin, and public hooks', 'debug' );
		$this->loader = Loader::get_instance();
		$this->define_core_hooks();
		$this->define_admin_hooks();
		$this->define_public_hooks();
	}

	/**
	 * Register all of the hooks related to the core functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return void
	 */
	private function define_core_hooks() {
		// Initialize API controllers from config.
		$api_controllers = include TUBEBAY_PATH . 'config/api.php';
		tubebay_log( 'Plugin: Loading API controllers: ' . wp_json_encode( $api_controllers ), 'debug' );
		if ( is_array( $api_controllers ) ) {
			foreach ( $api_controllers as $controller ) {
				if ( class_exists( $controller ) && method_exists( $controller, 'get_instance' ) ) {
					tubebay_log( 'Plugin: Registering REST routes for: ' . $controller, 'debug' );
					add_action(
						'rest_api_init',
						function () use ( $controller ) {
							$controller::get_instance()->register_routes();
						}
					);
				} else {
					tubebay_log( 'Plugin: Controller class not found or missing get_instance: ' . $controller, 'error' );
				}
			}
		}
	}

	/**
	 * Register all of the hooks related to the public area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return void
	 */
	private function define_public_hooks() {
		if ( is_admin() ) {
			return;
		}
		tubebay_log( 'Plugin: Registering public-facing hooks', 'debug' );
		// Enqueue the public CSS for the plugin.
		$this->loader->add_action(
			'wp_enqueue_scripts',
			$this,
			'enqueue_public_styles'
		);
	}

	/**
	 * Enqueue the public CSS and JS for the plugin.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return void
	 */
	public function enqueue_public_styles() {
		tubebay_log( 'Plugin: Enqueueing public CSS and JS', 'debug' );
		wp_enqueue_style( TUBEBAY_OPTION_NAME . '_public', TUBEBAY_URL . 'assets/css/public.css', array(), TUBEBAY_VERSION );

		wp_enqueue_script(
			TUBEBAY_OPTION_NAME . '_public_js',
			TUBEBAY_URL . 'assets/js/public.js',
			array(),
			TUBEBAY_VERSION,
			true
		);

		wp_localize_script(
			TUBEBAY_OPTION_NAME . '_public_js',
			'tubebaySettings',
			array(
				'privacyMode' => \TubeBay\Helper\Settings::get( 'privacy_mode', false ),
				'showControls' => \TubeBay\Helper\Settings::get( 'show_controls', true ),
				'galleryMode' => \TubeBay\Helper\Settings::get( 'gallery_mode', 'inline' ), // or 'lightbox'
			)
		);
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @return void
	 */
	private function define_admin_hooks() {
		// Initialize Core classes from config.
		$core_classes = include TUBEBAY_PATH . 'config/core.php';
		tubebay_log( 'Plugin: Loading core classes from config: ' . wp_json_encode( $core_classes ), 'debug' );
		if ( is_array( $core_classes ) ) {
			foreach ( $core_classes as $class ) {
				if ( class_exists( $class ) && method_exists( $class, 'get_instance' ) ) {
					$instance = $class::get_instance();
					if ( method_exists( $instance, 'run' ) ) {
						tubebay_log( 'Plugin: Running class: ' . $class, 'debug' );
						$instance->run( $this );
					}
				} else {
					tubebay_log( 'Plugin: Core class not found or missing get_instance: ' . $class, 'error' );
				}
			}
		}
	}

	/**
	 * Changes the plugin's display name on the plugins page.
	 *
	 * @since 1.0.0
	 * @param array $plugins The array of all plugin data.
	 * @return array The modified array of plugin data.
	 */
	public function change_plugin_display_name( $plugins ) {
		$plugin_basename = plugin_basename( TUBEBAY_PATH . 'tubebay.php' );

		if ( isset( $plugins[ $plugin_basename ] ) ) {
			$plugins[ $plugin_basename ]['Name'] = 'TubeBay';
		}

		return $plugins;
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 * @access public
	 * @return void
	 */
	public function run() {
		tubebay_log( 'Plugin: Running loader — executing all registered WordPress hooks', 'info' );
		$this->loader->run();
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @access public
	 * @return    Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}
}
