/**
 * Static save() — the markup frozen into post content.
 *
 * Read src/blocks/video/deprecated.ts before touching anything in here.
 *
 * Note what is deliberately NOT saved: the YouTube embed URL. Only the video
 * ID is stored, and assets/js/blocks/tubebay-blocks-view.js builds the embed
 * URL at click time from the live `privacy_mode` setting. That is what lets a
 * shop owner turn on privacy mode and have every already-published post switch
 * to youtube-nocookie.com without re-saving a single one.
 */

import { useBlockProps, RichText } from '@wordpress/block-editor';

import { Facade } from '../shared/Facade';
import type { AspectRatio } from '../shared/Facade';

interface SaveProps {
	attributes: {
		videoId: string;
		title: string;
		thumbnailUrl: string;
		aspectRatio: AspectRatio;
		openInModal: boolean;
		popupWidth: string;
		startTime: string;
		caption: string;
	};
}

export default function save( { attributes }: SaveProps ) {
	const {
		videoId,
		title,
		thumbnailUrl,
		aspectRatio,
		openInModal,
		popupWidth, startTime,
		caption,
	} = attributes;

	if ( ! videoId ) {
		return null;
	}

	const blockProps = useBlockProps.save();

	return (
		<figure { ...blockProps }>
			<Facade
				videoId={ videoId }
				title={ title }
				thumbnailUrl={ thumbnailUrl }
				aspectRatio={ aspectRatio }
				openInModal={ openInModal }
				popupWidth={ popupWidth }
				startTime={ startTime }
			/>
			{ ! RichText.isEmpty( caption ) && (
				<RichText.Content
					tagName="figcaption"
					className="wp-element-caption"
					value={ caption }
				/>
			) }
		</figure>
	);
}
