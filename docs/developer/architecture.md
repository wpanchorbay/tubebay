# Architecture

This page provides a technical overview of TubeBay's internal architecture. It is intended for developers who want to understand how the plugin is built or contribute to it.

## High-Level Architecture

TubeBay follows a **hybrid architecture**, splitting responsibilities between a React-based admin layer and a PHP backend for YouTube integration and frontend rendering.

```
┌──────────────────────────────────────────────────────────┐
│                    WordPress Core                        │
├────────────────────────┬─────────────────────────────────┤
│     Admin (React SPA)  │       Frontend / Player         │
│                        │                                 │
│  React + TypeScript    │  YouTube IFrame API             │
│  Two entry points:     │  PHP renderers + Transients     │
│   admin.tsx (Library/  │  WP-Cron sync engine            │
│    Manager/Onboarding) │                                 │
│   settings.tsx         │                                 │
│  Zustand state         │                                 │
│  React Router (Hash)   │                                 │
│                        │                                 │
│  ┌──────────────────┐  │  ┌───────────────────────────┐  │
│  │   REST API        │◄─┼──│   YouTube / Settings /   │  │
│  │  /tubebay/v1       │  │  │   Product / Log          │  │
│  └────────┬─────────┘  │  │   Controllers             │  │
│           │            │  └───────────────────────────┘  │
├───────────┼────────────┴─────────────────────────────────┤
│           ▼                                              │
│  ┌─────────────────┐  ┌──────────────────────────────┐   │
│  │  API Controllers │  │  Data Layer                  │   │
│  │  (extend         │──│  (Channel / Video entities,  │   │
│  │  ApiController)   │  │   Settings helper)           │   │
│  └─────────────────┘  └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Backend (PHP)

### Directory Structure

```
app/
├── Admin/           # wp-admin UI: menu registration, product metabox
│   ├── Admin.php            # Admin menu + React bundle enqueue
│   ├── ProductMetabox.php   # "TubeBay Video" meta box on the product edit screen
│   └── WCSettingsTab.php    # Registers the "TubeBay" tab under WooCommerce → Settings
├── Api/             # REST API controllers (tubebay/v1)
│   ├── ApiController.php       # Base controller (manage_tubebay permission checks)
│   ├── YouTubeController.php   # Library sync, search, connection test
│   ├── SettingsController.php  # Settings CRUD, connect, delete-all-data
│   ├── ProductController.php   # WooCommerce product search for the mapping UI
│   └── LogController.php       # Clears debug log files
├── Core/            # Plugin bootstrap, hook loader, activation/deactivation
│   ├── Plugin.php           # Reads config/core.php + config/api.php, boots everything
│   ├── Cron.php             # WP-Cron daily sync scheduling
│   ├── Activator.php        # Adds the manage_tubebay capability on activation
│   └── Deactivator.php
├── Data/
│   └── Entities/    # Channel and Video domain objects
│       ├── Channel.php      # YouTube Data API calls, OAuth proxy exchange
│       └── Video.php
├── Frontend/
│   └── VideoShortcode.php   # [tubebay_video] shortcode rendering
├── Integration/
│   └── WooCommerce.php      # Injects the video gallery into the product page
└── Helper/
    ├── Settings.php     # Single source of truth for all tubebay_* options
    └── Loader.php       # Central hook registrar
```

### Key Components

- **`Integration/WooCommerce`:** Hooks into `woocommerce_single_product_image_thumbnail_html` and injects each assigned video as an extra "slide" into the product's image gallery — see [Visual Placement](/features/placement) for how position is controlled.
- **`Channel` entity:** Wraps the connection credentials (API key + Channel ID, or OAuth refresh token) and talks to the YouTube Data API v3 directly, plus the WPAnchorBay OAuth proxy for token exchange.
- **`Cron`:** A WP-Cron based background process that refreshes the local video cache once per day (filterable via `tubebay_cron_start` / `tubebay_cron_recurrence`).
- **`ProductMetabox`:** Renders the "TubeBay Video" box on the product edit screen. Also renders the (Pro-gated) per-product gallery override fields, and fires `tubebay_product_metabox_settings` / `tubebay_metabox_saved` so TubeBay Pro can add its own fields without touching this file.

## Frontend (React/TypeScript)

### Tech Stack

| Technology | Purpose |
|-----------|---------|
| React + TypeScript | UI library and type-safe development |
| Zustand | State management for the library and settings |
| React Router (Hash) | Client-side routing within the admin SPA |
| `@wordpress/scripts` / Vite | Build tooling |

### Two SPA Entry Points

- **`src/admin.tsx` → `AdminApp.tsx`** — mounted on the **TubeBay Library** and **TubeBay Manager** admin pages (both live under **Products** in the WordPress admin menu). Routes (`react-router-dom` `HashRouter`):
  - `/` → `ChannelLibrary.tsx` — browse/search the synced video library.
  - `/manager` → `Manager.tsx` — product-centric bulk video assignment.
  - `/onboarding` → `Onboarding.tsx` — first-run setup wizard.
- **`src/settings.tsx` → `SettingsApp.tsx`** — mounted on the **TubeBay** tab under **WooCommerce → Settings**. Renders `Settings.tsx` with tabs: Connection, Player, Sync, Advanced.

Both entry points are enqueued by `Admin::enqueue_resources()`, which resolves the bundle URL through the filterable `tubebay_admin_script_{$context}` / `tubebay_admin_css_{$context}` hooks — the exact seam TubeBay Pro uses to swap in its own compiled bundle instead of maintaining a separate admin app.

### State Management
TubeBay uses **Zustand** for lightweight state management within the admin dashboard, seeded from PHP via the `tubebay_admin_localize` filter (`window.tubebay_Localize`). This allows for immediate UI updates when a user maps a video or triggers a sync, without waiting for page refreshes.

## Data Persistence

- **Video assignments:** Stored per-product as WooCommerce post meta (`_tubebay_video_ids`, a JSON-encoded array supporting multiple YouTube and self-hosted videos per product). A legacy single-video meta key (`_tubebay_video_id`) is kept in sync for backward compatibility.
- **Video library cache:** Cached via WordPress **Transients**, keyed per channel ID, with an expiry controlled by the **Cache Duration** setting (default 12 hours).
- **Settings:** Every setting is a single `wp_option` named `tubebay_{key}` (see `Helper/Settings.php`). Connection credentials (API key, OAuth refresh/access tokens) are stored the same way.

## Build System
The admin bundles are built with the [`@wordpress/scripts`](https://www.npmjs.com/package/@wordpress/scripts) toolchain (`npm run build`), producing `build/admin.js` / `build/settings.js` plus their `.asset.php` dependency manifests, enqueued only on TubeBay's own admin pages.
