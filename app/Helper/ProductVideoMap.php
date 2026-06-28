<?php
/**
 * Helper class for mapping products to their assigned videos.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Helper
 */

namespace TubeBay\Helper;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class ProductVideoMap
 */
class ProductVideoMap {

	/**
	 * Get the map of video IDs to products.
	 * Returns array with format: video_id_or_url => array( product_id )
	 *
	 * @return array
	 */
	public static function get_map() {
		$map = get_transient( 'tubebay_product_video_map' );

		if ( false !== $map ) {
			return $map;
		}

		$map = array();

		global $wpdb;

		// 1. Get legacy single video assignments (_tubebay_video_id)
		$legacy_results = $wpdb->get_results(
			"SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_tubebay_video_id' AND meta_value != ''"
		);

		foreach ( $legacy_results as $row ) {
			$video_id = $row->meta_value;
			if ( ! isset( $map[ $video_id ] ) ) {
				$map[ $video_id ] = array();
			}
			$map[ $video_id ][] = $row->post_id;
		}

		// 2. Get multi-video array assignments (_tubebay_video_ids)
		$array_results = $wpdb->get_results(
			"SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_tubebay_video_ids' AND meta_value != ''"
		);

		foreach ( $array_results as $row ) {
			$video_ids_json = $row->meta_value;
			$videos = json_decode( $video_ids_json, true );

			if ( is_array( $videos ) ) {
				foreach ( $videos as $video ) {
					$vid = '';
					if ( isset( $video['type'] ) && 'youtube' === $video['type'] && ! empty( $video['id'] ) ) {
						$vid = $video['id'];
					} elseif ( isset( $video['type'] ) && 'self-hosted' === $video['type'] ) {
						// For self-hosted, use ID if available, otherwise URL
						if ( ! empty( $video['id'] ) ) {
							$vid = 'self_' . $video['id'];
						} elseif ( ! empty( $video['url'] ) ) {
							$vid = $video['url'];
						}
					}

					if ( ! empty( $vid ) ) {
						if ( ! isset( $map[ $vid ] ) ) {
							$map[ $vid ] = array();
						}
						if ( ! in_array( $row->post_id, $map[ $vid ] ) ) {
							$map[ $vid ][] = $row->post_id;
						}
					}
				}
			}
		}

		// Ensure unique values per video ID just in case
		foreach ( $map as $vid => $product_ids ) {
			$map[ $vid ] = array_values( array_unique( $product_ids ) );
		}

		set_transient( 'tubebay_product_video_map', $map, HOUR_IN_SECONDS );

		return $map;
	}

	/**
	 * Invalidate the product video map cache.
	 *
	 * @return void
	 */
	public static function invalidate_cache() {
		delete_transient( 'tubebay_product_video_map' );
	}
}