/**
 * Channel video picker shown inside a modal in the block editor.
 *
 * Talks to GET /tubebay/v1/youtube/videos — the same route and response shape
 * assets/js/admin/product-metabox.js already uses for the product metabox.
 *
 * Typing filters the already-loaded videos in the browser, which is free. The
 * "Search whole channel" button is what actually sends `search` to the API, and
 * that call costs 100 YouTube quota units. Keep that distinction: the picker is
 * now reachable by every editor on the site, not just administrators.
 */

import { useMemo, useState } from '@wordpress/element';
import {
	Button,
	Modal,
	Notice,
	SearchControl,
	SelectControl,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { useChannelVideos } from './useChannelVideos';
import type { ChannelVideo, SortKey } from './types';

interface VideoPickerProps {
	onSelect: ( video: ChannelVideo ) => void;
	onClose: () => void;
}

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
	{ label: __( 'Newest first', 'tubebay' ), value: 'date_desc' },
	{ label: __( 'Oldest first', 'tubebay' ), value: 'date_asc' },
	{ label: __( 'Title A–Z', 'tubebay' ), value: 'title_asc' },
	{ label: __( 'Title Z–A', 'tubebay' ), value: 'title_desc' },
	{ label: __( 'Most viewed', 'tubebay' ), value: 'view_count' },
];

export const VideoPicker = ( { onSelect, onClose }: VideoPickerProps ) => {
	// What the user typed — filters locally, costs nothing.
	const [ filter, setFilter ] = useState( '' );
	// What we actually sent to the API — only set by an explicit search.
	const [ apiSearch, setApiSearch ] = useState( '' );
	const [ sort, setSort ] = useState< SortKey >( 'date_desc' );

	const {
		videos,
		isLoading,
		error,
		nextPageToken,
		isEmpty,
		isForbidden,
		hasFetched,
		canSearch,
		loadMore,
	} = useChannelVideos( apiSearch, sort );

	const visible = useMemo( () => {
		const needle = filter.trim().toLowerCase();

		/*
		 * Once a whole-channel search has run, show exactly what the API
		 * returned. It matches on description and tags as well as title, so
		 * re-applying the local title filter would silently drop results the
		 * user just spent quota to fetch — and could even leave the list
		 * empty after a successful search.
		 */
		if ( ! needle || apiSearch ) {
			return videos;
		}

		return videos.filter( ( video ) =>
			( video.title || '' ).toLowerCase().includes( needle )
		);
	}, [ videos, filter, apiSearch ] );

	const canSearchApi =
		canSearch && filter.trim() !== '' && filter.trim() !== apiSearch;

	return (
		<Modal
			title={ __( 'Choose a video', 'tubebay' ) }
			onRequestClose={ onClose }
			className="tubebay-video-picker"
			size="large"
		>
			<div className="tubebay-video-picker__toolbar">
				<SearchControl
					__nextHasNoMarginBottom
					label={ __( 'Filter loaded videos', 'tubebay' ) }
					value={ filter }
					onChange={ setFilter }
				/>
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Sort by', 'tubebay' ) }
					value={ sort }
					/*
					 * The server pins users without `manage_tubebay` to the
					 * cached newest-first list. Leaving this live would let
					 * them pick "Oldest first" and get the newest-first list
					 * back with no explanation.
					 */
					options={ SORT_OPTIONS }
					disabled={ hasFetched && ! canSearch }
					help={
						hasFetched && ! canSearch
							? __(
									'Showing the most recent videos. Sorting the full channel needs a TubeBay administrator.',
									'tubebay'
							  )
							: undefined
					}
					onChange={ ( value ) => setSort( value as SortKey ) }
				/>
			</div>

			{ canSearchApi && (
				<div className="tubebay-video-picker__deep-search">
					<Button variant="link" onClick={ () => setApiSearch( filter.trim() ) }>
						{ __( 'Search your whole channel instead', 'tubebay' ) }
					</Button>
				</div>
			) }

			{ apiSearch && (
				<div className="tubebay-video-picker__deep-search">
					<Button
						variant="link"
						onClick={ () => {
							setApiSearch( '' );
							setFilter( '' );
						} }
					>
						{ __( 'Clear search and show recent videos', 'tubebay' ) }
					</Button>
				</div>
			) }

			{ isForbidden && (
				<Notice status="warning" isDismissible={ false }>
					{ __(
						'You do not have permission to browse the channel library. You can still paste a YouTube URL instead.',
						'tubebay'
					) }
				</Notice>
			) }

			{ ! isForbidden && error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }

			{ isLoading && videos.length === 0 && (
				<div className="tubebay-video-picker__loading">
					<Spinner />
				</div>
			) }

			{ /* The route answers 200 with an empty array when no channel is
			     connected, so this covers the disconnected state too. */ }
			{ hasFetched && ! isLoading && ! error && ! isForbidden && isEmpty && (
				<Notice status="info" isDismissible={ false }>
					{ apiSearch
						? __( 'No videos matched your search.', 'tubebay' )
						: __(
								'No videos found. Connect your YouTube channel in TubeBay settings, or paste a YouTube URL instead.',
								'tubebay'
						  ) }
				</Notice>
			) }

			{ hasFetched && ! isLoading && ! error && ! isForbidden && ! isEmpty && visible.length === 0 && (
				<Notice status="info" isDismissible={ false }>
					{ __( 'No loaded videos match that filter.', 'tubebay' ) }
				</Notice>
			) }

			{ visible.length > 0 && (
				<ul className="tubebay-video-picker__grid">
					{ visible.map( ( video ) => (
						<li key={ video.id }>
							<button
								type="button"
								className="tubebay-video-picker__item"
								onClick={ () => {
									onSelect( video );
									onClose();
								} }
							>
								<img src={ video.thumbnail_url } alt="" loading="lazy" />
								<span className="tubebay-video-picker__title" title={ video.title }>
									{ video.title }
								</span>
							</button>
						</li>
					) ) }
				</ul>
			) }

			{ nextPageToken && (
				<div className="tubebay-video-picker__more">
					<Button variant="secondary" onClick={ loadMore } isBusy={ isLoading }>
						{ isLoading ? __( 'Loading…', 'tubebay' ) : __( 'Load more', 'tubebay' ) }
					</Button>
				</div>
			) }
		</Modal>
	);
};
