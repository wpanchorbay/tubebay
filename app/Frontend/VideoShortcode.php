<?php
/**
 * Shortcode for rendering YouTube videos.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Frontend
 */

namespace TubeBay\Frontend;

use TubeBay\Core\Plugin;
use TubeBay\Helper\Settings;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * VideoShortcode class.
 */
class VideoShortcode {

	/**
	 * The single instance of the class.
	 *
	 * @var VideoShortcode|null
	 */
	private static $instance = null;

	/**
	 * Gets an instance of this object.
	 *
	 * @return VideoShortcode
	 * @since 1.0.0
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
	 * @param Plugin $plugin The plugin instance.
	 * @since 1.0.0
	 */
	public function run( $plugin ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		tubebay_log( 'VideoShortcode: Registering [tubebay_video] shortcode', 'debug' );
		add_shortcode( 'tubebay_video', array( $this, 'render_shortcode' ) );
	}

	/**
	 * Render the [tubebay_video] shortcode.
	 *
	 * Usage: [tubebay_video id="VIDEO_ID" autoplay="1" mute="1" controls="1" width="560" height="315"]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string HTML output.
	 */
	public function render_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'id'       => '',
				'autoplay' => null,
				'mute'     => null,
				'controls' => null,
				'width'    => '',
				'height'   => '',
			),
			$atts,
			'tubebay_video'
		);

		/**
		 * Filter the shortcode attributes before processing.
		 * Pro can inject or override attributes here.
		 *
		 * @since 1.1.0
		 * @param array       $atts The shortcode attributes.
		 * @param \WP_Post|null $post The current post.
		 */
		global $post;
		$atts = apply_filters( 'tubebay_shortcode_atts', $atts, $post );

		$video_id   = sanitize_text_field( $atts['id'] );
		$video_type = 'youtube';

		if ( empty( $video_id ) ) {
			global $post;
			if ( $post ) {
				$video_ids_json = get_post_meta( $post->ID, '_tubebay_video_ids', true );
				if ( ! empty( $video_ids_json ) ) {
					$videos = json_decode( $video_ids_json, true );
					if ( is_array( $videos ) && ! empty( $videos ) ) {
						$first_video = $videos[0];
						$video_id    = is_array( $first_video ) ? $first_video['id'] : $first_video;
						$video_type  = is_array( $first_video ) && isset( $first_video['type'] ) ? $first_video['type'] : 'youtube';
					}
				} else {
					$video_id = get_post_meta( $post->ID, '_tubebay_video_id', true );
				}
			}

			if ( empty( $video_id ) ) {
				tubebay_log( 'VideoShortcode: render_shortcode called without a video ID and no product video found — returning empty', 'debug' );
				return '<!-- TubeBay: No video ID provided and no video assigned to current product -->';
			}
		}

		tubebay_log( 'VideoShortcode: Rendering video ID ' . $video_id, 'info' );

		/**
		 * Filter the video type before rendering.
		 * Pro can return 'vimeo', 'hls', etc. to use a different renderer.
		 *
		 * @since 1.1.0
		 * @param string $video_type The video type ('youtube' or 'self_hosted').
		 * @param string $video_id   The video ID.
		 */
		$video_type = apply_filters( 'tubebay_video_type', $video_type, $video_id );

		// Resolve settings: shortcode attrs override globals.

		/*
		 * Both fall back to the global setting, which is the whole point of
		 * having one — each of these used to ignore it.
		 *
		 * `muted_autoplay` is the shortcode's own option. It previously read
		 * `autoplay_first`, which is a GALLERY setting ("the first video in
		 * the gallery will start playing automatically"); a shortcode is not a
		 * gallery and has no first video, so that reading was wrong in both
		 * directions — it made the gallery toggle silently change unrelated
		 * shortcodes, and left `muted_autoplay` itself read by nothing.
		 */
		$muted_autoplay = null !== $atts['autoplay']
			? ( '1' === $atts['autoplay'] )
			: (bool) Settings::get( 'muted_autoplay', false );
		$show_controls  = null !== $atts['controls']
			? ( '1' === $atts['controls'] )
			: (bool) Settings::get( 'show_controls', true );
		$privacy_mode   = Settings::get( 'privacy_mode', false );

		$width  = ! empty( $atts['width'] ) ? intval( $atts['width'] ) : '';
		$height = ! empty( $atts['height'] ) ? intval( $atts['height'] ) : '';

		ob_start();
		?>
		<div class="tubebay-shortcode-video-wrapper">
			<div class="tubebay-responsive-iframe-container">
			<?php if ( 'youtube' === $video_type ) : ?>
				<?php
				$domain    = $privacy_mode ? 'youtube-nocookie.com' : 'youtube.com';
				$embed_url = 'https://www.' . $domain . '/embed/' . esc_attr( $video_id ) . '?rel=0';

				if ( $muted_autoplay ) {
					$embed_url .= '&autoplay=1&mute=1';
				}
				if ( ! $show_controls ) {
					$embed_url .= '&controls=0';
				}
				?>
				<iframe
					<?php
					if ( $width ) {
						printf( 'width="%s" ', esc_attr( $width ) );
					}
					if ( $height ) {
						printf( 'height="%s" ', esc_attr( $height ) );
					}
					?>
					src="<?php echo esc_url( $embed_url ); ?>"
					title="<?php esc_attr_e( 'TubeBay Video', 'tubebay' ); ?>" frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					<?php /* Sites that withhold the referrer cross-origin otherwise get YouTube's "Error 153". */ ?>
					referrerpolicy="strict-origin-when-cross-origin"
					allowfullscreen>
				</iframe>
			<?php else : ?>
				<?php
				// Allow pro to handle non-youtube video types (Vimeo, HLS, etc.).
				do_action( 'tubebay_video_type_unknown', $video_id, $video_type );

				// Self-hosted WP attachment fallback.
				$attachment_url = wp_get_attachment_url( $video_id );
				?>
				<?php if ( $attachment_url ) : ?>
					<video
						<?php
						if ( $width ) {
							printf( 'width="%s" ', esc_attr( $width ) );
						}
						if ( $height ) {
							printf( 'height="%s" ', esc_attr( $height ) );
						}
						if ( $show_controls ) {
							echo 'controls ';
						}
						if ( $muted_autoplay ) {
							echo 'autoplay muted ';
						}
						?>
						playsinline
						style="max-width: 100%; height: auto;"
					>
						<source src="<?php echo esc_url( $attachment_url ); ?>" type="<?php echo esc_attr( get_post_mime_type( $video_id ) ); ?>">
						<?php esc_html_e( 'Your browser does not support the video tag.', 'tubebay' ); ?>
					</video>
				<?php endif; ?>
			<?php endif; ?>
			</div>
		</div>
		<?php
		$html = ob_get_clean();

		/**
		 * Filter the rendered shortcode video HTML.
		 *
		 * @since 1.1.0
		 * @param string $html      The rendered HTML.
		 * @param array  $atts      The shortcode attributes.
		 * @param string $video_id  The resolved video ID.
		 */
		return apply_filters( 'tubebay_shortcode_video_html', $html, $atts, $video_id );
	}
}
