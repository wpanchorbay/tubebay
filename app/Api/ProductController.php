<?php
namespace TubeBay\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;

class ProductController extends ApiController {

	private static $instance = null;

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

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

	public function get_products( $request ) {
		$params = $request->get_params();
		$search = isset( $params['search'] ) ? sanitize_text_field( $params['search'] ) : '';
		$page = isset( $params['page'] ) ? max( 1, intval( $params['page'] ) ) : 1;
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
				if ( ! $product ) continue;

				$video_ids_json = get_post_meta( $post->ID, '_tubebay_video_ids', true );
				$assigned_videos = array();

				if ( ! empty( $video_ids_json ) ) {
					$assigned_videos = json_decode( $video_ids_json, true ) ?: array();
				} else {
					$legacy_id = get_post_meta( $post->ID, '_tubebay_video_id', true );
					if ( ! empty( $legacy_id ) ) {
						$assigned_videos = array(
							array(
								'id' => $legacy_id,
								'type' => 'youtube',
								'title' => get_post_meta( $post->ID, '_tubebay_video_title', true ),
								'thumbnail' => get_post_meta( $post->ID, '_tubebay_video_thumbnail', true )
							)
						);
					}
				}

				$image_id  = $product->get_image_id();
				$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : wc_placeholder_img_src();

				$products[] = array(
					'id' => $post->ID,
					'name' => $post->post_title,
					'sku' => $product->get_sku(),
					'thumbnail' => $image_url,
					'assigned_videos' => $assigned_videos,
					'video_count' => count( $assigned_videos )
				);
			}
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'products' => $products,
				'total_pages' => $query->max_num_pages,
				'total_items' => $query->found_posts,
				'current_page' => $page
			),
			200
		);
	}
}
