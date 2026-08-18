# Changelog

All notable changes to TubeBay are documented on this page.

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
