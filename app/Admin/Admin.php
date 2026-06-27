<?php
/**
 * Admin class.
 *
 * Handles admin-specific functionality and menu registration.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Admin
 */

namespace TubeBay\Admin;

use TubeBay\Helper\Settings;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The admin-specific functionality of the plugin.
 *
 * @package    TubeBay
 * @subpackage TubeBay/Admin
 * @author     sankarsan <wpanchorbay@gmail.com>
 */
class Admin {

	/**
	 * The single instance of the class.
	 *
	 * @since 1.0.0
	 * @var   Admin
	 * @access private
	 */
	private static $instance = null;

	/**
	 * Menu info.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      array
	 */
	private $menu_info;

	/**
	 * Gets an instance of this object.
	 *
	 * @access public
	 * @return Admin
	 * @since 1.0.0
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Get plugin data (formerly white label options).
	 *
	 * @since 1.0.0
	 * @access private
	 * @return array
	 */
	private function get_plugin_data() {
		return array(
			'plugin_name' => esc_html__( 'TubeBay', 'tubebay' ),
			'short_name'  => esc_html__( 'TubeBay', 'tubebay' ),
			'menu_label'  => esc_html__( 'TubeBay', 'tubebay' ),
			'custom_icon' => TUBEBAY_URL . 'assets/img/icon.svg',
			'menu_icon'   => 'dashicons-admin-plugins',
			'author_name' => 'WP Anchor Bay',
			'author_uri'  => 'wpanchorbay.com',
			'support_uri' => 'wpanchorbay.com/support',
			'docs_uri'    => 'https://docs.wpanchorbay.com',
			'position'    => 57,
		);
	}

	/**
	 * Add Admin Page Menu page.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function add_admin_menu() {
		tubebay_log( 'Admin: Registering TubeBay admin menu', 'info' );
		$plugin_data = $this->get_plugin_data();

		// Add Videos submenu under Products.
		add_submenu_page(
			'edit.php?post_type=product',
			esc_html__( 'Videos', 'tubebay' ),
			esc_html__( 'Videos', 'tubebay' ),
			'manage_tubebay',
			'tubebay-videos',
			array( $this, 'add_setting_root_div' )
		);
		
		// Store menu info for other methods.
		$this->menu_info = array(
			'menu_slug' => 'tubebay-videos',
		);
	}

	/**
	 * Redirect to the main TubeBay dashboard.
	 *
	 * @return void
	 */
	public function redirect_to_tubebay() {
		$redirect_url = admin_url( 'edit.php?post_type=product&page=tubebay-videos' );
		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Check if current page is our menu page.
	 *
	 * @access public
	 * @since 1.0.0
	 * @return bool
	 */
	public function is_menu_page() {
		$screen              = get_current_screen();
		
		if ( ! $screen ) {
			return false;
		}
		
		$base = $screen->base;
		
		if ( 'product_page_tubebay-videos' === $base ) {
			return true;
		}

		// Check for WooCommerce Settings tab
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( 'woocommerce_page_wc-settings' === $base && isset( $_GET['tab'] ) && TUBEBAY_PLUGIN_NAME === $_GET['tab'] ) {
			return true;
		}

		return false;
	}

	/**
	 * Add has sticky header class.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param string $classes The classes.
	 * @return string
	 */
	public function add_has_sticky_header( $classes ) {
		if ( $this->is_menu_page() ) {
			$classes .= ' at-has-hdr-stky ';
		}
		return $classes;
	}

	/**
	 * Add setting root div.
	 *
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public function add_setting_root_div() {
		echo '<div id="' . esc_attr( TUBEBAY_PLUGIN_NAME ) . '">
			<div class="tubebay-loader-container">
				<p>' . esc_html__( 'Loading...', 'tubebay' ) . '</p>
			</div>
		</div>';
	}

	/**
	 * Enqueue admin resources.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function enqueue_resources() {
		wp_enqueue_style( 'tubebay-admin-style', TUBEBAY_URL . 'assets/css/admin-menu.css', array(), TUBEBAY_VERSION );

		if ( ! $this->is_menu_page() ) {
			return;
		}

		$screen = get_current_screen();
		$context = ( isset( $screen->base ) && 'woocommerce_page_wc-settings' === $screen->base ) ? 'settings' : 'admin';
		$handle  = TUBEBAY_PLUGIN_NAME . '-' . $context;

		tubebay_log( "Admin: Enqueueing admin resources for TubeBay menu page (context: {$context})", 'debug' );

		$deps_file  = TUBEBAY_PATH . "build/{$context}.asset.php";
		$dependency = array( 'wp-i18n' );
		$version    = TUBEBAY_VERSION;
		if ( file_exists( $deps_file ) ) {
			$deps_file  = require $deps_file;
			$dependency = $deps_file['dependencies'];
			$version    = $deps_file['version'];
			tubebay_log( 'Admin: Loaded exact build dependencies: ' . wp_json_encode( $dependency ), 'debug' );
		} else {
			tubebay_log( 'Admin: Build asset file not found; falling back to default dependencies', 'debug' );
		}

		/**
		 * Filters the URL of the main admin JavaScript file.
		 *
		 * @since 1.0.0
		 * @hook tubebay_admin_script_{$context}
		 * @param string $script_url The URL to the js file.
		 */
		$admin_script = apply_filters( "tubebay_admin_script_{$context}", TUBEBAY_URL . "build/{$context}.js" );
		wp_enqueue_script( $handle, $admin_script, $dependency, $version, true );
		wp_enqueue_editor();
		wp_enqueue_media();

		/**
		 * Filters the URL of the main admin CSS file.
		 *
		 * @since 1.0.0
		 * @hook tubebay_admin_css_{$context}
		 * @param string $style_url The URL to the css file.
		 */
		$admin_css = apply_filters( "tubebay_admin_css_{$context}", TUBEBAY_URL . "build/{$context}.css" );
		wp_enqueue_style( $handle, $admin_css, array(), $version );
		wp_style_add_data( $handle, 'rtl', 'replace' );

		/**
		 * Filters the data passed from PHP to the main admin JavaScript application.
		 *
		 * @since 1.0.0
		 * @hook tubebay_admin_localize
		 * @param array $localize An associative array of data to be passed to JS.
		 * @return array The filtered localization data array.
		 */
		$localize = apply_filters(
			'tubebay_admin_localize',
			array(
				'version'         => $version,
				'root_id'         => TUBEBAY_PLUGIN_NAME,
				'nonce'           => wp_create_nonce( 'wp_rest' ),
				'store'           => TUBEBAY_PLUGIN_NAME,
				'rest_url'        => get_rest_url(),
				'pluginData'      => $this->get_plugin_data(),
				'wpSettings'      => array(
					'dateFormat' => get_option( 'date_format' ),
					'timeFormat' => get_option( 'time_format' ),
				),
				'plugin_settings' => Settings::get_all(),
				'products_url'    => admin_url( 'edit.php?post_type=product' ),
				'settings_url'    => admin_url( 'admin.php?page=wc-settings&tab=' . TUBEBAY_PLUGIN_NAME ),
				'context'         => $context,
			)
		);

		wp_localize_script( $handle, 'tubebay_Localize', $localize );

		$path_to_check = TUBEBAY_PATH . 'languages';
		wp_set_script_translations(
			$handle,
			'tubebay',
			$path_to_check
		);
	}

	/**
	 * Add plugin action links.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param string[] $actions     Plugin action links.
	 * @param string   $plugin_file Path to the plugin file.
	 * @param array    $plugin_data Plugin data.
	 * @param string   $context     The plugin context.
	 * @return array
	 */
	public function add_plugin_action_links( $actions, $plugin_file, $plugin_data, $context ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		$actions[] = '<a href="' . esc_url( admin_url( 'admin.php?page=wc-settings&tab=' . TUBEBAY_PLUGIN_NAME ) ) . '">' . esc_html__( 'Settings', 'tubebay' ) . '</a>';
		return $actions;
	}
	
	/**
	 * Add to WooCommerce settings pages.
	 *
	 * @since 1.0.0
	 * @param array $settings The settings pages.
	 * @return array
	 */
	public function add_wc_settings_tab( $settings ) {
		$settings[] = new WCSettingsTab();
		return $settings;
	}

	/**
	 * Dismiss onboarding notice action.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function handle_dismiss_onboarding() {
		if ( isset( $_GET['tubebay_dismiss_onboarding'] ) && check_admin_referer( 'tubebay_dismiss_onboarding' ) ) {
			Settings::set( 'is_onboarding_completed', true );
			wp_safe_redirect( remove_query_arg( array( 'tubebay_dismiss_onboarding', '_wpnonce' ) ) );
			exit;
		}
	}

	/**
	 * Display onboarding notice on WooCommerce pages.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function display_onboarding_notice() {
		if ( ! current_user_can( 'manage_woocommerce' ) && ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen ) {
			return;
		}

		$is_wc_page = false;
		if ( strpos( $screen->id, 'woocommerce' ) !== false || strpos( $screen->id, 'wc-' ) !== false || 'dashboard' === $screen->id || 'edit-product' === $screen->id || 'product' === $screen->id ) {
			$is_wc_page = true;
		}

		if ( ! $is_wc_page ) {
			return;
		}

		if ( Settings::get( 'is_onboarding_completed' ) ) {
			return;
		}

		if ( $this->is_menu_page() ) {
			return;
		}

		$setup_url   = admin_url( 'edit.php?post_type=product&page=tubebay-videos#/onboarding' );
		$dismiss_url = wp_nonce_url( add_query_arg( 'tubebay_dismiss_onboarding', '1' ), 'tubebay_dismiss_onboarding' );
		?>
		<style type="text/css">
			/* WooCommerce Admin SPA stylesheet hides standard notices under #wpbody-content. We force ours to show. */
			#wpbody-content .tubebay-onboarding-notice,
			.woocommerce-layout__notice-list-wrapper .tubebay-onboarding-notice,
			.tubebay-onboarding-notice {
				display: block !important;
				visibility: visible !important;
				opacity: 1 !important;
				margin: 20px 20px 10px 2px !important;
			}
		</style>
		<div class="notice notice-info is-dismissible tubebay-onboarding-notice" style="padding: 15px 20px; border-left-color: #2271b1; position: relative; display: block !important;">
			<h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;"><?php esc_html_e( 'Welcome to TubeBay!', 'tubebay' ); ?></h3>
			<p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5; color: #4c4c4c;">
				<?php esc_html_e( 'Connect your YouTube channel once, and seamlessly sync product videos across your entire WooCommerce store.', 'tubebay' ); ?>
			</p>
			<p style="margin: 0;">
				<a href="<?php echo esc_url( $setup_url ); ?>" class="button button-primary" style="margin-right: 10px;"><?php esc_html_e( 'Start Setup Wizard', 'tubebay' ); ?></a>
				<a href="<?php echo esc_url( $dismiss_url ); ?>" class="button button-secondary"><?php esc_html_e( 'Skip Setup', 'tubebay' ); ?></a>
			</p>
		</div>
		<script type="text/javascript">
			jQuery(document).on('click', '.tubebay-onboarding-notice .notice-dismiss', function() {
				window.location.href = '<?php echo esc_url_raw( $dismiss_url ); ?>';
			});
		</script>
		<?php
	}

	/**
	 * Register or update the WooCommerce Admin Inbox Note for onboarding.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function manage_woocommerce_inbox_note() {
		if ( ! class_exists( 'Automattic\WooCommerce\Admin\Notes\Note' ) || ! class_exists( 'Automattic\WooCommerce\Admin\Notes\Notes' ) ) {
			return;
		}

		$note_name = 'tubebay-onboarding-setup';

		// If onboarding is completed, delete the note
		if ( Settings::get( 'is_onboarding_completed' ) ) {
			try {
				\Automattic\WooCommerce\Admin\Notes\Notes::delete_notes_with_name( $note_name );
			} catch ( \Exception $e ) {
				// Ignore errors
			}
			return;
		}

		try {
			$note_exists = \Automattic\WooCommerce\Admin\Notes\Notes::get_note_by_name( $note_name );
			if ( $note_exists ) {
				return;
			}

			$note = new \Automattic\WooCommerce\Admin\Notes\Note();
			$note->set_title( __( 'Ready to get started with TubeBay?', 'tubebay' ) );
			$note->set_content( __( 'Connect your YouTube channel once, and seamlessly sync product videos across your entire WooCommerce store.', 'tubebay' ) );
			$note->set_content_data( (object) array() );
			$note->set_type( \Automattic\WooCommerce\Admin\Notes\Note::E_WC_ADMIN_NOTE_INFORMATIONAL );
			$note->set_name( $note_name );
			$note->set_source( 'tubebay' );

			$setup_url   = admin_url( 'edit.php?post_type=product&page=tubebay-videos#/onboarding' );

			// Start Setup (Primary action)
			$note->add_action(
				'start-setup',
				__( 'Start Setup Wizard', 'tubebay' ),
				$setup_url,
				'actioned',
				true
			);

			$note->save();
		} catch ( \Exception $e ) {
			// Ignore database errors
		}
	}

	/**
	 * Register the hooks for the admin area.
	 *
	 * @since    1.0.0
	 * @param    \TubeBay\Core\Plugin $plugin The Plugin instance.
	 * @return   void
	 */
	public function run( $plugin ) {
		$loader = $plugin->get_loader();
		$loader->add_filter( 'all_plugins', $plugin, 'change_plugin_display_name' );
		$loader->add_action( 'admin_menu', $this, 'add_admin_menu' );
		$loader->add_filter( 'woocommerce_get_settings_pages', $this, 'add_wc_settings_tab' );
		$loader->add_filter( 'admin_body_class', $this, 'add_has_sticky_header' );
		$loader->add_action( 'admin_enqueue_scripts', $this, 'enqueue_resources' );
		$loader->add_action( 'admin_notices', $this, 'display_onboarding_notice' );
		$loader->add_action( 'admin_init', $this, 'handle_dismiss_onboarding' );
		$loader->add_action( 'admin_init', $this, 'manage_woocommerce_inbox_note' );

		$plugin_basename = plugin_basename( TUBEBAY_PATH . 'tubebay.php' );
		$loader->add_filter( 'plugin_action_links_' . $plugin_basename, $this, 'add_plugin_action_links', 10, 4 );
	}
}
