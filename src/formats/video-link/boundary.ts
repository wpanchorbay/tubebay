/**
 * Find the extent of a format run around an index.
 *
 * WordPress core does this with getFormatBoundary(), but that helper lives
 * inside @wordpress/format-library and is NOT exported from
 * @wordpress/rich-text — so it has to be reimplemented here.
 *
 * It is not optional. applyFormat() on a COLLAPSED caret applies to zero
 * characters unless a format of that type already sits at the index
 * (rich-text.js:299-323), while removeFormat() on a collapsed caret expands
 * across the whole run. Editing an existing link through the popover is exactly
 * that case — the popover opens on click, with nothing selected — so without
 * this, re-applying after a settings change silently deletes the link.
 */

interface RichTextFormat {
	type: string;
	attributes?: Record< string, string >;
	unregisteredAttributes?: Record< string, string >;
}

interface RichTextValue {
	formats: Array< RichTextFormat[] | undefined >;
	text: string;
	start?: number;
	end?: number;
}

/**
 * @return The half-open range [start, end) covering the run, or null when the
 *         index is not inside one.
 */
export function getFormatRange(
	value: RichTextValue,
	type: string,
	index: number
): { start: number; end: number } | null {
	const { formats } = value;

	const has = ( i: number ): boolean =>
		i >= 0 &&
		i < formats.length &&
		Array.isArray( formats[ i ] ) &&
		( formats[ i ] as RichTextFormat[] ).some( ( format ) => format.type === type );

	/*
	 * A caret sitting immediately after the last character of a run reports
	 * index === end, where formats[index] belongs to whatever follows. Look one
	 * character back before giving up, which is what makes clicking at the end
	 * of a link still find it.
	 */
	let anchor = index;

	if ( ! has( anchor ) ) {
		anchor = index - 1;
	}

	if ( ! has( anchor ) ) {
		return null;
	}

	let start = anchor;
	let end = anchor;

	while ( has( start - 1 ) ) {
		start--;
	}

	while ( has( end + 1 ) ) {
		end++;
	}

	// applyFormat takes a half-open range, so end is exclusive.
	return { start, end: end + 1 };
}

/** The active format object of `type` at an index, if any. */
export function getActiveFormat(
	value: RichTextValue,
	type: string,
	index: number
): RichTextFormat | undefined {
	const at = ( i: number ) =>
		i >= 0 && i < value.formats.length
			? ( value.formats[ i ] || [] ).find( ( format ) => format.type === type )
			: undefined;

	return at( index ) || at( index - 1 );
}
