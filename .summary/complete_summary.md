# TubeBay — Project Overview & Executive Summary

## What Is TubeBay?

**TubeBay** is a WordPress / WooCommerce plugin that bridges a merchant's YouTube channel with their online store. It lets shop owners replace static product images with high-performance YouTube videos — directly from the WordPress admin dashboard — without copying embed codes.

| Attribute         | Detail                                          |
| ----------------- | ----------------------------------------------- |
| **Plugin Name**   | TubeBay                                         |
| **Version**       | 1.0.0                                           |
| **Author**        | WPAnchorBay (sankarsan)                         |
| **Platform**      | WordPress 6.8+ / WooCommerce                    |
| **PHP**           | 7.4+                                            |
| **License**       | GPLv2 or later                                  |
| **Frontend Tech** | React + TypeScript (admin), Vanilla JS (public) |
| **Backend Tech**  | PHP with WordPress Plugin API                   |
| **Styling**       | TailwindCSS 3.x (admin), Vanilla CSS (public)   |
| **Build Tool**    | Webpack via `@wordpress/scripts`                |

---

## The Problem It Solves

WooCommerce merchants who use YouTube to market products face friction:

- Manually copying YouTube embed codes is tedious and error-prone.
- Standard embeds are slow (YouTube loads heavy scripts on page load), hurting page speed and SEO.
- There's no centralized way to manage which videos are on which products.

---

## How TubeBay Solves It

1. **Connect Securely** — Connect via Google OAuth 2.0 (recommended) for one-click setup or use a manual API key.
2. **Auto-Sync Library** — TubeBay fetches the channel's video library and caches it.
3. **Assign Videos to Products** — A custom metabox on each WooCommerce product edit screen lets you browse and pick a video from a visual grid.
4. **Automatic Frontend Display** — The chosen video automatically appears in the product gallery (or other configurable positions) on the live store.
5. **Video Façade Technology** — Instead of loading a full YouTube iframe on page load, TubeBay shows a lightweight thumbnail+play-button. The actual player only loads when the visitor clicks — keeping Largest Contentful Paint (LCP) scores excellent.

---

## Development Phases

OAuth is now the primary and recommended connection method, providing a seamless and secure experience for users without requiring manual API key creation.

---

## Target Audience

| Audience                     | What They Get                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| **WooCommerce Store Owners** | A no-code way to add YouTube videos to product pages and boost conversions                   |
| **Marketers**                | Video content embedded where it matters most — on product pages — for higher engagement      |
| **Developers**               | A well-structured, extensible plugin with clean separation of PHP backend and React frontend |

---

## Key Features at a Glance

- ✅ **Google OAuth 2.0 Connection** (One-click, secure authentication)
- ✅ Native WooCommerce gallery integration (replace main image or add to gallery)
- ✅ Performance-first Video Façade (lazy-loading YouTube embeds)
- ✅ Guided onboarding wizard
- ✅ Real-time video search and sort (by date, title, views)
- ✅ Per-product and global autoplay/controls settings
- ✅ Automatic daily sync via WP-Cron
- ✅ Debug logging system
- ✅ Clean uninstall with optional data deletion
- ✅ PHPCS / WordPress coding standards compliant
- ✅ Internationalization (i18n) ready
- ✅ `[tubebay_video]` shortcode for embedding videos anywhere

# TubeBay — Architecture & File Structure

## High-Level Architecture

TubeBay follows a classic WordPress plugin architecture with a **PHP backend** and a **React/TypeScript admin SPA**:

```
┌─────────────────────────────────────────────────────────────┐
│                        WordPress                            │
│  ┌──────────────────┐    ┌─────────────────────────────┐    │
│  │  WooCommerce      │    │  WordPress REST API         │    │
│  │  (Product Pages)  │    │  (tubebay/v1/*)             │    │
│  └────────┬─────────┘    └──────────┬──────────────────┘    │
│           │                         │                       │
│  ┌────────▼─────────────────────────▼──────────────────┐    │
│  │             TubeBay PHP Backend                      │    │
│  │  ┌─────────┐ ┌─────┐ ┌──────┐ ┌───────────────┐    │    │
│  │  │  Core   │ │Admin│ │ API  │ │  Integration   │    │    │
│  │  │         │ │     │ │      │ │  (WooCommerce) │    │    │
│  │  └─────────┘ └─────┘ └──────┘ └───────────────┘    │    │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────┐           │    │
│  │  │  Data   │ │  Helper  │ │  Frontend  │           │    │
│  │  │(Channel,│ │(Settings,│ │(Shortcode) │           │    │
│  │  │ Video)  │ │ Loader,  │ │            │           │    │
│  │  │         │ │ Logger)  │ │            │           │    │
│  │  └─────────┘ └──────────┘ └────────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │        React/TypeScript Admin SPA (build/)           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐           │    │
│  │  │  Pages   │ │Components│ │   Store   │           │    │
│  │  │          │ │ (38 UI)  │ │ (Context) │           │    │
│  │  └──────────┘ └──────────┘ └───────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │           YouTube Data API v3 (External)             │    │
│  │  Channels · PlaylistItems · Search endpoints         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
tubebay/
├── tubebay.php              ← Plugin entry point (bootstrap)
├── index.php                ← Security: prevents directory listing
├── uninstall.php            ← Runs on plugin deletion
│
├── app/                     ← PHP Backend
│   ├── Core/                ← Plugin lifecycle
│   │   ├── Plugin.php       ← Main plugin class (singleton)
│   │   ├── Activator.php    ← Activation logic
│   │   ├── Deactivator.php  ← Deactivation logic
│   │   ├── Base.php         ← Abstract singleton base
│   │   └── Cron.php         ← WP-Cron daily sync
│   ├── Admin/               ← WordPress admin UI
│   │   ├── Admin.php        ← Menu, scripts, admin pages
│   │   └── ProductMetabox.php ← WooCommerce product metabox
│   ├── Api/                 ← REST API controllers
│   │   ├── ApiController.php     ← Base controller
│   │   ├── SettingsController.php ← Settings CRUD
│   │   ├── YouTubeController.php  ← YouTube operations
│   │   ├── LogController.php      ← Log viewer
│   ├── Data/                ← Data layer
│   │   ├── DbManager.php    ← Database table management
│   │   └── Entities/
│   │       ├── Channel.php  ← YouTube channel operations
│   │       └── Video.php    ← Video data model
│   ├── Frontend/            ← Public-facing features
│   │   └── VideoShortcode.php ← [tubebay_video] shortcode
│   ├── Helper/              ← Utilities
│   │   ├── Loader.php       ← Hook registration manager
│   │   ├── Logger.php       ← Logging wrapper
│   │   └── Settings.php     ← Settings management
│   ├── Integration/         ← Third-party integrations
│   │   └── WooCommerce.php  ← WooCommerce gallery hooks
│   └── functions.php        ← Global helper functions
│
├── config/                  ← PHP configuration files
│   ├── api.php              ← Registered API controllers
│   └── core.php             ← Registered core classes
│
├── src/                     ← React/TypeScript Frontend (source)
│   ├── index.tsx            ← App entry point
│   ├── App.tsx              ← Router + providers
│   ├── pages/               ← Admin page components
│   │   ├── Onboarding.tsx   ← Setup wizard (3 steps)
│   │   ├── ChannelLibrary.tsx ← Video library browser
│   │   ├── Settings.tsx     ← Plugin settings
│   │   └── Logs.tsx         ← Debug log viewer
├── components/          ← Reusable UI components
│   ├── common/          ← 32 shared components
│   ├── settings/        ← 6 settings-specific components
│   │   └── loading/         ← Skeleton loaders
│   ├── store/               ← State management
│   │   ├── wpabStore.tsx    ← React Context store
│   │   └── toast/           ← Toast notification system
│   ├── hooks/               ← Custom React hooks
│   │   └── useYouTubeActions.tsx
│   ├── utils/               ← Utilities
│   │   ├── types.ts         ← TypeScript interfaces
│   │   ├── Dates.ts         ← Date formatting
│   │   ├── apiFetch.ts      ← API helper
│   │   └── useMenuSync.ts   ← WP menu sync
│   └── styles/
│       └── index.scss       ← Global styles (Tailwind + custom)
│
├── build/                   ← Compiled output (not in repo)
├── assets/                  ← Static assets
│   ├── css/                 ← Stylesheets
│   │   ├── public.css       ← Frontend video styles
│   │   ├── admin-menu.css   ← Admin menu styles
│   │   └── admin/product-metabox.css
│   ├── js/
│   │   ├── public.js        ← Frontend video facade script
│   │   └── admin/product-metabox.js
│   └── img/                 ← Logo and icons
│
├── languages/               ← Translation files
├── vendor/                  ← Composer dependencies
├── node_modules/            ← npm dependencies
│
├── package.json             ← npm config
├── composer.json            ← Composer config
├── webpack.config.js        ← Webpack configuration
├── tailwind.config.js       ← TailwindCSS configuration
├── tsconfig.json            ← TypeScript configuration
├── postcss.config.js        ← PostCSS configuration
│
├── build.sh                 ← Production build script
├── package.sh               ← ZIP packaging script
│
├── README.md                ← Developer documentation
└── readme.txt               ← WordPress.org listing
```

---

## Design Patterns Used

| Pattern                        | Where                                           | Purpose                                 |
| ------------------------------ | ----------------------------------------------- | --------------------------------------- |
| **Singleton**                  | All PHP classes (Plugin, Admin, Settings, etc.) | Ensures single instance per class       |
| **Hook Loader**                | `Helper/Loader.php`                             | Centralized WordPress hook registration |
| **Config-Driven Registration** | `config/api.php`, `config/core.php`             | Declarative class registration          |
| **MVC-lite**                   | API Controllers + Data Entities + Admin Views   | Separation of concerns                  |
| **React Context**              | `wpabStore.tsx`                                 | Frontend state management               |
| **Hash Router**                | `App.tsx`                                       | SPA navigation within WordPress admin   |
| **Transient Caching**          | `Channel.php`                                   | YouTube API response caching            |
| **Façade Pattern**             | `public.js` + WooCommerce integration           | Lazy-loading YouTube embeds             |

---

## Plugin Lifecycle Flow

```
WordPress Boot
     │
     ▼
tubebay.php
     │
     ├── define constants (TUBEBAY_PATH, TUBEBAY_URL, etc.)
     ├── load Composer autoloader
     ├── require app/functions.php
     ├── register activation/deactivation hooks
     │
     └── tubebay_run()
           │
           ▼
     Plugin::get_instance()  →  __construct()
           │
           ├── define_core_hooks()    →  Register REST API controllers from config/api.php
           ├── define_admin_hooks()   →  Initialize core classes from config/core.php
           │     ├── Admin         →  add_admin_menu, enqueue_resources
           │     ├── ProductMetabox →  add_metabox, save_metabox_data
           │     ├── Settings      →  (no hooks needed)
           │     ├── Cron          →  check_and_schedule, do_daily_sync
           │     ├── WooCommerce   →  render_product_video / render_video_in_gallery
           │     └── VideoShortcode →  register [tubebay_video] shortcode
           │
           └── define_public_hooks() →  enqueue_public_styles (CSS + JS)
                    │
                    ▼
           add_action('plugins_loaded', Plugin::run)
                    │
                    ▼
           Loader::run()  →  Registers all collected actions & filters with WordPress
```

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

# TubeBay — Frontend Deep Dive (React/TypeScript Admin SPA)

## 1. Overview

The admin interface is a **React Single-Page Application (SPA)** built with TypeScript. It renders inside the WordPress admin dashboard within a `<div id="tubebay">` container.

| Aspect           | Detail                                 |
| ---------------- | -------------------------------------- |
| Framework        | React 18+                              |
| Language         | TypeScript                             |
| Router           | `react-router-dom` (HashRouter)        |
| State Management | React Context API (`wpabStore`)        |
| API Client       | `@wordpress/api-fetch`                 |
| Icons            | `lucide-react` + custom SVG icons      |
| Styling          | TailwindCSS 3.x with `tubebay-` prefix |
| Build            | Webpack via `@wordpress/scripts`       |
| i18n             | `@wordpress/i18n`                      |

---

## 2. Entry Point & App Structure

### index.tsx

- Mounts the React app into `#tubebay` DOM element
- Imports global SCSS styles

### App.tsx — Root Component

```
WpabProvider (Context Store)
  └── ToastProvider (Notifications)
       └── ToastContainer
       └── HashRouter
            └── MenuSyncProvider (Syncs WP sidebar)
                 └── AppLayout (Shared layout wrapper)
                      ├── / → ChannelLibrary
                      ├── /onboarding → Onboarding
                      ├── /logs → Logs
                      ├── /settings → Settings
                      └── /library → ChannelLibrary
```

---

## 3. Pages (Admin Views)

### Onboarding Page (`pages/Onboarding.tsx`)

A **3-step guided wizard** for first-time setup:

| Step | Title              | What Happens                                                       |
| ---- | ------------------ | ------------------------------------------------------------------ |
| 1    | Connect YouTube    | User chooses connection method (OAuth or API Key) → Connect account |
| 2    | Configure Settings | Set video placement, autoplay, controls, cache duration, auto-sync |
| 3    | Done               | Success screen with link to Channel Library                        |

**Key Functions**:

- `handleConnect()` — Handles OAuth redirect or API key validation
- `handleTestConnection()` — Calls `POST /youtube/test-connection` endpoint
- `handleSyncLibrary()` — Calls `GET /youtube/sync-library-status` to sync videos
- `handleSaveSettings()` — Saves all settings, triggers library sync
- `handleFinish()` — Marks onboarding complete, navigates to library

**Auto-Navigation**: If onboarding is already completed, redirects to Channel Library.

---

### Channel Library Page (`pages/ChannelLibrary.tsx`)

The main dashboard view — displays the YouTube video library.

**Features**:

- Video grid showing thumbnails, titles, and publish dates
- Real-time search filter
- Sort by: Recently Added, Oldest, Title A-Z/Z-A, Most Viewed
- "Sync Now" button to refresh from YouTube API
- "Load More" pagination
- Per-video shortcode copy (`[tubebay_video id="..."]`)
- Connection status indicator
- Last sync time display
- Links to Products admin for quick video assignment

**Data Flow**:

1. Fetches videos from `GET /youtube/videos`
2. For search/sort: passes `?search=X&sort=Y` params
3. Uses `page_token` for pagination

**UI States**:

- Loading skeleton while fetching
- Empty state with connect prompt if no channel connected
- Error state with retry option

---

### Settings Page (`pages/Settings.tsx`)

Full plugin configuration split into cards:

**Settings Cards**:

| Card Component          | Contents                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ConnectAccountCard`    | Toggle between OAuth (recommended) and API Key, test connection, view channel info display                            |
| `SyncCard`              | Auto-sync toggle, cache duration slider, manual sync button, last sync time                                           |
| `PlacementSettingsCard` | Video placement selector (radio cards with visual previews), muted autoplay, show controls, video placeholder preview |
| `AdvancedSettingsCard`  | Debug mode toggle, delete all data on uninstall toggle, "Delete All Data Now" button with confirmation modal          |

**Key Functions**:

- `fetchSettings()` — Loads current settings from `GET /settings`
- `handleConnect()` — Saves connection credentials, updates status
- `handleSaveSettings()` — Saves all configurable settings
- `handleTestConnection()` — Tests YouTube connection
- `handleSyncLibrary()` — Triggers library sync
- `credentialsChanged()` / `otherSettingsChanged()` — Dirty state tracking for save button

---

### Logs Page (`pages/Logs.tsx`)

Debug log viewer for development/troubleshooting:

- Fetches logs from `GET /logs`
- Shows in a dark-themed monospace code viewer
- "Refresh" button to reload
- "Clear Logs" button to delete all logs (with confirmation)
- Shows log file path info

---

## 4. Component Library (`src/components/`)

### Common Components (33 components)

| Component                    | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `AppLayout`                  | Shared page layout wrapper with Navbar                                |
| `Navbar`                     | Top navigation bar with branding, navigation links, save button       |
| `Sidebar`                    | Slide-in sidebar panel                                                |
| `Page`                       | Base page container                                                   |
| `Header` / `HeaderContainer` | Section headers                                                       |
| `Button`                     | Styled button with variants (primary, secondary, danger, ghost, link) |
| `Input`                      | Text input with label, prefix/suffix, validation                      |
| `Select`                     | Feature-rich dropdown with search, grouping                           |
| `MultiSelect`                | Multi-value select with tags                                          |
| `NumberInput`                | Numeric input with increment/decrement controls                       |
| `Checkbox`                   | Styled checkbox                                                       |
| `Switch`                     | Toggle switch                                                         |
| `Toggler`                    | Label + toggle switch combo                                           |
| `Radio`                      | Radio button group                                                    |
| `CardRadioGroup`             | Visual card-based radio selection                                     |
| `SelectionCard`              | Clickable selection card with icon                                    |
| `Card`                       | Generic content card                                                  |
| `Toast`                      | Toast notification component                                          |
| `ToastContainer`             | Fixed-position toast stack                                            |
| `Loader`                     | Spinning loader indicator                                             |
| `Skeleton`                   | Shimmer skeleton placeholder                                          |
| `Stepper`                    | Step indicator for onboarding                                         |
| `ConfirmationModal`          | Confirmation dialog                                                   |
| `CustomModal`                | Generic modal overlay                                                 |
| `CopyToClipboard`            | Click-to-copy text utility                                            |
| `EditableText`               | Inline editable text                                                  |
| `ListSelect`                 | Simple list-based selector                                            |
| `Popover`                    | Floating popover                                                      |
| `ToolTip`                    | Hover tooltip                                                         |
| `BuyProTooltip`              | Pro feature upsell tooltip                                            |
| `Icons`                      | 30+ custom SVG icon components                                        |
| `classes.ts`                 | CSS class utility helpers                                             |

### Settings Components (7 components)

| Component               | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `ConnectAccountCard`    | YouTube connection management UI                          |
| `SyncCard`              | Sync settings and manual sync                             |
| `PlacementSettingsCard` | Video placement configuration with visual previews        |
| `AdvancedSettingsCard`  | Debug mode and data management                            |
| `ProductSkeleton`       | Product page preview skeleton for placement visualization |
| `VideoPlaceholder`      | Video player placeholder display                          |
| `types.ts`              | Settings-specific TypeScript interfaces                   |

### Loading Components (2 components)

| Component      | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| `PageSkeleton` | Full-page skeleton loader with variants (default, logs) |

---

## 5. State Management (`src/store/`)

### wpabStore.tsx — Global State via React Context

**Data Source**: PHP passes initial data via `wp_localize_script()` as `tubebay_Localize` global.

**Store Shape** (`BoilerplateStore`):

```typescript
{
  version: string; // Plugin version
  root_id: string; // 'tubebay'
  nonce: string; // WP REST nonce
  store: string; // Store name
  rest_url: string; // REST API base URL
  pluginData: PluginData; // Branding info
  wpSettings: WpSettings; // Date/time formats
  plugin_settings: PluginSettings; // All plugin settings
  products_url: string; // Admin products URL
}
```

**Actions**:

- `updateStore(key, value)` — Update any top-level store key
- `updateSettings(key, value)` — Update a specific plugin setting

**Features**:

- API fetch middleware setup (nonce + root URL)
- Server time synchronization (updates every 60 seconds)

### Toast System (`store/toast/use-toast.tsx`)

- Toast notification provider with add/remove capabilities
- Supports `info`, `success`, `error` variants
- Auto-dismiss with configurable duration

---

## 6. Custom Hooks (`src/hooks/`)

### useYouTubeActions.tsx

Shared hook for YouTube-related actions:

- `handleTestConnection(apiKey, channelId)` — Tests connection
- `handleSyncLibrary()` — Triggers library sync
- Manages loading/error states

---

## 7. Utilities (`src/utils/`)

| File                 | Purpose                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `types.ts`           | Core TypeScript interfaces (`PluginData`, `WpSettings`, `PluginSettings`, `BoilerplateStore`, `SyncPlacementSettings`) |
| `Dates.ts`           | Date formatting utilities, `timeDiff()` for relative time display                                                      |
| `apiFetch.ts`        | Wrapper around `@wordpress/api-fetch`                                                                                  |
| `getBool.ts`         | Safely converts values to boolean                                                                                      |
| `status_helpers.tsx` | Status badge rendering helpers                                                                                         |
| `useMenuSync.ts`     | Syncs React Router location with WordPress admin sidebar menu highlighting                                             |

---

## 8. Styling (`src/styles/`)

### index.scss

- Imports TailwindCSS (`@tailwind base/components/utilities`)
- Custom TailwindCSS component layer with `tubebay-` prefixed utilities:
  - Color tokens: primary `#3858e9`, secondary `#f1f5f9`
  - Typography scale: `tubebay-t-1` through `tubebay-t-6`
  - Layout utilities: max-width, padding, gaps
- WordPress admin overrides (removes padding, hides WP notices and footer)
- Skeleton shimmer animation
- Toast animations (slide-in/out with variants)
- Modal and tooltip animations
- Responsive breakpoints for modals

### TailwindCSS Configuration

- Prefix: `tubebay-` (prevents conflicts with WordPress admin CSS)
- Scoped to `src/**/*.{js,ts,jsx,tsx}` files only

---

## 9. Data Flow: PHP → React → YouTube API

```
PHP Activation                  React SPA Boot
      │                              │
      ▼                              ▼
Settings::get_all()         tubebay_Localize (global)
      │                              │
      └── wp_localize_script() ──────┘
                                     │
                                     ▼
                              wpabStore (Context)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ChannelLibrary    Settings        Onboarding
                    │                │                │
                    ▼                ▼                ▼
              apiFetch()         apiFetch()      apiFetch()
              GET /videos        POST /settings  POST /test-connection
                    │                │                │
                    ▼                ▼                ▼
            YouTubeController  SettingsController  YouTubeController
                    │                │                │
                    ▼                │                ▼
              Channel.php           │          Channel.php
                    │                │                │
                    ▼                │                ▼
            YouTube API v3          │          YouTube API v3
            (playlistItems/         │          (channels endpoint)
             search)                │
                    │                │
                    ▼                ▼
              WP Transient     wp_options table
              (video cache)    (individual settings)
```

# TubeBay — Build, Deployment, Security & User Guide

## 1. Build System & Tooling

### Technology Stack

| Tool               | Version | Purpose                          |
| ------------------ | ------- | -------------------------------- |
| Webpack            | 5.x     | Module bundler                   |
| @wordpress/scripts | 30.x    | WordPress-specific build tooling |
| TypeScript         | 5.x     | Type-safe JavaScript             |
| TailwindCSS        | 3.x     | Utility-first CSS framework      |
| Sass               | 1.x     | CSS preprocessor                 |
| PostCSS            | 8.x     | CSS transformations              |
| Babel              | 7.x     | JavaScript transpilation         |
| Composer           | -       | PHP dependency management        |
| PHP                | 7.4+    | Backend language                 |

### npm Scripts

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run start`        | Development mode with hot reloading                 |
| `npm run build`        | Production build (modern, uses WP's React/ReactDOM) |
| `npm run build:legacy` | Legacy build (bundles React for standalone use)     |
| `npm run makepot`      | Generate translation `.pot` file                    |
| `npm run make-json`    | Generate JSON translation files                     |

### Webpack Configuration (`webpack.config.js`)

Two build modes:

**Modern Mode** (default):

- Extends `@wordpress/scripts` defaults
- Externalizes React/ReactDOM (uses WordPress's bundled versions)
- Entry: `src/index.tsx` → `build/admin.js`

**Legacy Mode** (`BUILD_TARGET=legacy`):

- Standalone build that bundles React
- Uses Babel with `@wordpress/babel-preset-default`
- Outputs `build/admin-legacy.js`
- Separate SCSS processing pipeline

### Build Script (`build.sh`)

Production build process:

1. `npm run build` (modern)
2. `npm run build:legacy` (standalone)
3. Renames license files
4. Prepends copyright headers with version and source code URLs to both JS files

### Output Files

```
build/
├── admin.js           ← Modern build (externalized React)
├── admin-legacy.js    ← Legacy build (bundled React)
├── admin.css          ← Compiled styles
├── admin.asset.php    ← Dependency manifest
└── admin.js.LICENSE.txt ← Third-party licenses
```

---

## 2. Static Assets (`assets/`)

### CSS Files

| File                            | Loads On            | Purpose                                           |
| ------------------------------- | ------------------- | ------------------------------------------------- |
| `css/public.css`                | All frontend pages  | Video wrapper styles, responsive iframe container |
| `css/admin-menu.css`            | All admin pages     | Custom admin menu icon styling                    |
| `css/admin/product-metabox.css` | Product edit screen | Metabox modal, video card, toggle styles          |

### JavaScript Files

| File                          | Loads On            | Purpose                                                                      |
| ----------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| `js/public.js`                | All frontend pages  | **Video Façade** — click handler that replaces thumbnail with YouTube iframe |
| `js/admin/product-metabox.js` | Product edit screen | Modal video browser, search, sort, selection logic                           |

### Images

| File              | Purpose                 |
| ----------------- | ----------------------- |
| `img/icon.svg`    | Admin menu icon (small) |
| `img/TubeBay.svg` | Full logo (SVG)         |
| `img/TubeBay.png` | Full logo (PNG)         |

---

## 3. Security Measures

### Authentication & Authorization

- **Capability-based access**: Custom `manage_tubebay` capability (assigned to admin role)
- **Nonce verification**: Every REST API request validated via `X-WP-Nonce` header
- **Both permissions check**: Capability + nonce must pass for every API call

### Input Security

- All user inputs sanitized: `sanitize_text_field()`, `sanitize_textarea_field()`, `esc_url_raw()`
- All outputs escaped: `esc_html()`, `esc_attr()`, `esc_url()`
- Nonce fields on all forms: `wp_nonce_field()` + `wp_verify_nonce()`

### File Security

- Every directory contains `index.php` (prevents directory listing)
- Direct file access blocked: `if (!defined('ABSPATH')) exit;`
- Log directory protected with `.htaccess` (denies direct access to .log files)

### Data Security

- API keys stored in `wp_options` (database)
- No sensitive data exposed to frontend (API keys not passed to JavaScript)
- Transient caching prevents excessive external API calls

---

## 4. WordPress Integration Points

### Hooks Registered

**Actions**:
| Hook | Handler | Purpose |
|---|---|---|
| `plugins_loaded` | `Plugin::run()` | Execute all registered hooks |
| `rest_api_init` | `*Controller::register_routes()` | Register REST API endpoints |
| `admin_menu` | `Admin::add_admin_menu()` | Register admin menu pages |
| `admin_enqueue_scripts` | `Admin::enqueue_resources()` | Load admin CSS/JS |
| `admin_enqueue_scripts` | `ProductMetabox::enqueue_assets()` | Load metabox CSS/JS |
| `wp_enqueue_scripts` | `Plugin::enqueue_public_styles()` | Load frontend CSS/JS |
| `add_meta_boxes_product` | `ProductMetabox::add_metabox()` | Add product metabox |
| `save_post_product` | `ProductMetabox::save_metabox_data()` | Save product video data |
| `init` | `Cron::check_and_schedule()` | Schedule/unschedule cron |
| `tubebay_daily_sync_event` | `Cron::do_daily_sync()` | Execute daily sync |

**Filters**:
| Hook | Handler | Purpose |
|---|---|---|
| `all_plugins` | `Plugin::change_plugin_display_name()` | Customize plugin name in plugins list |
| `admin_body_class` | `Admin::add_has_sticky_header()` | Add CSS class for sticky header |
| `plugin_action_links_*` | `Admin::add_plugin_action_links()` | Add "Settings" link |
| `woocommerce_single_product_image_thumbnail_html` | `WooCommerce::render_video_in_gallery()` | Inject video into gallery |

### WordPress Options Used

All stored with prefix `tubebay_` as individual rows in `wp_options` table.
(See Settings table in summary03.md for complete list)

### Post Meta Keys Used

| Meta Key                    | Stored On | Purpose                       |
| --------------------------- | --------- | ----------------------------- |
| `_tubebay_video_id`         | Products  | Assigned YouTube video ID     |
| `_tubebay_video_title`      | Products  | Video title for display       |
| `_tubebay_video_thumbnail`  | Products  | Video thumbnail URL           |
| `_tubebay_display_location` | Products  | Video placement position      |
| `_tubebay_muted_autoplay`   | Products  | Per-product autoplay override |

### Transient Keys

| Key Pattern                         | TTL                        | Purpose              |
| ----------------------------------- | -------------------------- | -------------------- |
| `tubebay_videos_cache_{channel_id}` | Configurable (default 12h) | Cached video library |

### Cron Events

| Event Name                 | Schedule         | Purpose                            |
| -------------------------- | ---------------- | ---------------------------------- |
| `tubebay_daily_sync_event` | Daily at 3:00 AM | Refresh video library from YouTube |

---

## 5. User Guide & Workflows

### First-Time Setup (Onboarding)

1. Install and activate TubeBay plugin
2. Go to **TubeBay** menu in WordPress admin
3. The Onboarding wizard will launch automatically
4. **Step 1: Connect YouTube**
   - Enter your Google Cloud API Key
   - Enter your YouTube Channel ID
   - Click "Test Connection" → see green confirmation
   - Click "Connect & Continue"
5. **Step 2: Configure Settings**
   - Choose video placement (e.g., "Add to Gallery Last")
   - Set cache duration, auto-sync preference
   - Toggle muted autoplay and player controls
   - Click "Save & Continue"
6. **Step 3: Done!**
   - Click "Go to Channel Library" to see your videos

### Assigning a Video to a Product

1. Go to **Products → Edit** any WooCommerce product
2. Find the **"TubeBay Video"** metabox on the right sidebar
3. Click **"Select Video from Library"**
4. Browse / search / sort your video library in the modal
5. Click on a video to select it
6. Optionally toggle **Muted Autoplay** for this specific product
7. Click **"Update"** to save the product

### Managing Settings

Navigate to **TubeBay → Settings**:

- **Connection**: Change API key/channel, test connection, view channel info
- **Sync**: Toggle auto-sync, adjust cache duration, manual sync
- **Placement**: Choose where videos appear on product pages (visual preview)
- **Advanced**: Enable debug logs, manage data deletion

### Using the Shortcode

Embed a TubeBay video anywhere on your site:

```
[tubebay_video id="dQw4w9WgXcQ"]
[tubebay_video id="dQw4w9WgXcQ" autoplay="1" controls="1"]
[tubebay_video id="dQw4w9WgXcQ" width="800" height="450"]
```

### Viewing Debug Logs

1. Enable **Debug Mode** in Settings → Advanced
2. Go to **TubeBay → Settings** and click on the Log Viewer (accessible via URL hash `#/logs`)
3. View, refresh, or clear logs

---

## 6. Internationalization (i18n)

- All user-facing strings wrapped in `__()`, `esc_html__()`, `esc_attr__()`, `esc_html_e()`, `esc_attr_e()`
- Text domain: `tubebay`
- Translation files location: `languages/`
- Supports both PHP and JavaScript translations
- POT file generation: `npm run makepot`
- React uses `@wordpress/i18n` for frontend translations

---

## 7. Packaging & Distribution

### package.sh — ZIP Packaging

Creates a distribution-ready ZIP file (`tubebay.zip`) excluding:

- Development files (`src/`, `node_modules/`, `.git/`, etc.)
- Build configuration files
- Only includes compiled `build/` directory and PHP source

---

## 8. Key Dependencies

### PHP (Composer)

```json
{
  "autoload": {
    "psr-4": {
      "TubeBay\\": "app/"
    }
  }
}
```

### JavaScript (npm)

**Runtime Dependencies**:
| Package | Purpose |
|---|---|
| `@wordpress/api-fetch` | REST API client with nonce/URL middleware |
| `@wordpress/date` | Date formatting aligned with WP settings |
| `@wordpress/i18n` | Internationalization |
| `@wordpress/icons` | WordPress icon library |
| `react-router-dom` | Client-side routing |
| `lucide-react` | Additional icon set |

**Dev Dependencies**:
| Package | Purpose |
|---|---|
| `@wordpress/scripts` | Build toolchain (webpack, babel, etc.) |
| `tailwindcss` | Utility-first CSS |
| `sass` / `sass-loader` | SCSS compilation |
| `typescript` | Type checking |
| `cross-env` | Cross-platform env variables |

---

## 9. Performance Optimizations

| Optimization                   | Detail                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **Video Façade**               | YouTube iframe only loads on user interaction (click), not on page load       |
| **Transient Caching**          | YouTube API responses cached for configurable hours (default 12)              |
| **Conditional Script Loading** | Admin scripts only on TubeBay pages and product edit screens                  |
| **No Full React Bundle**       | Modern build externalizes React (uses WordPress's copies)                     |
| **Lazy API Calls**             | Videos fetched from cache by default; YouTube Search API only for search/sort |
| **Responsive Embeds**          | 16:9 aspect ratio preserved via CSS padding-bottom technique                  |

---

## 10. Known Limitations & Future Roadmap

| Item                   | Type          | Detail                                                                                             |
| ---------------------- | ------------- | -------------------------------------------------------------------------------------------------- |
| Max 50 Videos          | Current       | Playlist API fetches up to 50 videos per request (YouTube limit)                                   |
| Shop Page Videos       | Commented Out | Code exists for shop/loop page video replacement but is disabled                                   |
| Custom Database Tables | Stub          | `DbManager::create_tables()` is prepared but no tables are created yet                             |
| WooCommerce Required   | Dependency    | Plugin features assume WooCommerce is active                                                       |
| Video Tab              | Planned       | Using `woocommerce_product_tabs` for a dedicated "Video" tab is documented but not yet implemented |

# TubeBay — Supplemental Details (What Summaries 01–05 Didn't Cover)

This file fills every gap found during a file-by-file verification audit of all 117 project files.

---

## 1. Product Metabox JavaScript (`assets/js/admin/product-metabox.js`)

A **jQuery-based** script (separate from the React SPA) that powers the video selection modal on the WooCommerce product edit screen.

**How It Works**:

1. Binds to "Select Video" and "Edit Video" buttons → opens modal overlay
2. Uses **AJAX** (`$.ajax`) to call `GET /tubebay/v1/youtube/videos` with search, sort, and page_token params
3. Renders a grid of video thumbnails dynamically
4. On video click: populates hidden input fields (`_tubebay_video_id`, `_tubebay_video_title`, `_tubebay_video_thumbnail`) and updates the preview card
5. "Remove Video" clears all hidden fields and switches UI back to "Select" state
6. **Search**: Debounced 500ms input handler resets pagination and re-fetches
7. **Sort**: Change handler resets pagination and re-fetches
8. **Load More**: Pagination via `nextPageToken` from YouTube API
9. All REST requests include `X-WP-Nonce` header for security

**UX States**:

- Loading text while fetching
- Error text if no videos found
- Show/hide "Load More" button based on pagination token

---

## 2. Public Façade Script (`assets/js/public.js`)

The Video Façade is TubeBay's core performance optimization. Here's exactly what it does:

```
Page loads → Static thumbnail + SVG play button (lightweight)
User clicks → JavaScript creates <iframe> dynamically → YouTube player loads
```

**Detailed behavior**:

1. On `DOMContentLoaded`, finds all `.tubebay-video-facade` elements
2. Adds click listener to each
3. On click:
   - Prevents default (stops WooCommerce lightbox from opening)
   - Stops event propagation
   - Reads `data-video-id` attribute
   - Creates an `<iframe>` with `autoplay=1&rel=0`
   - Positions iframe absolutely (fills 16:9 container)
   - Replaces the thumbnail + play button with the iframe
   - Removes cursor pointer styling

---

## 3. Product Metabox CSS (`assets/css/admin/product-metabox.css`)

315 lines of custom CSS covering:

| Section          | What It Styles                                                                    |
| ---------------- | --------------------------------------------------------------------------------- |
| Video Card       | Thumbnail with 16:9 aspect ratio, play icon overlay, action buttons (edit/remove) |
| Toggle Switch    | Custom iOS-style toggle (`.tubebay-switch`, `.tubebay-slider`)                    |
| Setting Rows     | Horizontal flex layout with label + control                                       |
| Modal Overlay    | Full-screen dark overlay (`rgba(0,0,0,0.6)`)                                      |
| Modal Content    | Centered 800px max, 80vh max-height, rounded corners, shadow                      |
| Modal Header     | Title + close button                                                              |
| Filter Toolbar   | Search input + sort dropdown on gray background                                   |
| Video Grid       | CSS Grid with `auto-fill, minmax(200px, 1fr)`                                     |
| Video Items      | Hover effects: blue border + shadow                                               |
| Load More Footer | Centered at bottom of modal                                                       |

---

## 4. Public CSS (`assets/css/public.css`)

37 lines covering:

- `.tubebay-product-video-wrapper` — Full-width video container with margin
- `.tubebay-responsive-iframe-container` — 16:9 aspect ratio via `padding-bottom: 56.25%`
- `.tubebay-video-facade:hover .tubebay-play-bg` — YouTube red (#ff0000) play button on hover
- `.tubebay-video-facade:hover img` — Slight dimming on hover (opacity 0.85)

---

## 5. Admin Menu CSS (`assets/css/admin-menu.css`)

21 lines styling the custom admin menu icon:

- Sets TubeBay SVG icon to 20px width
- Aligns icon within WordPress admin sidebar using flexbox

---

## 6. Missing Frontend Components

### VideoGridSkeleton (`components/loading/VideoGridSkeleton.tsx`)

- Shimmer loading skeleton for the video library
- Supports **two view modes**: `grid` and `list`
- Grid mode: 4-column responsive grid
- List mode: vertical card layout with horizontal flex
- Each skeleton card has thumbnail, title, description, and action button placeholders
- Default count: 12 skeleton items

### useClickOutside Hook (`components/common/hooks/useClickOutside.ts`)

- Custom React hook to detect clicks outside a referenced element
- Used by dropdown/select/popover components to close on outside click
- Listens to both `mousedown` and `touchstart` events
- Cleans up listeners on unmount

---

## 7. Navbar Component Details (`components/common/Navbar.tsx`)

The top navigation bar (281 lines) includes:

**Structure**:

- TubeBay logo (loaded from `assets/img/TubeBay.svg`)
- Navigation links: Channel Library, Settings
- Connection status indicator (color-coded)
- Last sync time display
- External links: Documentation, Support
- Mobile hamburger menu

**Connection Status Display**:

- Uses `getConnectionStatusText()` helper
- Shows colored WiFi icon based on status
- Displays `timeDiff()` for last sync time

---

## 8. Date Utility Functions (`utils/Dates.ts`)

| Function                         | Purpose                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `formatDateTime(dateTimeString)` | Formats a date/timestamp per WordPress date + time format settings                                   |
| `formatDate(dateTimeString)`     | Formats date-only per WordPress settings                                                             |
| `timeDiff(dateTimeString)`       | Returns human-readable relative time (e.g., "3 hours ago"), falls back to absolute time if > 10 days |
| `currentDateTime()`              | Returns current server time formatted per WordPress settings                                         |

All functions respect WordPress timezone offset settings.

---

## 9. API Fetch Utility (`utils/apiFetch.ts`)

A secondary initialization file for `@wordpress/api-fetch`:

- Declares global `window.tubebay_Localize` TypeScript type
- Sets up nonce middleware and root URL middleware
- This is an alternative to the primary setup in `wpabStore.tsx`

---

## 10. Status Helpers (`utils/status_helpers.tsx`)

Provides `getConnectionStatusText()` function that maps connection status strings to human-readable display text for the Navbar and status indicators.

---

## 11. getBool Utility (`utils/getBool.ts`)

Simple utility that safely converts any value to a boolean, handling strings like `"true"`, `"false"`, `"1"`, `"0"`.

---

## 12. useMenuSync Hook (`utils/useMenuSync.ts`)

Synchronizes React Router navigation with WordPress admin sidebar menu:

- When user navigates within the React SPA, updates the highlighted menu item in the WordPress admin sidebar
- Uses `useLocation()` from React Router to detect route changes
- Manipulates WordPress admin menu DOM classes to keep sidebar highlighting in sync

---

## 13. Configuration Files Not Detailed Earlier

### PostCSS Config (`postcss.config.js`)

```js
plugins: { tailwindcss: {}, autoprefixer: {} }
```

Processes TailwindCSS utilities and adds vendor prefixes.

### TailwindCSS Config (`tailwind.config.js`)

- **Prefix**: `tubebay-` (all Tailwind classes get this prefix)
- **Content**: Scans only `src/**/*.{js,jsx,ts,tsx}`
- **No custom plugins**

### TypeScript Config (`tsconfig.json`)

- Target: ES2020
- Module: ESNext
- Strict mode enabled
- JSX: `react-jsx` (automatic runtime)
- Includes: `src/` directories (pages, components, store, utils)
- Excludes: `node_modules`, `build`, `vendor`
- `noEmit: true` (webpack handles emission)

### Composer Config (`composer.json`)

```json
{
  "name": "dipta-sdd/tubebay",
  "type": "wordpress-plugin",
  "require": { "php": ">=7.4" },
  "autoload": { "psr-4": { "TubeBay\\": "app/" } }
}
```

PSR-4 autoloading maps `TubeBay\` namespace to `app/` directory.

---

## 14. Package Script (`package.sh`)

Creates a distribution-ready `tubebay.zip` for WordPress.org submission:

**Included in ZIP**:
| What | Source |
|---|---|
| `app/` | PHP backend |
| `languages/` | Translation files |
| `assets/` | CSS, JS, images |
| `build/` | Compiled React SPA |
| `index.php` | Security file |
| `readme.txt` | WordPress.org listing |
| `uninstall.php` | Cleanup script |
| `tubebay.php` | Plugin entry point |

**Excluded from ZIP** (not included):

- `src/` (source code)
- `node_modules/`
- `vendor/`
- `package.json` / `composer.json`
- Build config files
- `.git/`

---

## 15. Git Configuration (`.gitignore`)

Ignored files/directories:
| Entry | Reason |
|---|---|
| `/node_modules` | npm dependencies |
| `/vendor` | Composer dependencies |
| `/build` | Compiled output |
| `package-lock.json` | Lock file |
| `tubebay.zip` | Distribution package |
| `routing.json`, `wp-cli.phar` | Development tools |
| `all_php_code.txt`, `todo.txt`, `todo.md` | Dev notes |
| `documentation.zip`, `campaignbay.zip` | Archives |

---

## 16. VS Code Configuration (`.vscode/`)

### settings.json

- Custom title bar and activity bar colors (`#f02a74` — brand pink/red)
- Intelephense PHP autocomplete includes WooCommerce path

### tasks.json

- Two build tasks configured:
  1. `npm: build` — Modern build (default)
  2. `npm: build:legacy` — Legacy build

---

## 17. Translation File (`languages/tubebay.pot`)

POT (Portable Object Template) file for i18n — contains all translatable strings extracted from the plugin. Generated via `npm run makepot`.

---

## 18. Development Directory (`.dev/`)

Contains a `ui/` subdirectory — likely used for UI mockups/design references during development. Currently empty or not version-controlled.

---

## 19. Security Index Files

Every directory contains an `index.php` file with content like:

```php
<?php
// Silence is golden.
```

This prevents directory listing if the web server's directory indexing is enabled. Present in: `app/`, `app/Core/`, `app/Admin/`, `app/Api/`, `app/Data/`, `app/Data/Entities/`, `app/Frontend/`, `app/Helper/`, `app/Integration/`, `assets/`, `assets/img/`, `config/`, root `index.php`.

# TubeBay — Features & Capabilities (Marketer & User Guide)

This is a complete, plain-English breakdown of everything TubeBay can do from a storefront, marketing, and user perspective. No code required.

---

## 🚀 The Core Benefit

TubeBay allows store owners to **effortlessly link their YouTube channel** to their WooCommerce store. Instead of manually pasting video links the old way, you browse a beautiful grid of your actual YouTube videos right inside the product editor, click one, and attach it to the product. The plugin automatically optimizes the video so it doesn't slow down the page.

---

## 🎨 1. Front-End Features (What the Shopper Sees)

### Lightning-Fast Video Loading ("Video Façade")

Normal YouTube embeds slow down web pages drastically. TubeBay uses a "Video Façade" technique:

- When the page loads, the shopper only sees a lightweight image thumbnail with a play button.
- The actual heavy YouTube video player **only loads if the shopper actually clicks "Play."**
- _Benefit: Faster page speeds, better SEO, higher Google PageSpeed scores._

### Smart Product Integrations

Where do the videos show up? The store owner gets to decide:

- **Replace Main Product Image**: Swaps the primary product photo for a video player.
- **Below Product Gallery**: Adds the video right below the thumbnails section.
- **Above Product Summary**: Places the video near the price and "Add to Cart" button.
- **Below Product Summary**: Places the video below the short description.
- **Anywhere (Shortcode)**: Use `[tubebay_video]` to drop the video literally anywhere (blog posts, Elementor, Gutenberg, product descriptions).

### Player Experience Customizations

- **Muted Autoplay On/Off**: Decide if videos should start playing automatically (muted) the second the user interacts with them.
- **Player Controls On/Off**: Hide the YouTube timeline bar and buttons for a cleaner, branding-focused look.

---

## 🛠️ 2. Back-End Features (What the Store Owner Sees)

### The Setup Wizard (Onboarding)

A beautiful 3-step setup guide for first-time users:

1. **Connect Account**: Choose between one-click **Google OAuth** (recommended) or manual API Key. It verifies the connection to ensure everything is working perfectly.
2. **Configure Defaults**: Pick where videos should go globally by default.
3. **Finish**: Automatically syncs your library in the background.

### Channel Library (Video Dashboard)

A dedicated page inside the WordPress admin where you can see every YouTube video you own.

- **Beautiful Grid or List Views**: Toggle between a visual gallery or a detailed list.
- **Instant Search**: Type a word and find a video instantly from your channel.
- **Smart Sorting**: Sort by "Recently Added," "Oldest," "Most Viewed," or "A-Z".
- **Previews**: Click a button to preview the video right there in a popup modal.
- **Copy Shortcode Button**: One click to copy `[tubebay_video id="XYZ"]` to paste elsewhere.

### The Product Editor Modal (WooCommerce Integration)

When editing a specific WooCommerce product, there is a new "TubeBay Video" box on the side.

- Click **"Select Video"** to open a beautiful popup overlay.
- The popup contains your entire YouTube library (searchable and sortable).
- Click a thumbnail to attach it to the product.
- **Override Global Settings**: Decide _just for this specific product_ if autoplay should be on or off.

---

## ⚙️ 3. Automation & Settings

### The Settings Dashboard

A clean, modern React-based settings panel segmented into logical cards:

- **Connection Card**: Shows if you are "Connected" (green) or "Disconnected" (red). Allows you to test or change the linked YouTube channel.
- **Placement Settings Card**: Choose the global defaults (e.g., "Replace Main Image"). Also toggles Global Autoplay and Global Player Controls.
- **Sync Card**:
  - Toggle **Auto-Sync** (automatically pulls new YouTube videos into WordPress every 24 hours).
  - Shows EXACTLY when the last sync happened (e.g., "2 hours ago").
  - "Sync Now" button to manually pull new videos immediately after you upload them to YouTube.
- **Advanced Options**:
  - **Debug Mode**: Turns on hidden developer logs for troubleshooting.
  - **Clean Uninstall**: If toggled on, deleting the plugin will completely wipe all data and settings, leaving the database perfectly clean.

### Smart Caching

TubeBay remembers the YouTube videos so it doesn't have to ask YouTube every single time someone loads a page, saving API quota and speeding up the admin dashboard. The cache refreshes automatically based on user settings (default is every 12 hours).
