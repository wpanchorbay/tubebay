<?php
/**
 * Channel class.
 *
 * Handles YouTube channel-related data operations.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Data/Entities
 */

namespace TubeBay\Data\Entities;

use TubeBay\Helper\Settings;
use TubeBay\Data\Entities\Video;

/**
 * Channel class.
 *
 * Handles YouTube channel-related data operations.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Data/Entities
 */
class Channel {


	/**
	 * YouTube API key.
	 *
	 * @var string
	 */
	private $api_key;

	/**
	 * YouTube channel ID.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $channel_id;

	/**
	 * OAuth Refresh Token.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $refresh_token;

	/**
	 * Connection method: api or oauth.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $method = 'api';

	/**
	 * Constructor.
	 *
	 * @param array $data {
	 *     Optional. Data to initialize the channel.
	 *
	 *     @type string $api_key    YouTube API key.
	 *     @type string $channel_id YouTube channel ID.
	 * }
	 */
	public function __construct( $data = array() ) {
		if ( empty( $data ) ) {
			$this->api_key       = Settings::get_api_key();
			$this->channel_id    = Settings::get_channel_id();
			$this->refresh_token = Settings::get_refresh_token();
			$this->method        = Settings::get_connection_method();
			return;
		}

		$this->method = ! empty( $data['connection_method'] ) ? $data['connection_method'] : 'api';

		if ( 'oauth' === $this->method ) {
			$this->refresh_token = ! empty( $data['refresh_token'] ) ? $data['refresh_token'] : '';
			$this->channel_id    = ! empty( $data['channel_id'] ) ? $data['channel_id'] : '';
			$this->api_key       = '';
		} else {
			$this->api_key       = ! empty( $data['api_key'] ) ? $data['api_key'] : '';
			$this->channel_id    = ! empty( $data['channel_id'] ) ? $data['channel_id'] : '';
			$this->refresh_token = '';
		}
	}

	/**
	 * Check if the API is correctly configured.
	 *
	 * @return bool True if configured, false otherwise.
	 */
	public function is_configured() {
		if ( 'oauth' === $this->method ) {
			// OAuth mode strictly requires the refresh token for operation.
			// channel_id is optional during discovery but usually required for fetching videos.
			return ! empty( $this->refresh_token );
		}

		// Manual API Mode requires both the key and the specific channel ID.
		return ! empty( $this->api_key ) && ! empty( $this->channel_id );
	}

	/**
	 * Fetch and return the latest 50 videos from the channel.
	 * Wraps around the transient cache.
	 *
	 * @param bool $force_refresh Whether to force fresh data from the API.
	 * @return Video[]|\WP_Error
	 */
	public function get_latest_videos( $force_refresh = false ) {
		if ( ! $this->is_configured() ) {
			return new \WP_Error( 'not_configured', __( 'TubeBay API Key or Channel ID is missing.', 'tubebay' ) );
		}

		$transient_key = 'tubebay_videos_cache_' . $this->channel_id;

		if ( ! $force_refresh ) {
			$cached = get_transient( $transient_key );
			if ( false !== $cached && is_array( $cached ) ) {
				tubebay_log( 'get_latest_videos: Returning cached videos', 'debug' );
				$videos = array();
				foreach ( $cached as $v ) {
					$videos[] = new Video( $v );
				}
				return $videos;
			}
		}

		tubebay_log( 'get_latest_videos: Fetching fresh videos from API', 'info' );
		// Need to fetch fresh data.
		$videos = $this->fetch_videos_from_api();

		if ( is_wp_error( $videos ) ) {
			tubebay_log( 'get_latest_videos: Failed to fetch videos - ' . $videos->get_error_message(), 'error' );
			return $videos;
		}

		// Cache the raw array format.
		$to_cache = array();
		foreach ( $videos as $video ) {
			$to_cache[] = $video->to_array();
		}

		set_transient( $transient_key, $to_cache, Settings::get_cache_duration() );
		Settings::set_last_sync_time( time() );

		return $videos;
	}

	/**
	 * Get a valid access token. Requests a new one from the connector if expired.
	 *
	 * @return string|false Valid access token or false on failure.
	 */
	private function get_access_token() {
		if ( empty( $this->refresh_token ) ) {
			return false;
		}

		$access_token  = Settings::get( 'access_token' );
		$token_expires = (int) Settings::get( 'token_expires' );

		// Add a 5-minute buffer to expiration check
		if ( ! empty( $access_token ) && $token_expires > ( time() + 300 ) ) {
			return $access_token;
		}

		tubebay_log( 'get_access_token: Token expired or missing, requesting new one from connector', 'info' );

		// Request new access token from the connector server
		$connector_url = 'https://wpanchorbay.com/oauth/index.php';
		$response      = wp_remote_post(
			$connector_url,
			array(
				'body'    => array(
					'action'        => 'refresh',
					'refresh_token' => $this->refresh_token,
				),
				'timeout' => 15,
			)
		);

		if ( is_wp_error( $response ) ) {
			tubebay_log( 'get_access_token: Connector request failed - ' . $response->get_error_message(), 'error' );
			return false;
		}

		$raw_body = wp_remote_retrieve_body( $response );
		$body = json_decode( $raw_body, true );

		if ( empty( $body['success'] ) || empty( $body['data']['access_token'] ) ) {
			$response_code = wp_remote_retrieve_response_code( $response );
			tubebay_log( "get_access_token: Connector request failed. Response code: {$response_code}. Raw body: " . substr($raw_body, 0, 1000), 'error' );
			return false;
		}

		$new_access_token = $body['data']['access_token'];
		// Default to 1 hour expiration if expires_in not provided
		$expires_in = isset( $body['data']['expires_in'] ) ? (int) $body['data']['expires_in'] : 3599;
		$expires_at = time() + $expires_in;

		Settings::set( 'access_token', $new_access_token );
		Settings::set( 'token_expires', $expires_at );

		tubebay_log( 'get_access_token: Successfully refreshed access token', 'info' );

		return $new_access_token;
	}

	/**
	 * Build common YouTube API request arguments.
	 *
	 * @return array
	 */
	private function get_api_request_args() {
		$args = array( 'headers' => array( 'Accept' => 'application/json' ) );

		if ( ! empty( $this->refresh_token ) ) {
			$access_token = $this->get_access_token();
			if ( $access_token ) {
				$args['headers']['Authorization'] = 'Bearer ' . $access_token;
			}
		}

		return $args;
	}

	/**
	 * Perform the actual API call to YouTube.
	 * Phase 1 format.
	 *
	 * @return Video[]|\WP_Error Array of Video objects or a WP_Error on failure.
	 */
	private function fetch_videos_from_api() {
		// 1. Get the uploads playlist ID.
		tubebay_log( 'fetch_videos_from_api: Requesting channel details for uploads playlist', 'debug' );
		$args = array(
			'part' => 'snippet,contentDetails',
		);

		// If we don't have a channel ID yet but we are using OAuth, ask Google for "mine"
		if ( empty( $this->channel_id ) && 'oauth' === $this->method ) {
			$args['mine'] = 'true';
		} else {
			$args['id'] = $this->channel_id;
		}

		if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
			$args['key'] = $this->api_key;
		}

		$channel_url = add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/channels' );

		$channel_response = wp_remote_get( $channel_url, $this->get_api_request_args() );

		if ( is_wp_error( $channel_response ) ) {
			tubebay_log( 'fetch_videos_from_api: Network error fetching channel details - ' . $channel_response->get_error_message(), 'error' );
			return $channel_response;
		}

		$channel_body = json_decode( wp_remote_retrieve_body( $channel_response ), true );

		if ( isset( $channel_body['error'] ) ) {
			tubebay_log( 'fetch_videos_from_api: API error fetching channel details - ' . ( $channel_body['error']['message'] ?? 'Unknown Error' ), 'error' );
			return new \WP_Error( 'api_error', $channel_body['error']['message'] ?? 'Unknown API Error' );
		}

		if ( empty( $channel_body['items'][0]['contentDetails']['relatedPlaylists']['uploads'] ) ) {
			tubebay_log( 'fetch_videos_from_api: No uploads playlist found', 'error' );
			return new \WP_Error( 'no_uploads_playlist', __( 'Could not find the uploads playlist for this channel.', 'tubebay' ) );
		}

		$channel_data        = $channel_body['items'][0];
		$uploads_playlist_id = $channel_data['contentDetails']['relatedPlaylists']['uploads'];

		// Sync channel snippet info.
		if ( ! empty( $channel_data['snippet'] ) ) {
			$snippet = $channel_data['snippet'];
			Settings::set( 'channel_name', $snippet['title'] ?? '' );
			Settings::set( 'thumbnails_default', $snippet['thumbnails']['default']['url'] ?? '' );
			Settings::set( 'thumbnails_medium', $snippet['thumbnails']['medium']['url'] ?? '' );
			tubebay_log( 'fetch_videos_from_api: Synced channel details: ' . ( $snippet['title'] ?? 'no title' ), 'debug' );
		}

		// 2. Get up to 50 videos from the uploads playlist.
		tubebay_log( "fetch_videos_from_api: Fetching videos from playlist {$uploads_playlist_id}", 'debug' );
		$args = array(
			'playlistId' => $uploads_playlist_id,
			'part'       => 'snippet',
			'maxResults' => 50,
		);

		if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
			$args['key'] = $this->api_key;
		}

		$playlist_url = add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/playlistItems' );

		$playlist_response = wp_remote_get( $playlist_url, $this->get_api_request_args() );

		if ( is_wp_error( $playlist_response ) ) {
			tubebay_log( 'fetch_videos_from_api: Network error fetching playlist items - ' . $playlist_response->get_error_message(), 'error' );
			return $playlist_response;
		}

		$playlist_body = json_decode( wp_remote_retrieve_body( $playlist_response ), true );

		if ( isset( $playlist_body['error'] ) ) {
			tubebay_log( 'fetch_videos_from_api: API error fetching playlist items - ' . ( $playlist_body['error']['message'] ?? 'Unknown Error' ), 'error' );
			return new \WP_Error( 'api_error', $playlist_body['error']['message'] ?? 'Unknown API Error' );
		}

		if ( empty( $playlist_body['items'] ) ) {
			tubebay_log( 'fetch_videos_from_api: Playlist is empty', 'info' );
			return array();
		}

		// 3. Map to Entity.
		$videos = array();
		foreach ( $playlist_body['items'] as $item ) {
			$snippet = $item['snippet'];

			// Thumbnail selection.
			$thumbnails = $snippet['thumbnails'] ?? array();
			$thumb_url  = '';
			if ( isset( $thumbnails['maxres']['url'] ) ) {
				$thumb_url = $thumbnails['maxres']['url'];
			} elseif ( isset( $thumbnails['high']['url'] ) ) {
				$thumb_url = $thumbnails['high']['url'];
			} elseif ( isset( $thumbnails['medium']['url'] ) ) {
				$thumb_url = $thumbnails['medium']['url'];
			} elseif ( isset( $thumbnails['default']['url'] ) ) {
				$thumb_url = $thumbnails['default']['url'];
			}

			// Real video ID is stored in snippet.resourceId.videoId for playlistItems.
			$videos[] = new Video(
				array(
					'id'            => $snippet['resourceId']['videoId'] ?? '',
					'title'         => $snippet['title'] ?? '',
					'thumbnail_url' => $thumb_url,
					'published_at'  => $snippet['publishedAt'] ?? '',
					'description'   => $snippet['description'] ?? '',
				)
			);
		}

		return $videos;
	}

	/**
	 * Search and sort videos using the YouTube Search API.
	 * Supports pagination via pageToken.
	 *
	 * @param string $query       Search term.
	 * @param string $sort        Sorting order ('date_desc', 'date_asc', 'title_asc', 'title_desc', 'view_count').
	 * @param string $page_token  Next page token.
	 * @param int    $limit       Max results per request (1-50).
	 * @return array|\WP_Error    Array with 'videos' (Video[]) and 'next_page_token' (string|null).
	 */
	public function search_videos( $query = '', $sort = 'date_desc', $page_token = '', $limit = 50 ) {
		if ( ! $this->is_configured() ) {
			return new \WP_Error( 'not_configured', __( 'TubeBay API Key or Channel ID is missing.', 'tubebay' ) );
		}

		// Map our internal sort keys to YouTube API 'order'.
		$order = 'date'; // Default: Resources are sorted in reverse chronological order.
		switch ( $sort ) {
			case 'date_desc':
			case 'date_asc': // YouTube Search API doesn't support proper chronological ascending, so we fallback.
				$order = 'date';
				break;
			case 'title_asc':
			case 'title_desc':
				$order = 'title';
				break;
			case 'view_count':
				$order = 'viewCount';
				break;
			default:
				$order = 'date';
				break;
		}

		$args = array(
			'channelId'  => $this->channel_id,
			'part'       => 'snippet',
			'type'       => 'video', // Limit to videos only.
			'maxResults' => max( 1, min( (int) $limit, 50 ) ),
			'order'      => $order,
		);

		if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
			$args['key'] = $this->api_key;
		}

		if ( ! empty( $query ) ) {
			$args['q'] = sanitize_text_field( $query );
		}

		if ( ! empty( $page_token ) ) {
			$args['pageToken'] = sanitize_text_field( $page_token );
		}

		$search_url = add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/search' );

		tubebay_log( 'search_videos: Querying YouTube search API. URL params: ' . wp_json_encode( $args ), 'debug' );

		$response = wp_remote_get( $search_url, $this->get_api_request_args() );

		if ( is_wp_error( $response ) ) {
			tubebay_log( 'search_videos: Network error - ' . $response->get_error_message(), 'error' );
			return $response;
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $body['error'] ) ) {
			tubebay_log( 'search_videos: API error - ' . ( $body['error']['message'] ?? 'Unknown Error' ), 'error' );
			return new \WP_Error( 'api_error', $body['error']['message'] ?? 'Unknown API Error' );
		}

		$videos = array();
		if ( ! empty( $body['items'] ) ) {
			foreach ( $body['items'] as $item ) {
				$snippet = $item['snippet'];

				// Thumbnail selection.
				$thumbnails = $snippet['thumbnails'] ?? array();
				$thumb_url  = '';
				if ( isset( $thumbnails['high']['url'] ) ) {
					$thumb_url = $thumbnails['high']['url'];
				} elseif ( isset( $thumbnails['medium']['url'] ) ) {
					$thumb_url = $thumbnails['medium']['url'];
				} elseif ( isset( $thumbnails['default']['url'] ) ) {
					$thumb_url = $thumbnails['default']['url'];
				}

				// In Search API, ID is in id.videoId.
				$video_id = $item['id']['videoId'] ?? '';

				if ( empty( $video_id ) ) {
					continue; // Skip rare cases where it's not a video.
				}

				$videos[] = new Video(
					array(
						'id'            => $video_id,
						'title'         => $snippet['title'] ?? '',
						'thumbnail_url' => $thumb_url,
						'published_at'  => $snippet['publishedAt'] ?? '',
						'description'   => $snippet['description'] ?? '',
					)
				);
			}
		}

		// Search API reverse sort fix
		// YouTube API doesn't support reverse sorts for title or date ascending natively.
		// We'll flip the array manually for the specific page if requested.
		if ( 'date_asc' === $sort || 'title_desc' === $sort ) {
			$videos = array_reverse( $videos );
		}

		$next_page_token = $body['nextPageToken'] ?? null;

		return array(
			'videos'          => $videos,
			'next_page_token' => $next_page_token,
		);
	}


	/**
	 * Fetch channel details (like title) from the API.
	 *
	 * @return array|\WP_Error
	 */
	public function get_channel_details() {
		if ( ! $this->is_configured() ) {
			return new \WP_Error( 'not_configured', __( 'TubeBay API Key or Channel ID is missing.', 'tubebay' ) );
		}

		tubebay_log( 'get_channel_details: Fetching fresh details from API', 'info' );

		$args = array(
			'part' => 'snippet',
		);

		if ( empty( $this->channel_id ) && ! empty( $this->refresh_token ) ) {
			$args['mine'] = 'true';
		} else {
			$args['id'] = $this->channel_id;
		}

		if ( empty( $this->refresh_token ) && ! empty( $this->api_key ) ) {
			$args['key'] = $this->api_key;
		}

		$channel_url = add_query_arg( $args, 'https://www.googleapis.com/youtube/v3/channels' );

		$channel_response = wp_remote_get( $channel_url, $this->get_api_request_args() );

		if ( is_wp_error( $channel_response ) ) {
			tubebay_log( 'get_channel_details: Network error fetching details - ' . $channel_response->get_error_message(), 'error' );
			return $channel_response;
		}

		$channel_body = json_decode( wp_remote_retrieve_body( $channel_response ), true );

		if ( isset( $channel_body['error'] ) ) {
			tubebay_log( 'get_channel_details: API error - ' . ( $channel_body['error']['message'] ?? 'Unknown API Error' ), 'error' );
			return new \WP_Error( 'api_error', $channel_body['error']['message'] ?? 'Unknown API Error' );
		}

		if ( empty( $channel_body['items'][0]['snippet'] ) ) {
			tubebay_log( 'get_channel_details: Could not find channel snippet', 'error' );
			return new \WP_Error( 'api_error', __( 'Could not fetch channel details.', 'tubebay' ) );
		}

		$snippet    = $channel_body['items'][0]['snippet'];
		$channel_id = $channel_body['items'][0]['id'] ?? $this->channel_id;

		tubebay_log( 'get_channel_details: Channel details fetched successfully', 'debug' );
		tubebay_log( 'get_channel_details: Channel details - ' . wp_json_encode( $snippet ), 'debug' );

		$details = array(
			'channel_id'         => $channel_id,
			'title'              => $snippet['title'] ?? '',
			'description'        => $snippet['description'] ?? '',
			'thumbnails_default' => $snippet['thumbnails']['default']['url'] ?? '',
			'thumbnails_medium'  => $snippet['thumbnails']['medium']['url'] ?? '',
		);

		tubebay_log( 'get_channel_details: Success, setting transient cache', 'debug' );
		// Results are not cached locally for now.

		return $details;
	}

	/**
	 * Test the connection to YouTube using current credentials.
	 * Does NOT modify any stored settings — purely a read-only check.
	 *
	 * @return array|\WP_Error  Channel details array on success, WP_Error on failure.
	 */
	public function test_connection() {
		if ( ! $this->is_configured() ) {
			return new \WP_Error( 'not_configured', __( 'API Key or Channel ID is missing.', 'tubebay' ) );
		}

		if ( 'oauth' === $this->method ) {
			return $this->test_oauth_connection();
		}

		$details = $this->get_channel_details();

		if ( is_wp_error( $details ) ) {
			return $details;
		}

		return $details;
	}

	/**
	 * Test the OAuth connection using the refresh token.
	 *
	 * @return array|\WP_Error
	 */
	public function test_oauth_connection() {
		tubebay_log( 'Testing OAuth connection...', 'info' );

		// 1. Force token generation/refresh to prove the proxy & token work
		$token = $this->get_access_token();
		if ( ! $token ) {
			return new \WP_Error( 'oauth_failed', __( 'Failed to validate OAuth connection. Could not generate access token.', 'tubebay' ) );
		}

		// 2. Fetch the channel details.
		// Since channel_id might be empty initially, get_channel_details() will safely use mine=true
		$details = $this->get_channel_details();

		if ( is_wp_error( $details ) ) {
			return $details;
		}

		// 3. Populate the class instance with the newly discovered channel ID
		if ( empty( $this->channel_id ) && ! empty( $details['channel_id'] ) ) {
			$this->channel_id = $details['channel_id'];
		}

		return $details;
	}

	/**
	 * Reconnect: save the current credentials to Settings and re-test.
	 *
	 * @return true|\WP_Error
	 */
	public function reconnect() {
		Settings::set( 'api_key', $this->api_key );
		Settings::set( 'channel_id', $this->channel_id );

		return $this->test_connection();
	}

	/**
	 * Disconnect: clear connection state in Settings.
	 *
	 * @return void
	 */
	public function disconnect() {
		Settings::set( 'connection_status', 'disconnected' );
		Settings::set( 'channel_name', '' );
	}
}
