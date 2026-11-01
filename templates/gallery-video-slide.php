<?php
/**
 * Gallery video slide.
 *
 * Override in a theme at `{theme}/tubebay/gallery-video-slide.php`.
 *
 * Variables available (all prepared by WooCommerce::render_video_slide()):
 *
 * @var array  $video            The video array (see WooCommerce::get_product_videos()).
 * @var array  $args             Resolved args: play_icon, play_icon_color, video_aspect_ratio,
 *                               gallery_fixed_height, show_description, autoplay, show_duration.
 * @var string $vid_id           Video ID (attachment ID for self-hosted).
 * @var string $vid_type         'youtube' or 'self_hosted'.
 * @var string $vid_thumb        Thumbnail URL (never empty for known types).
 * @var string $autoplay         'true' or 'false' (for data-autoplay).
 * @var string $title            Video title, may be ''.
 * @var string $description      Video description, may be ''.
 * @var string $video_url        Self-hosted file URL, else ''.
 * @var string $mime_type        Self-hosted MIME type, else ''.
 * @var bool   $show_duration    Show the duration badge.
 * @var bool   $show_description Print data-description.
 * @var bool   $fixed_height     Fixed-height mode.
 * @var string $play_icon        'youtube'|'circle'|'triangle'.
 * @var string $ratio            '16-9'|'1-1'|'4-3'|'9-16'.
 * @var string $color            Play icon colour (hex).
 *
 * @package TubeBay
 */

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$tubebay_slide_classes = 'woocommerce-product-gallery__image tubebay-virtual-slide tubebay-video-slide tubebay-ratio-' . $ratio . ' tubebay-icon-' . $play_icon;
if ( $fixed_height ) {
	$tubebay_slide_classes .= ' tubebay-fixed-height';
}
?>
<div data-thumb="<?php echo esc_url( $vid_thumb ); ?>" class="<?php echo esc_attr( $tubebay_slide_classes ); ?>" data-play-icon="<?php echo esc_attr( $play_icon ); ?>" data-play-icon-color="<?php echo esc_attr( $color ); ?>" data-aspect-ratio="<?php echo esc_attr( $ratio ); ?>">
	<div class="tubebay-video-facade"
		data-video-id="<?php echo esc_attr( $vid_id ); ?>"
		data-video-type="<?php echo esc_attr( $vid_type ); ?>"
		data-video-url="<?php echo esc_attr( $video_url ); ?>"
		data-mime-type="<?php echo esc_attr( $mime_type ); ?>"
		data-poster="<?php echo esc_url( $vid_thumb ); ?>"
		data-autoplay="<?php echo esc_attr( $autoplay ); ?>"
		<?php if ( $show_description ) : ?>
		data-description="<?php echo esc_attr( $description ); ?>"
		<?php endif; ?>
		style="position: relative; padding-bottom: 100%; height: 0; overflow: hidden; width: 100%; background: #000; cursor: pointer;">

		<img src="<?php echo esc_url( $vid_thumb ); ?>" alt="Product Video" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; margin: 0;" />

		<div class="tubebay-play-button" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 48px; transition: all 0.2s ease-in-out; z-index: 2;">
			<svg viewBox="0 0 68 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
				<path class="tubebay-play-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#212121" fill-opacity="0.8"></path>
				<path d="M 45,24 27,14 27,34" fill="#fff"></path>
			</svg>
		</div>

		<?php if ( $show_duration ) : ?>
			<!-- Badge -->
			<div class="tubebay-duration-badge" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: #fff; padding: 2px 6px; font-size: 11px; border-radius: 4px; z-index: 2; line-height: 1.2;">Video</div>
		<?php endif; ?>
	</div>
</div>
