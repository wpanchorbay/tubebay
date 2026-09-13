<?php
/**
 * The plugin bootstrap file.
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://wpanchorbay.com
 * @since             1.0.0
 * @package           TubeBay
 *
 * @wordpress-plugin
 * Plugin Name:       TubeBay - YouTube Product Video Gallery & Embeds for WooCommerce
 * Plugin URI:        https://wpanchorbay.com/products/tubebay
 * Source URI:        https://github.com/wpanchorbay/tubebay
 * Description:       Connect your YouTube channel to WooCommerce and show fast, click-to-play product videos on product pages.
 * Version:           1.3.2
 * Author:            WPAnchorBay
 * Author URI:        https://wpanchorbay.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tubebay
 * Domain Path:       /languages
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Requires Plugins:  woocommerce
 * WC requires at least: 6.1
 * WC tested up to: 11.0
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'TUBEBAY_PATH', plugin_dir_path( __FILE__ ) );
define( 'TUBEBAY_DIR', plugin_dir_path( __FILE__ ) );
define( 'TUBEBAY_URL', plugin_dir_url( __FILE__ ) );
define( 'TUBEBAY_VERSION', '1.3.2' );
define( 'TUBEBAY_PLUGIN_NAME', 'tubebay' );
define( 'TUBEBAY_TEXT_DOMAIN', 'tubebay' );
define( 'TUBEBAY_OPTION_NAME', 'tubebay' );
define( 'TUBEBAY_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'TUBEBAY_DEV_MODE', false );

if ( file_exists( TUBEBAY_PATH . 'vendor/autoload.php' ) ) {
	require_once TUBEBAY_PATH . 'vendor/autoload.php';
}

require_once TUBEBAY_PATH . 'app/functions.php';

register_activation_hook( __FILE__, 'tubebay_activate' );
register_deactivation_hook( __FILE__, 'tubebay_deactivate' );

if ( ! function_exists( 'tubebay_run' ) ) {
	/**
	 * Begins execution of the plugin.
	 *
	 * @since    1.0.0
	 */
	function tubebay_run() {
		// Run the plugin.
		tubebay_log( 'Initializing TubeBay plugin...', 'info' );
		$plugin = \TubeBay\Core\Plugin::get_instance();
		add_action( 'plugins_loaded', array( $plugin, 'run' ) );
	}
}
tubebay_run();

/**
 * Tell WooCommerce which of its opt-in features this plugin is safe with.
 *
 * Without this, WooCommerce lists TubeBay under "incompatible plugins" on the
 * Advanced > Features screen from WC 8.2 onwards -- not because anything is
 * broken, but because silence is read as "not checked". TubeBay never reads or
 * writes an order (no wc_get_order, no WC_Order, no shop_order query) and never
 * touches cart or checkout, so both declarations below are statements of fact
 * rather than promises.
 *
 * This cannot go through the Loader like the plugin's own hooks: the callback
 * has to be attached before WooCommerce boots, and FeaturesUtil only exists
 * once WooCommerce itself is loaded, hence the class_exists guard.
 *
 * @since 1.3.2
 * @return void
 */
function tubebay_declare_wc_feature_compatibility() {
	if ( ! class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		return;
	}

	\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
	\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true );
}
add_action( 'before_woocommerce_init', 'tubebay_declare_wc_feature_compatibility' );

/**
 * Plugin activation hook.
 *
 * @since  1.0.0
 * @return void
 */
function tubebay_activate() {
	tubebay_log( 'TubeBay plugin activated', 'info' );
	// Calling the activation function.
	\TubeBay\Core\Activator::activate();
}

/**
 * Plugin deactivation hook.
 *
 * @since    1.0.0
 */
function tubebay_deactivate() {
	tubebay_log( 'TubeBay plugin deactivated', 'info' );
	\TubeBay\Core\Deactivator::deactivate();
}
