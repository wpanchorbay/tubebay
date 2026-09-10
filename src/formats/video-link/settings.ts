/**
 * Format definition for the inline video link.
 *
 * Split out from index.tsx so edit.tsx can pass these settings to useAnchor()
 * without a circular import — useAnchor reads tagName and className off the
 * settings object to find the element the popover should attach to.
 */

export const FORMAT_NAME = 'tubebay/video-link';

/*
 * className is MANDATORY here, not stylistic. registerFormatType refuses to
 * register a second format that claims a bare tag another format already owns
 * (rich-text.js:1279-1288), and core/link is `tagName: 'a', className: null`.
 * Without a class this registration silently aborts with a console error.
 *
 * Do NOT also map `class` in `attributes`: toFormat strips this className out
 * of the class attribute on parse and fromFormat re-adds it on serialize, so
 * mapping it as well would double it up.
 */
export const formatSettings = {
	title: 'Video link',
	tagName: 'a',
	className: 'tubebay-video-link',

	/*
	 * Every attribute the popover can edit must be listed. fromFormat only
	 * emits mapped attributes plus untouched unregisteredAttributes, so an
	 * unmapped attribute can never be written — which is how an earlier draft
	 * of this would have shipped anchors with no href at all.
	 */
	attributes: {
		url: 'href',
		target: 'target',
		rel: 'rel',
		videoId: 'data-tubebay-video',
		title: 'data-title',
		popupWidth: 'data-popup-width',
		ratio: 'data-ratio',
		start: 'data-start',
		appearance: 'data-appearance',
		playIcon: 'data-play-icon',
	},

	/*
	 * `interactive: true` is deliberately omitted: interactiveContentTags
	 * already contains 'a' (rich-text.js:2536-2548), so the tag name alone is
	 * what makes useFormatTypes hide this control inside RichTexts that set
	 * withoutInteractiveFormatting -- which is also what stops it being applied
	 * inside a button block, where it would nest interactive content.
	 */
};
