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
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
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
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
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
					'permission_callback' => function () {
						return true;
					},
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
		$api_key           = $params['api_key'];
		$channel_id        = $params['channel_id'];
		$refresh_token     = $params['refresh_token'];
		$connection_method = $params['connection_method'];

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
		$product_map = $this->get_product_video_map();
		$response_videos = array();
		foreach ( $videos as $video ) {
			$arr = $video->to_array();
			$arr['products'] = $product_map[ $video->id ] ?? array();
			$arr['is_assigned'] = !empty($arr['products']);
			$arr['assigned_count'] = count($arr['products']);
			$response_videos[] = $arr;
		}

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

		\TubeBay\Helper\Settings::set( 'connection_status', 'connected' );

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
					'success' => true,
					'videos'  => array(),
				),
				200
			);
		}

		$params     = $request->get_params();
		$search     = isset( $params['search'] ) ? sanitize_text_field( $params['search'] ) : '';
		$sort       = isset( $params['sort'] ) ? sanitize_text_field( $params['sort'] ) : 'date_desc';
		$page_token = isset( $params['page_token'] ) ? sanitize_text_field( $params['page_token'] ) : '';

		// If no search, default sort, and first page, use the fast cached playlist response.
		if ( empty( $search ) && 'date_desc' === $sort && empty( $page_token ) ) {
			$videos          = $channel->get_latest_videos( false );
			$next_page_token = null;
		} else {
			// Otherwise hit the search API directly.
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

		$product_map = $this->get_product_video_map();
		$response_videos = array();
		foreach ( $videos as $video ) {
			$arr = $video->to_array();
			$arr['products'] = $product_map[ $video->id ] ?? array();
			$arr['is_assigned'] = !empty($arr['products']);
			$arr['assigned_count'] = count($arr['products']);
			$response_videos[] = $arr;
		}

		return new WP_REST_Response(
			array(
				'success'         => true,
				'videos'          => $response_videos,
				'next_page_token' => $next_page_token ?? null,
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
		tubebay_log( '+++++++++++++++++++++++++++++++++++++++++' );
		$domain    = home_url();
		$proxy_url = 'https://wpanchorbay.com/oauth/index.php';

		$redirect_url = add_query_arg(
			array(
				'action' => 'connect',
				'domain' => $domain,
			),
			$proxy_url
		);

		tubebay_log( 'Redirecting user to OAuth proxy: ' . $redirect_url );
		tubebay_log( '_______________', $redirect_url );
		// phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
		wp_redirect( $redirect_url );
		exit;
	}

	/**
	 * Bulk assign videos to products.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function bulk_assign_videos( $request ) {
		$params = $request->get_json_params();
		$product_ids = isset($params['product_ids']) ? array_map('intval', (array) $params['product_ids']) : array();
		$video_ids = isset($params['video_ids']) ? (array) $params['video_ids'] : array();
		$action = isset($params['action']) ? sanitize_text_field($params['action']) : 'assign'; // 'assign' or 'remove'

		if (empty($product_ids)) {
			return new \WP_Error('invalid_data', __('No products specified.', 'tubebay'), array('status' => 400));
		}

		foreach ($product_ids as $product_id) {
			$existing_videos_json = get_post_meta($product_id, '_tubebay_video_ids', true);
			$existing_videos = empty($existing_videos_json) ? array() : json_decode($existing_videos_json, true);

			if (!is_array($existing_videos)) {
				// Migrate single video if needed
				$legacy_video = get_post_meta($product_id, '_tubebay_video_id', true);
				$existing_videos = !empty($legacy_video) ? array(array('id' => $legacy_video, 'type' => 'youtube')) : array();
			}

			if ($action === 'assign') {
				foreach ($video_ids as $video) {
					$vid_id = is_array($video) ? $video['id'] : $video;
					$vid_type = is_array($video) ? $video['type'] : 'youtube';
					$vid_title = is_array($video) && isset($video['title']) ? $video['title'] : '';
					$vid_thumb = is_array($video) && isset($video['thumbnail']) ? $video['thumbnail'] : '';

					// Check if already exists
					$exists = false;
					foreach ($existing_videos as $ev) {
						if (is_array($ev) && $ev['id'] === $vid_id) {
							$exists = true;
							break;
						}
					}

					if (!$exists) {
						$existing_videos[] = array(
							'id' => $vid_id,
							'type' => $vid_type,
							'title' => $vid_title,
							'thumbnail' => $vid_thumb
						);
					}
				}
			} elseif ($action === 'remove') {
				foreach ($video_ids as $video) {
					$vid_id = is_array($video) ? $video['id'] : $video;
					$existing_videos = array_filter($existing_videos, function($ev) use ($vid_id) {
						return (is_array($ev) ? $ev['id'] : $ev) !== $vid_id;
					});
				}
				$existing_videos = array_values($existing_videos);
			}

			// Update the post meta
			update_post_meta($product_id, '_tubebay_video_ids', wp_json_encode($existing_videos));

			// Update backward compatibility single ID
			if (!empty($existing_videos)) {
				$first_video = $existing_videos[0];
				update_post_meta($product_id, '_tubebay_video_id', is_array($first_video) ? $first_video['id'] : $first_video);
			} else {
				delete_post_meta($product_id, '_tubebay_video_id');
			}
		}

		wp_cache_delete('tubebay_product_video_map', 'tubebay');

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __('Products updated successfully.', 'tubebay')
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
		$params = $request->get_json_params();
		$product_id = isset($params['product_id']) ? intval($params['product_id']) : 0;
		$video_order = isset($params['video_order']) ? (array) $params['video_order'] : array();

		if (!$product_id || empty($video_order)) {
			return new \WP_Error('invalid_data', __('Invalid product ID or empty order.', 'tubebay'), array('status' => 400));
		}

		update_post_meta($product_id, '_tubebay_video_order', wp_json_encode($video_order));

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __('Video order saved successfully.', 'tubebay')
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
