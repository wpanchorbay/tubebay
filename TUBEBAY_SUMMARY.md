# TubeBay — Project Summary

## 1. Project Overview
TubeBay is a specialized WordPress plugin designed to integrate YouTube product videos seamlessly into WooCommerce stores. Its primary goal is to help store owners display video content on product pages to increase shopper engagement and social proof without compromising site performance.

- **Slug:** tubebay
- **Version:** 1.0.0
- **Author:** WPAnchorBay
- **License:** GPLv2 or later
- **Minimum Requirements:** WordPress 6.8+, PHP 7.4+, WooCommerce 6.1+

## 2. Feature Set
### Admin Features
- **YouTube Channel Connection:** Supports both guided Google OAuth (via WPAnchorBay proxy) and manual Google Cloud API key/Channel ID setup. OAuth is the recommended method.
- **Setup Wizard:** A modern, React-powered onboarding flow for first-time configuration, featuring a stepper and guided connection.
- **Channel Library:** A dedicated view inside the WordPress admin to browse, search, and sort synced YouTube videos.
- **Automated Sync:** Daily background synchronization (via WP-Cron) ensures the local video library stays up to date.
- **Force Sync:** Administrators can manually trigger a refresh to pull the latest video metadata immediately.
- **Help & Diagnostics:** Real-time debug logs and a connection status panel for troubleshooting.
- **Data Privacy:** Controls to wipe all plugin data (options, tables, meta) upon uninstallation or on demand via the "Delete All Data" feature.

### Frontend Features
- **WooCommerce Product Video Display:** Injects videos into the product gallery (as the first or last slide) or into dedicated placement hooks.
- **Video Facade Technology:** Displays a lightweight preview image with a play button. The heavy YouTube iframe only loads after a user click, significantly improving initial page load speed.
- **Shortcode Support:** Use `[tubebay_video]` to embed synced videos in posts, pages, or custom blocks.
- **Muted Autoplay:** Option to have videos start playing immediately without sound for a cinematic effect in the gallery.
- **Shop Page Video Support:** (Developer-facing) Skeleton for displaying videos in the WooCommerce shop loop.

## 3. File & Folder Structure
```
tubebay/
├── tubebay.php              — Main bootstrap file; defines constants and initializes the plugin
├── uninstall.php            — Cleanup script for plugin deletion; handles complete data wipe
├── app/
│   ├── Admin/               — Admin classes (Admin.php for menu/SPA, ProductMetabox.php for product edit screen)
│   ├── Api/                 — REST API Controllers (SettingsController, YouTubeController, LogController)
│   ├── Core/                — System logic (Activator, Deactivator, Plugin orchestrator, Cron for scheduling)
│   ├── Data/                — Data layer (DbManager for tables, Entities for Video/Channel objects)
│   ├── Frontend/            — Public logic (VideoShortcode.php)
│   ├── Helper/              — Utilities (Logger.php, Settings.php, Loader.php for hook registration)
│   └── Integration/         — WooCommerce.php (Core integration for product pages)
├── assets/
│   ├── css/                 — Static CSS (admin-menu.css, public.css)
│   ├── js/                  — Static JS (public.js for Facade interaction)
│   └── img/                 — Brand assets (icon.svg, TubeBay.svg)
├── build/                   — Compiled React/TypeScript assets for the admin UI
├── config/                  — Registration maps (api.php, core.php)
├── docs/                    — VitePress documentation source
├── languages/               — i18n translation files
├── src/                     — React/TypeScript source for the admin dashboard
├── tailwind.config.js       — Tailwind configuration for the admin UI
└── webpack.config.js        — Asset compilation configuration
```

## 4. System Architecture & Design
- **Bootstrap Sequence:** `tubebay.php` -> `TubeBay\Core\Plugin::get_instance()` -> `plugins_loaded` hook -> `Plugin::run()`.
- **Hook Management:** Uses a central `Loader` class (Registry pattern) to manage all `add_action` and `add_filter` calls.
- **Modularity:** Plugin modules (Controllers, Admin classes, Integrations) are registered in `config/*.php` and instantiated via a singleton pattern.
- **Admin UI Architecture:** The admin dashboard is a React SPA using `react-router-dom` for navigation. It fetches data exclusively via a custom namespace in the WordPress REST API.
- **OAuth Architecture:** Implements a proxy-based OAuth flow. The plugin redirects to `wpanchorbay.com` for authentication, receiving a refresh token that is then used to request short-lived access tokens from the proxy.

## 5. Database Schema
### Custom Tables
- **`wp_tubebay_items`**: Planned for local storage of video metadata. Table creation logic exists in `DbManager.php`.

### Options (`wp_options`)
All plugin settings use the `tubebay_` prefix:
- `tubebay_connection_method`: `oauth` (default) or `api`.
- `tubebay_refresh_token`: OAuth refresh token for secure API access.
- `tubebay_access_token`: Short-lived access token.
- `tubebay_token_expires`: Expiration timestamp for the access token.
- `tubebay_api_key`: Google Cloud API Key (Manual mode).
- `tubebay_channel_id`: YouTube Channel ID.
- `tubebay_channel_name`: Cached name of the connected channel.
- `tubebay_thumbnails_default`: URL of the channel's default thumbnail.
- `tubebay_thumbnails_medium`: URL of the channel's medium thumbnail.
- `tubebay_connection_status`: Current state (`connected`, `inactive`, `failed`).
- `tubebay_auto_sync`: Boolean to enable/disable daily cron.
- `tubebay_video_placement`: Hook name for gallery/page injection.
- `tubebay_is_onboarding_completed`: Boolean to track wizard status.

### Post Meta (`wp_postmeta`)
Used to map videos to WooCommerce products:
- `_tubebay_video_id`: YouTube Video ID assigned to the product.
- `_tubebay_video_title`: Cached title of the assigned video.
- `_tubebay_video_thumbnail`: URL of the video thumbnail used for the facade.
- `_tubebay_muted_autoplay`: Per-product override for autoplay behavior.

## 6. WordPress Integration (Hooks, Filters, Shortcodes, Blocks)
### Actions
| Hook | Callback | Priority | Purpose |
|------|----------|----------|---------|
| `admin_menu` | `Admin::add_admin_menu` | 10 | Registers TubeBay dashboard and submenus. |
| `rest_api_init` | `Plugin::define_core_hooks` | 10 | Initializes REST controllers. |
| `wp_enqueue_scripts` | `Plugin::enqueue_public_styles` | 10 | Loads frontend CSS/JS. |
| `save_post_product` | `ProductMetabox::save_metabox_data` | 10 | Persists video assignment on product save. |
| `tubebay_daily_sync_event` | `Cron::handle_sync` | 10 | Triggers the daily background sync. |

### Filters
| Hook | Callback | Purpose |
|------|----------|---------|
| `all_plugins` | `Plugin::change_plugin_display_name` | Updates plugin name in the list. |
| `woocommerce_single_product_image_thumbnail_html` | `WooCommerce::render_video_in_gallery` | Injects video into the product gallery. |
| `tubebay_admin_localize` | (Dynamic) | Filters data sent to the React admin app. |

### Shortcodes
- `[tubebay_video]`: Renders a video player. Attributes: `id`, `autoplay`, `mute`, `controls`.

## 7. Admin Interface & UX
- **Onboarding Wizard:** A dedicated multi-step flow at `admin.php?page=tubebay#/onboarding`. Uses a stepper component and guided cards for connection and settings configuration.
- **TubeBay Dashboard:** React-based UI at `admin.php?page=tubebay`.
    - **Channel Library:** Searchable grid of synced videos with preview functionality.
    - **Settings:** Tabbed interface for Connection, Placement, and Player settings.
- **Product Edit Metabox:** Located on the side of the WooCommerce Product editor. Allows searching the library and selecting a video.
- **Videos Submenu:** A shortcut under the "Products" menu that redirects to the TubeBay dashboard.

## 8. Frontend / Public-Facing Behavior
- **Gallery Injection:** If configured, the plugin injects a video slide into the WooCommerce gallery. Supports `replace_main_image` and `add_to_gallery_last`.
- **Facade Interaction:** The `public.js` script replaces the image facade with a responsive YouTube iframe upon user click.
- **Muted Autoplay:** If enabled, the iframe is loaded immediately with `autoplay=1&mute=1` and `controls=0`.

## 9. REST API & AJAX Endpoints
**Namespace:** `tubebay/v1`

| Route | Method | Purpose |
|-------|--------|---------|
| `/settings` | `GET` | Retrieve all plugin settings. |
| `/settings` | `POST` | Update multiple settings. |
| `/auth/connect` | `POST` | Process OAuth refresh token or manual API credentials. |
| `/youtube/test-connection` | `POST` | Validate API/OAuth credentials without saving. |
| `/youtube/oauth-connect` | `GET` | Redirect user to the OAuth Proxy server. |
| `/youtube/videos` | `GET` | Search or list YouTube videos (paginated). |
| `/youtube/sync-library` | `GET` | Trigger manual sync and return videos. |
| `/youtube/sync-library-status` | `GET` | Trigger manual sync and return only status. |
| `/youtube/disconnect` | `DELETE` | Clear all account-related settings. |
| `/logs` | `GET` | Fetch contents of the latest debug log. |
| `/settings/delete-all-data` | `DELETE` | Full reset of the plugin database state. |

## 10. Third-Party Integrations & Dependencies
- **WooCommerce:** Core dependency for product and gallery integration.
- **YouTube Data API v3:** Used for fetching video and channel metadata.
- **WPAnchorBay OAuth Proxy:** Handles secure Google OAuth handshakes.
- **React 18:** Framework for the admin UI.
- **Lucide React:** Icon library for the admin interface.

## 11. Settings & Configuration
- **Connection Method:** `oauth` (recommended) or `api`.
- **Auto Sync:** Daily background synchronization toggle.
- **Cache Duration:** How long (in hours) to cache the video library in transients.
- **Video Placement:** 
    - `woocommerce_product_thumbnails`: Add to gallery (replace main or add to end).
    - `woocommerce_before_single_product_summary`: Above title.
    - `woocommerce_after_single_product_summary`: Below short description.
- **Player Controls:** Global toggles for showing controls and starting muted.
- **Delete All Data on Uninstall:** Advanced setting to ensure clean removal.

## 12. Data Flow & Key Workflows
### OAuth Connection Workflow
1. User clicks "Connect via Google" in the wizard.
2. Plugin redirects to `wpanchorbay.com/oauth/index.php`.
3. User authorizes Google account.
4. Proxy redirects back to WordPress with a `refresh_token`.
5. Plugin saves the `refresh_token` and triggers a connection test.
6. Connection test uses `refresh_token` to get an `access_token` and fetches channel details.

### Video Synchronization Workflow
1. **Trigger:** Daily Cron or Admin "Force Sync".
2. **Action:** `Channel` fetches the `uploads` playlist ID from YouTube API.
3. **Fetching:** Fetches the latest 50 videos from the playlist.
4. **Caching:** Maps videos to entities and stores in a versioned transient (`tubebay_videos_cache_{id}`).

## 13. Cron Jobs & Background Processing
- **`tubebay_daily_sync_event`**:
    - **Frequency:** Daily.
    - **Callback:** `Channel::get_latest_videos(true)`.
    - **Purpose:** Refreshes the local video library cache.

## 14. Security Model
- **Capability Check:** Admin operations gate-kept by the `manage_tubebay` capability.
- **REST Nonce:** All API requests require a valid `X-WP-Nonce`.
- **OAuth Proxy:** Protects Google Client Secrets by never storing them in the plugin.
- **Data Sanitization:** All inputs sanitized before DB entry or API requests.
- **SQL Safety:** Uses `$wpdb->prepare` for all direct database queries.

## 15. Performance Considerations
- **Lazy Loading (Facade):** Drastically reduces initial page weight by not loading YouTube scripts until needed.
- **Transient Caching:** Minimizes external API calls to YouTube.
- **Conditional Loading:** Admin assets only load on TubeBay-specific pages.

## 16. Internationalization & Localization
- **Text Domain:** `tubebay`.
- **Translatable Strings:** Full coverage in both PHP and React (using `@wordpress/i18n`).
- **POT File:** Located in `languages/tubebay.pot`.

## 17. Developer Extension Points
- **Filter `tubebay_admin_localize`**: Inject custom data into the JS application.
- **Filter `tubebay_admin_script`/`css`**: Override build asset URLs.
- **Hooks:** Various `tubebay_log` and configuration hooks for extending behavior.

## 18. Build & Toolchain
- **Build Tool:** `@wordpress/scripts`.
- **Styling:** Tailwind CSS (configured in `tailwind.config.js`).
- **Language:** TypeScript for the frontend.
- **Linting:** PHPCS (WordPress standards) and ESLint.

## 19. Known Limitations & Technical Debt
- **Transient-Only Storage:** Large libraries are limited by transient size/persistence; persistent DB tables are planned.
- **Single Channel:** Currently supports only one connected YouTube channel.
- **Proxy Dependency:** OAuth functionality depends on the availability of the WPAnchorBay proxy.

## 20. Glossary of Key Terms
- **Connection Method:** How the plugin authenticates with YouTube (OAuth Proxy or direct API Key).
- **Facade:** A lightweight UI placeholder that looks like a video player but is a simple image.
- **Proxy Server:** The middleman service (`wpanchorbay.com`) that handles OAuth secrets.
- **Sync:** The process of pulling metadata from YouTube into the local WordPress cache.
