/**
 * Controls shared by the two blocks and the inline video-link format.
 *
 * These live here rather than in any one caller because all three surfaces are
 * required to offer the same options — a user who learns the block should not
 * find the inline link missing half of them.
 */

import { SelectControl, TextControl } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import type { AspectRatio } from './Facade';

export const ASPECT_OPTIONS: { label: string; value: AspectRatio }[] = [
	{ label: __( '16:9 — Widescreen', 'tubebay' ), value: '16-9' },
	{ label: __( '4:3 — Standard', 'tubebay' ), value: '4-3' },
	{ label: __( '1:1 — Square', 'tubebay' ), value: '1-1' },
	{ label: __( '9:16 — Shorts', 'tubebay' ), value: '9-16' },
];

interface AspectRatioControlProps {
	value: AspectRatio;
	onChange: ( next: AspectRatio ) => void;
}

export const AspectRatioControl = ( { value, onChange }: AspectRatioControlProps ) => (
	<SelectControl
		__nextHasNoMarginBottom
		label={ __( 'Video shape', 'tubebay' ) }
		value={ value || '16-9' }
		options={ ASPECT_OPTIONS }
		onChange={ ( next ) => onChange( next as AspectRatio ) }
	/>
);

/*
 * Start time is stored as a plain number of seconds, because that is what
 * YouTube's `start` embed parameter takes. Authors think in mm:ss, so the
 * control converts in both directions and never makes them count seconds.
 */

/** "90" -> "1:30". Empty stays empty. */
export function secondsToClock( seconds: string | number ): string {
	const total = parseInt( String( seconds ), 10 );

	if ( ! Number.isFinite( total ) || total <= 0 ) {
		return '';
	}

	const mins = Math.floor( total / 60 );
	const secs = total % 60;

	return `${ mins }:${ String( secs ).padStart( 2, '0' ) }`;
}

/**
 * "1:30" -> "90". Also accepts "90", "1:30:00" and sloppy input like " 1: 5".
 * Returns '' for anything that isn't a positive time, so an unparseable value
 * simply means "start at the beginning" rather than throwing.
 */
export function clockToSeconds( input: string ): string {
	const text = String( input ).trim();

	if ( ! text ) {
		return '';
	}

	const parts = text.split( ':' ).map( ( part ) => parseInt( part.trim(), 10 ) );

	if ( parts.some( ( part ) => ! Number.isFinite( part ) || part < 0 ) ) {
		return '';
	}

	// h:m:s, m:s, or bare seconds.
	const total = parts.reduce( ( acc, part ) => acc * 60 + part, 0 );

	return total > 0 ? String( total ) : '';
}

interface StartTimeControlProps {
	/** Seconds, as stored. */
	value: string;
	onChange: ( next: string ) => void;
}

export const StartTimeControl = ( { value, onChange }: StartTimeControlProps ) => {
	/*
	 * The field owns the text the user is typing; it is NOT re-derived from
	 * `value` on every render.
	 *
	 * Echoing `secondsToClock( value )` straight back made the control
	 * silently wrong rather than merely awkward. Typing "1:30" went:
	 * "1" -> stored 1 -> field rewritten to "0:01" -> next keystroke gives
	 * "0:01:" -> unparseable -> field cleared -> "3" -> "0:03" -> "0" ->
	 * "0:030" -> stored 30. The author asked for 1:30 and got 0:30, with no
	 * error anywhere.
	 *
	 * Conversion happens on the way out only. We still commit on every
	 * keystroke rather than on blur, because the video-link popover's Apply
	 * button would otherwise depend on blur firing before the click.
	 */
	const [ text, setText ] = useState( () => secondsToClock( value ) );

	// What we last handed upward, so the round-trip below can be ignored.
	const committed = useRef( value );

	useEffect( () => {
		// Only resync when `value` changed somewhere else — a different video
		// picked, or the popover reopened on another link.
		if ( value !== committed.current ) {
			committed.current = value;
			setText( secondsToClock( value ) );
		}
	}, [ value ] );

	return (
		<TextControl
			__nextHasNoMarginBottom
			__next40pxDefaultSize
			label={ __( 'Start at', 'tubebay' ) }
			help={ __( 'For example 1:30. Leave empty to start at the beginning.', 'tubebay' ) }
			value={ text }
			placeholder="0:00"
			onChange={ ( next ) => {
				setText( next );

				const seconds = clockToSeconds( next );

				committed.current = seconds;
				onChange( seconds );
			} }
		/>
	);
};
