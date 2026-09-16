# Changelog

All notable changes to TubeBay are documented on this page.

## [1.3.2] - 2026-09-15

::: tip Coming from 1.2.0?
Versions 1.3.0 and 1.3.1 were never published on their own — everything they
changed reached stores as part of 1.3.2. Both are listed below so you can see
what arrived.
:::

### Fixed
- **Show Player Controls could not be turned off.** Switching it off looked like it worked, but nothing was saved and controls stayed on. Stores updating from 1.2.0 were affected.
- A player toggle could show as on while it was stored as off, so the next save switched it back on.
- Stores whose Video Position was the retired "Mixed" value could not save the Video Player settings at all. That value is now converted to **Last (After images)** once, automatically, on update — see [Visual Placement](/features/placement).
- The setup wizard could not be finished on those stores.
- The shop front went blank instead of loading if WooCommerce stopped running while TubeBay was still active. TubeBay now steps aside quietly, and the product list in the admin explains what is wrong instead of failing silently.
- Searching the video library found nothing unless you typed a whole word. Searching `woo` now finds your "WooCommerce …" videos — see [Library Management](/features/library-management).

### Changed
- Video Position and Connection Method are validated when saved, so an unrecognised value is rejected instead of stored.
- The play badge on the video blocks is drawn from the stylesheet instead of being saved into each post, so future changes to it cannot invalidate posts you have already published.
- TubeBay now declares compatibility with WooCommerce's High-Performance Order Storage and block-based Cart &amp; Checkout, so it no longer appears under "incompatible plugins" in **WooCommerce → Settings → Advanced → Features**.

### Removed
- Development source maps are no longer shipped in the release build.

## [1.3.1]

### Fixed
- Videos showed "Error 153 — Video player configuration error" instead of playing, on sites whose `Referrer-Policy` withholds the referrer from other domains. YouTube identifies the embedding site from that header and refuses to play without it. This affected the blocks, inline links, the product gallery and the shortcode alike.

## [1.3.0]

### Added
- **[TubeBay Video block](/features/blocks)** — a click-to-play thumbnail that plays in place or opens a popup, with an optional caption.
- **[TubeBay Video Button block](/features/blocks#tubebay-video-button-block)** — a button that opens a video in a popup, styled by your theme. It can open its fallback link in a new tab and mark it `nofollow`.
- **[Inline video links](/features/blocks#inline-video-links)** — select words in any paragraph, heading or list and turn them into a link that opens the video popup, straight from the block toolbar.
- Video shape (16:9, 4:3, 1:1, 9:16), start time and popup width can be set per block and per inline link.
- An **Autoplay Shortcode Videos** setting, so shortcode autoplay no longer follows the product gallery's setting — see [Global Settings](/features/global-settings).
- Editors and authors can now choose videos from your channel when adding a block. Live channel searches stay limited to administrators, to protect your YouTube API quota.

### Fixed
- Privacy/GDPR mode had no effect on the product gallery, which always embedded `youtube.com`.
- Show Player Controls had no effect anywhere, and was stored as off while the settings screen showed it on.
- Autoplay First Video never actually autoplayed in the gallery.
- The setup wizard discarded five of the player settings you chose in it.
- The start time field rewrote what you typed, so entering `1:30` saved 30 seconds.
- **Delete All Data** and uninstalling the free plugin removed a TubeBay Pro licence key.
- Connection status, connection method and video position are now validated, so an unrecognised value can no longer leave a settings screen showing nothing selected.

### Removed
- The **Mixed** video position. It was offered on the settings screen and in the product metabox but was never implemented, and behaved exactly like **Last**. Products already set to it now show as **Last**.

### Security
- Debug log files are given an unguessable name and can no longer be read directly over the web. They previously sat at a predictable URL under uploads and were readable on servers that ignore `.htaccess`, such as nginx.

## [1.2.0] - 2026-07-19

### Security
- Redact secrets (API keys, OAuth tokens) from debug log output.

### Added
- Settings and engine extension hooks for add-ons (`tubebay_settings_defaults`, `tubebay_settings_saveable_keys`, `tubebay_gallery_videos`, and more — see [Hooks & Filters](/developer/hooks)).

### Changed
- Per-product gallery override controls (Max Videos, Video Position, Autoplay First Video, Show Duration Badge) moved to [TubeBay Pro](/guide/pro). They remain visible on the free product metabox as a disabled preview.
- Hardening and stability fixes across the REST API and sync engine.

## [1.1.0] - 2026-06-28

### Added
- Support for multiple videos per product, displayed as a gallery of "Video Facade" slides mixed into the WooCommerce product image gallery.
- Object caching for product-to-video mappings.
- A "No videos found" message when a video search returns empty.

### Changed
- Aligned the product metabox UI with the classic WordPress dashboard styling.

## [1.0.0] - 2026-04-09

### Initial Release
- **Core:** Dual-mode connection supporting Google OAuth 2.0 and a manual YouTube Data API key.
- **Library:** Automatic synchronization of YouTube videos to WordPress.
- **Mapping:** Search and map videos directly to WooCommerce products.
- **Player:** Responsive YouTube player with customizable settings (autoplay, controls).
- **Placement:** Flexible visual placement for product videos.
- **Architecture:** Modern hybrid React/PHP architecture for high performance.
