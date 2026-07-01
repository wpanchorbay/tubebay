<?php
/**
 * ProductMetabox class.
 *
 * Handles the custom meta box for the WooCommerce product edit screen.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Admin
 */

namespace TubeBay\Admin;

use TubeBay\Core\Plugin;
use TubeBay\Helper\Settings;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class ProductMetabox
 *
 * Handles the custom meta box for the WooCommerce product edit screen.
 *
 * @package    TubeBay
 * @subpackage TubeBay/Admin
 */
class ProductMetabox {

	/**
	 * The single instance of the class.
	 *
	 * @var ProductMetabox|null
	 * @since 1.0.0
	 */
	private static $instance = null;

	/**
	 * Gets an instance of this object.
	 *
	 * @return ProductMetabox
	 * @since 1.0.0
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register hooks for this class.
	 *
	 * @param \TubeBay\Core\Plugin $plugin The main plugin instance.
	 * @return void
	 * @since 1.0.0
	 */
	public function run( $plugin ) {
		$loader = $plugin->get_loader();
		// Hook into WooCommerce product meta boxes.
		$loader->add_action( 'add_meta_boxes_product', $this, 'add_metabox' );
		$loader->add_action( 'save_post_product', $this, 'save_metabox_data', 10, 2 );
		$loader->add_action( 'admin_enqueue_scripts', $this, 'enqueue_assets' );
	}

	/**
	 * Add the meta box to the product screen.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function add_metabox() {
		$is_connected = ( Settings::get( 'connection_status', 'inactive' ) === 'connected' );

		// If not connected, only show metabox if product already has a video.
		if ( ! $is_connected ) {
			global $post;
			if ( $post ) {
				$video_id = get_post_meta( $post->ID, '_tubebay_video_id', true );
				if ( empty( $video_id ) ) {
					return; // Not connected and no video — hide metabox.
				}
			}
		}

		add_meta_box(
			'tubebay_product_video_metabox',
			__( 'TubeBay Video', 'tubebay' ),
			array( $this, 'render_metabox_content' ),
			'product',
			'side',
			'high'
		);
		tubebay_log( 'ProductMetabox: Added TubeBay Video metabox to product screen', 'debug' );
	}

	/**
	 * Enqueue JS and CSS for the metabox on the product screen.
	 *
	 * @param string $hook The current admin page.
	 * @return void
	 * @since 1.0.0
	 */
	public function enqueue_assets( $hook ) {
		global $post_type;

		if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
			return;
		}

		if ( 'product' !== $post_type ) {
			return;
		}

		wp_enqueue_style(
			'tubebay-product-metabox-css',
			TUBEBAY_URL . 'assets/css/admin/product-metabox.css',
			array(),
			TUBEBAY_VERSION
		);

		wp_enqueue_script(
			'tubebay-product-metabox-js',
			TUBEBAY_URL . 'assets/js/admin/product-metabox.js',
			array( 'jquery' ),
			TUBEBAY_VERSION,
			true
		);

		// Pass localized data to script.
		$is_connected = ( Settings::get( 'connection_status', 'inactive' ) === 'connected' );
		wp_localize_script(
			'tubebay-product-metabox-js',
			'tubebayMetabox',
			array(
				'restUrl'     => esc_url_raw( rest_url( 'tubebay/v1/youtube/videos' ) ),
				'nonce'       => wp_create_nonce( 'wp_rest' ),
				'isConnected' => $is_connected,
				'i18n'        => array(
					'selectVideo' => __( 'Select Video', 'tubebay' ),
					'removeVideo' => __( 'Remove Video', 'tubebay' ),
					'loading'     => __( 'Loading...', 'tubebay' ),
					'error'       => __( 'Error loading videos.', 'tubebay' ),
					'noVideos'    => __( 'No videos found.', 'tubebay' ),
					'loadMore'    => __( 'Load More', 'tubebay' ),
					'search'      => __( 'Search videos...', 'tubebay' ),
					'sort'        => array(
						'date_desc'  => __( 'Recently Added', 'tubebay' ),
						'date_asc'   => __( 'Oldest First', 'tubebay' ),
						'title_asc'  => __( 'Title (A-Z)', 'tubebay' ),
						'title_desc' => __( 'Title (Z-A)', 'tubebay' ),
						'view_count' => __( 'Most Viewed', 'tubebay' ),
					),
				),
			)
		);
	}

	/**
	 * Render the metabox HTML.
	 *
	 * @param \WP_Post $post The post object.
	 * @return void
	 * @since 1.0.0
	 */
	public function render_metabox_content( $post ) {
		wp_nonce_field( 'tubebay_product_metabox_nonce', 'tubebay_product_metabox_nonce_field' );

		// Retrieve existing values.
		$video_id    = get_post_meta( $post->ID, '_tubebay_video_id', true );
		$video_title = get_post_meta( $post->ID, '_tubebay_video_title', true );
		$video_thumb = get_post_meta( $post->ID, '_tubebay_video_thumbnail', true );

		$is_connected = ( Settings::get( 'connection_status', 'inactive' ) === 'connected' );

		// 1. Get existing legacy single video ID and convert if needed, or get new array
		$video_ids_json = get_post_meta( $post->ID, '_tubebay_video_ids', true );
		if ( empty( $video_ids_json ) ) {
			if ( ! empty( $video_id ) ) {
				$video_ids = array(
					array(
						'id' => $video_id,
						'type' => 'youtube',
						'title' => get_post_meta( $post->ID, '_tubebay_video_title', true ),
						'thumbnail' => get_post_meta( $post->ID, '_tubebay_video_thumbnail', true )
					)
				);
			} else {
				$video_ids = array();
			}
		} else {
			$video_ids = json_decode( $video_ids_json, true ) ?: array();
		}

		// Fallback for settings
		$max_videos = get_post_meta( $post->ID, '_tubebay_max_videos', true );
		$video_position = get_post_meta( $post->ID, '_tubebay_video_position', true );
		$autoplay_first = get_post_meta( $post->ID, '_tubebay_autoplay_first', true );
		$show_duration = get_post_meta( $post->ID, '_tubebay_show_duration', true );

		?>
		<div class="tubebay-metabox-wrapper">
			<!-- Hidden inputs to store selection -->
			<input type="hidden" id="tubebay_video_ids" name="tubebay_video_ids" value="<?php echo esc_attr( wp_json_encode( $video_ids ) ); ?>" />

			<!-- Sortable Video List -->
			<div id="tubebay-video-list" class="tubebay-video-list" style="margin-bottom: 10px;">
				<!-- JS will render items here -->
			</div>

			<!-- Add Video Buttons -->
			<div class="tubebay-add-video-buttons" style="margin-top: 10px; display: flex; flex-direction: column; gap: 5px;">
				<?php if ( $is_connected ) : ?>
					<a href="#" id="tubebay_select_youtube_btn" class="button" style="text-align: center;"><?php esc_html_e( 'Add YouTube Video', 'tubebay' ); ?></a>
				<?php else : ?>
					<p class="description" style="color: #d63638; margin-bottom: 5px;">
						<?php esc_html_e( 'Connect your YouTube account in TubeBay Settings to select YouTube videos.', 'tubebay' ); ?>
					</p>
				<?php endif; ?>
				<a href="#" id="tubebay_select_self_hosted_btn" class="button" style="text-align: center;"><?php esc_html_e( 'Add Self-Hosted Video', 'tubebay' ); ?></a>
			</div>

			<hr style="margin: 15px 0;">

			<!-- Gallery Settings (Collapsible) -->
			<div class="tubebay-gallery-settings-toggle" style="cursor: pointer; font-weight: 600; margin-bottom: 10px;">
				<span class="dashicons dashicons-arrow-down-alt2" style="font-size: 16px; margin-top: 2px;"></span> <?php esc_html_e('Video Gallery Settings', 'tubebay'); ?>
			</div>

			<div class="tubebay-gallery-settings" style="display: none; padding-left: 5px;">

				<p>
					<label for="tubebay_max_videos"><?php esc_html_e('Max Videos:', 'tubebay'); ?></label><br/>
					<select name="tubebay_max_videos" id="tubebay_max_videos" style="width: 100%;">
						<option value="" <?php selected($max_videos, ''); ?>><?php esc_html_e('Inherit (Global)', 'tubebay'); ?></option>
						<?php for($i=1; $i<=10; $i++): ?>
							<option value="<?php echo $i; ?>" <?php selected($max_videos, (string)$i); ?>><?php echo $i; ?></option>
						<?php endfor; ?>
						<option value="0" <?php selected($max_videos, '0'); ?>><?php esc_html_e('Unlimited', 'tubebay'); ?></option>
					</select>
				</p>
				<p>
					<label for="tubebay_video_position"><?php esc_html_e('Video Position:', 'tubebay'); ?></label><br/>
					<select name="tubebay_video_position" id="tubebay_video_position" style="width: 100%;">
						<option value="" <?php selected($video_position, ''); ?>><?php esc_html_e('Inherit (Global)', 'tubebay'); ?></option>
						<option value="first" <?php selected($video_position, 'first'); ?>><?php esc_html_e('First (Before Images)', 'tubebay'); ?></option>
						<option value="last" <?php selected($video_position, 'last'); ?>><?php esc_html_e('Last (After Images)', 'tubebay'); ?></option>
						<option value="mixed" <?php selected($video_position, 'mixed'); ?>><?php esc_html_e('Mixed (Drag/Drop Order)', 'tubebay'); ?></option>
					</select>
				</p>
				<p>
					<label for="tubebay_autoplay_first"><?php esc_html_e('Autoplay First Video:', 'tubebay'); ?></label><br/>
					<select name="tubebay_autoplay_first" id="tubebay_autoplay_first" style="width: 100%;">
						<option value="" <?php selected($autoplay_first, ''); ?>><?php esc_html_e('Inherit (Global)', 'tubebay'); ?></option>
						<option value="yes" <?php selected($autoplay_first, 'yes'); ?>><?php esc_html_e('Yes', 'tubebay'); ?></option>
						<option value="no" <?php selected($autoplay_first, 'no'); ?>><?php esc_html_e('No', 'tubebay'); ?></option>
					</select>
				</p>
				<p>
					<label for="tubebay_show_duration"><?php esc_html_e('Show Duration Badge:', 'tubebay'); ?></label><br/>
					<select name="tubebay_show_duration" id="tubebay_show_duration" style="width: 100%;">
						<option value="" <?php selected($show_duration, ''); ?>><?php esc_html_e('Inherit (Global)', 'tubebay'); ?></option>
						<option value="yes" <?php selected($show_duration, 'yes'); ?>><?php esc_html_e('Yes', 'tubebay'); ?></option>
						<option value="no" <?php selected($show_duration, 'no'); ?>><?php esc_html_e('No', 'tubebay'); ?></option>
					</select>
				</p>
			</div>

			<?php if ( $is_connected ) : ?>
			<!-- Video Selection Modal (WordPress media-modal pattern) -->
			<div id="tubebay-video-modal" style="display:none;">
				<div class="media-modal wp-core-ui">
					<button type="button" class="media-modal-close" id="tubebay-modal-close-btn">
						<span class="media-modal-icon">
							<span class="screen-reader-text"><?php esc_html_e( 'Close', 'tubebay' ); ?></span>
						</span>
					</button>
					<div class="media-modal-content">
						<div class="media-frame wp-core-ui hide-menu hide-router">
							<div class="media-frame-title">
								<h1 style="padding-left:16px;"><?php esc_html_e( 'Select a Video', 'tubebay' ); ?></h1>
							</div>
							
							<!-- Main content block -->
							<div class="media-frame-content" style="top: 50px; bottom: 0;">
								<div class="attachments-browser">
									<!-- Filter/Search Toolbar -->
									<div class="media-toolbar">
										<div class="media-toolbar-secondary">
											<select id="tubebay-modal-sort" class="attachment-filters">
												<option value="date_desc"><?php esc_html_e( 'Recently Added', 'tubebay' ); ?></option>
												<option value="date_asc"><?php esc_html_e( 'Oldest First', 'tubebay' ); ?></option>
												<option value="title_asc"><?php esc_html_e( 'Title (A-Z)', 'tubebay' ); ?></option>
												<option value="title_desc"><?php esc_html_e( 'Title (Z-A)', 'tubebay' ); ?></option>
												<option value="view_count"><?php esc_html_e( 'Most Viewed', 'tubebay' ); ?></option>
											</select>
										</div>
										<div class="media-toolbar-primary search-form">
											<label for="tubebay-modal-search" class="screen-reader-text"><?php esc_html_e( 'Search videos', 'tubebay' ); ?></label>
											<input type="search" placeholder="<?php esc_attr_e( 'Search videos...', 'tubebay' ); ?>" id="tubebay-modal-search" class="search" />
										</div>
									</div>
									
									<!-- Scrollable Grid Body -->
									<div class="tubebay-modal-body" id="tubebay-modal-video-grid">
										<p class="tubebay-loading-text"><?php esc_html_e( 'Loading videos...', 'tubebay' ); ?></p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="media-modal-backdrop" id="tubebay-modal-backdrop"></div>
			</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Save the metabox data.
	 *
	 * @param int      $post_id The post ID.
	 * @param \WP_Post $post    The post object.
	 * @return int The post ID.
	 * @since 1.0.0
	 */
	public function save_metabox_data( $post_id, $post ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		// Check if nonce is set.
		if ( ! isset( $_POST['tubebay_product_metabox_nonce_field'] ) ) {
			return $post_id;
		}

		$nonce = sanitize_text_field( wp_unslash( $_POST['tubebay_product_metabox_nonce_field'] ) );

		// Verify that the nonce is valid.
		if ( ! wp_verify_nonce( $nonce, 'tubebay_product_metabox_nonce' ) ) {
			tubebay_log( 'ProductMetabox: Save aborted - invalid nonce', 'error' );
			return $post_id;
		}

		// If this is an autosave, our form has not been submitted.
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return $post_id;
		}

		// Check the user's permissions.
		if ( isset( $_POST['post_type'] ) && 'product' === sanitize_text_field( wp_unslash( $_POST['post_type'] ) ) ) {
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				return $post_id;
			}
		}

		// Save multiple videos array
		if ( isset( $_POST['tubebay_video_ids'] ) ) {
			$video_ids_json = wp_unslash( $_POST['tubebay_video_ids'] );
			$video_ids = json_decode( $video_ids_json, true ) ?: array();

			// Sanitize array elements
			$sanitized_ids = array();
			foreach ( $video_ids as $video ) {
				if ( is_array( $video ) && isset( $video['id'] ) ) {
					$sanitized_ids[] = array(
						'id' => sanitize_text_field( $video['id'] ),
						'type' => sanitize_text_field( $video['type'] ?? 'youtube' ),
						'title' => sanitize_text_field( $video['title'] ?? '' ),
						'thumbnail' => esc_url_raw( $video['thumbnail'] ?? '' )
					);
				}
			}

			update_post_meta( $post_id, '_tubebay_video_ids', wp_json_encode( $sanitized_ids ) );

			// Maintain backward compatibility with the single ID for legacy fallback
			if ( ! empty( $sanitized_ids ) ) {
				update_post_meta( $post_id, '_tubebay_video_id', $sanitized_ids[0]['id'] );
				update_post_meta( $post_id, '_tubebay_video_title', $sanitized_ids[0]['title'] );
				update_post_meta( $post_id, '_tubebay_video_thumbnail', $sanitized_ids[0]['thumbnail'] );
			} else {
				delete_post_meta( $post_id, '_tubebay_video_id' );
				delete_post_meta( $post_id, '_tubebay_video_title' );
				delete_post_meta( $post_id, '_tubebay_video_thumbnail' );
			}

			tubebay_log( 'ProductMetabox: Saved ' . count($sanitized_ids) . ' videos for product ID ' . $post_id, 'info' );
		}

		// Save gallery settings
		$settings_keys = array(
			'tubebay_max_videos' => '_tubebay_max_videos',
			'tubebay_video_position' => '_tubebay_video_position',
			'tubebay_autoplay_first' => '_tubebay_autoplay_first',
			'tubebay_show_duration' => '_tubebay_show_duration',
		);

		foreach ( $settings_keys as $post_key => $meta_key ) {
			if ( isset( $_POST[$post_key] ) ) {
				update_post_meta( $post_id, $meta_key, sanitize_text_field( wp_unslash( $_POST[$post_key] ) ) );
			}
		}

		// Clear cached mapping of videos to products.
		wp_cache_delete( 'tubebay_product_video_map', 'tubebay' );

		return $post_id;
	}
}
