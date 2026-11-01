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
 * Optional key in $args: `is_first` (bool) - true when this is the first slide of
 * the gallery. When absent the poster is treated as non-critical (lazy), which is
 * what every video slide did before the key existed.
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

// Ratio keyword -> CSS aspect-ratio value. The slot stays square; the facade is letterboxed inside it.
$tubebay_aspect_map = array(
	'16-9' => '16 / 9',
	'1-1'  => '1 / 1',
	'4-3'  => '4 / 3',
	'9-16' => '9 / 16',
);
$tubebay_aspect     = isset( $tubebay_aspect_map[ $ratio ] ) ? $tubebay_aspect_map[ $ratio ] : '16 / 9';

// Intrinsic size hint for the poster <img> so the browser can reserve its box
// before the file arrives (no layout shift). CSS (width/height 100% + object-fit)
// still decides the rendered size.
$tubebay_dims_map = array(
	'16-9' => array( 640, 360 ),
	'1-1'  => array( 480, 480 ),
	'4-3'  => array( 480, 360 ),
	'9-16' => array( 360, 640 ),
);
$tubebay_dims     = isset( $tubebay_dims_map[ $ratio ] ) ? $tubebay_dims_map[ $ratio ] : $tubebay_dims_map['16-9'];

// Poster loading priority. The first slide (it is what LCP measures) and an
// autoplay video are fetched immediately; every other poster uses native
// loading="lazy". A WooCommerce thumbnail rail reuses data-thumb (the same URL),
// so with a rail the browser fetches it anyway for the visible rail image.
$tubebay_is_first = ! empty( $args['is_first'] );
$tubebay_critical = $tubebay_is_first || 'true' === $autoplay;
$tubebay_img_load = $tubebay_critical ? 'decoding="async"' : 'loading="lazy" decoding="async"';
// High priority only when the slide is known to be first, or autoplay without a known "not first".
$tubebay_known_not_first = isset( $args['is_first'] ) && ! $args['is_first'];
if ( $tubebay_is_first || ( 'true' === $autoplay && ! $tubebay_known_not_first ) ) {
	$tubebay_img_load .= ' fetchpriority="high"';
}
?>
<div data-thumb="<?php echo esc_url( $vid_thumb ); ?>" class="<?php echo esc_attr( $tubebay_slide_classes ); ?>" data-play-icon="<?php echo esc_attr( $play_icon ); ?>" data-play-icon-color="<?php echo esc_attr( $color ); ?>" data-aspect-ratio="<?php echo esc_attr( $ratio ); ?>" style="--tubebay-aspect: <?php echo esc_attr( $tubebay_aspect ); ?>;">
	<div class="tubebay-video-frame">
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
		>

		<img src="<?php echo esc_url( $vid_thumb ); ?>" alt="Product Video" width="<?php echo esc_attr( $tubebay_dims[0] ); ?>" height="<?php echo esc_attr( $tubebay_dims[1] ); ?>" <?php echo $tubebay_img_load; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Fixed literal attributes built above. ?> style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; margin: 0;" />

		<?php
		// Button box per icon style: YouTube keeps its 68x48 pill; circle/triangle are square.
		$tubebay_play_w = ( 'youtube' === $play_icon ) ? 68 : 60;
		$tubebay_play_h = ( 'youtube' === $play_icon ) ? 48 : 60;
		?>
		<div class="tubebay-play-button" style="--tubebay-play-color: <?php echo esc_attr( $color ); ?>; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: <?php echo esc_attr( $tubebay_play_w ); ?>px; height: <?php echo esc_attr( $tubebay_play_h ); ?>px; transition: all 0.2s ease-in-out; z-index: 2;">
			<?php if ( 'circle' === $play_icon ) : ?>
				<svg viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
					<circle class="tubebay-play-bg" cx="30" cy="30" r="30" fill-opacity="0.8"></circle>
					<path class="tubebay-play-glyph" d="M 42,30 23,19 23,41" fill="#fff"></path>
				</svg>
			<?php elseif ( 'triangle' === $play_icon ) : ?>
				<svg viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
					<path class="tubebay-play-bg" d="M 50,30 14,9 14,51 Z"></path>
				</svg>
			<?php else : ?>
				<svg viewBox="0 0 68 48" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
					<path class="tubebay-play-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill-opacity="0.8"></path>
					<path class="tubebay-play-glyph" d="M 45,24 27,14 27,34" fill="#fff"></path>
				</svg>
			<?php endif; ?>
		</div>

		<?php if ( $show_duration ) : ?>
			<!-- Badge -->
			<div class="tubebay-duration-badge" style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: #fff; padding: 2px 6px; font-size: 11px; border-radius: 4px; z-index: 2; line-height: 1.2;">Video</div>
		<?php endif; ?>
	</div>
	</div>
</div>
