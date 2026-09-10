/**
 * Editor UI for the TubeBay Video Button block.
 */

import { useState } from '@wordpress/element';
import {
	BlockControls,
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Button,
	ButtonGroup,
	PanelBody,
	ToggleControl,
	Placeholder,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import { PopupWidthControl } from '../shared/PopupWidthControl';
import { AspectRatioControl, StartTimeControl } from '../shared/videoOptions';
import { VideoPicker } from '../shared/VideoPicker';
import { VideoSourceControls } from '../shared/VideoSourceControls';
import { buttonBlockIcon } from '../shared/icons';
import type { VideoAttributes } from '../shared/types';
import { WIDTH_OPTIONS, getWidthClasses } from './width';

interface EditProps {
	attributes: {
		videoId: string;
		title: string;
		thumbnailUrl: string;
		text: string;
		width?: number;
		popupWidth: string;
		aspectRatio: string;
		startTime: string;
		playIcon: boolean;
		newTab: boolean;
		nofollow: boolean;
	};
	setAttributes: ( next: Partial< EditProps[ 'attributes' ] > ) => void;
}

export default function Edit( { attributes, setAttributes }: EditProps ) {
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

	const [ isReplacing, setReplacing ] = useState( false );

	// One call only, whichever branch renders: useBlockProps registers props on
	// the block wrapper and must not be invoked twice per render.
	const blockProps = useBlockProps( {
		/*
		 * `tubebay-video-trigger` has to be here, not only in save(). The play
		 * icon is drawn by
		 *   .tubebay-video-trigger[data-play-icon="true"]::before
		 * so an editor preview missing either the class or the attribute meant
		 * toggling "Show play icon" changed nothing on screen — the author only
		 * found out whether it worked after publishing.
		 */
		className: videoId
			? [
					'wp-block-button__link',
					'wp-element-button',
					'tubebay-video-trigger',
					getWidthClasses( width ),
			  ]
					.filter( Boolean )
					.join( ' ' )
			: undefined,
		'data-play-icon': videoId && playIcon ? 'true' : undefined,
	} );

	const applyVideo = ( next: VideoAttributes ) => setAttributes( next );

	if ( ! videoId ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ buttonBlockIcon }
					label={ __( 'TubeBay Video Button', 'tubebay' ) }
					instructions={ __(
						'Choose a video from your connected YouTube channel, or paste any YouTube URL. The button will open it in a popup.',
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
						icon={ buttonBlockIcon }
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

				<PanelBody title={ __( 'Popup', 'tubebay' ) }>
					<AspectRatioControl
						value={ aspectRatio as any }
						onChange={ ( value ) => setAttributes( { aspectRatio: value } ) }
					/>
					<StartTimeControl
						value={ startTime }
						onChange={ ( value ) => setAttributes( { startTime: value } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Show play icon', 'tubebay' ) }
						checked={ playIcon }
						onChange={ ( value ) => setAttributes( { playIcon: value } ) }
					/>
					<PopupWidthControl
						value={ popupWidth }
						onChange={ ( value ) =>
							setAttributes( { popupWidth: value } )
						}
					/>
				</PanelBody>

				{ /*
				   * save() writes a real href to youtube.com/watch as the
				   * no-JS fallback, so this button is a genuine outbound link
				   * and both of these apply to it — the same pair the inline
				   * video-link format offers.
				   */ }
				<PanelBody title={ __( 'Link fallback', 'tubebay' ) } initialOpen={ false }>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Open in new tab', 'tubebay' ) }
						help={ __(
							'Applies to the fallback link, used when the popup cannot open.',
							'tubebay'
						) }
						checked={ newTab }
						onChange={ ( value ) => setAttributes( { newTab: value } ) }
					/>
					<ToggleControl
						__nextHasNoMarginBottom
						label={ __( 'Add nofollow', 'tubebay' ) }
						checked={ nofollow }
						onChange={ ( value ) => setAttributes( { nofollow: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			{ /* Width lives in the Dimensions group so it sits exactly where a
			     core Button's width control does. */ }
			<InspectorControls group="dimensions">
				<div className="tubebay-width-control">
					<p className="tubebay-width-control__label">
						{ __( 'Width', 'tubebay' ) }
					</p>
					<ButtonGroup>
						{ WIDTH_OPTIONS.map( ( option ) => (
							<Button
								key={ option }
								size="small"
								variant={ option === width ? 'primary' : undefined }
								onClick={ () =>
									// Clicking the active option clears it, same as core.
									setAttributes( {
										width: option === width ? undefined : option,
									} )
								}
								aria-label={ sprintf(
									/* translators: %d: width percentage. */
									__( '%d%% width', 'tubebay' ),
									option
								) }
							>
								{ `${ option }%` }
							</Button>
						) ) }
					</ButtonGroup>
				</div>
			</InspectorControls>

			<RichText
				{ ...blockProps }
				tagName="a"
				identifier="text"
				placeholder={ __( 'Watch the video', 'tubebay' ) }
				value={ text }
				onChange={ ( value ) => setAttributes( { text: value } ) }
				withoutInteractiveFormatting
				// A live link inside the editor would navigate on click.
				href={ undefined }
			/>
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
