/**
 * Inline "video link" format.
 *
 * Lets an author select words inside a paragraph, heading, list item or table
 * cell and turn them into a link that opens the video in TubeBay's lightbox.
 * The frontend needs no new code: the delegated handler in
 * assets/js/blocks/tubebay-blocks-view.js already matches any
 * a[data-tubebay-video]. What this adds is the editor UI, and the render_block
 * filter in app/Blocks/BlockManager.php that loads the view script on pages
 * that carry such a link but no TubeBay block.
 *
 * KNOWN LIMITATION -- copying a run of text containing a video link and pasting
 * it elsewhere loses the video. This is the block editor's own paste filter,
 * not kses: filterInlineHTML runs removeInvalidHTML against the phrasing
 * schema, which allows exactly href/target/rel/id on an anchor (dom.js:829)
 * and strips every data-* attribute. Copying a WHOLE BLOCK is unaffected --
 * that path uses block serialization instead. There is no clean fix; the
 * documented workaround is to copy the whole block, or re-apply the format
 * after pasting.
 */

import { registerFormatType } from '@wordpress/rich-text';
import { __ } from '@wordpress/i18n';

import { FORMAT_NAME, formatSettings } from './settings';
import edit from './edit';

registerFormatType( FORMAT_NAME, {
	...formatSettings,
	title: __( 'Video link', 'tubebay' ),
	edit,
} );
