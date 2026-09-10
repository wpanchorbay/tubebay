/**
 * Editor UI for the TubeBay Video block.
 */

import {
	InspectorControls,
	RichText,
	useBlockProps,
	BlockControls,
} from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	Placeholder,
	SelectControl,
	ToggleControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { Facade } from '../shared/Facade';
import type { AspectRatio } from '../shared/Facade';
import { PopupWidthControl } from '../shared/PopupWidthControl';
import { AspectRatioControl, StartTimeControl } from '../shared/videoOptions';
import { VideoPicker } from '../shared/VideoPicker';
import { VideoSourceControls } from '../shared/VideoSourceControls';
import { videoBlockIcon } from '../shared/icons';
import type { VideoAttributes } from '../shared/types';

interface EditProps {
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
	setAttributes: ( next: Partial< EditProps[ 'attributes' ] > ) => void;
	isSelected: boolean;
}

export default function Edit( {
	attributes,
	setAttributes,
	isSelected,
}: EditProps ) {
	const {
		videoId,
		title,
		thumbnailUrl,
		aspectRatio,
		openInModal,
		popupWidth,
		startTime,
		caption,
	} = attributes;

	const [ isReplacing, setReplacing ] = useState( false );

	const blockProps = useBlockProps();

	const applyVideo = ( next: VideoAttributes ) => setAttributes( next );

	if ( ! videoId ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ videoBlockIcon }
					label={ __( 'TubeBay Video', 'tubebay' ) }
					instructions={ __(
						'Choose a video from your connected YouTube channel, or paste any YouTube URL.',
						'tubebay'
					) }
				>
					<VideoSourceControls
						videoId={ videoId }
						title={ title }
						onChange={ applyVideo }
					/>
				</Placeholder>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon={ videoBlockIcon }
						label={ __( 'Replace video', 'tubebay' ) }
						/*
						 * Opens the picker. It must NOT clear videoId: save()
						 * returns null without one, which removes the elements
						 * that `text` and `caption` are sourced from, so those
						 * attributes would be lost on the next parse.
						 */
						onClick={ () => setReplacing( true ) }
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Video', 'tubebay' ) }>
					<VideoSourceControls
						videoId={ videoId }
						title={ title }
						onChange={ applyVideo }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Display', 'tubebay' ) }>
					<AspectRatioControl
						value={ aspectRatio }
						onChange={ ( value ) => setAttributes( { aspectRatio: value } ) }
					/>
					<StartTimeControl
						value={ startTime }
						onChange={ ( value ) => setAttributes( { startTime: value } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Open in a popup instead', 'tubebay' ) }
						help={
							openInModal
								? __( 'Clicking opens the video in a lightbox.', 'tubebay' )
								: __( 'Clicking plays the video in place.', 'tubebay' )
						}
						checked={ openInModal }
						onChange={ ( value ) => setAttributes( { openInModal: value } ) }
					/>

					{ /* Only meaningful once the video actually opens in a popup. */ }
					{ openInModal && (
						<PopupWidthControl
							value={ popupWidth }
							onChange={ ( value ) =>
								setAttributes( { popupWidth: value } )
							}
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<figure { ...blockProps }>
				{ /* Same component save() uses, so the preview cannot drift. */ }
				<Facade
					videoId={ videoId }
					title={ title }
					thumbnailUrl={ thumbnailUrl }
					aspectRatio={ aspectRatio }
					openInModal={ openInModal }
					popupWidth={ popupWidth }
					startTime={ startTime }
					isPreview
				/>
				{ ( isSelected || ! RichText.isEmpty( caption ) ) && (
					<RichText
						identifier="caption"
						tagName="figcaption"
						className="wp-element-caption"
						placeholder={ __( 'Add a caption…', 'tubebay' ) }
						value={ caption }
						onChange={ ( value ) => setAttributes( { caption: value } ) }
					/>
				) }
			</figure>
			{ isReplacing && (
				<VideoPicker
					onSelect={ ( video ) =>
						applyVideo( {
							videoId: video.id,
							title: video.title,
							thumbnailUrl: video.thumbnail_url,
						} )
					}
					onClose={ () => setReplacing( false ) }
				/>
			) }
		</>
	);
}
