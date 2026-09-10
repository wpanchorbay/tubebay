/**
 * The toolbar control and popover for the inline video link.
 *
 * Mirrors the structure of core's own link format: a RichTextToolbarButton, a
 * Popover anchored with useAnchor, and essentials with the rest behind a
 * collapsed "Advanced" disclosure.
 */

import { useState, useMemo } from '@wordpress/element';
import { RichTextToolbarButton } from '@wordpress/block-editor';
import {
	Button,
	Popover,
	RadioControl,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { applyFormat, removeFormat, useAnchor } from '@wordpress/rich-text';
import { __ } from '@wordpress/i18n';

import { VideoSourceControls } from '../../blocks/shared/VideoSourceControls';
import { PopupWidthControl } from '../../blocks/shared/PopupWidthControl';
import {
	AspectRatioControl,
	StartTimeControl,
} from '../../blocks/shared/videoOptions';
import { watchUrl } from '../../blocks/shared/parseYouTube';
import type { AspectRatio } from '../../blocks/shared/Facade';
import { videoLinkIcon } from '../../blocks/shared/icons';

import { FORMAT_NAME, formatSettings } from './settings';
import { getFormatRange, getActiveFormat } from './boundary';

interface Draft {
	videoId: string;
	title: string;
	popupWidth: string;
	ratio: AspectRatio;
	start: string;
	appearance: 'link' | 'button';
	playIcon: boolean;
	newTab: boolean;
	nofollow: boolean;
}

const EMPTY: Draft = {
	videoId: '',
	title: '',
	popupWidth: '',
	ratio: '16-9',
	start: '',
	appearance: 'link',
	playIcon: false,
	newTab: false,
	nofollow: false,
};

function draftFromAttributes( attrs: Record< string, string > = {} ): Draft {
	return {
		videoId: attrs.videoId || '',
		title: attrs.title || '',
		popupWidth: attrs.popupWidth || '',
		ratio: ( attrs.ratio as AspectRatio ) || '16-9',
		start: attrs.start || '',
		appearance: attrs.appearance === 'button' ? 'button' : 'link',
		playIcon: attrs.playIcon === 'true',
		newTab: attrs.target === '_blank',
		nofollow: ( attrs.rel || '' ).includes( 'nofollow' ),
	};
}

function attributesFromDraft( draft: Draft ): Record< string, string > {
	const attrs: Record< string, string > = {
		// href is not optional. It is the JS-off fallback, it is what makes the
		// anchor focusable and keyboard-activatable at all (dom.js lists
		// `a[href]`, not `a`), and it is what ctrl-click falls through to.
		url: watchUrl( draft.videoId ),
		videoId: draft.videoId,
	};

	if ( draft.title ) {
		attrs.title = draft.title;
	}
	if ( draft.popupWidth ) {
		attrs.popupWidth = draft.popupWidth;
	}
	if ( draft.ratio && draft.ratio !== '16-9' ) {
		attrs.ratio = draft.ratio;
	}
	if ( draft.start ) {
		attrs.start = draft.start;
	}
	if ( draft.appearance === 'button' ) {
		attrs.appearance = 'button';
	}
	if ( draft.playIcon ) {
		attrs.playIcon = 'true';
	}

	if ( draft.newTab ) {
		attrs.target = '_blank';
	}

	// noopener is not optional alongside target=_blank.
	const rel = [ draft.newTab ? 'noopener' : '', draft.nofollow ? 'nofollow' : '' ]
		.filter( Boolean )
		.join( ' ' );

	if ( rel ) {
		attrs.rel = rel;
	}

	return attrs;
}

interface EditProps {
	isActive: boolean;
	activeAttributes: Record< string, string >;
	value: any;
	onChange: ( value: any ) => void;
	contentRef: React.RefObject< HTMLElement >;
}

export default function VideoLinkEdit( {
	isActive,
	activeAttributes,
	value,
	onChange,
	contentRef,
}: EditProps ) {
	const [ isOpen, setOpen ] = useState( false );
	const [ showAdvanced, setShowAdvanced ] = useState( false );
	const [ draft, setDraft ] = useState< Draft >( EMPTY );
	// The run we are editing, if the caret is in or beside one.
	const [ range, setRange ] = useState< { start: number; end: number } | null >( null );

	const popoverAnchor = useAnchor( {
		editableContentElement: contentRef?.current,
		settings: { ...formatSettings, isActive },
	} );

	const hasSelection = value?.start !== value?.end;

	const open = () => {
		/*
		 * Do NOT rely on `isActive` to decide whether we are editing an
		 * existing link.
		 *
		 * Clicking a link in the canvas places the caret at the format's
		 * BOUNDARY -- offset 10 in "Watch our |product demo" -- not inside it.
		 * That is deliberate in Gutenberg (it is how you type immediately
		 * before a link), and it means isActive is legitimately false while the
		 * user is plainly trying to edit the link they just clicked. Gating on
		 * it left Apply permanently disabled.
		 *
		 * The boundary walk already resolves that case, so use it as the source
		 * of truth for both the draft and the target range.
		 */
		const found = getFormatRange( value, FORMAT_NAME, value?.start ?? 0 );
		const existing = found
			? getActiveFormat( value, FORMAT_NAME, value?.start ?? 0 )
			: undefined;

		setRange( found );
		setDraft(
			existing?.attributes
				? draftFromAttributes( existing.attributes )
				: isActive
				? draftFromAttributes( activeAttributes )
				: EMPTY
		);
		setShowAdvanced( false );
		setOpen( true );
	};

	const close = () => setOpen( false );

	const apply = () => {
		if ( ! draft.videoId ) {
			return;
		}

		const format = { type: FORMAT_NAME, attributes: attributesFromDraft( draft ) };

		/*
		 * Applying over an existing core/link would nest <a> inside <a>: toTree
		 * appends one element per format with no dedupe by tag name, and the
		 * browser reparses that as siblings, so stored and rendered content
		 * diverge. Core's own link UI does the mirror of this.
		 */
		let next;

		if ( hasSelection ) {
			// Both calls act on the selection, so neither needs a range.
			next = applyFormat( removeFormat( value, 'core/link' ), format );
		} else {
			// Collapsed caret: re-apply across the whole existing run. Without
			// an explicit range, applyFormat targets zero characters here and
			// the link would simply vanish.
			const target = range || getFormatRange( value, FORMAT_NAME, value.start ?? 0 );

			if ( ! target ) {
				return;
			}

			/*
			 * The range matters for the removeFormat too. Unranged, it expands
			 * across the whole run of core/link the caret sits in — which can
			 * be wider than our video link, if the author applied this over
			 * part of a longer hyperlink. That would strip the href off the
			 * rest of their link as a side effect of editing ours.
			 */
			next = removeFormat( value, 'core/link', target.start, target.end );
			next = applyFormat( next, format, target.start, target.end );
		}

		onChange( next );
		setOpen( false );
	};

	const remove = () => {
		// Same boundary problem: removeFormat does expand a collapsed caret
		// across the run, but only when the caret is genuinely inside it.
		const target = range;

		onChange(
			target
				? removeFormat( value, FORMAT_NAME, target.start, target.end )
				: removeFormat( value, FORMAT_NAME )
		);
		setOpen( false );
	};

	const isEditingExisting = !! range || isActive;

	const canApply = useMemo(
		() => !! draft.videoId && ( hasSelection || isEditingExisting ),
		[ draft.videoId, hasSelection, isEditingExisting ]
	);

	return (
		<>
			<RichTextToolbarButton
				/*
				 * `name` is what keeps this out of the "More" dropdown.
				 *
				 * FormatToolbar renders exactly four named Slots —
				 * RichText.ToolbarControls.{bold,italic,link,unknown} — and a
				 * catch-all Slot whose fills become a DropdownMenu. A button
				 * with no name lands in that dropdown, two clicks deep behind
				 * a chevron, which is where nobody finds it. Claiming the
				 * `link` slot puts it in the toolbar proper, next to the core
				 * link button it is a sibling of. Slots render every fill, so
				 * core's own link button is unaffected.
				 */
				name="link"
				icon={ videoLinkIcon }
				title={ __( 'Video link', 'tubebay' ) }
				onClick={ open }
				isActive={ isActive }
				role="menuitemcheckbox"
			/>

			{ isOpen && (
				<Popover
					anchor={ popoverAnchor }
					onClose={ close }
					placement="bottom"
					offset={ 8 }
					shift
					focusOnMount="firstElement"
					className="tubebay-video-link-popover"
				>
					<div className="tubebay-video-link-popover__inner">
						<VStack spacing={ 3 }>
							<VideoSourceControls
								videoId={ draft.videoId }
								title={ draft.title }
								onChange={ ( next ) =>
									setDraft( ( prev ) => ( {
										...prev,
										videoId: next.videoId,
										title: next.title,
									} ) )
								}
							/>

							<RadioControl
								label={ __( 'Appearance', 'tubebay' ) }
								selected={ draft.appearance }
								options={ [
									{ label: __( 'Link', 'tubebay' ), value: 'link' },
									{ label: __( 'Button', 'tubebay' ), value: 'button' },
								] }
								onChange={ ( next ) =>
									setDraft( ( prev ) => ( {
										...prev,
										appearance: next as 'link' | 'button',
									} ) )
								}
							/>

							<Button
								variant="link"
								onClick={ () => setShowAdvanced( ( prev ) => ! prev ) }
								aria-expanded={ showAdvanced }
							>
								{ showAdvanced
									? __( '▾ Advanced', 'tubebay' )
									: __( '▸ Advanced', 'tubebay' ) }
							</Button>

							{ showAdvanced && (
								<VStack spacing={ 3 } className="tubebay-video-link-popover__advanced">
									<ToggleControl
										__nextHasNoMarginBottom
										label={ __( 'Open in new tab', 'tubebay' ) }
										help={ __(
											'Applies to the fallback link, used when the popup cannot open.',
											'tubebay'
										) }
										checked={ draft.newTab }
										onChange={ ( next ) =>
											setDraft( ( prev ) => ( { ...prev, newTab: next } ) )
										}
									/>
									<ToggleControl
										__nextHasNoMarginBottom
										label={ __( 'Add nofollow', 'tubebay' ) }
										checked={ draft.nofollow }
										onChange={ ( next ) =>
											setDraft( ( prev ) => ( { ...prev, nofollow: next } ) )
										}
									/>
									<PopupWidthControl
										value={ draft.popupWidth }
										onChange={ ( next ) =>
											setDraft( ( prev ) => ( { ...prev, popupWidth: next } ) )
										}
									/>
									<AspectRatioControl
										value={ draft.ratio }
										onChange={ ( next ) =>
											setDraft( ( prev ) => ( { ...prev, ratio: next } ) )
										}
									/>
									<StartTimeControl
										value={ draft.start }
										onChange={ ( next ) =>
											setDraft( ( prev ) => ( { ...prev, start: next } ) )
										}
									/>
									<ToggleControl
										__nextHasNoMarginBottom
										label={ __( 'Show play icon', 'tubebay' ) }
										checked={ draft.playIcon }
										onChange={ ( next ) =>
											setDraft( ( prev ) => ( { ...prev, playIcon: next } ) )
										}
									/>
								</VStack>
							) }

							<div className="tubebay-video-link-popover__actions">
								{ isEditingExisting && (
									<Button variant="tertiary" isDestructive onClick={ remove }>
										{ __( 'Remove', 'tubebay' ) }
									</Button>
								) }
								<Button variant="primary" onClick={ apply } disabled={ ! canApply }>
									{ __( 'Apply', 'tubebay' ) }
								</Button>
							</div>
						</VStack>
					</div>
				</Popover>
			) }
		</>
	);
}
