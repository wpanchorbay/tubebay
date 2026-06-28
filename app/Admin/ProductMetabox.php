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

		wp_enqueue_media();

		wp_enqueue_script(
			'tubebay-sortable-js',
			'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
			array(),
			'1.15.2',
			true
		);

		wp_enqueue_script(
			'tubebay-product-metabox-js',
			TUBEBAY_URL . 'assets/js/admin/product-metabox.js',
			array( 'jquery', 'tubebay-sortable-js' ),
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
				'maxVideos'   => Settings::get( 'max_videos_per_product', 0 ),
				'i18n'        => array(
					'selectVideo' => __( 'Select Video', 'tubebay' ),
					'removeVideo' => __( 'Remove Video', 'tubebay' ),
					'loading'     => __( 'Loading...', 'tubebay' ),
					'error'       => __( 'Error loading videos.', 'tubebay' ),
					'loadMore'    => __( 'Load More', 'tubebay' ),
					'search'      => __( 'Search videos...', 'tubebay' ),
					'sort'        => array(
						'date_desc'  => __( 'Recently Added', 'tubebay' ),
						'date_asc'   => __( 'Oldest First', 'tubebay' ),
						'title_asc'  => __( 'Title (A-Z)', 'tubebay' ),
						'title_desc' => __( 'Title (Z-A)', 'tubebay' ),
						'view_count' => __( 'Most Viewed', 'tubebay' ),
					),
					'selfHosted'  => __( 'Self-Hosted', 'tubebay' ),
					'duration'    => __( 'Duration', 'tubebay' ),
					'mediaPickerTitle' => __( 'Choose a video', 'tubebay' ),
					'mediaPickerButton' => __( 'Select Video', 'tubebay' ),
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
		$video_ids_json = get_post_meta( $post->ID, '_tubebay_video_ids', true );

		// Fallback for older products with only _tubebay_video_id
		if ( empty( $video_ids_json ) ) {
			$legacy_id = get_post_meta( $post->ID, '_tubebay_video_id', true );
			if ( ! empty( $legacy_id ) ) {
				$legacy_title = get_post_meta( $post->ID, '_tubebay_video_title', true );
				$legacy_thumb = get_post_meta( $post->ID, '_tubebay_video_thumbnail', true );
				$legacy_video = array(
					array(
						'type'      => 'youtube',
						'id'        => $legacy_id,
						'title'     => $legacy_title,
						'thumbnail' => $legacy_thumb,
					)
				);
				$video_ids_json = wp_json_encode( $legacy_video );
			}
		}

		if ( empty( $video_ids_json ) ) {
			$video_ids_json = '[]';
		}

		// These are currently fixed for the free version.
		$display_location = 'default';

		$muted_autoplay = get_post_meta( $post->ID, '_tubebay_muted_autoplay', true );

		// Fallback to global defaults if not explicitly set yet.
		$muted_autoplay = ( '' === $muted_autoplay ) ? ( Settings::get( 'muted_autoplay', true ) ? '1' : '0' ) : $muted_autoplay;

		$is_connected = ( Settings::get( 'connection_status', 'inactive' ) === 'connected' );

		?>
		<div class="tubebay-metabox-wrapper">
			<!-- Hidden input to store JSON array of selected videos -->
			<input type="hidden" id="tubebay_video_ids" name="tubebay_video_ids" value="<?php echo esc_attr( $video_ids_json ); ?>" />
			<input type="hidden" name="tubebay_display_location" value="<?php echo esc_attr( $display_location ); ?>" />

			<!-- Container for sortable list of selected videos -->
			<div id="tubebay-selected-video-list" class="tubebay-selected-video-list">
				<!-- JS will render selected videos here -->
			</div>

			<div id="tubebay-add-video-container" style="margin-top: 15px;">
				<?php if ( $is_connected ) : ?>
				<button type="button" class="button button-primary" id="tubebay_select_video_btn" style="margin-right: 8px;">
					<?php esc_html_e( 'Add YouTube Video', 'tubebay' ); ?>
				</button>
				<?php else : ?>
				<p class="description" style="margin-bottom: 8px; color: #b91c1c;">
					<?php esc_html_e( 'Connect your YouTube account in TubeBay Settings to select YouTube videos.', 'tubebay' ); ?>
				</p>
				<?php endif; ?>

				<button type="button" class="button" id="tubebay_add_self_hosted_btn">
					<?php esc_html_e( 'Add Self-Hosted Video', 'tubebay' ); ?>
				</button>
			</div>

			<div id="tubebay-autoplay-setting">
				<hr />
				<div class="tubebay-setting-row">
					<div class="tubebay-setting-label">
						<strong>
							<?php esc_html_e( 'Muted Autoplay', 'tubebay' ); ?>
						</strong>
						<p class="description">
							<?php esc_html_e( 'Video plays automatically without sound', 'tubebay' ); ?>
						</p>
					</div>
					<div class="tubebay-setting-control">
						<label class="tubebay-switch">
							<input type="checkbox" name="tubebay_muted_autoplay" value="1" <?php checked( $muted_autoplay, '1' ); ?> />
							<span class="tubebay-slider tubebay-round"></span>
						</label>
					</div>
				</div>
			</div>

			<?php if ( $is_connected ) : ?>
			<!-- Modal (Hidden by default) -->
			<div id="tubebay-video-modal" style="display:none;">
				<div class="tubebay-modal-overlay"></div>
				<div class="tubebay-modal-content">
					<div class="tubebay-modal-header">
						<h2>
							<?php esc_html_e( 'Select a Video', 'tubebay' ); ?>
						</h2>
						<span class="tubebay-modal-close">&times;</span>
					</div>

					<!-- Filter Toolbar -->
					<div class="tubebay-modal-toolbar">
						<input type="text" id="tubebay-modal-search" placeholder="<?php esc_attr_e( 'Search videos...', 'tubebay' ); ?>" />
						<select id="tubebay-modal-sort">
							<option value="date_desc"><?php esc_html_e( 'Recently Added', 'tubebay' ); ?></option>
							<option value="date_asc"><?php esc_html_e( 'Oldest First', 'tubebay' ); ?></option>
							<option value="title_asc"><?php esc_html_e( 'Title (A-Z)', 'tubebay' ); ?></option>
							<option value="title_desc"><?php esc_html_e( 'Title (Z-A)', 'tubebay' ); ?></option>
							<option value="view_count"><?php esc_html_e( 'Most Viewed', 'tubebay' ); ?></option>
						</select>
					</div>

					<div class="tubebay-modal-body" id="tubebay-modal-video-grid">
						<p class="tubebay-loading-text">
							<?php esc_html_e( 'Loading videos...', 'tubebay' ); ?>
						</p>
					</div>
					
					<div class="tubebay-modal-footer" id="tubebay-modal-footer" style="display:none;">
						<button type="button" class="button" id="tubebay-modal-load-more"><?php esc_html_e( 'Load More', 'tubebay' ); ?></button>
					</div>
				</div>
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

		// Save Multi-Video array (_tubebay_video_ids)
		if ( isset( $_POST['tubebay_video_ids'] ) ) {
			// Expected format is JSON from frontend
			$video_ids_json = wp_unslash( $_POST['tubebay_video_ids'] );
			$videos = json_decode( $video_ids_json, true );

			$sanitized_videos = array();

			if ( is_array( $videos ) ) {
				foreach ( $videos as $video ) {
					if ( ! isset( $video['type'] ) ) {
						continue;
					}

					$sanitized_video = array(
						'type' => sanitize_text_field( $video['type'] ),
					);

					if ( 'youtube' === $video['type'] ) {
						if ( empty( $video['id'] ) ) {
							continue;
						}
						$sanitized_video['id'] = sanitize_text_field( $video['id'] );
						$sanitized_video['title'] = isset( $video['title'] ) ? sanitize_text_field( $video['title'] ) : '';
						$sanitized_video['thumbnail'] = isset( $video['thumbnail'] ) ? esc_url_raw( $video['thumbnail'] ) : '';

						if ( isset( $video['duration'] ) ) {
							$sanitized_video['duration'] = intval( $video['duration'] );
						}
					} elseif ( 'self-hosted' === $video['type'] ) {
						if ( empty( $video['url'] ) ) {
							continue;
						}
						$sanitized_video['url'] = esc_url_raw( $video['url'] );
						$sanitized_video['id'] = isset( $video['id'] ) ? intval( $video['id'] ) : null;
						$sanitized_video['mime'] = isset( $video['mime'] ) ? sanitize_text_field( $video['mime'] ) : '';
						$sanitized_video['title'] = isset( $video['title'] ) ? sanitize_text_field( $video['title'] ) : '';
						$sanitized_video['thumbnail'] = isset( $video['thumbnail'] ) ? esc_url_raw( $video['thumbnail'] ) : '';

						if ( isset( $video['duration'] ) ) {
							$sanitized_video['duration'] = intval( $video['duration'] );
						}
					}

					$sanitized_videos[] = $sanitized_video;
				}
			}

			$encoded_videos = wp_json_encode( $sanitized_videos );
			update_post_meta( $post_id, '_tubebay_video_ids', $encoded_videos );

			// Invalidate cache when assignments change
			if ( class_exists( '\TubeBay\Helper\ProductVideoMap' ) ) {
				\TubeBay\Helper\ProductVideoMap::invalidate_cache();
			}

			// Keep _tubebay_video_id updated for backward compatibility (set to first YouTube video if available)
			$legacy_id = '';
			foreach ( $sanitized_videos as $sv ) {
				if ( 'youtube' === $sv['type'] && ! empty( $sv['id'] ) ) {
					$legacy_id = $sv['id'];
					break;
				}
			}

			if ( empty( $legacy_id ) ) {
				delete_post_meta( $post_id, '_tubebay_video_id' );
				delete_post_meta( $post_id, '_tubebay_video_title' );
				delete_post_meta( $post_id, '_tubebay_video_thumbnail' );
			} else {
				update_post_meta( $post_id, '_tubebay_video_id', $legacy_id );

				// Optional: update title/thumbnail for legacy
				foreach ( $sanitized_videos as $sv ) {
					if ( 'youtube' === $sv['type'] && $sv['id'] === $legacy_id ) {
						if ( isset( $sv['title'] ) ) {
							update_post_meta( $post_id, '_tubebay_video_title', $sv['title'] );
						}
						if ( isset( $sv['thumbnail'] ) ) {
							update_post_meta( $post_id, '_tubebay_video_thumbnail', $sv['thumbnail'] );
						}
						break;
					}
				}
			}
		}

		// Display Location (hidden field for now).
		if ( isset( $_POST['tubebay_display_location'] ) ) {
			update_post_meta( $post_id, '_tubebay_display_location', sanitize_text_field( wp_unslash( $_POST['tubebay_display_location'] ) ) );
		}

		// Muted Autoplay Toggle (checkboxes only exist in $_POST if checked).
		$muted_autoplay = isset( $_POST['tubebay_muted_autoplay'] ) ? '1' : '0';
		update_post_meta( $post_id, '_tubebay_muted_autoplay', $muted_autoplay );
		tubebay_log( 'ProductMetabox: Saved muted_autoplay=' . $muted_autoplay . ' for product ID ' . $post_id, 'debug' );

		return $post_id;
	}
}
