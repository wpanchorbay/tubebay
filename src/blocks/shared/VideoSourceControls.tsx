/**
 * The "which video?" controls shared by both blocks: a channel picker plus a
 * manual YouTube URL / ID field, so the blocks stay usable when no channel is
 * connected.
 */

import { useState } from '@wordpress/element';
import { Button, Notice, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { VideoPicker } from './VideoPicker';
import { parseYouTubeId, probeThumbnail, thumbnailUrl } from './parseYouTube';
import type { ChannelVideo, VideoAttributes } from './types';

interface VideoSourceControlsProps {
	videoId: string;
	title: string;
	onChange: ( next: VideoAttributes ) => void;
}

export const VideoSourceControls = ( {
	videoId,
	title,
	onChange,
}: VideoSourceControlsProps ) => {
	const [ isPickerOpen, setPickerOpen ] = useState( false );
	const [ manual, setManual ] = useState( '' );
	const [ manualError, setManualError ] = useState< string | null >( null );

	const applyChannelVideo = ( video: ChannelVideo ) => {
		onChange( {
			videoId: video.id,
			title: video.title,
			// Prefer the thumbnail the sync already picked (best available
			// maxres -> high -> medium -> default) over reconstructing a URL.
			thumbnailUrl: video.thumbnail_url || thumbnailUrl( video.id ),
		} );
	};

	const applyManual = async () => {
		const parsed = parseYouTubeId( manual );

		if ( ! parsed ) {
			setManualError(
				__( 'That does not look like a YouTube video URL or ID.', 'tubebay' )
			);
			return;
		}

		setManualError( null );
		setManual( '' );

		// No synced record exists for a pasted ID, so there is no title and no
		// known-good thumbnail. Probe for the best tier that actually exists.
		onChange( {
			videoId: parsed,
			title: '',
			thumbnailUrl: await probeThumbnail( parsed ),
		} );
	};

	return (
		<div className="tubebay-video-source">
			{ videoId && (
				<p className="tubebay-video-source__current">
					<strong>{ __( 'Selected:', 'tubebay' ) }</strong>{ ' ' }
					{ title || videoId }
				</p>
			) }

			<Button variant="secondary" onClick={ () => setPickerOpen( true ) }>
				{ videoId
					? __( 'Replace video', 'tubebay' )
					: __( 'Choose from channel', 'tubebay' ) }
			</Button>

			<TextControl
				__nextHasNoMarginBottom
				label={ __( 'Or paste a YouTube URL or ID', 'tubebay' ) }
				value={ manual }
				onChange={ ( value ) => {
					setManual( value );
					setManualError( null );
				} }
				onKeyDown={ ( event: React.KeyboardEvent ) => {
					if ( event.key === 'Enter' ) {
						event.preventDefault();
						void applyManual();
					}
				} }
				placeholder="https://youtu.be/…"
			/>

			<Button
				variant="tertiary"
				onClick={ () => void applyManual() }
				disabled={ ! manual.trim() }
			>
				{ __( 'Use this video', 'tubebay' ) }
			</Button>

			{ manualError && (
				<Notice status="error" isDismissible={ false }>
					{ manualError }
				</Notice>
			) }

			{ isPickerOpen && (
				<VideoPicker
					onSelect={ applyChannelVideo }
					onClose={ () => setPickerOpen( false ) }
				/>
			) }
		</div>
	);
};
