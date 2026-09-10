/**
 * Parse a YouTube video ID out of whatever the user pasted.
 *
 * Accepts every shape YouTube hands out:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/live/ID
 *   https://www.youtube-nocookie.com/embed/ID
 *   https://music.youtube.com/watch?v=ID
 *   ID
 */

const ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const PATH_PREFIXES = [ 'embed', 'shorts', 'live', 'v' ];

/**
 * Extract an 11-character YouTube video ID, or null when there isn't one.
 *
 * @param input Raw user input — a URL or a bare ID.
 */
export function parseYouTubeId( input: string ): string | null {
	const value = ( input || '' ).trim();

	if ( ! value ) {
		return null;
	}

	// Bare ID.
	if ( ID_PATTERN.test( value ) ) {
		return value;
	}

	let url: URL;

	try {
		url = new URL( value.includes( '://' ) ? value : `https://${ value }` );
	} catch {
		return null;
	}

	const host = url.hostname.replace( /^www\./, '' );
	const segments = url.pathname.split( '/' ).filter( Boolean );

	// youtu.be/ID
	if ( host === 'youtu.be' ) {
		return ID_PATTERN.test( segments[ 0 ] ) ? segments[ 0 ] : null;
	}

	/*
	 * music.youtube.com is included because it serves ordinary /watch?v= URLs
	 * for the same videos and is what the share button hands you from the
	 * YouTube Music app — pasting one used to be rejected as "not a YouTube
	 * link" even though the ID embeds perfectly well.
	 */
	const WATCH_HOSTS = [
		'youtube.com',
		'youtube-nocookie.com',
		'm.youtube.com',
		'music.youtube.com',
	];

	if ( ! WATCH_HOSTS.includes( host ) ) {
		return null;
	}

	// watch?v=ID
	const queryId = url.searchParams.get( 'v' );
	if ( queryId && ID_PATTERN.test( queryId ) ) {
		return queryId;
	}

	// /embed/ID, /shorts/ID, /live/ID, /v/ID
	if ( segments.length >= 2 && PATH_PREFIXES.includes( segments[ 0 ] ) ) {
		return ID_PATTERN.test( segments[ 1 ] ) ? segments[ 1 ] : null;
	}

	return null;
}

/**
 * Public watch URL for a video ID. Used as the button's real `href` so the
 * block still works when JavaScript doesn't.
 */
export function watchUrl( videoId: string ): string {
	return `https://www.youtube.com/watch?v=${ encodeURIComponent( videoId ) }`;
}

/**
 * Best-guess thumbnail for a manually entered ID, where no synced Video record
 * exists to read `thumbnail_url` from. `maxresdefault` is absent for plenty of
 * videos, so the facade attaches an onerror fallback to this.
 */
export function thumbnailUrl( videoId: string ): string {
	return `https://i.ytimg.com/vi/${ encodeURIComponent( videoId ) }/maxresdefault.jpg`;
}

/**
 * The fallback the facade swaps to when maxresdefault 404s.
 */
export function fallbackThumbnailUrl( videoId: string ): string {
	return `https://i.ytimg.com/vi/${ encodeURIComponent( videoId ) }/hqdefault.jpg`;
}

/** Thumbnail tiers, best first. */
const THUMB_TIERS = [ 'maxresdefault', 'sddefault', 'hqdefault' ];

/**
 * Find the best thumbnail that actually exists for a video ID.
 *
 * Only needed for manually pasted IDs — videos picked from the channel already
 * carry a `thumbnail_url` chosen at sync time.
 *
 * YouTube does not 404 a missing tier; it serves a 120x90 grey placeholder. So
 * this tests `naturalWidth`, not the error event — checking onerror alone would
 * happily accept the placeholder.
 */
export function probeThumbnail( videoId: string ): Promise< string > {
	const tryTier = ( index: number ): Promise< string > => {
		const url = `https://i.ytimg.com/vi/${ encodeURIComponent( videoId ) }/${ THUMB_TIERS[ index ] }.jpg`;

		if ( index === THUMB_TIERS.length - 1 ) {
			return Promise.resolve( url );
		}

		return new Promise( ( resolve ) => {
			const img = new Image();
			img.onload = () =>
				resolve( img.naturalWidth > 120 ? url : '' );
			img.onerror = () => resolve( '' );
			img.src = url;
		} ).then( ( result ) =>
			result ? ( result as string ) : tryTier( index + 1 )
		);
	};

	return tryTier( 0 );
}
