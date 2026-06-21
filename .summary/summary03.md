# TubeBay — Backend Deep Dive (PHP)

## 1. Plugin Entry Point (`tubebay.php`)

The main plugin file handles:

- **WordPress Plugin Header** — Name, version, author, license, text domain
- **Constants** — `TUBEBAY_PATH`, `TUBEBAY_URL`, `TUBEBAY_VERSION`, `TUBEBAY_PLUGIN_NAME`, `TUBEBAY_TEXT_DOMAIN`, `TUBEBAY_OPTION_NAME`, `TUBEBAY_PLUGIN_BASENAME`, `TUBEBAY_DEV_MODE`
- **Autoloading** — Loads Composer autoloader
- **Bootstrap** — Calls `tubebay_run()` which gets the Plugin singleton and hooks it into `plugins_loaded`

---

## 2. Core Layer (`app/Core/`)

### Plugin.php — The Orchestrator

- **Singleton** — `Plugin::get_instance()`
- **Constructor** initializes:
  - `Loader` instance (hook manager)
  - Core hooks (API controllers from `config/api.php`)
  - Admin hooks (core classes from `config/core.php`)
  - Public hooks (frontend CSS/JS)
- **`run()`** — Called on `plugins_loaded`, executes `Loader::run()` to register all hooks

### Activator.php — Runs on Plugin Activation

| Task                   | Detail                                                                   |
| ---------------------- | ------------------------------------------------------------------------ |
| Set default options    | Iterates `Settings::get_defaults()`, sets each as individual `wp_option` |
| Create database tables | Via `DbManager::create_tables()`                                         |
| Flush rewrite rules    | `flush_rewrite_rules()`                                                  |
| Secure log directory   | Creates `.htaccess` + `index.php` in upload/tubebay-logs/                |
| Add capabilities       | Adds `manage_tubebay` capability to admin role                           |

### Deactivator.php — Runs on Plugin Deactivation

- Removes `manage_tubebay` capability from all roles

### Base.php — Abstract Singleton

- Provides singleton pattern via `get_instance()` with proper inheritance support
- Hook management: `add_action()`, `add_filter()`, `get_hooks()`
- All extending classes share the same instance pool

### Cron.php — Daily Auto-Sync

- Uses WP-Cron with hook name `tubebay_daily_sync_event`
- Schedules daily at 3:00 AM when `auto_sync` setting is enabled
- `do_daily_sync()` fetches fresh videos from YouTube API via `Channel::get_latest_videos(true)`
- Auto-schedules/unschedules based on setting changes

---

## 3. Admin Layer (`app/Admin/`)

### Admin.php — Dashboard Integration

- **Admin Menu**: Creates top-level "TubeBay" menu with submenu items:
  - Channel Library (default)
  - Settings
  - Videos (under Products → Videos, redirects to main page)
- **Resource Enqueuing**: Loads the React SPA on the TubeBay admin pages:
  - `build/admin.js` + `build/admin.css`
  - Uses `admin.asset.php` for dependency tracking
  - Passes PHP data to JS via `wp_localize_script('tubebay_Localize', ...)`
- **Localized Data** passed to frontend:
  - Version, nonce, REST URL, plugin branding data
  - WordPress date/time format settings
  - All plugin settings
  - Products admin URL
- **Action Links**: Adds "Settings" link on the Plugins page

### ProductMetabox.php — WooCommerce Product Integration

- Adds a **"TubeBay Video"** metabox on the product edit screen (side, high priority)
- Only shows if channel is connected OR product already has a video assigned
- **Metabox UI includes**:
  - Selected video preview (thumbnail + title)
  - Edit / Remove video buttons
  - "Select Video from Library" button → opens a **modal**
  - Muted Autoplay toggle (per-product, falls back to global setting)
- **Video Selection Modal**:
  - Grid view of videos from the channel library
  - Search by title
  - Sort by: Recently Added, Oldest First, Title A-Z/Z-A, Most Viewed
  - Load More pagination
- **Data Saved as Post Meta**:
  - `_tubebay_video_id`
  - `_tubebay_video_title`
  - `_tubebay_video_thumbnail`
  - `_tubebay_display_location`
  - `_tubebay_muted_autoplay`
- **Security**: Full nonce verification, capability checks, autosave detection

---

## 4. API Layer (`app/Api/`)

All REST endpoints live under namespace `tubebay/v1/`. Base controller handles authentication.

### ApiController.php — Base Controller

- Extends `WP_REST_Controller`
- Permission checks require `manage_tubebay` capability + valid nonce
- Both GET and POST endpoints are secured

### REST API Endpoints

| Method   | Endpoint                       | Controller         | Description                         |
| -------- | ------------------------------ | ------------------ | ----------------------------------- |
| `GET`    | `/settings`                    | SettingsController | Retrieve all plugin settings        |
| `POST`   | `/settings`                    | SettingsController | Update plugin settings              |
| `DELETE` | `/settings/delete-all-data`    | SettingsController | Wipe all plugin data and reset      |
| `POST`   | `/youtube/test-connection`     | YouTubeController  | Test YouTube API connection         |
| `GET`    | `/youtube/oauth-connect`       | YouTubeController  | Redirect to Google OAuth Proxy      |
| `GET`    | `/youtube/sync-library`        | YouTubeController  | Sync video library (returns videos) |
| `GET`    | `/youtube/sync-library-status` | YouTubeController  | Sync library (returns status only)  |
| `GET`    | `/youtube/videos`              | YouTubeController  | Get videos (search, sort, paginate) |
| `GET`    | `/logs`                        | LogController      | Retrieve debug log content          |
| `DELETE` | `/logs`                        | LogController      | Clear all log files                 |

### SettingsController — Settings Management

- **GET `/settings`**: Returns all settings via `Settings::get_all_settings()`
- **POST `/settings`**: Updates individual settings. When `api_key` or `channel_id` changes, automatically tests the connection and updates `connection_status`, `channel_name`, thumbnails
- **DELETE `/settings/delete-all-data`**: Complete data wipe:
  1. Drops custom tables
  2. Deletes all `tubebay_*` options
  3. Deletes all product meta
  4. Deletes all transients
  5. Unschedules cron
  6. Re-creates tables and restores defaults

### YouTubeController — YouTube Integration

- **Test Connection**: Creates a `Channel` with provided credentials, calls `test_connection()`
- **Sync Library**: Force-refreshes videos from API, returns full video list
- **Get Videos**: Smart routing — uses cached playlist data for default view, hits YouTube Search API for search/sort/pagination

---

## 5. Data Layer (`app/Data/`)

### DbManager.php

- Singleton that manages custom database tables
- `create_tables()` is called on activation (currently a stub for future tables)

### Channel.php — YouTube Channel Entity

The most complex entity — handles all YouTube API communication for both **OAuth** and **Manual API** connection methods:

**Properties**: `api_key`, `channel_id`, `access_token`, `refresh_token`, `method` (loaded from Settings)

**Key Methods**:

| Method                                              | Description                                                  |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `is_configured()`                                   | Checks if connection credentials are set                     |
| `get_latest_videos($force)`                         | Returns cached videos or fetches fresh from API              |
| `fetch_videos_from_api()`                           | Two-step API call: get uploads playlist → get playlist items |
| `search_videos($query, $sort, $page_token, $limit)` | Full YouTube Search API with sorting and pagination          |
| `get_channel_details()`                             | Fetches channel snippet (title, thumbnails)                  |
| `test_connection()`                                 | Connection test for both API and OAuth modes                 |
| `test_oauth_connection()`                           | Validates OAuth refresh token and generates access token     |
| `reconnect()`                                       | Saves credentials and re-tests                               |
| `disconnect()`                                      | Clears connection state                                      |

**Caching Strategy**:

- Videos cached as WordPress transients: `tubebay_videos_cache_{channel_id}`
- Cache duration configurable (default 12 hours)
- Force-refresh bypasses cache

**YouTube API Calls Made**:

1. `GET youtube/v3/channels` — Get upload playlist ID + channel details
2. `GET youtube/v3/playlistItems` — Get up to 50 latest videos
3. `GET youtube/v3/search` — Used for search/sort queries

**Sort Mapping**:
| Internal Key | YouTube API `order` |
|---|---|
| `date_desc` | `date` |
| `date_asc` | `date` (reversed client-side) |
| `title_asc` | `title` |
| `title_desc` | `title` (reversed client-side) |
| `view_count` | `viewCount` |

### Video.php — Video Data Model

Simple value object with sanitized fields:

- `id` (YouTube video ID)
- `title`
- `thumbnail_url`
- `published_at`
- `description`
- `to_array()` method for serialization

---

## 6. Helper Layer (`app/Helper/`)

### Settings.php — Centralized Settings Management

All settings stored as individual `wp_options` with prefix `tubebay_`:

| Setting Key                     | Default                 | Type   | Description                                       |
| ------------------------------- | ----------------------- | ------ | ------------------------------------------------- |
| `api_key`                       | `''`                    | string | Google Cloud API Key                              |
| `channel_id`                    | `''`                    | string | YouTube Channel ID                                |
| `channel_name`                  | `''`                    | string | Synced channel name                               |
| `thumbnails_default`            | `''`                    | string | Channel thumbnail (small)                         |
| `thumbnails_medium`             | `''`                    | string | Channel thumbnail (medium)                        |
| `connection_status`             | `'inactive'`            | string | `inactive`, `connected`, `disconnected`, `failed` |
| `cache_duration`                | `12`                    | int    | Hours to cache video data                         |
| `auto_sync`                     | `true`                  | bool   | Enable daily auto-sync                            |
| `video_placement`               | `'add_to_gallery_last'` | string | Where to inject video on product page             |
| `muted_autoplay`                | `false`                 | bool   | Global muted autoplay default                     |
| `show_controls`                 | `false`                 | bool   | Show player controls                              |
| `is_onboarding_completed`       | `false`                 | bool   | Onboarding wizard status                          |
| `last_sync_time`                | `0`                     | int    | Unix timestamp of last sync                       |
| `connection_method`             | `'oauth'`               | string | `oauth` or `api`                                  |
| `access_token`                  | `''`                    | string | OAuth access token                                |
| `refresh_token`                 | `''`                    | string | OAuth refresh token                               |
| `token_expires`                 | `0`                     | int    | Token expiry timestamp                            |
| `advanced_deleteAllOnUninstall` | `false`                 | bool   | Delete data on uninstall                          |
| `debug_enableMode`              | `false`                 | bool   | Enable debug logging                              |

### Loader.php — Hook Registration Manager

- Collects actions and filters, then registers them all at once via `run()`
- Ensures hooks are registered in a controlled order

### Logger.php — Logging Wrapper

- Singleton wrapper around the `tubebay_log()` function
- Structured logging with log type and optional context

### functions.php — Global Helpers

- **`tubebay_log($message, $level)`**: File-based logging to `wp-content/uploads/tubebay-logs/plugin-log-YYYY-MM-DD.log`. Only logs when debug mode is on (always logs errors). Supports arrays/objects via JSON encoding.
- **`tubebay_get_value($target, $key, $default)`**: Dot-notation accessor for nested arrays/objects.

---

## 7. Integration Layer (`app/Integration/`)

### WooCommerce.php — Product Video Display

Hooks into WooCommerce to display videos on product pages.

**Video Placement Options**:

| Option                                 | Hook / Method                                             | Description                                                           |
| -------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| `replace_main_image`                   | Filters `woocommerce_single_product_image_thumbnail_html` | Replaces the main product image with video as the first gallery slide |
| `add_to_gallery_last`                  | Filters `woocommerce_single_product_image_thumbnail_html` | Adds video as the last gallery slide                                  |
| `woocommerce_product_thumbnails`       | Action hook                                               | Places video below the gallery                                        |

> **Note**: Additional placement hooks are supported by the backend but are currently hidden in the UI pending further testing.

**Video Rendering**:

- **Autoplay Mode**: Renders a full YouTube iframe with `autoplay=1&mute=1&loop=1`
- **Façade Mode** (default): Renders a thumbnail image + SVG play button; actual iframe loads on click
- Supports per-product autoplay override with global fallback

---

## 8. Frontend Layer (`app/Frontend/`)

### VideoShortcode.php — `[tubebay_video]` Shortcode

Allows embedding TubeBay videos anywhere via shortcode.

**Usage**: `[tubebay_video id="VIDEO_ID" autoplay="1" mute="1" controls="1" width="560" height="315"]`

| Attribute  | Default        | Description              |
| ---------- | -------------- | ------------------------ |
| `id`       | (required)     | YouTube video ID         |
| `autoplay` | Global setting | Override muted autoplay  |
| `controls` | Global setting | Override player controls |
| `width`    | Responsive     | Custom width             |
| `height`   | Responsive     | Custom height            |

---

## 9. Uninstall Process (`uninstall.php`)

Only runs if `advanced_deleteAllOnUninstall` option is `true`. Cleanup steps:

1. Delete all `tubebay_*` options from `wp_options`
2. Delete all TubeBay product meta (`_tubebay_video_id`, `_tubebay_video_title`, `_tubebay_video_thumbnail`, `_tubebay_display_location`, `_tubebay_muted_autoplay`)
3. Delete all `tubebay_` transients
4. Remove `manage_tubebay` capability from all roles
5. Unschedule cron events

---

## 10. Configuration Files (`config/`)

### config/api.php — Registered API Controllers

```
SettingsController
YouTubeController
LogController
```

### config/core.php — Registered Core Classes

```
Admin
ProductMetabox
Settings
Cron
WooCommerce
VideoShortcode
```

Each class must implement `get_instance()` and `run($plugin)`.
