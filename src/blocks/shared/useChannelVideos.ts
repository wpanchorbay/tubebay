/**
 * Fetches the connected channel's videos for the block editor's picker.
 *
 * Deliberately uses bare @wordpress/api-fetch rather than src/utils/apiFetch.ts:
 * that wrapper reads window.tubebay_Localize at module load, and Admin.php only
 * localizes it on TubeBay's own admin screens. It is undefined on post.php,
 * post-new.php and site-editor.php, which is exactly where blocks live. Core's
 * own middleware supplies the REST root and nonce inside the editor.
 *
 * Quota discipline matters here. YouTubeController::get_videos() serves the
 * cached transient — zero YouTube API units — only when `search` is empty, sort
 * is `date_desc` and there is no page token. Any other combination costs 100
 * units per call against a 10,000/day quota shared by the whole plugin. So the
 * picker loads the free cached list by default and filters it in the browser;
 * `search` is sent only when the user explicitly asks to search the whole
 * channel.
 */

import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';

import type { ChannelVideo, SortKey, VideosResponse } from './types';

const ROUTE = '/tubebay/v1/youtube/videos';

interface State {
	videos: ChannelVideo[];
	isLoading: boolean;
	error: string | null;
	nextPageToken: string | null;
	/** True when the request succeeded but returned nothing. */
	isEmpty: boolean;
	/** True when the current user may not browse the library. */
	isForbidden: boolean;
	/** False until the first request settles — distinct from "found nothing". */
	hasFetched: boolean;
	/**
	 * False only when the server told us so. Optimistic until then: asserting
	 * "you may not search" off the back of a failed request would show a
	 * permission message to an administrator who has the capability.
	 */
	canSearch: boolean;
}

const INITIAL: State = {
	videos: [],
	isLoading: false,
	error: null,
	nextPageToken: null,
	isEmpty: false,
	isForbidden: false,
	hasFetched: false,
	canSearch: true,
};

/**
 * @param apiSearch Sent to the API. Empty string keeps the request on the free
 *                  cached path — do not wire this straight to a text field.
 * @param sort      Sort key. Anything other than `date_desc` costs quota.
 */
export function useChannelVideos( apiSearch: string, sort: SortKey ) {
	const [ state, setState ] = useState< State >( INITIAL );

	// Guards against a slow earlier request overwriting a newer one.
	const requestId = useRef( 0 );

	const request = useCallback(
		async ( pageToken: string | null, append: boolean ) => {
			const id = ++requestId.current;

			setState( ( prev ) => ( { ...prev, isLoading: true, error: null } ) );

			try {
				const response = await apiFetch< VideosResponse >( {
					path: addQueryArgs( ROUTE, {
						search: apiSearch,
						sort,
						page_token: pageToken || '',
					} ),
				} );

				if ( id !== requestId.current ) {
					return;
				}

				const incoming = response?.videos || [];

				setState( ( prev ) => {
					const videos = append ? [ ...prev.videos, ...incoming ] : incoming;

					return {
						videos,
						isLoading: false,
						error: null,
						nextPageToken: response?.next_page_token || null,
						// The route answers 200 with an empty array when the
						// channel isn't connected — that is not an error.
						isEmpty: videos.length === 0,
						isForbidden: false,
						hasFetched: true,
						canSearch: response?.can_search !== false,
					};
				} );
			} catch ( err: any ) {
				if ( id !== requestId.current ) {
					return;
				}

				const status = err?.data?.status;

				setState( ( prev ) => ( {
					...prev,
					isLoading: false,
					hasFetched: true,
					isForbidden: status === 401 || status === 403,
					/*
					 * Leave `canSearch` alone. The request never reached a
					 * verdict, and the spread used to carry the initial
					 * `false` forward while `hasFetched` flipped true — which
					 * disabled the sort control and told an administrator that
					 * sorting "needs a TubeBay administrator".
					 */
					error:
						err?.message ||
						__( 'Could not load videos from your channel.', 'tubebay' ),
				} ) );
			}
		},
		[ apiSearch, sort ]
	);

	/*
	 * The debounce exists for keystrokes, which is why it is long: a search
	 * that reaches the server costs 100 quota units. But it was also applied to
	 * the very first load, where there is nothing to debounce — opening the
	 * picker sat empty for 500ms before it even asked for the cached list. Fire
	 * the first request immediately; debounce everything after it.
	 */
	const hasRequested = useRef( false );

	useEffect( () => {
		if ( ! hasRequested.current ) {
			hasRequested.current = true;
			request( null, false );
			return;
		}

		const timer = setTimeout( () => {
			request( null, false );
		}, 500 );

		return () => clearTimeout( timer );
	}, [ request ] );

	const loadMore = useCallback( () => {
		if ( state.nextPageToken && ! state.isLoading ) {
			request( state.nextPageToken, true );
		}
	}, [ request, state.nextPageToken, state.isLoading ] );

	return { ...state, loadMore };
}
