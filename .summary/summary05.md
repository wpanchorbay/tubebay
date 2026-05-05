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

### rename.sh — Plugin Renaming

Utility script to rebrand the plugin:

- Renames files, directories, class names, function prefixes
- Updates all internal references (constants, text domain, option names)
- Useful for creating white-label versions

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
