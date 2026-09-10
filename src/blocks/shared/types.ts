/**
 * Shapes shared by the TubeBay blocks.
 */

/** A video as returned by GET /tubebay/v1/youtube/videos. */
export interface ChannelVideo {
	id: string;
	title: string;
	thumbnail_url: string;
	published_at?: string;
	description?: string;
	is_assigned?: boolean;
	assigned_count?: number;
}

export interface VideosResponse {
	success: boolean;
	videos: ChannelVideo[];
	next_page_token: string | null;
	/** False when the server restricted this user to the cached list. */
	can_search?: boolean;
}

/** Attributes common to both blocks. */
export interface VideoAttributes {
	videoId: string;
	title: string;
	thumbnailUrl: string;
}

export type SortKey =
	| 'date_desc'
	| 'date_asc'
	| 'title_asc'
	| 'title_desc'
	| 'view_count';
