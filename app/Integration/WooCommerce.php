<?php

namespace TubeBay\Integration;

use TubeBay\Core\Plugin;
use TubeBay\Helper\Settings;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WooCommerce
 *
 * Handles integration with WooCommerce hooks.
 *
 * @package    TubeBay
 * @subpackage TubeBay/Integration
 * @since      1.0.0
 */
class WooCommerce {

	/**
	 * The single instance of the class.
	 *
	 * @var WooCommerce|null
	 */
	private static $instance = null;

	/**
	 * Gets an instance of this object.
	 *
	 * @return WooCommerce
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
	 * @param Plugin $plugin
	 */
	public function run( $plugin ) {
		$loader = $plugin->get_loader();

		// We now always hook into the gallery regardless of global settings,
		// because the position can be overridden per product.
		tubebay_log( "WooCommerce: Registering render_video_in_gallery on hook: woocommerce_single_product_image_thumbnail_html", 'debug' );
		$loader->add_filter( 'woocommerce_single_product_image_thumbnail_html', $this, 'render_video_in_gallery', 10, 2 );

		// Add frontend assets hook
		$loader->add_action( 'wp_enqueue_scripts', $this, 'enqueue_frontend_scripts' );
	}

	/**
	 * Enqueue frontend vanilla JS and CSS.
	 */
	public function enqueue_frontend_scripts() {
		/*
		 * This runs on wp_enqueue_scripts, i.e. on every front-end request. An
		 * unguarded is_product() therefore takes the entire shop front down with
		 * a fatal the moment WooCommerce stops loading -- not a theoretical
		 * case: it is in this site's debug.log. "Requires Plugins: woocommerce"
		 * blocks activation without WooCommerce and makes its Deactivate link
		 * inert, but it does not survive WP-CLI, a fatal inside WooCommerce
		 * itself, or the plugin folder being renamed. Without WooCommerce there
		 * is no product page to style, so bailing is also the correct behaviour.
		 */
		if ( ! function_exists( 'is_product' ) || ! is_product() ) {
			return;
		}

		$version = TUBEBAY_VERSION;

		// CSS
		wp_enqueue_style( 'tubebay-gallery-css', TUBEBAY_URL . 'assets/css/frontend/tubebay-gallery.css', array(), $version );
	}
	/**
	 * Inject the videos into the WooCommerce product gallery.
	 *
	 * @param string $html              The original image HTML.
	 * @param int    $post_thumbnail_id The thumbnail ID.
	 * @return string
	 */
	public function render_video_in_gallery( $html, $post_thumbnail_id ) {
		global $post;

		if ( ! is_singular( 'product' ) || ! $post ) {
			return $html;
		}

		static $injected = false;
		if ( $injected ) {
			return $html;
		}

		// 1. Get array of videos
		$video_ids_json = get_post_meta( $post->ID, '_tubebay_video_ids', true );
		$videos = array();

		if ( ! empty( $video_ids_json ) ) {
			$videos = json_decode( $video_ids_json, true ) ?: array();
		} else {
			$legacy_id = get_post_meta( $post->ID, '_tubebay_video_id', true );
			if ( ! empty( $legacy_id ) ) {
				$videos = array(
					array(
						'id' => $legacy_id,
						'type' => 'youtube',
						'title' => get_post_meta( $post->ID, '_tubebay_video_title', true ),
						'thumbnail' => get_post_meta( $post->ID, '_tubebay_video_thumbnail', true )
					)
				);
			}
		}

		if ( empty( $videos ) ) {
			return $html;
		}

		/**
		 * Filter the gallery videos before rendering.
		 * Pro can add/remove/reorder videos (e.g. inject Vimeo/HLS entries).
		 *
		 * @since 1.1.0
		 * @param array       $videos The video array.
		 * @param \WP_Post    $post   The current product post.
		 */
		$videos = apply_filters( 'tubebay_gallery_videos', $videos, $post );

		if ( empty( $videos ) ) {
			return $html;
		}

		// 2. Get global + per-product settings
		$max_videos = get_post_meta( $post->ID, '_tubebay_max_videos', true );
		$max_videos = ( $max_videos !== '' ) ? intval($max_videos) : intval(Settings::get( 'max_videos', 0 ));

		$placement = get_post_meta( $post->ID, '_tubebay_video_position', true );
		$placement = ( $placement !== '' ) ? $placement : Settings::get( 'video_position', 'first' );

		// 'mixed' was offered until 1.3.0 and never implemented — it always
		// fell through to the same branch as 'last'. Say so explicitly rather
		// than leave it to a fall-through nobody can read as intentional.
		if ( 'mixed' === $placement ) {
			$placement = 'last';
		}

		$autoplay_first = get_post_meta( $post->ID, '_tubebay_autoplay_first', true );
		$autoplay_first = ( $autoplay_first !== '' ) ? ($autoplay_first === 'yes') : Settings::get( 'autoplay_first', false );

		$show_duration = get_post_meta( $post->ID, '_tubebay_show_duration', true );
		$show_duration = ( $show_duration !== '' ) ? ($show_duration === 'yes') : Settings::get( 'show_duration', true );

		$privacy_mode = Settings::get( 'privacy_mode', false );

		// Apply max limit if not 0 (unlimited)
		if ( $max_videos > 0 && count( $videos ) > $max_videos ) {
			$videos = array_slice( $videos, 0, $max_videos );
		}

		// Check if we need to output the main container wrapper
		static $has_output_gallery_data = false;
		if ( ! $has_output_gallery_data ) {
			$gallery_config = array(
				'privacy_mode'  => (bool) $privacy_mode,
				'placement'     => $placement,
				// Read by assets/js/public.js when it builds the embed URL.
				// Without it the gallery ignored Settings > Player entirely.
				'show_controls' => (bool) Settings::get( 'show_controls', true ),
			);
			echo '<div id="tubebay-gallery-data" style="display:none;" data-config="' . esc_attr( wp_json_encode( $gallery_config ) ) . '"></div>';
			$has_output_gallery_data = true;
		}

		$main_image_id = get_post_thumbnail_id( $post->ID );

		$videos_html = '';

		/**
		 * Fires before the gallery video loop starts.
		 * Pro can use this to enqueue per-product scripts or inject markup.
		 *
		 * @since 1.1.0
		 * @param \WP_Post $post The current product post.
		 */
		do_action( 'tubebay_gallery_before_videos', $post );

		foreach ( $videos as $index => $video ) {
			// Guard against legacy/malformed entries (e.g. plain-string video IDs).
			if ( ! is_array( $video ) || ! isset( $video['id'] ) ) {
				continue;
			}
			$vid_id = $video['id'];
			$vid_type = isset($video['type']) ? $video['type'] : 'youtube';
			$vid_thumb = isset($video['thumbnail']) ? $video['thumbnail'] : '';

			if ( $vid_type === 'youtube' && empty($vid_thumb) ) {
				$vid_thumb = 'https://i.ytimg.com/vi/' . esc_attr( $vid_id ) . '/hqdefault.jpg';
			}

			if ( $vid_type === 'self_hosted' && empty($vid_thumb) ) {
				$vid_thumb = includes_url( 'images/media/video.svg' );
			}

			$is_first = ( $index === 0 );
			$autoplay = ( $is_first && $autoplay_first ) ? 'true' : 'false';

			ob_start();
			?>
			<?php
			$video_url = '';
			$mime_type = '';
			if ( $vid_type === 'self_hosted' ) {
				$video_url = wp_get_attachment_url( $vid_id );
				$mime_type = get_post_mime_type( $vid_id );
			}
			?>
			<div data-thumb="<?php echo esc_url( $vid_thumb ); ?>" class="woocommerce-product-gallery__image tubebay-virtual-slide tubebay-video-slide">
				<div class="tubebay-video-facade"
					data-video-id="<?php echo esc_attr( $vid_id ); ?>"
					data-video-type="<?php echo esc_attr( $vid_type ); ?>"
					data-video-url="<?php echo esc_attr( $video_url ); ?>"
					data-mime-type="<?php echo esc_attr( $mime_type ); ?>"
					data-poster="<?php echo esc_url( $vid_thumb ); ?>"
					data-autoplay="<?php echo esc_attr( $autoplay ); ?>"
					style="position: relative; padding-bottom: 100%; height: 0; overflow: hidden; width: 100%; background: #000; cursor: pointer;">

					<img src="<?php echo esc_url( $vid_thumb ); ?>" alt="Product Video" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; margin: 0;" />

					<div class="tubebay-play-button" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 48px; transition: all 0.2s ease-in-out; z-index: 2;">
						<svg viewBox="0 0 68 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
							<path class="tubebay-play-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#212121" fill-opacity="0.8"></path>
							<path d="M 45,24 27,14 27,34" fill="#fff"></path>
						</svg>
					</div>

					<?php if ( $show_duration ): ?>
						<!-- Badge -->
						<div class="tubebay-duration-badge" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: #fff; padding: 2px 6px; font-size: 11px; border-radius: 4px; z-index: 2; line-height: 1.2;">Video</div>
					<?php endif; ?>
				</div>
			</div>
			<?php
			$videos_html .= ob_get_clean();
		}

		// Inject based on placement
		// We only want to inject this ONCE per gallery load.
		// WooCommerce calls this filter for the main image, and then for EACH gallery image.
		// To avoid duplicating the videos, we only append them when processing the MAIN image (first slide).
		// Note: The frontend JS will rearrange them if 'last' is selected, but it's easier to inject them all at the beginning and let JS sort it.

		if ( $post_thumbnail_id == $main_image_id || empty( $main_image_id ) ) {
			$injected = true;
			if ( $placement === 'first' ) {
				$output = $videos_html . $html;
			} else {
				// We append to the HTML, but frontend JS will move it to the end or mixed if needed.
				$output = $html . $videos_html;
			}

			/**
			 * Filter the final gallery HTML output.
			 *
			 * @since 1.1.0
			 * @param string $output    The combined HTML.
			 * @param array  $videos    The video array.
			 * @param string $placement  The placement setting ('first'|'last').
			 */
			return apply_filters( 'tubebay_gallery_html', $output, $videos, $placement );
		}

		return $html;
	}
}
