<?php
/**
 * Represents a single video from YouTube.
 *
 * @since      1.0.0
 * @package    TubeBay
 * @subpackage TubeBay/Data/Entities
 */

namespace TubeBay\Data\Entities;

/**
 * Video entity class.
 */
class Video {

	/**
	 * Video ID.
	 *
	 * @var string
	 */
	public $id;

	/**
	 * Video title.
	 *
	 * @var string
	 */
	public $title;

	/**
	 * Video thumbnail URL.
	 *
	 * @var string
	 */
	public $thumbnail_url;

	/**
	 * Video publish date.
	 *
	 * @var string
	 */
	public $published_at;

	/**
	 * Video description.
	 *
	 * @var string
	 */
	public $description;

	/**
	 * ISO 8601 duration (for example PT4M13S). Empty until details are fetched.
	 *
	 * @since 1.4.0
	 * @var   string
	 */
	public $duration;

	/**
	 * Real upload date. Empty until details are fetched.
	 *
	 * Unlike `published_at` (when the video joined the uploads playlist),
	 * this comes from `videos.list`.
	 *
	 * @since 1.4.0
	 * @var   string
	 */
	public $uploaded_at;

	/**
	 * Constructor.
	 *
	 * @param array $data The video data.
	 */
	public function __construct( array $data ) {
		$this->id            = sanitize_text_field( $data['id'] ?? '' );
		$this->title         = sanitize_text_field( $data['title'] ?? '' );
		$this->thumbnail_url = esc_url_raw( $data['thumbnail_url'] ?? '' );
		$this->published_at  = sanitize_text_field( $data['published_at'] ?? '' );
		$this->description   = sanitize_textarea_field( $data['description'] ?? '' );
		$this->duration      = sanitize_text_field( $data['duration'] ?? '' );
		$this->uploaded_at   = sanitize_text_field( $data['uploaded_at'] ?? '' );
	}

	/**
	 * Convert to array for easy caching/JSON serialization.
	 *
	 * @return array
	 */
	public function to_array() {
		$data = array(
			'id'            => $this->id,
			'title'         => $this->title,
			'thumbnail_url' => $this->thumbnail_url,
			'published_at'  => $this->published_at,
			'description'   => $this->description,
		);

		// Only present once details are known, so the shape is unchanged until then.
		if ( '' !== $this->duration ) {
			$data['duration'] = $this->duration;
		}
		if ( '' !== $this->uploaded_at ) {
			$data['uploaded_at'] = $this->uploaded_at;
		}

		return $data;
	}
}
