<?php
/**
 * ProductController class.
 *
 * Handles the API endpoint that lists products with their assigned videos.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Api
 */

namespace TubeBay\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;

/**
 * ProductController class.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Api
 * @author     sankarsan <wpanchorbay@gmail.com>
 */
class ProductController extends ApiController {

	/**
	 * Instance of this class.
	 *
	 * @var ProductController|null
	 * @since 1.0.0
	 */
	private static $instance = null;

	/**
	 * Get instance of this class.
	 *
	 * @since  1.0.0
	 * @return ProductController
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register the REST routes for this controller.
	 *
	 * @since  1.0.0
	 * @return void
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		register_rest_route(
			$namespace,
			'/products',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_products' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Return a paginated list of products together with their assigned videos.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $request The REST request.
	 * @return WP_REST_Response
	 */
	public function get_products( $request ) {
		// wc_get_product() and wc_placeholder_img_src() are both used below. A
		// 500 from an undefined function tells the admin nothing; this says what
		// is actually wrong.
		if ( ! function_exists( 'wc_get_product' ) ) {
			return new \WP_Error(
				'woocommerce_missing',
				__( 'WooCommerce is not active, so products cannot be listed.', 'tubebay' ),
				array( 'status' => 503 )
			);
		}

		$params   = $request->get_params();
		$search   = isset( $params['search'] ) ? sanitize_text_field( $params['search'] ) : '';
		$page     = isset( $params['page'] ) ? max( 1, intval( $params['page'] ) ) : 1;
		$per_page = 20;

		$args = array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'posts_per_page' => $per_page,
			'paged'          => $page,
		);

		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$query = new \WP_Query( $args );

		$products = array();
		if ( $query->have_posts() ) {
			foreach ( $query->posts as $post ) {
				$product = wc_get_product( $post->ID );
				if ( ! $product ) {
					continue;
				}

				$video_ids_json  = get_post_meta( $post->ID, '_tubebay_video_ids', true );
				$assigned_videos = array();

				if ( ! empty( $video_ids_json ) ) {
					$decoded         = json_decode( $video_ids_json, true );
					$assigned_videos = is_array( $decoded ) ? $decoded : array();
				} else {
					$legacy_id = get_post_meta( $post->ID, '_tubebay_video_id', true );
					if ( ! empty( $legacy_id ) ) {
						$assigned_videos = array(
							array(
								'id'        => $legacy_id,
								'type'      => 'youtube',
								'title'     => get_post_meta( $post->ID, '_tubebay_video_title', true ),
								'thumbnail' => get_post_meta( $post->ID, '_tubebay_video_thumbnail', true ),
							),
						);
					}
				}

				$image_id  = $product->get_image_id();
				$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : wc_placeholder_img_src();

				$products[] = array(
					'id'              => $post->ID,
					'name'            => $post->post_title,
					'sku'             => $product->get_sku(),
					'thumbnail'       => $image_url,
					'assigned_videos' => $assigned_videos,
					'video_count'     => count( $assigned_videos ),
				);
			}
		}

		return new WP_REST_Response(
			array(
				'success'      => true,
				'products'     => $products,
				'total_pages'  => $query->max_num_pages,
				'total_items'  => $query->found_posts,
				'current_page' => $page,
			),
			200
		);
	}
}
