<?php
/**
 * VideoObject structured data (JSON-LD) for product pages.
 *
 * @since      1.4.0
 * @package    TubeBay
 * @subpackage TubeBay/Frontend
 */

namespace TubeBay\Frontend;

use TubeBay\Core\Plugin;
use TubeBay\Helper\Settings;
use TubeBay\Integration\WooCommerce;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * VideoSchema class.
 *
 * Prints one JSON-LD block in wp_head on single product pages, with a
 * VideoObject for every product video that has the fields Google requires
 * (duration and upload date). Videos missing either are skipped, because
 * incomplete markup fails the Rich Results test.
 *
 * @since 1.4.0
 */
class VideoSchema {

	/**
	 * Maximum length of the description property, in characters.
	 *
	 * @since 1.4.0
	 * @var   int
	 */
	const DESCRIPTION_LIMIT = 500;

	/**
	 * The single instance of the class.
	 *
	 * @var VideoSchema|null
	 */
	private static $instance = null;

	/**
	 * Gets an instance of this object.
	 *
	 * @return VideoSchema
	 * @since 1.4.0
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
	 * @param Plugin $plugin The plugin instance.
	 * @since 1.4.0
	 */
	public function run( $plugin ) {
		$plugin->get_loader()->add_action( 'wp_head', $this, 'print_schema', 20 );
	}

	/**
	 * Print the JSON-LD script tag, if there is anything eligible to print.
	 *
	 * @since 1.4.0
	 * @return void
	 */
	public function print_schema() {
		$json = $this->get_json();

		if ( '' === $json ) {
			return;
		}

		// The JSON is encoded with JSON_HEX_TAG | JSON_HEX_AMP, so it cannot close the script tag.
		echo '<script type="application/ld+json">' . $json . "</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Build the encoded JSON-LD for the current request.
	 *
	 * @since 1.4.0
	 * @return string JSON, or '' when nothing should be printed.
	 */
	public function get_json() {
		// Without WooCommerce there is no product page.
		if ( ! function_exists( 'is_product' ) || ! is_product() ) {
			return '';
		}

		$product_id = (int) get_queried_object_id();
		if ( $product_id <= 0 ) {
			return '';
		}

		// Yoast Video SEO prints its own VideoObject markup; do not duplicate it.
		if ( class_exists( 'WPSEO_Video_Sitemap' ) ) {
			return '';
		}

		// Read via get_all(): Settings::get() ignores filtered defaults.
		$settings = Settings::get_all();
		$enabled  = ! empty( $settings['video_schema'] );

		/**
		 * Filter whether the VideoObject JSON-LD is printed on a product page.
		 *
		 * @since 1.4.0
		 * @param bool $enabled    Whether to print the markup. Defaults to the Video schema setting.
		 * @param int  $product_id The product being viewed.
		 */
		$enabled = (bool) apply_filters( 'tubebay_output_video_schema', $enabled, $product_id );

		if ( ! $enabled ) {
			return '';
		}

		$videos = WooCommerce::get_instance()->get_product_videos( $product_id );
		if ( empty( $videos ) ) {
			return '';
		}

		$product_name  = html_entity_decode( wp_strip_all_tags( get_the_title( $product_id ) ), ENT_QUOTES, 'UTF-8' );
		$product_short = '';
		$product       = wc_get_product( $product_id );
		if ( $product ) {
			$product_short = (string) $product->get_short_description();
		}

		$embed_host = ! empty( $settings['privacy_mode'] ) ? 'www.youtube-nocookie.com' : 'www.youtube.com';

		$items = array();
		foreach ( $videos as $video ) {
			$item = $this->build_item( $video, $product_name, $product_short, $embed_host );
			if ( null !== $item ) {
				$items[] = $item;
			}
		}

		if ( empty( $items ) ) {
			return '';
		}

		if ( 1 === count( $items ) ) {
			$data = $items[0];
		} else {
			foreach ( $items as &$item ) {
				unset( $item['@context'] );
			}
			unset( $item );
			$data = array(
				'@context' => 'https://schema.org',
				'@graph'   => $items,
			);
		}

		$json = wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_SLASHES );

		return is_string( $json ) ? $json : '';
	}

	/**
	 * Build one VideoObject, or null when the video is not eligible.
	 *
	 * @since 1.4.0
	 * @param array  $video         A video from WooCommerce::get_product_videos().
	 * @param string $product_name  Product title, used as a fallback.
	 * @param string $product_short Product short description, used as a fallback.
	 * @param string $embed_host    YouTube embed host.
	 * @return array|null
	 */
	private function build_item( $video, $product_name, $product_short, $embed_host ) {
		$duration    = isset( $video['duration'] ) ? (string) $video['duration'] : '';
		$uploaded_at = isset( $video['uploaded_at'] ) ? (string) $video['uploaded_at'] : '';

		if ( '' === $duration || '' === $uploaded_at ) {
			return null;
		}

		// uploaded_at is a MySQL DATETIME in UTC.
		$timestamp = strtotime( $uploaded_at . ' UTC' );
		if ( false === $timestamp ) {
			return null;
		}

		$type     = isset( $video['type'] ) ? (string) $video['type'] : 'youtube';
		$video_id = isset( $video['video_id'] ) ? (string) $video['video_id'] : '';

		$thumbnail = isset( $video['thumbnail_url'] ) ? (string) $video['thumbnail_url'] : '';
		if ( '' === $thumbnail ) {
			return null;
		}

		$name = isset( $video['title'] ) ? $this->clean_text( $video['title'] ) : '';
		if ( '' === $name ) {
			$name = $this->clean_text( $product_name );
		}

		$description = isset( $video['description'] ) ? $this->clean_text( $video['description'] ) : '';
		if ( '' === $description ) {
			$description = $this->clean_text( $product_short );
		}
		if ( '' === $description ) {
			$description = $name;
		}
		if ( '' === $name && '' === $description ) {
			return null;
		}

		$item = array(
			'@context'     => 'https://schema.org',
			'@type'        => 'VideoObject',
			'name'         => $name,
			'description'  => $description,
			'thumbnailUrl' => $thumbnail,
			'uploadDate'   => gmdate( 'c', $timestamp ),
			'duration'     => $duration,
		);

		if ( 'self_hosted' === $type ) {
			$url = wp_get_attachment_url( (int) $video['id'] );
			if ( ! $url ) {
				return null;
			}
			$item['contentUrl'] = $url;
		} else {
			if ( '' === $video_id ) {
				return null;
			}
			$item['embedUrl'] = 'https://' . $embed_host . '/embed/' . rawurlencode( $video_id );
		}

		return $item;
	}

	/**
	 * Strip tags, collapse whitespace and cap the length of a text value.
	 *
	 * @since 1.4.0
	 * @param mixed $text Raw text.
	 * @return string
	 */
	private function clean_text( $text ) {
		$text = wp_strip_all_tags( (string) $text );
		$text = html_entity_decode( $text, ENT_QUOTES, 'UTF-8' );
		$text = trim( preg_replace( '/\s+/u', ' ', $text ) );

		if ( mb_strlen( $text ) > self::DESCRIPTION_LIMIT ) {
			$text = rtrim( mb_substr( $text, 0, self::DESCRIPTION_LIMIT - 1 ) ) . "\u{2026}";
		}

		return $text;
	}
}
