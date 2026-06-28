<?php
/**
 * ProductManager class.
 *
 * Handles the TubeBay Product Manager page for assigning videos to products in bulk.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Admin
 */

namespace TubeBay\Admin;

use TubeBay\Core\Plugin;
use WP_List_Table;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'WP_List_Table' ) ) {
	require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * Class ProductManagerListTable
 */
class ProductManagerListTable extends WP_List_Table {

	/**
	 * Constructor.
	 */
	public function __construct() {
		parent::__construct(
			array(
				'singular' => __( 'Product', 'tubebay' ),
				'plural'   => __( 'Products', 'tubebay' ),
				'ajax'     => false,
			)
		);
	}

	/**
	 * Prepare items for the table.
	 */
	public function prepare_items() {
		$per_page = 20;
		$current_page = $this->get_pagenum();

		$args = array(
			'post_type'      => 'product',
			'post_status'    => 'any',
			'posts_per_page' => $per_page,
			'offset'         => ( $current_page - 1 ) * $per_page,
		);

		if ( isset( $_REQUEST['s'] ) && ! empty( $_REQUEST['s'] ) ) {
			$args['s'] = sanitize_text_field( $_REQUEST['s'] );
		}

		// Filter by video status
		if ( isset( $_REQUEST['video_status'] ) ) {
			if ( 'with_video' === $_REQUEST['video_status'] ) {
				$args['meta_query'] = array(
					'relation' => 'OR',
					array(
						'key'     => '_tubebay_video_ids',
						'compare' => 'EXISTS',
					),
					array(
						'key'     => '_tubebay_video_id',
						'value'   => '',
						'compare' => '!=',
					),
				);
			} elseif ( 'without_video' === $_REQUEST['video_status'] ) {
				$args['meta_query'] = array(
					'relation' => 'AND',
					array(
						'key'     => '_tubebay_video_ids',
						'compare' => 'NOT EXISTS',
					),
					array(
						'relation' => 'OR',
						array(
							'key'     => '_tubebay_video_id',
							'compare' => 'NOT EXISTS',
						),
						array(
							'key'     => '_tubebay_video_id',
							'value'   => '',
							'compare' => '=',
						),
					),
				);
			}
		}

		$query = new \WP_Query( $args );

		$this->items = $query->posts;

		$this->set_pagination_args(
			array(
				'total_items' => $query->found_posts,
				'per_page'    => $per_page,
				'total_pages' => ceil( $query->found_posts / $per_page ),
			)
		);
	}

	/**
	 * Get columns for the table.
	 *
	 * @return array
	 */
	public function get_columns() {
		return array(
			'cb'         => '<input type="checkbox" />',
			'thumb'      => '<span class="wc-image tips" data-tip="' . esc_attr__( 'Image', 'woocommerce' ) . '">' . __( 'Image', 'woocommerce' ) . '</span>',
			'name'       => __( 'Name', 'tubebay' ),
			'sku'        => __( 'SKU', 'tubebay' ),
			'videos'     => __( 'Assigned Videos', 'tubebay' ),
		);
	}

	/**
	 * Render the checkbox column.
	 *
	 * @param \WP_Post $item
	 * @return string
	 */
	protected function column_cb( $item ) {
		return sprintf(
			'<input type="checkbox" name="product_ids[]" value="%d" />',
			$item->ID
		);
	}

	/**
	 * Render the thumbnail column.
	 *
	 * @param \WP_Post $item
	 * @return string
	 */
	protected function column_thumb( $item ) {
		$product = wc_get_product( $item->ID );
		return $product ? $product->get_image( 'thumbnail' ) : '';
	}

	/**
	 * Render the name column.
	 *
	 * @param \WP_Post $item
	 * @return string
	 */
	protected function column_name( $item ) {
		$product = wc_get_product( $item->ID );
		if ( ! $product ) {
			return '';
		}

		$edit_link = get_edit_post_link( $item->ID );
		$title = _draft_or_post_title( $item );

		$actions = array(
			'edit' => sprintf( '<a href="%s">%s</a>', $edit_link, __( 'Edit', 'tubebay' ) ),
			'view' => sprintf( '<a href="%s" rel="bookmark">%s</a>', get_permalink( $item->ID ), __( 'View', 'tubebay' ) ),
		);

		return sprintf(
			'<strong><a class="row-title" href="%s">%s</a></strong>%s',
			esc_url( $edit_link ),
			esc_html( $title ),
			$this->row_actions( $actions )
		);
	}

	/**
	 * Render the SKU column.
	 *
	 * @param \WP_Post $item
	 * @return string
	 */
	protected function column_sku( $item ) {
		$product = wc_get_product( $item->ID );
		return $product && $product->get_sku() ? $product->get_sku() : '<span class="na">&ndash;</span>';
	}

	/**
	 * Render the assigned videos column.
	 *
	 * @param \WP_Post $item
	 * @return string
	 */
	protected function column_videos( $item ) {
		$video_ids_json = get_post_meta( $item->ID, '_tubebay_video_ids', true );
		$count = 0;
		$videos = array();

		if ( ! empty( $video_ids_json ) ) {
			$videos = json_decode( $video_ids_json, true );
			if ( is_array( $videos ) ) {
				$count = count( $videos );
			}
		} else {
			$legacy_id = get_post_meta( $item->ID, '_tubebay_video_id', true );
			if ( ! empty( $legacy_id ) ) {
				$count = 1;
				$videos[] = array( 'type' => 'youtube', 'id' => $legacy_id );
			}
		}

		$html = sprintf( '<span class="tubebay-badge tubebay-badge-%s">%d</span>', $count > 0 ? 'success' : 'default', $count );

		if ( $count > 0 ) {
			$html .= ' <a href="' . esc_url( get_edit_post_link( $item->ID ) ) . '" class="tubebay-edit-inline">' . __( 'Edit', 'tubebay' ) . '</a>';
		} else {
			$html .= ' <a href="' . esc_url( get_edit_post_link( $item->ID ) ) . '" class="tubebay-edit-inline">' . __( 'Add', 'tubebay' ) . '</a>';
		}

		return $html;
	}
}

/**
 * Class ProductManager
 */
class ProductManager {

	/**
	 * The single instance of the class.
	 *
	 * @var ProductManager|null
	 */
	private static $instance = null;

	/**
	 * Gets an instance of this object.
	 *
	 * @return ProductManager
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register hooks for this class.
	 *
	 * @param \TubeBay\Core\Plugin $plugin The main plugin instance.
	 * @return void
	 */
	public function run( $plugin ) {
		$loader = $plugin->get_loader();
		$loader->add_action( 'admin_menu', $this, 'add_menu_page', 20 );
	}

	/**
	 * Add submenu page.
	 */
	public function add_menu_page() {
		add_submenu_page(
			'tubebay',
			__( 'TubeBay Product Manager', 'tubebay' ),
			__( 'Product Manager', 'tubebay' ),
			'manage_woocommerce',
			'tubebay-manager',
			array( $this, 'render_page' )
		);
	}

	/**
	 * Render the page content.
	 */
	public function render_page() {
		$table = new ProductManagerListTable();
		$table->prepare_items();

		?>
		<div class="wrap tubebay-manager-wrap">
			<h1 class="wp-heading-inline"><?php esc_html_e( 'Product Manager', 'tubebay' ); ?></h1>
			<p><?php esc_html_e( 'Manage video assignments across your products.', 'tubebay' ); ?></p>

			<form id="tubebay-product-filter" method="get">
				<input type="hidden" name="page" value="tubebay-manager" />
				<?php $table->search_box( __( 'Search Products', 'tubebay' ), 'product' ); ?>

				<div class="alignleft actions">
					<select name="video_status">
						<option value=""><?php esc_html_e( 'All Video Statuses', 'tubebay' ); ?></option>
						<option value="with_video" <?php selected( isset( $_REQUEST['video_status'] ) ? sanitize_text_field( $_REQUEST['video_status'] ) : '', 'with_video' ); ?>><?php esc_html_e( 'With Videos', 'tubebay' ); ?></option>
						<option value="without_video" <?php selected( isset( $_REQUEST['video_status'] ) ? sanitize_text_field( $_REQUEST['video_status'] ) : '', 'without_video' ); ?>><?php esc_html_e( 'Without Videos', 'tubebay' ); ?></option>
					</select>
					<?php submit_button( __( 'Filter', 'tubebay' ), '', 'filter_action', false, array( 'id' => 'post-query-submit' ) ); ?>
				</div>

				<?php $table->display(); ?>
			</form>
		</div>

		<style>
		.tubebay-badge {
			display: inline-block;
			padding: 2px 8px;
			border-radius: 12px;
			font-size: 12px;
			font-weight: bold;
		}
		.tubebay-badge-success {
			background: #e6f4ea;
			color: #1e8e3e;
		}
		.tubebay-badge-default {
			background: #f1f3f4;
			color: #5f6368;
		}
		.tubebay-edit-inline {
			margin-left: 8px;
			font-size: 13px;
		}
		</style>
		<?php
	}
}