# Shortcodes

While TubeBay handles video placement automatically based on your settings, you often need more control for specific page layouts or landing pages. Our shortcodes allow you to embed videos anywhere that supports WordPress shortcodes.

## The Global Video Shortcode

TubeBay includes a powerful shortcode system that allows you to embed your YouTube videos anywhere on your WordPress site, not just on product pages.

## Basic Usage

To embed a video, use the following shortcode structure:

`[tubebay_video id="YOUTUBE_VIDEO_ID"]`

### How to get the Video ID?

You can find the ID for any of your synced videos in the **TubeBay > Library** tab.

<!-- ![Getting Video ID from Library](/public/img/feature-shortcode-id.png) -->

## Customizing the Player

You can pass various parameters to the shortcode to customize the look and feel of the player:

- **width**: Set the width of the player (e.g., `800px` or `100%`).
- **autoplay**: Set to `true` to start the video immediately (Note: Browser policies may apply).
- **controls**: Set to `false` to hide YouTube player controls.

**Example with parameters:**
`[tubebay_video id="your_id" width="100%" autoplay="false"]`

## Front-end Preview

When you place a shortcode in a page or post, it will render as a responsive, high-quality video player.

<!-- ![Shortcode Front-end Rendering](/public/img/feature-shortcode-preview.png) -->

---

## Technical Performance

- **Zero Impact on Page Speed:** TubeBay uses lazy-loading for iframe elements. The actual YouTube player only loads when the user interacts with the thumbnail.
- **Theme Independent:** The shortcodes are designed to inherit your theme's container width while staying perfectly responsive.
- **Gutenberg:** Use the Shortcode or Custom HTML block.
- **Beaver Builder:** Use the HTML or Text module.
