# Shortcodes

TubeBay automatically places videos in the product gallery based on your settings, but the `[tubebay_video]` shortcode lets you embed a video anywhere else that supports WordPress shortcodes — a landing page, a blog post, a page-builder text block.

## Basic Usage

```text
[tubebay_video id="YOUTUBE_VIDEO_ID"]
```

If you omit `id` on a product page (or any post/page a video has been mapped to), TubeBay automatically embeds that post's first attached video.

```text
[tubebay_video]
```

### Available Attributes

| Attribute | Description |
|-----------|-------------|
| `id` | The YouTube video ID to embed. Omit to use the current post's first mapped video. |
| `autoplay` | `1` to autoplay the video (browsers require `mute="1"` for this to work). |
| `mute` | `1` to start the video muted. |
| `controls` | `1` to show YouTube's playback controls, `0` to hide them. |
| `width` | Player width in pixels. |
| `height` | Player height in pixels. |

### Advanced Usage

```text
[tubebay_video id="YOUTUBE_VIDEO_ID" autoplay="1" mute="1" controls="1" width="560" height="315"]
```

## Technical Performance

- **Zero Impact on Page Speed:** TubeBay uses the same lazy-loading Video Facade as the product gallery — the actual YouTube player only loads when a visitor clicks the thumbnail.
- **Theme Independent:** Shortcodes inherit your theme's container width while staying responsive.
- **Gutenberg:** Use the Shortcode block or a Custom HTML block.
- **Page builders:** Use whichever block/module renders raw shortcodes or HTML in your builder.

## Extending the Shortcode
Developers can filter the parsed attributes, override the resolved video type (to support other providers), or filter the final rendered HTML — see [Hooks & Filters](/developer/hooks#shortcode-hooks) (`tubebay_shortcode_atts`, `tubebay_video_type`, `tubebay_shortcode_video_html`).
