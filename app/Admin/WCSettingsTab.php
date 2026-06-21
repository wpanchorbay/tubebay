<?php
/**
 * WC Settings Tab — integrates TubeBay settings into WooCommerce settings.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Admin
 */

namespace TubeBay\Admin;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce Settings Tab for TubeBay.
 */
class WCSettingsTab extends \WC_Settings_Page {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->id    = TUBEBAY_PLUGIN_NAME;
		$this->label = __( 'TubeBay', 'tubebay' );

		parent::__construct();
	}

	/**
	 * Output the settings.
	 */
	public function output() {
		Admin::get_instance()->add_setting_root_div();
	}

	/**
	 * Save settings.
	 *
	 * We don't need this because React handles saving via REST API.
	 */
	public function save() {
		// Logic is handled by React/REST API.
	}
}
