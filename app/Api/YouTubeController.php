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
use TubeBay\Helper\ProductVideoMap;

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
					'permission_callback' => array( $this, 'get_item_permissions_check' ),
					'args'                => array(
						'product_ids' => array(
							'required' => true,
							'type'     => 'array',
						),
						'videos' => array(
							'required' => true,
							'type'     => 'array',
						),
						'action' => array(
							'required' => true,
							'type'     => 'string',
							'enum'     => array( 'assign', 'remove' ),
						),
					),
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
		$response_videos = array();
		$product_map = ProductVideoMap::get_map();

		foreach ( $videos as $video ) {
			$video_array = $video->to_array();
			$video_array['is_assigned'] = isset( $product_map[ $video->get_id() ] ) && ! empty( $product_map[ $video->get_id() ] );
			$video_array['assigned_count'] = isset( $product_map[ $video->get_id() ] ) ? count( $product_map[ $video->get_id() ] ) : 0;
			$response_videos[] = $video_array;
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

		$response_videos = array();
		$product_map = ProductVideoMap::get_map();

		foreach ( $videos as $video ) {
			$video_array = $video->to_array();
			$video_array['is_assigned'] = isset( $product_map[ $video->get_id() ] ) && ! empty( $product_map[ $video->get_id() ] );
			$video_array['assigned_count'] = isset( $product_map[ $video->get_id() ] ) ? count( $product_map[ $video->get_id() ] ) : 0;
			$response_videos[] = $video_array;
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
	 * Bulk assign videos to products.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return \WP_REST_Response|\WP_Error The REST response or error.
	 * @since 1.0.0
	 */
	public function bulk_assign_videos( $request ) {
		$params = $request->get_params();
		$product_ids = $params['product_ids'];
		$videos = $params['videos'];
		$action = $params['action'];

		if ( empty( $product_ids ) || empty( $videos ) ) {
			return new \WP_Error( 'invalid_params', __( 'Product IDs and videos are required.', 'tubebay' ), array( 'status' => 400 ) );
		}

		$modified_count = 0;

		foreach ( $product_ids as $product_id ) {
			$product = wc_get_product( $product_id );
			if ( ! $product ) {
				continue;
			}

			$existing_json = get_post_meta( $product_id, '_tubebay_video_ids', true );
			$existing_videos = array();

			if ( ! empty( $existing_json ) ) {
				$decoded = json_decode( $existing_json, true );
				if ( is_array( $decoded ) ) {
					$existing_videos = $decoded;
				}
			} else {
				// Fallback to legacy single video
				$legacy_id = get_post_meta( $product_id, '_tubebay_video_id', true );
				if ( ! empty( $legacy_id ) ) {
					$existing_videos[] = array(
						'type' => 'youtube',
						'id' => $legacy_id,
					);
				}
			}

			$changed = false;

			if ( 'assign' === $action ) {
				// Prevent duplicates
				foreach ( $videos as $new_video ) {
					$exists = false;
					foreach ( $existing_videos as $ev ) {
						if ( isset( $ev['type'] ) && isset( $new_video['type'] ) && $ev['type'] === $new_video['type'] ) {
							if ( 'youtube' === $ev['type'] && isset( $ev['id'] ) && isset( $new_video['id'] ) && $ev['id'] === $new_video['id'] ) {
								$exists = true;
								break;
							}
						}
					}
					if ( ! $exists ) {
						$existing_videos[] = $new_video;
						$changed = true;
					}
				}
			} elseif ( 'remove' === $action ) {
				$new_list = array();
				foreach ( $existing_videos as $ev ) {
					$should_remove = false;
					foreach ( $videos as $remove_video ) {
						if ( isset( $ev['type'] ) && isset( $remove_video['type'] ) && $ev['type'] === $remove_video['type'] ) {
							if ( 'youtube' === $ev['type'] && isset( $ev['id'] ) && isset( $remove_video['id'] ) && $ev['id'] === $remove_video['id'] ) {
								$should_remove = true;
								break;
							}
						}
					}
					if ( ! $should_remove ) {
						$new_list[] = $ev;
					} else {
						$changed = true;
					}
				}
				$existing_videos = $new_list;
			}

			if ( $changed ) {
				update_post_meta( $product_id, '_tubebay_video_ids', wp_json_encode( $existing_videos ) );

				// Update backward compatibility field
				$legacy_id = '';
				foreach ( $existing_videos as $ev ) {
					if ( 'youtube' === $ev['type'] && ! empty( $ev['id'] ) ) {
						$legacy_id = $ev['id'];
						break;
					}
				}
				if ( empty( $legacy_id ) ) {
					delete_post_meta( $product_id, '_tubebay_video_id' );
				} else {
					update_post_meta( $product_id, '_tubebay_video_id', $legacy_id );
				}

				$modified_count++;
			}
		}

		if ( $modified_count > 0 && class_exists( '\TubeBay\Helper\ProductVideoMap' ) ) {
			ProductVideoMap::invalidate_cache();
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => sprintf( __( 'Successfully updated %d products.', 'tubebay' ), $modified_count ),
				'modified_count' => $modified_count,
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
		wp_safe_redirect( $redirect_url );
		exit;
	}
}
