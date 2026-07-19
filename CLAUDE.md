# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TubeBay is a WordPress/WooCommerce plugin (PHP + React/TypeScript admin) that connects a store's YouTube channel and displays product videos on WooCommerce product pages via a "Video Facade" (lightweight preview, YouTube iframe loads only on click). It requires WooCommerce to be active.

This is the **free** plugin. A paid add-on, `tubebaypro`, lives as a sibling plugin directory (`../tubebaypro`, also added as a working directory in this session) and follows the WPAnchorBay free/pro split pattern — gated features check `defined( 'TUBEBAY_PRO_VERSION' )` and pro registers into free's extension points (e.g. `tubebay_settings_defaults` filter) rather than free depending on pro.

## Commands

Frontend (admin React app):
```bash
npm start              # wp-scripts dev server (modern build)
npm run build           # wp-scripts production build -> build/
npm run start:legacy    # webpack dev server, legacy/babel target (BUILD_TARGET=legacy)
npm run build:legacy    # webpack production build, legacy target
```
Two build pipelines exist because of `webpack.config.js`: the default path delegates to `@wordpress/scripts`' webpack config (modern, externalizes `react`/`react-dom`), while `BUILD_TARGET=legacy` uses a hand-rolled babel-loader config for older environments. Entry points for both are `src/admin.tsx` (Channel Library / product mapping UI) and `src/settings.tsx` (Settings screens), building to `build/admin.js` and `build/settings.js` respectively, loaded via their `*.asset.php` dependency manifests.

PHP:
```bash
composer install        # installs dev deps (phpcs, etc.) — no runtime PHP deps
npm run lint             # phpcs --standard=phpcs.xml.dist
npm run lint-stat        # phpcs summary report
npm run lint-fix         # phpcbf auto-fix
```
There is no PHPUnit test suite in this repo (that lives in `tubebaypro/tests`). `phpcs.xml.dist` excludes `WooCommerce.php` from linting and skips `vendor/`, `node_modules/`, `dist/`, `build/`, `assets/`.

i18n:
```bash
npm run makepot          # regenerate languages/tubebay.pot (excludes node_modules, vendor, src)
npm run make-json        # split .po into per-locale JSON for JS i18n
```

Full release build: `./build.sh <version>` — runs `npm run build`, `npm run makepot`, then prepends a license header to `build/admin.js`.

## Architecture

### PHP bootstrap and hook registration

`tubebay.php` defines constants (`TUBEBAY_PATH`, `TUBEBAY_URL`, `TUBEBAY_VERSION`, `TUBEBAY_OPTION_NAME` = `tubebay`, etc.), loads the composer autoloader (PSR-4 `TubeBay\` → `app/`), and boots `TubeBay\Core\Plugin` on `plugins_loaded`.

Classes are **not** hardcoded into `Plugin` — they're registered through two config manifests that `Plugin::__construct()` reads and instantiates via `get_instance()`:
- `config/core.php` — core/admin/integration classes, each expected to expose a `run( $plugin )` method that registers its hooks against the shared `Loader`. Add new backend features here.
- `config/api.php` — REST controllers extending `TubeBay\Api\ApiController`, each auto-wired to `rest_api_init` via `register_routes()`.

`TubeBay\Core\Base` is an abstract singleton + hook-collector base class (some classes extend it; others just implement `get_instance()`/`run()` ad hoc — check the class before assuming inheritance). `TubeBay\Helper\Loader` is the actual hook registrar: classes call `$loader->add_action(...)`/`add_filter(...)` in their `run()` method, and `Loader::run()` (called once from `Plugin::run()`) fires all of them against WordPress. When adding a new hook, register it through the `Loader` instance passed via `$plugin->get_loader()`, not `add_action()` directly, to keep hook registration centralized and consistent with the rest of the codebase.

Key backend pieces:
- `app/Helper/Settings.php` — single source of truth for all plugin options. Every setting is a `wp_option` named `tubebay_{key}`; defaults live in the private `$defaults` array and are exposed (filterable via `tubebay_settings_defaults`, which is how pro adds keys like license info) through `Settings::get_defaults()` / `get_all()`. Prefer adding new options here over ad hoc `get_option()` calls.
- `app/Data/Entities/Channel.php`, `Video.php` — YouTube channel/video domain objects, including the OAuth proxy call to `https://wpanchorbay.com/oauth/index.php` (filterable via `tubebay_oauth_proxy_url`) and the YouTube Data API request building (`tubebay_youtube_api_args`).
- `app/Core/Cron.php` — WP-Cron daily sync scheduling (`tubebay_cron_start`, `tubebay_cron_recurrence` filters).
- `app/Integration/WooCommerce.php` — hooks video rendering into `woocommerce_single_product_image_thumbnail_html` (always active; per-product placement overrides happen inside the render, not via conditional hook registration). Excluded from phpcs.
- `app/Admin/ProductMetabox.php` — per-product video metabox on the WooCommerce product edit screen; pro-only controls are visually present but `disabled`/dimmed when `TUBEBAY_PRO_VERSION` isn't defined.
- `app/Frontend/VideoShortcode.php` — `[tubebay_video]`-style shortcode rendering, independent of the WooCommerce gallery hook.
- `app/functions.php` — global helpers, notably `tubebay_log()` (writes to `wp-content/uploads/tubebay-logs/`, gated by the `debug_enableMode` setting except for `error`-level messages) and `tubebay_redact_secrets()`, which regex-scrubs `access_token`/`refresh_token`/`api_key`/etc. from every log line before it's written — never bypass this when adding new logging call sites that might include request/response payloads.

Hook naming convention across the plugin: all custom actions/filters are prefixed `tubebay_`. See `docs/developer/hooks.md` for the documented public hook list (note: it also documents some hooks/paths, e.g. `OnboardingController`, `Data/Repositories/`, that are aspirational/pro-side and don't exist in this repo's `app/` tree — verify against actual source before relying on it).

### React admin app (`src/`)

Two independent SPA entry points share one component library:
- `src/admin.tsx` → `AdminApp.tsx` — Channel Library / video-to-product mapping (`pages/ChannelLibrary.tsx`, `Manager.tsx`, `Onboarding.tsx`).
- `src/settings.tsx` → `SettingsApp.tsx` — Settings screens (`pages/Settings.tsx`, tabs in `components/settings/tabs/`: Connection, Player, Sync, Advanced).

Shared pieces:
- `src/components/common/` — the general-purpose UI kit (Button, Input, Select, Modal, Toast, Popover, Switch, etc.) used by both apps.
- `src/components/classics/` — a parallel set of "Classic"-prefixed components (ClassicButton, ClassicTable, ClassicRepeater, …), used where a more WP-classic-admin visual style is needed rather than the SPA-native look — check which set a given page already uses before adding new UI.
- `src/store/wpabStore.tsx`, `AddonContext.tsx` — shared state (Zustand-based per `docs/developer/architecture.md`).
- `src/utils/apiFetch.ts` — wraps `@wordpress/api-fetch` for calling the `tubebay/v1` REST namespace.
- `src/hooks/useYouTubeActions.tsx` — sync/force-sync/connection actions shared across pages.

### REST API

Namespace `tubebay/v1` (`ApiController::$namespace`/`$version`). Controllers registered in `config/api.php`: `SettingsController`, `YouTubeController` (library sync, search), `ProductController`, `LogController`. All extend `ApiController` (itself extending `WP_REST_Controller`) for the singleton/`get_instance()`/`register_routes()` contract.

### Security notes specific to this codebase

- OAuth tokens, API keys, and other secrets flow through `Settings` (`access_token`, `refresh_token`, `api_key` keys) — any new code path that logs request/response data must go through `tubebay_log()` so redaction applies; don't `error_log()`/`file_put_contents()` raw payloads directly.
- The OAuth proxy URL and YouTube API request args are filterable — if modifying the OAuth or YouTube API flow, check `Channel.php` for the existing filter points before adding new ones.
