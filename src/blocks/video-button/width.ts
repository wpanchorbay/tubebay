/**
 * The 25/50/75/100% width control, hand-copied from core/button.
 *
 * This is NOT gold-plating. Core's own width CSS is scoped to
 * `.wp-block-buttons > .wp-block-button…` (verified in
 * wp-includes/blocks/button/style.min.css on WP 7.1), so emitting core's class
 * names on a standalone block produces exactly nothing. We emit them anyway —
 * themes target them — and back them with our own rules in
 * assets/css/blocks/tubebay-blocks.css.
 *
 * Core also moved this mechanism between 6.8 and 7.1 (a `width` attribute
 * became `supports.dimensions.width`). Owning it here means core churn can't
 * reach us; the plugin supports WordPress 6.8 upward.
 */

export const WIDTH_OPTIONS = [ 25, 50, 75, 100 ];

/**
 * Class names for a given width, matching core's so theme CSS applies.
 */
export function getWidthClasses( width?: number ): string {
	if ( ! width ) {
		return '';
	}

	return [
		'has-custom-width',
		'wp-block-button__width',
		`wp-block-button__width-${ width }`,
	].join( ' ' );
}
