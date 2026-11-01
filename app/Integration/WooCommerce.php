<?php

namespace TubeBay\Integration;

use TubeBay\Core\Plugin;
use TubeBay\Data\VideoRepository;
use TubeBay\Helper\Settings;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class WooCommerce
 *
 * Handles integration with WooCommerce hooks, and exposes the gallery render
 * API (get_product_videos(), render_video_slide(), enqueue_frontend_assets(),
 * output_gallery_config()) that the product gallery, the JSON-LD output and the
 * Pro shortcode all share.
 *
 * @package    TubeBay
 * @subpackage TubeBay/Integration
 * @since      1.0.0
 */
class WooCommerce {

	/**
	 * Allowed values for the play_icon setting.
	 *
	 * @since 1.4.0
	 * @var   string[]
	 */
	const PLAY_ICONS = array( 'youtube', 'circle', 'triangle' );

	/**
	 * Allowed values for the video_aspect_ratio setting.
	 *
	 * @since 1.4.0
	 * @var   string[]
	 */
	const ASPECT_RATIOS = array( '16-9', '1-1', '4-3', '9-16' );

	/**
	 * The single instance of the class.
	 *
	 * @var WooCommerce|null
	 */
	private static $instance = null;

	/**
	 * Per-request cache of get_product_videos(), keyed by product ID.
	 *
	 * @since 1.4.0
	 * @var   array<int, array>
	 */
	private $videos_cache = array();

	/**
	 * Whether #tubebay-gallery-data has already been printed on this request.
	 *
	 * @since 1.4.0
	 * @var   bool
	 */
	private $config_printed = false;

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

		// Fixed-height gallery: tag the gallery wrapper so the CSS can equalise image slides too.
		$loader->add_filter( 'woocommerce_single_product_image_gallery_classes', $this, 'add_fixed_height_gallery_class' );

		// Add frontend assets hook
		$loader->add_action( 'wp_enqueue_scripts', $this, 'enqueue_frontend_scripts' );
	}

	/**
	 * Add `tubebay-gallery-fixed-height` to the product gallery wrapper when the
	 * Fixed gallery height setting is on and the product has videos.
	 *
	 * With the class present, tubebay-gallery.css gives every slide (videos and
	 * WooCommerce images) the same height, so the gallery does not jump between
	 * a video and a tall or short image. With the setting off, or on a product
	 * without videos, the gallery is untouched.
	 *
	 * @since 1.4.0
	 * @param string[] $classes Gallery wrapper classes.
	 * @return string[]
	 */
	public function add_fixed_height_gallery_class( $classes ) {
		$settings = Settings::get_all();
		if ( empty( $settings['gallery_fixed_height'] ) ) {
			return $classes;
		}

		$product_id = get_the_ID();
		if ( ! $product_id || ! is_singular( 'product' ) || empty( $this->get_product_videos( $product_id ) ) ) {
			return $classes;
		}

		$classes   = (array) $classes;
		$classes[] = 'tubebay-gallery-fixed-height';
		return $classes;
	}

	/**
	 * Optional fixed pixel height for fixed-height galleries.
	 *
	 * @since 1.4.0
	 * @return int Height in px; 0 (the default) means a square slot, i.e. the
	 *             slot height equals the gallery width.
	 */
	private function get_fixed_height_px() {
		/**
		 * Filter the fixed gallery height in pixels. Return 0 (default) for a
		 * square slot that scales with the gallery width.
		 *
		 * @since 1.4.0
		 * @param int $height Height in px, 0 for square.
		 */
		return max( 0, absint( apply_filters( 'tubebay_gallery_fixed_height_px', 0 ) ) );
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

		$this->enqueue_frontend_assets();
	}

	/**
	 * Enqueue everything a rendered video slide needs: the gallery CSS and the
	 * public script/style the plugin already loads globally.
	 *
	 * Public and idempotent so a shortcode can call it on any page, not just a
	 * product page. WordPress ignores a second enqueue of the same handle.
	 *
	 * @since 1.4.0
	 * @return void
	 */
	public function enqueue_frontend_assets() {
		$version = TUBEBAY_VERSION;

		// Same handles and files as Plugin::enqueue_public_styles().
		wp_enqueue_style( TUBEBAY_OPTION_NAME . '_public', TUBEBAY_URL . 'assets/css/public.css', array(), $version );
		wp_enqueue_style( 'tubebay-gallery-css', TUBEBAY_URL . 'assets/css/frontend/tubebay-gallery.css', array(), $version );

		// Fixed-height gallery with a custom pixel height (tubebay_gallery_fixed_height_px filter).
		$fixed_px = $this->get_fixed_height_px();
		if ( $fixed_px > 0 && ! empty( Settings::get_all()['gallery_fixed_height'] ) ) {
			wp_add_inline_style( 'tubebay-gallery-css', '.tubebay-gallery-fixed-height{--tubebay-fixed-height:' . $fixed_px . 'px;}' );
		}
		wp_enqueue_script( TUBEBAY_OPTION_NAME . '_public_js', TUBEBAY_URL . 'assets/js/public.js', array(), $version, true );
	}

	/**
	 * The per-product display options (each overrides the matching global
	 * setting when the product sets its own).
	 *
	 * @since 1.4.0
	 * @param int $product_id Product ID.
	 * @return array {
	 *     @type int    $max_videos     0 means unlimited.
	 *     @type string $placement      'first' or 'last'.
	 *     @type bool   $autoplay_first Autoplay the first video.
	 *     @type bool   $show_duration  Show the duration badge.
	 * }
	 */
	public function get_product_options( $product_id ) {
		$product_id = (int) $product_id;
		$settings   = Settings::get_all();

		$max_videos = get_post_meta( $product_id, '_tubebay_max_videos', true );
		$max_videos = ( '' !== $max_videos ) ? intval( $max_videos ) : intval( isset( $settings['max_videos'] ) ? $settings['max_videos'] : 0 );

		$placement = get_post_meta( $product_id, '_tubebay_video_position', true );
		$placement = ( '' !== $placement ) ? $placement : ( isset( $settings['video_position'] ) ? $settings['video_position'] : 'first' );

		// 'mixed' was offered until 1.3.0 and never implemented — it always
		// fell through to the same branch as 'last'. Say so explicitly rather
		// than leave it to a fall-through nobody can read as intentional.
		if ( 'mixed' === $placement ) {
			$placement = 'last';
		}

		$autoplay_first = get_post_meta( $product_id, '_tubebay_autoplay_first', true );
		$autoplay_first = ( '' !== $autoplay_first ) ? ( 'yes' === $autoplay_first ) : ! empty( $settings['autoplay_first'] );

		$show_duration = get_post_meta( $product_id, '_tubebay_show_duration', true );
		$show_duration = ( '' !== $show_duration ) ? ( 'yes' === $show_duration ) : ( ! isset( $settings['show_duration'] ) || ! empty( $settings['show_duration'] ) );

		return array(
			'max_videos'     => $max_videos,
			'placement'      => $placement,
			'autoplay_first' => $autoplay_first,
			'show_duration'  => $show_duration,
		);
	}

	/**
	 * Resolve a product's videos: the single source for the gallery, the
	 * JSON-LD output and the Pro shortcode.
	 *
	 * Reads `_tubebay_video_ids` (falling back to the legacy single-video
	 * meta), runs the `tubebay_gallery_videos` filter, applies the per-product
	 * or global max-videos limit, then enriches each entry from the videos
	 * table. Order is the order stored in `_tubebay_video_ids`. Cached per
	 * request per product.
	 *
	 * Each item keeps every key the stored entry had (`id`, `type`, `title`,
	 * `thumbnail`, plus anything the filter added) and gains: `video_id`,
	 * `title`, `description`, `thumbnail_url`, `thumbnail`, `duration`,
	 * `duration_seconds`, `uploaded_at`, `synced_at`, `channel_id`. Fields with
	 * no table row are '' (duration_seconds is 0).
	 *
	 * @since 1.4.0
	 * @param int $product_id Product ID.
	 * @return array[] List of video arrays; empty when the product has none.
	 */
	public function get_product_videos( $product_id ) {
		$product_id = (int) $product_id;

		if ( isset( $this->videos_cache[ $product_id ] ) ) {
			return $this->videos_cache[ $product_id ];
		}

		$this->videos_cache[ $product_id ] = array();

		$video_ids_json = get_post_meta( $product_id, '_tubebay_video_ids', true );
		$videos         = array();

		if ( ! empty( $video_ids_json ) ) {
			$videos = json_decode( $video_ids_json, true ) ?: array();
		} else {
			$legacy_id = get_post_meta( $product_id, '_tubebay_video_id', true );
			if ( ! empty( $legacy_id ) ) {
				$videos = array(
					array(
						'id'        => $legacy_id,
						'type'      => 'youtube',
						'title'     => get_post_meta( $product_id, '_tubebay_video_title', true ),
						'thumbnail' => get_post_meta( $product_id, '_tubebay_video_thumbnail', true ),
					),
				);
			}
		}

		if ( empty( $videos ) || ! is_array( $videos ) ) {
			return array();
		}

		/**
		 * Filter the gallery videos before rendering.
		 * Pro can add/remove/reorder videos (e.g. inject Vimeo/HLS entries).
		 *
		 * @since 1.1.0
		 * @param array       $videos The video array.
		 * @param \WP_Post    $post   The current product post.
		 */
		$videos = apply_filters( 'tubebay_gallery_videos', $videos, get_post( $product_id ) );

		if ( empty( $videos ) || ! is_array( $videos ) ) {
			return array();
		}

		// Apply max limit if not 0 (unlimited).
		$options = $this->get_product_options( $product_id );
		if ( $options['max_videos'] > 0 && count( $videos ) > $options['max_videos'] ) {
			$videos = array_slice( $videos, 0, $options['max_videos'] );
		}

		// Guard against legacy/malformed entries (e.g. plain-string video IDs).
		$videos = array_values(
			array_filter(
				$videos,
				function ( $video ) {
					return is_array( $video ) && isset( $video['id'] );
				}
			)
		);

		// One query for all YouTube rows.
		$youtube_ids = array();
		foreach ( $videos as $video ) {
			if ( ! isset( $video['type'] ) || 'youtube' === $video['type'] ) {
				$youtube_ids[] = (string) $video['id'];
			}
		}
		$rows = $youtube_ids ? VideoRepository::get_many( $youtube_ids ) : array();

		foreach ( $videos as $i => $video ) {
			$id   = (string) $video['id'];
			$type = isset( $video['type'] ) ? $video['type'] : 'youtube';
			$row  = ( 'youtube' === $type && isset( $rows[ $id ] ) ) ? $rows[ $id ] : array();

			$video['video_id'] = $id;
			$video['type']     = $type;

			if ( ! empty( $row['title'] ) ) {
				$video['title'] = $row['title'];
			} elseif ( ! isset( $video['title'] ) ) {
				$video['title'] = '';
			}

			$video['description']      = isset( $row['description'] ) ? (string) $row['description'] : '';
			$video['duration']         = isset( $row['duration'] ) ? (string) $row['duration'] : '';
			$video['duration_seconds'] = isset( $row['duration_seconds'] ) ? (int) $row['duration_seconds'] : 0;
			$video['uploaded_at']      = isset( $row['uploaded_at'] ) ? (string) $row['uploaded_at'] : '';
			$video['synced_at']        = isset( $row['synced_at'] ) ? (string) $row['synced_at'] : '';
			$video['channel_id']       = isset( $row['channel_id'] ) ? (string) $row['channel_id'] : '';

			// Thumbnail (yt-12): the table's URL first, then what the entry was
			// saved with, then the i.ytimg.com / placeholder fallbacks.
			$thumb = '';
			if ( ! empty( $row['thumbnail_url'] ) ) {
				$thumb = $row['thumbnail_url'];
			} elseif ( ! empty( $video['thumbnail'] ) ) {
				$thumb = $video['thumbnail'];
			}
			$video['thumbnail_url'] = $this->resolve_thumbnail( $thumb, $id, $type );
			$video['thumbnail']     = $video['thumbnail_url'];

			$videos[ $i ] = $video;
		}

		$this->videos_cache[ $product_id ] = $videos;

		return $videos;
	}

	/**
	 * Fall back to a YouTube / placeholder thumbnail when none is stored.
	 *
	 * @since 1.4.0
	 * @param string $thumb Stored thumbnail URL, possibly empty.
	 * @param string $id    Video ID (or attachment ID).
	 * @param string $type  'youtube' or 'self_hosted'.
	 * @return string
	 */
	private function resolve_thumbnail( $thumb, $id, $type ) {
		// A javascript:/data: URL would survive the empty check, then esc_url()
		// in the template would blank it to src="" -- filter it out here instead.
		$thumb = is_string( $thumb ) ? esc_url_raw( $thumb ) : '';
		if ( ! empty( $thumb ) ) {
			return $thumb;
		}

		if ( 'youtube' === $type ) {
			return 'https://i.ytimg.com/vi/' . $id . '/hqdefault.jpg';
		}

		if ( 'self_hosted' === $type ) {
			return includes_url( 'images/media/video.svg' );
		}

		return '';
	}

	/**
	 * Render one video slide through templates/gallery-video-slide.php.
	 *
	 * The template can be overridden from a theme at
	 * `{theme}/tubebay/gallery-video-slide.php`, and its path filtered with
	 * `tubebay_template_path`.
	 *
	 * @since 1.4.0
	 * @param array $video One item from get_product_videos() (a bare
	 *                     `array( 'id' => ..., 'type' => ... )` also works).
	 * @param array $args {
	 *     Optional. Defaults come from the settings.
	 *
	 *     @type string $play_icon            'youtube'|'circle'|'triangle'.
	 *     @type string $play_icon_color      Hex colour.
	 *     @type string $video_aspect_ratio   '16-9'|'1-1'|'4-3'|'9-16'.
	 *     @type bool   $gallery_fixed_height Fixed-height mode.
	 *     @type bool   $show_description     Print data-description.
	 *     @type bool   $autoplay             Mark this facade for autoplay.
	 *     @type bool   $show_duration        Show the duration badge.
	 * }
	 * @return string Slide HTML; '' when the video has no ID.
	 */
	public function render_video_slide( $video, $args = array() ) {
		if ( ! is_array( $video ) ) {
			return '';
		}

		$vid_id = '';
		if ( isset( $video['id'] ) ) {
			$vid_id = (string) $video['id'];
		} elseif ( isset( $video['video_id'] ) ) {
			$vid_id = (string) $video['video_id'];
		}
		if ( '' === $vid_id ) {
			return '';
		}

		$settings = Settings::get_all();

		$args = wp_parse_args(
			$args,
			array(
				'play_icon'            => isset( $settings['play_icon'] ) ? $settings['play_icon'] : 'youtube',
				'play_icon_color'      => isset( $settings['play_icon_color'] ) ? $settings['play_icon_color'] : '#212121',
				'video_aspect_ratio'   => isset( $settings['video_aspect_ratio'] ) ? $settings['video_aspect_ratio'] : '16-9',
				'gallery_fixed_height' => ! empty( $settings['gallery_fixed_height'] ),
				'show_description'     => ! empty( $settings['show_description'] ),
				'autoplay'             => false,
				'show_duration'        => ! isset( $settings['show_duration'] ) || ! empty( $settings['show_duration'] ),
			)
		);

		// Normalise so the template can trust every value.
		$play_icon = in_array( $args['play_icon'], self::PLAY_ICONS, true ) ? $args['play_icon'] : 'youtube';
		$ratio     = in_array( $args['video_aspect_ratio'], self::ASPECT_RATIOS, true ) ? $args['video_aspect_ratio'] : '16-9';
		$color     = sanitize_hex_color( $args['play_icon_color'] );
		$color     = $color ? $color : '#212121';

		$args['play_icon']            = $play_icon;
		$args['play_icon_color']      = $color;
		$args['video_aspect_ratio']   = $ratio;
		$args['gallery_fixed_height'] = (bool) $args['gallery_fixed_height'];
		$args['show_description']     = (bool) $args['show_description'];
		$args['autoplay']             = (bool) $args['autoplay'];
		$args['show_duration']        = (bool) $args['show_duration'];

		// Template variables.
		$vid_type    = isset( $video['type'] ) ? $video['type'] : 'youtube';
		$vid_thumb   = $this->resolve_thumbnail(
			isset( $video['thumbnail_url'] ) && '' !== $video['thumbnail_url'] ? $video['thumbnail_url'] : ( isset( $video['thumbnail'] ) ? $video['thumbnail'] : '' ),
			$vid_id,
			$vid_type
		);
		$autoplay    = $args['autoplay'] ? 'true' : 'false';
		$title       = isset( $video['title'] ) ? (string) $video['title'] : '';
		$description = isset( $video['description'] ) ? (string) $video['description'] : '';
		$video_url   = '';
		$mime_type   = '';
		if ( 'self_hosted' === $vid_type ) {
			$video_url = wp_get_attachment_url( $vid_id );
			$mime_type = get_post_mime_type( $vid_id );
		}
		$video_url = $video_url ? $video_url : '';
		$mime_type = $mime_type ? $mime_type : '';

		$show_duration    = $args['show_duration'];
		$show_description = $args['show_description'];
		$fixed_height     = $args['gallery_fixed_height'];

		// Theme override, then the filterable path.
		$template_name = 'gallery-video-slide.php';
		$template      = TUBEBAY_PATH . 'templates/' . $template_name;
		$theme_file    = locate_template( 'tubebay/' . $template_name );
		if ( $theme_file ) {
			$template = $theme_file;
		}

		/**
		 * Filter the path of a TubeBay template.
		 *
		 * @since 1.4.0
		 * @param string $template      Absolute path to the template file.
		 * @param string $template_name File name, e.g. 'gallery-video-slide.php'.
		 * @param array  $video         The video array.
		 * @param array  $args          The resolved slide args.
		 */
		$template = apply_filters( 'tubebay_template_path', $template, $template_name, $video, $args );

		if ( ! is_string( $template ) || ! file_exists( $template ) ) {
			return '';
		}

		ob_start();
		include $template;
		return (string) ob_get_clean();
	}

	/**
	 * Print the `#tubebay-gallery-data` element read by assets/js/public.js.
	 *
	 * Idempotent: only the first call on a request prints (the element id must
	 * be unique, and JS reads it with getElementById). The config is passed
	 * through the `tubebay_gallery_config` filter, which is how Pro adds its keys.
	 *
	 * The element is a hidden div whose `data-config` attribute holds the JSON —
	 * the format public.js already parses.
	 *
	 * @since 1.4.0
	 * @param int $product_id Product the config is for; 0 for none (global
	 *                        settings only, e.g. a shortcode off a product page).
	 * @return void
	 */
	public function output_gallery_config( $product_id = 0 ) {
		if ( $this->config_printed ) {
			return;
		}
		$this->config_printed = true;

		$product_id = (int) $product_id;
		$settings   = Settings::get_all();

		if ( $product_id ) {
			$placement = $this->get_product_options( $product_id )['placement'];
		} else {
			$placement = isset( $settings['video_position'] ) ? $settings['video_position'] : 'first';
			$placement = ( 'mixed' === $placement ) ? 'last' : $placement;
		}

		$config = array(
			'privacy_mode'         => ! empty( $settings['privacy_mode'] ),
			'placement'            => $placement,
			// Read by assets/js/public.js when it builds the embed URL.
			// Without it the gallery ignored Settings > Player entirely.
			'show_controls'        => ! isset( $settings['show_controls'] ) || ! empty( $settings['show_controls'] ),
			'allow_fullscreen'     => ! isset( $settings['allow_fullscreen'] ) || ! empty( $settings['allow_fullscreen'] ),
			'allow_pip'            => ! isset( $settings['allow_pip'] ) || ! empty( $settings['allow_pip'] ),
			'show_description'     => ! empty( $settings['show_description'] ),
			'play_icon'            => isset( $settings['play_icon'] ) ? $settings['play_icon'] : 'youtube',
			'video_aspect_ratio'   => isset( $settings['video_aspect_ratio'] ) ? $settings['video_aspect_ratio'] : '16-9',
			'gallery_fixed_height' => ! empty( $settings['gallery_fixed_height'] ),
		);

		/**
		 * Filter the config printed into #tubebay-gallery-data for public.js.
		 * Pro adds its keys here.
		 *
		 * @since 1.4.0
		 * @param array $config     The config.
		 * @param int   $product_id The product ID, or 0 when not for a product.
		 */
		$config = apply_filters( 'tubebay_gallery_config', $config, $product_id );

		echo '<div id="tubebay-gallery-data" style="display:none;" data-config="' . esc_attr( wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP ) ) . '"></div>';
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

		// 1. Get the product's videos (legacy fallback, filter and limit applied).
		$videos = $this->get_product_videos( $post->ID );

		if ( empty( $videos ) ) {
			return $html;
		}

		// 2. Get global + per-product settings
		$options        = $this->get_product_options( $post->ID );
		$placement      = $options['placement'];
		$autoplay_first = $options['autoplay_first'];
		$show_duration  = $options['show_duration'];

		// Check if we need to output the main container wrapper
		$this->output_gallery_config( $post->ID );

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
			$videos_html .= $this->render_video_slide(
				$video,
				array(
					'autoplay'      => ( 0 === $index && $autoplay_first ),
					'show_duration' => $show_duration,
					'is_first'      => ( 0 === $index && 'first' === $placement ),
				)
			);
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
