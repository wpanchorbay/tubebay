/**
 * Static save() — the markup frozen into post content.
 *
 * Read src/blocks/video-button/deprecated.ts before touching anything here.
 *
 * Two things about this markup are load-bearing:
 *
 * 1. The <a> IS the block's root element — there is no wrapper <div>. That is
 *    what makes useBlockProps.save() serialize colour, gradient, typography,
 *    border, radius, padding and shadow onto the button itself. Core/button
 *    achieves the same thing the hard way (skipSerialization on every support
 *    plus a `selectors.root` override plus manual style application in its own
 *    save), because core needs the wrapper for the Buttons container. We don't.
 *
 * 2. href is a real youtube.com/watch URL. If JavaScript is off or broken the
 *    button still takes the visitor to the video instead of doing nothing. It
 *    is deliberately youtube.com and not youtube-nocookie.com: the -nocookie
 *    domain only serves /embed/, it has no watch page. A link sets no cookies
 *    until it is followed.
 */

import { useBlockProps, RichText } from '@wordpress/block-editor';

import { watchUrl } from '../shared/parseYouTube';
import { getWidthClasses } from './width';

interface SaveProps {
	attributes: {
		videoId: string;
		title: string;
		text: string;
		width?: number;
		popupWidth: string;
		aspectRatio: string;
		startTime: string;
		playIcon: boolean;
		newTab: boolean;
		nofollow: boolean;
	};
}

export default function save( { attributes }: SaveProps ) {
	const {
		videoId,
		title,
		text,
		width,
		popupWidth,
		aspectRatio,
		startTime,
		playIcon,
		newTab,
		nofollow,
	} = attributes;

	if ( ! videoId ) {
		return null;
	}

	const blockProps = useBlockProps.save( {
		className: [
			'wp-block-button__link',
			'wp-element-button',
			'tubebay-video-trigger',
			getWidthClasses( width ),
		]
			.filter( Boolean )
			.join( ' ' ),
	} );

	/*
	 * Applies to the href fallback above, which is a real outbound link to
	 * youtube.com — so both of these are meaningful here, exactly as they are
	 * on the inline video-link format. noopener is not optional alongside
	 * target=_blank. Both are omitted when unset, so markup saved before these
	 * attributes existed is unchanged and needs no deprecation entry.
	 */
	const rel = [ newTab ? 'noopener' : '', nofollow ? 'nofollow' : '' ]
		.filter( Boolean )
		.join( ' ' );

	return (
		<RichText.Content
			{ ...blockProps }
			tagName="a"
			href={ watchUrl( videoId ) }
			target={ newTab ? '_blank' : undefined }
			rel={ rel || undefined }
			data-tubebay-video={ videoId }
			data-title={ title || undefined }
			data-popup-width={ popupWidth || undefined }
			/* Omitted when at the default, so existing markup is unchanged. */
			data-ratio={ aspectRatio && aspectRatio !== '16-9' ? aspectRatio : undefined }
			data-start={ startTime || undefined }
			data-play-icon={ playIcon ? 'true' : undefined }
			value={ text }
		/>
	);
}
