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
| `autoplay` | `1` to autoplay the video. Omit it and the **Autoplay Shortcode Videos** setting decides. Autoplaying videos always start muted — browsers refuse to autoplay audio. |
| `mute` | Accepted for backwards compatibility, but it has no effect on its own: muting is tied to autoplay. |
| `controls` | `1` to show YouTube's playback controls, `0` to hide them. Omit it and the **Show Player Controls** setting decides. |
| `width` | Player width in pixels. |
| `height` | Player height in pixels. |

### Advanced Usage

```text
[tubebay_video id="YOUTUBE_VIDEO_ID" autoplay="1" mute="1" controls="1" width="560" height="315"]
```

## Technical Performance

- **The shortcode embeds the player directly.** Unlike the product gallery and the [video blocks](/features/blocks), which show a thumbnail and load YouTube only on click, `[tubebay_video]` puts the YouTube iframe straight into the page. It therefore costs what an ordinary YouTube embed costs. If page weight matters on that page, reach for a video block instead.
- **Theme Independent:** Shortcodes inherit your theme's container width while staying responsive.
- **Block editor:** Use the [TubeBay Video block](/features/blocks) instead — it previews the video as you write and needs no shortcode. The Shortcode block still works if you prefer it.
- **Page builders:** Use whichever block/module renders raw shortcodes or HTML in your builder.
- **Privacy mode:** If **Privacy (GDPR) Mode** is on in [Global Settings](/features/global-settings), shortcode embeds use `youtube-nocookie.com` too.

## Extending the Shortcode
Developers can filter the parsed attributes, override the resolved video type (to support other providers), or filter the final rendered HTML — see [Hooks & Filters](/developer/hooks#shortcode-hooks) (`tubebay_shortcode_atts`, `tubebay_video_type`, `tubebay_shortcode_video_html`).
