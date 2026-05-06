# Shortcodes

While TubeBay handles video placement automatically based on your settings, you often need more control for specific page layouts or landing pages. Our shortcodes allow you to embed videos anywhere that supports WordPress shortcodes.

## The Global Video Shortcode

TubeBay includes a powerful shortcode system that allows you to embed your YouTube videos anywhere on your WordPress site, not just on product pages.

## Basic Usage

To embed a video, use the following shortcode:

```text
[tubebay_video id="YOUTUBE_VIDEO_ID"]
```

### Advanced Usage

You can customize the player behavior using additional parameters:

```text
[tubebay_video id="YOUTUBE_VIDEO_ID" autoplay="1" controls="1"]
```

## Front-end Preview

When you place a shortcode in a page or post, it will render as a responsive, high-quality video player.

<!-- ![Shortcode Front-end Rendering](/public/img/feature-shortcode-preview.png) -->

---

## Technical Performance

- **Zero Impact on Page Speed:** TubeBay uses lazy-loading for iframe elements. The actual YouTube player only loads when the user interacts with the thumbnail.
- **Theme Independent:** The shortcodes are designed to inherit your theme's container width while staying perfectly responsive.
- **Gutenberg:** Use the Shortcode or Custom HTML block.
- **Beaver Builder:** Use the HTML or Text module.
