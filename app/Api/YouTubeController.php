<?php
/**
 * REST API Controller for YouTube interactions.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Api
 */

namespace TubeBay\Api;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use TubeBay\Data\Entities\Channel;

/**
 * YouTube API Controller class.
 */
class YouTubeController extends ApiController {


	/**
	 * The single instance of the class.
	 *
	 * @var YouTubeController|null
	 * @since 1.0.0
	 */
	private static $instance = null;

	/**
	 * Gets an instance of this object.
	 *
	 * @return YouTubeController
	 * @since 1.0.0
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register the routes for this controller.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function register_routes() {
		$namespace = $this->namespace . $this->version;

		add_filter(
			'allowed_redirect_hosts',
			function ( $hosts, $host ) {
				if ( 'wpanchorbay.com' === $host ) {
					$hosts[] = 'wpanchorbay.com';
				}
				return $hosts;
			},
			10,
			2
		);

		// Route to test YouTube Connection.
		register_rest_route(
			$namespace,
			'/youtube/test-connection',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'test_connection' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'connection_method' => array(
							'required' => true,
							'type'     => 'string',
							'enum'     => array( 'api', 'oauth' ),
						),
					),
				),
			)
		);

		// Route to bulk assign videos to products.
		register_rest_route(
			$namespace,
			'/products/bulk-assign',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'bulk_assign_videos' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
		);

		// Route to save video order.
		register_rest_route(
			$namespace,
			'/products/video-order',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_video_order' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
		);

		// Route to manually sync/refresh the library.
		register_rest_route(
			$namespace,
			'/youtube/sync-library',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'sync_library' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
				),
			)
		);

		// Route to manually sync the library returning only status.
		register_rest_route(
			$namespace,
			'/youtube/sync-library-status',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'sync_library_status' ),
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
				),
			)
		);

		// Route to get cached videos.
		register_rest_route(
			$namespace,
			'/youtube/videos',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_videos' ),
					// Intentionally NOT the shared get_item_permissions_check:
					// the block editor's video picker must work for editors and
					// authors, not just administrators. See below.
					'permission_callback' => array( $this, 'get_videos_permissions_check' ),
				),
			)
		);
		// Route to disconnect the YouTube account.
		register_rest_route(
			$namespace,
			'/youtube/disconnect',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'disconnect' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
		);
		// Route to redirect user to OAuth Proxy with domain tracking.
		register_rest_route(
			$namespace,
			'/youtube/oauth-connect',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'oauth_connect' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Test YouTube API connection.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error The REST response or error.
	 * @since 1.0.0
	 */
	public function test_connection( $request ) {
		$params            = $request->get_params();
		$api_key           = isset( $params['api_key'] ) ? sanitize_text_field( $params['api_key'] ) : '';
		$channel_id        = isset( $params['channel_id'] ) ? sanitize_text_field( $params['channel_id'] ) : '';
		$refresh_token     = isset( $params['refresh_token'] ) ? sanitize_text_field( $params['refresh_token'] ) : '';
		$connection_method = isset( $params['connection_method'] ) ? sanitize_text_field( $params['connection_method'] ) : 'api';

		tubebay_log( "Testing connection for Channel ID: {$channel_id}", 'debug' );

		$channel = new Channel(
			array(
				'api_key'           => $api_key,
				'channel_id'        => $channel_id,
				'refresh_token'     => $refresh_token,
				'connection_method' => $connection_method,
			)
		);
		if ( ! $channel->is_configured() ) {
			tubebay_log( 'Connection test failed: API Key or Channel ID missing', 'error' );
			return new \WP_Error( 'not_configured', __( 'API Key or Channel ID missing.', 'tubebay' ), array( 'status' => 400 ) );
		}

		$result = $channel->test_connection();

		if ( is_wp_error( $result ) ) {
			tubebay_log( 'Connection test failed: ' . $result->get_error_message(), 'error' );
			return new \WP_Error( 'connection_failed', $result->get_error_message(), array( 'status' => 400 ) );
		}

		tubebay_log( 'Connection test successful for channel: ' . ( $result['title'] ?? 'Unknown' ), 'info' );

		return new WP_REST_Response(
			array(
				'success'             => true,
				'message'             => __( 'Connection successful!', 'tubebay' ),
				'channel_name'        => $result['title'] ?? '',
				'channel_description' => $result['description'] ?? '',
			),
			200
		);
	}


	/**
	 * Sync the YouTube library manually.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error The REST response or error.
	 * @since 1.0.0
	 */
	public function sync_library( $request ) {
		tubebay_log( 'Manual sync_library request received', 'debug' );
		$channel = new Channel();

		if ( ! $channel->is_configured() ) {
			tubebay_log( 'Sync failed: Channel not configured', 'error' );
			return new \WP_Error( 'not_configured', __( 'API Key or Channel ID missing.', 'tubebay' ), array( 'status' => 400 ) );
		}

		// Force a refresh from the API bypassing transient caches.
		$videos = $channel->get_latest_videos( true );

		if ( is_wp_error( $videos ) ) {
			\TubeBay\Helper\Settings::set( 'connection_status', 'failed' );
			return new \WP_Error( 'sync_failed', $videos->get_error_message(), array( 'status' => 400 ) );
		}

		\TubeBay\Helper\Settings::set( 'connection_status', 'connected' );

		// Send back an array of the newly fetched videos.
		$product_map     = $this->get_product_video_map();
		$response_videos = array();
		foreach ( $videos as $video ) {
			$arr                   = $video->to_array();
			$arr['products']       = $product_map[ $video->id ] ?? array();
			$arr['is_assigned']    = ! empty( $arr['products'] );
			$arr['assigned_count'] = count( $arr['products'] );
			$response_videos[]     = $arr;
		}

		/**
		 * Filter the synced videos response array.
		 *
		 * @since 1.1.0
		 * @param array $response_videos The video array.
		 * @param Video[] $videos The raw Video objects.
		 */
		$response_videos = apply_filters( 'tubebay_synced_videos', $response_videos, $videos );

		/**
		 * Fires after the library sync completes successfully.
		 *
		 * @since 1.1.0
		 * @param Video[] $videos The fetched Video objects.
		 */
		do_action( 'tubebay_after_sync_library', $videos );

		return new WP_REST_Response(
			array(
				'success'            => true,
				'message'            => __( 'Library synced successfully.', 'tubebay' ),
				'videos'             => $response_videos,
				'last_sync_time'     => \TubeBay\Helper\Settings::get_last_sync_time(),
				'channel_name'       => \TubeBay\Helper\Settings::get( 'channel_name' ),
				'thumbnails_default' => \TubeBay\Helper\Settings::get( 'thumbnails_default' ),
				'thumbnails_medium'  => \TubeBay\Helper\Settings::get( 'thumbnails_medium' ),
			),
			200
		);
	}

	/**
	 * Sync the YouTube library manually and return only status.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error The REST response or error.
	 * @since 1.0.0
	 */
	public function sync_library_status( $request ) {
		tubebay_log( 'Manual sync_library_status request received', 'debug' );
		$channel = new Channel();

		if ( ! $channel->is_configured() ) {
			tubebay_log( 'Sync status failed: Channel not configured', 'error' );
			return new \WP_Error( 'not_configured', __( 'API Key or Channel ID missing.', 'tubebay' ), array( 'status' => 400 ) );
		}

		// Force a refresh from the API bypassing transient caches.
		$videos = $channel->get_latest_videos( true );

		if ( is_wp_error( $videos ) ) {
			\TubeBay\Helper\Settings::set( 'connection_status', 'failed' );
			tubebay_log( 'Sync status failed during get_latest_videos: ' . $videos->get_error_message(), 'error' );
			return new \WP_Error( 'sync_failed', $videos->get_error_message(), array( 'status' => 400 ) );
		}

		\TubeBay\Helper\Settings::set( 'connection_status', 'connected' );
		tubebay_log( 'Library sync_status successful, fetched ' . count( $videos ) . ' videos', 'info' );

		return new WP_REST_Response(
			array(
				'success'            => true,
				'message'            => __( 'Library synced successfully.', 'tubebay' ),
				'last_sync_time'     => \TubeBay\Helper\Settings::get_last_sync_time(),
				'channel_name'       => \TubeBay\Helper\Settings::get( 'channel_name' ),
				'thumbnails_default' => \TubeBay\Helper\Settings::get( 'thumbnails_default' ),
				'thumbnails_medium'  => \TubeBay\Helper\Settings::get( 'thumbnails_medium' ),
			),
			200
		);
	}

	/**
	 * Permission check for GET /youtube/videos.
	 *
	 * Deliberately looser than the shared ApiController::get_item_permissions_check(),
	 * which requires `manage_tubebay` — a capability granted only to the
	 * administrator role at activation. The block editor's video picker is used
	 * by whoever writes the content, so gating it on `manage_tubebay` left
	 * editors, authors and shop managers with an empty picker.
	 *
	 * `edit_posts` is the canonical "can use the block editor" capability. The
	 * nonce check is kept: relaxing the capability should not also relax CSRF
	 * protection. This route returns public YouTube data plus the titles of
	 * already-published products, so it carries nothing privileged — API keys
	 * and OAuth tokens remain behind `manage_tubebay` in SettingsController.
	 *
	 * Only this route changes. Every other route still requires `manage_tubebay`.
	 *
	 * @since 1.3.0
	 * @param WP_REST_Request $request Full details about the request.
	 * @return bool|WP_Error True if the request may read the video library.
	 */
	public function get_videos_permissions_check( $request ) {
		if ( ! current_user_can( 'manage_tubebay' ) && ! current_user_can( 'edit_posts' ) ) {
			tubebay_log( 'YouTubeController: Permission denied — user cannot edit posts', 'error' );
			return new \WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to browse the video library.', 'tubebay' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return $this->verify_rest_nonce( $request );
	}

	/**
	 * Match the synced library against a search term.
	 *
	 * A plain case-insensitive substring test on the title, which is what a
	 * person means by "search" and what the block editor's picker has always
	 * done. YouTube's own search matches whole words only, so this is the half
	 * that finds "WooCommerce ..." when someone types "woo".
	 *
	 * Never returns a WP_Error: an unreadable cache simply means no local
	 * matches, and the caller still has the API result.
	 *
	 * @param \TubeBay\Data\Entities\Channel $channel The channel.
	 * @param string                         $search  The raw search term.
	 * @return array Video entities whose title contains the term.
	 */
	private function search_cached_videos( $channel, $search ) {
		$needle = trim( (string) $search );
		if ( '' === $needle ) {
			return array();
		}

		$cached = $channel->get_latest_videos( false );
		if ( is_wp_error( $cached ) || ! is_array( $cached ) ) {
			return array();
		}

		// mb_stripos so non-ASCII titles fold case correctly too.
		$matches = array();
		foreach ( $cached as $video ) {
			$title = (string) ( $video->title ?? '' );
			if ( '' !== $title && false !== mb_stripos( $title, $needle ) ) {
				$matches[] = $video;
			}
		}

		return $matches;
	}

	/**
	 * Get videos from YouTube (search or latest).
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error The REST response or error.
	 * @since 1.0.0
	 */
	public function get_videos( $request ) {
		$channel = new Channel();

		if ( ! $channel->is_configured() ) {
			return new WP_REST_Response(
				array(
					'success'         => true,
					'videos'          => array(),
					'next_page_token' => null,

					// Must be present here too: the client reads a missing
					// can_search as true and would offer a whole-channel
					// search against a channel that isn't connected.
					'can_search'      => false,
				),
				200
			);
		}

		$params     = $request->get_params();
		$search     = isset( $params['search'] ) ? sanitize_text_field( $params['search'] ) : '';
		$sort       = isset( $params['sort'] ) ? sanitize_text_field( $params['sort'] ) : 'date_desc';
		$page_token = isset( $params['page_token'] ) ? sanitize_text_field( $params['page_token'] ) : '';

		/*
		 * The block editor's picker is reachable by anyone with `edit_posts`,
		 * which includes Contributors. The branch below that calls
		 * Channel::search_videos() costs 100 YouTube quota units per request
		 * against a 10,000/day allowance shared by the whole site — roughly a
		 * hundred requests would take the plugin down for everyone — so it is
		 * not something an untrusted role should be able to trigger at will.
		 *
		 * Users without `manage_tubebay` are therefore pinned to the cached
		 * playlist path. The picker already loads that by default and filters
		 * it client-side, so this costs them nothing in practice; it only
		 * removes the ability to force repeated live Search API calls.
		 */
		$can_query_api = current_user_can( 'manage_tubebay' );

		/*
		 * Sorting and paging still need the Search API, so they stay gated. The
		 * search TERM no longer does: it is also matched against the synced
		 * library below, which costs nothing and works for every role.
		 */
		if ( ! $can_query_api ) {
			$sort       = 'date_desc';
			$page_token = '';
		}

		if ( '' === $search && 'date_desc' === $sort && '' === $page_token ) {
			// No search, default sort, first page: the fast cached playlist.
			$videos          = $channel->get_latest_videos( false );
			$next_page_token = null;

		} elseif ( '' !== $search ) {
			/*
			 * A search is BOTH: the synced library is matched here as a plain
			 * substring, and YouTube's Search API is asked as well.
			 *
			 * Why both: YouTube's `q` matches whole words. On a channel full of
			 * "WooCommerce ..." titles, searching "woo" returned nothing at all
			 * while "cart" worked, because "cart" is a whole word and "woo" is
			 * only half of one. Matching the cached titles ourselves covers the
			 * partial-word case; still calling the API covers videos that have
			 * not been synced into the cache yet. Neither alone is enough.
			 *
			 * Cached matches come first — they are the store's own library —
			 * and API results are appended, skipping any already listed.
			 */
			$videos          = '' === $page_token ? $this->search_cached_videos( $channel, $search ) : array();
			$next_page_token = null;

			if ( $can_query_api ) {
				$result = $channel->search_videos( $search, $sort, $page_token, 50 );

				if ( is_wp_error( $result ) ) {
					/*
					 * Do not fail the whole request. The cached matches are a
					 * real answer, and a quota or network problem at YouTube
					 * should not empty a library the store already has.
					 */
					tubebay_log( 'get_videos: channel search failed, serving cached matches only - ' . $result->get_error_message(), 'error' );
				} else {
					$seen = array();
					foreach ( $videos as $video ) {
						$seen[ $video->id ] = true;
					}
					foreach ( $result['videos'] as $video ) {
						if ( ! isset( $seen[ $video->id ] ) ) {
							$videos[]           = $video;
							$seen[ $video->id ] = true;
						}
					}
					$next_page_token = $result['next_page_token'];
				}
			}
		} else {
			// Sorting or paging with no search term: the API path, unchanged.
			$result = $channel->search_videos( $search, $sort, $page_token, 50 );

			if ( is_wp_error( $result ) ) {
				return new \WP_Error( 'search_failed', $result->get_error_message(), array( 'status' => 400 ) );
			}

			$videos          = $result['videos'];
			$next_page_token = $result['next_page_token'];
		}

		if ( is_wp_error( $videos ) ) {
			return new \WP_Error( 'fetch_failed', $videos->get_error_message(), array( 'status' => 400 ) );
		}

		$product_map     = $this->get_product_video_map();
		$response_videos = array();
		foreach ( $videos as $video ) {
			$arr                   = $video->to_array();
			$arr['products']       = $product_map[ $video->id ] ?? array();
			$arr['is_assigned']    = ! empty( $arr['products'] );
			$arr['assigned_count'] = count( $arr['products'] );
			$response_videos[]     = $arr;
		}

		return new WP_REST_Response(
			array(
				'success'         => true,
				'videos'          => $response_videos,
				'next_page_token' => $next_page_token ?? null,

				/*
				 * Whether this user's search, sort and paging parameters are
				 * honoured at all. When false the server pins the request to
				 * the cached newest-first list, so the editor has to disable
				 * those controls rather than let them appear to work.
				 */
				'can_search'      => $can_query_api,
			),
			200
		);
	}

	/**
	 * Disconnect the YouTube account.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error The REST response or error.
	 */
	public function disconnect( $request ) {
		tubebay_log( 'Disconnect request received', 'info' );

		$channel_id = \TubeBay\Helper\Settings::get_channel_id();

		// List of settings to clear.
		$settings_to_clear = array(
			'api_key',
			'channel_id',
			'channel_name',
			'thumbnails_default',
			'thumbnails_medium',
			'connection_status',
			'connection_method',
			'last_sync_time',
			'access_token',
			'refresh_token',
			'token_expires',
		);

		foreach ( $settings_to_clear as $setting ) {
			if ( 'connection_status' === $setting ) {
				\TubeBay\Helper\Settings::set( $setting, 'inactive' );
			} elseif ( 'connection_method' === $setting ) {
				\TubeBay\Helper\Settings::set( $setting, 'oauth' );
			} elseif ( 'last_sync_time' === $setting || 'token_expires' === $setting ) {
				\TubeBay\Helper\Settings::set( $setting, 0 );
			} else {
				\TubeBay\Helper\Settings::set( $setting, '' );
			}
		}

		// Clear transient cache for this channel.
		if ( ! empty( $channel_id ) ) {
			delete_transient( 'tubebay_videos_cache_' . $channel_id );
		}

		tubebay_log( 'YouTube account disconnected and credentials cleared.', 'info' );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Account disconnected successfully.', 'tubebay' ),
			),
			200
		);
	}

	/**
	 * Redirect the user to the YouTube OAuth proxy.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return void
	 */
	public function oauth_connect( $request ) {
		tubebay_log( 'Redirecting user to OAuth proxy', 'info' );
		$domain    = home_url();
		$proxy_url = 'https://wpanchorbay.com/oauth/index.php';

		$redirect_url = add_query_arg(
			array(
				'action' => 'connect',
				'domain' => $domain,
			),
			$proxy_url
		);

		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Bulk assign videos to products.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function bulk_assign_videos( $request ) {
		$params      = $request->get_json_params();
		$product_ids = isset( $params['product_ids'] ) ? array_map( 'intval', (array) $params['product_ids'] ) : array();
		$video_ids   = isset( $params['video_ids'] ) ? (array) $params['video_ids'] : array();
		$action      = isset( $params['action'] ) ? sanitize_text_field( $params['action'] ) : 'assign'; // Either assign or remove.

		if ( empty( $product_ids ) ) {
			return new \WP_Error( 'invalid_data', __( 'No products specified.', 'tubebay' ), array( 'status' => 400 ) );
		}

		foreach ( $product_ids as $product_id ) {
			// Verify the target is a product and the user can edit it.
			if ( get_post_type( $product_id ) !== 'product' || ! current_user_can( 'edit_post', $product_id ) ) {
				tubebay_log( 'bulk_assign_videos: Skipping product ID ' . $product_id . ' — not a product or lacks edit_post cap', 'error' );
				continue;
			}

			$existing_videos_json = get_post_meta( $product_id, '_tubebay_video_ids', true );
			$existing_videos      = empty( $existing_videos_json ) ? array() : json_decode( $existing_videos_json, true );

			if ( ! is_array( $existing_videos ) ) {
				// Migrate single video if needed
				$legacy_video    = get_post_meta( $product_id, '_tubebay_video_id', true );
				$existing_videos = ! empty( $legacy_video ) ? array(
					array(
						'id'   => sanitize_text_field( $legacy_video ),
						'type' => 'youtube',
					),
				) : array();
			}

			if ( 'assign' === $action ) {
				foreach ( $video_ids as $video ) {
					if ( is_array( $video ) && ! isset( $video['id'] ) ) {
						continue; // Malformed entry — skip rather than emit a notice.
					}
					$vid_id    = is_array( $video ) ? sanitize_text_field( $video['id'] ) : sanitize_text_field( $video );
					$vid_type  = is_array( $video ) && isset( $video['type'] ) ? sanitize_text_field( $video['type'] ) : 'youtube';
					$vid_title = is_array( $video ) && isset( $video['title'] ) ? sanitize_text_field( $video['title'] ) : '';
					$vid_thumb = is_array( $video ) && isset( $video['thumbnail'] ) ? esc_url_raw( $video['thumbnail'] ) : '';

					// Check if already exists
					$exists = false;
					foreach ( $existing_videos as $ev ) {
						if ( is_array( $ev ) && $ev['id'] === $vid_id ) {
							$exists = true;
							break;
						}
					}

					if ( ! $exists ) {
						$existing_videos[] = array(
							'id'        => $vid_id,
							'type'      => $vid_type,
							'title'     => $vid_title,
							'thumbnail' => $vid_thumb,
						);
					}
				}
			} elseif ( 'remove' === $action ) {
				foreach ( $video_ids as $video ) {
					$vid_id          = is_array( $video ) ? sanitize_text_field( $video['id'] ) : sanitize_text_field( $video );
					$existing_videos = array_filter(
						$existing_videos,
						function ( $ev ) use ( $vid_id ) {
							return ( is_array( $ev ) ? $ev['id'] : $ev ) !== $vid_id;
						}
					);
				}
				$existing_videos = array_values( $existing_videos );
			}

			// Update the post meta
			update_post_meta( $product_id, '_tubebay_video_ids', wp_json_encode( $existing_videos ) );

			// Update backward compatibility single ID
			if ( ! empty( $existing_videos ) ) {
				$first_video = $existing_videos[0];
				update_post_meta( $product_id, '_tubebay_video_id', is_array( $first_video ) ? sanitize_text_field( $first_video['id'] ) : sanitize_text_field( $first_video ) );
			} else {
				delete_post_meta( $product_id, '_tubebay_video_id' );
			}
		}

		wp_cache_delete( 'tubebay_product_video_map', 'tubebay' );

		/**
		 * Fires after videos have been assigned/removed from products.
		 *
		 * @since 1.1.0
		 * @param array  $product_ids The affected product IDs.
		 * @param array  $video_ids   The video IDs in the operation.
		 * @param string $action      The action ('assign' or 'remove').
		 */
		do_action( 'tubebay_videos_assigned', $product_ids, $video_ids, $action );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Products updated successfully.', 'tubebay' ),
			),
			200
		);
	}

	/**
	 * Save video order for a product.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_video_order( $request ) {
		$params      = $request->get_json_params();
		$product_id  = isset( $params['product_id'] ) ? intval( $params['product_id'] ) : 0;
		$video_order = isset( $params['video_order'] ) ? (array) $params['video_order'] : array();

		if ( ! $product_id || empty( $video_order ) ) {
			return new \WP_Error( 'invalid_data', __( 'Invalid product ID or empty order.', 'tubebay' ), array( 'status' => 400 ) );
		}

		// Verify the target is a product and the user can edit it.
		if ( get_post_type( $product_id ) !== 'product' || ! current_user_can( 'edit_post', $product_id ) ) {
			return new \WP_Error( 'forbidden', __( 'You do not have permission to edit this product.', 'tubebay' ), array( 'status' => 403 ) );
		}

		// Sanitize order elements.
		$sanitized_order = array();
		foreach ( $video_order as $item ) {
			if ( is_array( $item ) ) {
				$sanitized_item = array();
				foreach ( $item as $k => $v ) {
					$sanitized_item[ sanitize_text_field( $k ) ] = sanitize_text_field( $v );
				}
				$sanitized_order[] = $sanitized_item;
			} else {
				$sanitized_order[] = sanitize_text_field( $item );
			}
		}

		update_post_meta( $product_id, '_tubebay_video_order', wp_json_encode( $sanitized_order ) );

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'Video order saved successfully.', 'tubebay' ),
			),
			200
		);
	}

	/**
	 * Get mapping of video IDs to products.
	 *
	 * @return array Map of video_id => list of array('id' => product_id, 'name' => product_title)
	 */
	private function get_product_video_map() {
		$cache_key   = 'tubebay_product_video_map';
		$cache_group = 'tubebay';
		$product_map = wp_cache_get( $cache_key, $cache_group );

		if ( false !== $product_map ) {
			return $product_map;
		}

		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$results = $wpdb->get_results(
			"SELECT pm.meta_value AS video_id, p.ID AS product_id, p.post_title AS product_name 
			 FROM {$wpdb->postmeta} pm
			 JOIN {$wpdb->posts} p ON pm.post_id = p.ID
			 WHERE pm.meta_key = '_tubebay_video_id' AND p.post_status = 'publish'"
		);

		$product_map = array();
		if ( ! empty( $results ) ) {
			foreach ( $results as $row ) {
				$product_map[ $row->video_id ][] = array(
					'id'   => (int) $row->product_id,
					'name' => $row->product_name,
				);
			}
		}

		// Also scan _tubebay_video_ids for a more complete map
		$results_json = $wpdb->get_results(
			"SELECT pm.meta_value AS video_ids_json, p.ID AS product_id, p.post_title AS product_name
			 FROM {$wpdb->postmeta} pm
			 JOIN {$wpdb->posts} p ON pm.post_id = p.ID
			 WHERE pm.meta_key = '_tubebay_video_ids' AND p.post_status = 'publish'"
		);

		if ( ! empty( $results_json ) ) {
			foreach ( $results_json as $row ) {
				$video_ids = json_decode( $row->video_ids_json, true );
				if ( is_array( $video_ids ) ) {
					foreach ( $video_ids as $video ) {
						$vid_id = is_array( $video ) ? $video['id'] : $video;
						// Avoid duplicates if already added from _tubebay_video_id
						$already_added = false;
						if ( isset( $product_map[ $vid_id ] ) ) {
							foreach ( $product_map[ $vid_id ] as $existing ) {
								if ( $existing['id'] === (int) $row->product_id ) {
									$already_added = true;
									break;
								}
							}
						}

						if ( ! $already_added ) {
							$product_map[ $vid_id ][] = array(
								'id'   => (int) $row->product_id,
								'name' => $row->product_name,
							);
						}
					}
				}
			}
		}

		wp_cache_set( $cache_key, $product_map, $cache_group, 300 );

		return $product_map;
	}
}
