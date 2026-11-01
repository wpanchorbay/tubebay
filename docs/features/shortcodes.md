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
- **Self-hosted videos:** If the post's first attached video is a self-hosted one from your media library, the shortcode renders an HTML5 `<video>` player instead of a YouTube embed, honouring the same **Autoplay Shortcode Videos** and **Show Player Controls** settings. This works through the no-`id` form only — an `id` you type is always read as a YouTube video ID, never as a media-library attachment ID.
- **Theme Independent:** Shortcodes inherit your theme's container width while staying responsive.
- **Block editor:** Use the [TubeBay Video block](/features/blocks) instead — it previews the video as you write and needs no shortcode. The Shortcode block still works if you prefer it.
- **Page builders:** Use whichever block/module renders raw shortcodes or HTML in your builder.
- **Privacy mode:** If **Privacy (GDPR) Mode** is on in [Global Settings](/features/global-settings), shortcode embeds use `youtube-nocookie.com` too.

## `[tubebay_by_pid]`: a product's videos anywhere (Pro)

::: tip TubeBay Pro
`[tubebay_by_pid]` is part of [TubeBay Pro](/guide/pro#tubebay-by-pid-shortcode). Free sites only have `[tubebay_video]`.
:::

`[tubebay_by_pid id="123"]` shows **every video assigned to one product** as a responsive grid, on any page, post or builder block. Each tile is the same click-to-play thumbnail used in the product gallery, so YouTube only loads when a shopper clicks.

```text
[tubebay_by_pid id="123" columns="3" play_icon="circle" aspect_ratio="4:3"]
```

| Attribute | Values | Default |
|-----------|--------|---------|
| `id` (aliases `pid`, `product_id`) | Product ID; the first one present wins | none; required |
| `columns` | `1` to `6` | automatic grid of 260 px columns; always one column on phones |
| `autoplay` | `true`/`false` (`1`/`0`, `yes`/`no`); the first video only, muted | off |
| `play_icon` | `youtube`, `circle`, `triangle` | the **Video Player** setting |
| `play_icon_color` | a hex colour such as `#e11d48` | the **Video Player** setting |
| `aspect_ratio` | `16-9`, `1-1`, `4-3`, `9-16` (`16:9`, `16/9` also work) | the **Video Player** setting |
| `show_duration` | `true`/`false` | the product's own option, then the global setting |
| `show_description` | `true`/`false` | the global setting; has no visible effect in the grid |

Invalid values are ignored and fall back to the default. Nothing is printed (and no error shown) when the ID is missing, the product is not published or is password-protected, it has no videos, or the shortcode sits in a feed or excerpt. The full description is on the [Pro guide](/guide/pro#tubebay-by-pid-shortcode).

## Extending the Shortcode
Developers can filter the parsed attributes, override the resolved video type (to support other providers), or filter the final rendered HTML — see [Hooks & Filters](/developer/hooks#shortcode-hooks) (`tubebay_shortcode_atts`, `tubebay_video_type`, `tubebay_shortcode_video_html`).
