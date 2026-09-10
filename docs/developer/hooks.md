# Hooks & Filters

TubeBay provides a set of WordPress action hooks and filters, enabling developers to extend, customize, and integrate with the plugin without modifying its core source files. TubeBay Pro itself is built entirely on these hooks — it doesn't touch the free plugin's source, it only listens to and filters these extension points.

## Hook Naming Convention

All hooks are prefixed with `tubebay_` to avoid collisions:
- **Actions** — Use `do_action( 'tubebay_*' )`
- **Filters** — Use `apply_filters( 'tubebay_*' )`

---

## Sync & Cron Hooks

### `tubebay_cron_start`
Filters the Unix timestamp of the first scheduled daily sync. By default TubeBay anchors the daily run to 03:00 (server/UTC time).
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Core/Cron.php`
- **Parameters:** `$timestamp` (int)

### `tubebay_cron_recurrence`
Filters the WP-Cron recurrence used for the automatic sync (default `'daily'`; any registered WP-Cron schedule name works, e.g. `'hourly'`, `'twicedaily'`).
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Core/Cron.php`
- **Parameters:** `$recurrence` (string)

### `tubebay_daily_sync`
Fires immediately before the scheduled daily sync runs.
- **Type:** Action · **Since:** 1.1.0
- **File:** `app/Core/Cron.php`
- **Parameters:** `$channel` (`TubeBay\Data\Entities\Channel`)

### `tubebay_daily_sync_complete`
Fires after the scheduled daily sync finishes (whether it succeeded or returned a `WP_Error`).
- **Type:** Action · **Since:** 1.1.0
- **File:** `app/Core/Cron.php`
- **Parameters:** `$videos` (`Video[]|WP_Error`), `$channel` (`Channel`)

### `tubebay_after_sync_library`
Fires after a manual/REST-triggered library sync completes successfully.
- **Type:** Action · **Since:** 1.1.0
- **File:** `app/Api/YouTubeController.php`
- **Parameters:** `$videos` (`Video[]`)

### `tubebay_synced_videos`
Filters the video array returned by the sync-library REST response before it's sent to the admin UI.
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Api/YouTubeController.php`
- **Parameters:** `$response_videos` (array), `$videos` (`Video[]`, the raw entities)

---

## Connection Hooks

### `tubebay_oauth_proxy_url`
Filters the URL of the OAuth authentication proxy TubeBay talks to when exchanging/refreshing tokens.
- **Type:** Filter
- **File:** `app/Data/Entities/Channel.php`
- **Parameters:** `$connector_url` (string) — default `https://wpanchorbay.com/oauth/index.php`

### `tubebay_youtube_api_args`
Filters the `wp_remote_get`/`wp_remote_post` args (headers, timeout, etc.) used for every YouTube Data API request.
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Data/Entities/Channel.php`
- **Parameters:** `$args` (array)

---

## Settings Hooks

### `tubebay_settings_defaults`
Filters the map of default setting values. This is the seam add-ons use to register their own option keys (e.g. TubeBay Pro adds `license_key` / `license_status` here) so they flow through `Settings::get_all()`.
- **Type:** Filter · **Since:** 1.0.4
- **File:** `app/Helper/Settings.php`
- **Parameters:** `$defaults` (array)

### `tubebay_settings_saveable_keys`
Filters the map of `{ key => sanitizer }` pairs the Settings REST endpoint will read from the request body and persist. Add-ons register additional saveable keys here.
- **Type:** Filter
- **File:** `app/Api/SettingsController.php`
- **Parameters:** `$simple_settings` (array)

### `tubebay_settings_saved`
Fires after `POST /settings` has persisted all the built-in and filtered saveable keys. Add-ons use this to persist their own keys on the same save pass.
- **Type:** Action · **Since:** 1.1.0
- **File:** `app/Api/SettingsController.php`
- **Parameters:** `$body` (array, the raw request body)

### `tubebay_uninstall_protected_options`
Filters the option names a TubeBay data wipe must **not** delete. Both wipe paths — the "Delete All Data" REST route and the free plugin's `uninstall.php` — delete every option matching `tubebay_%`, and add-on options share that prefix. Any add-on storing state under `tubebay_` should append its option names here, or the free plugin will take them with it.

Free already protects `tubebay_license_key` and `tubebay_license_status` whenever `TUBEBAY_PRO_VERSION` is defined.

```php
add_filter( 'tubebay_uninstall_protected_options', function ( $protected ) {
	$protected[] = 'tubebay_myaddon_state';
	return $protected;
} );
```

Note the filter does not run inside `uninstall.php` for an add-on that is **inactive** at that moment: WordPress loads `uninstall.php` without bootstrapping the plugin, so only hooks registered by still-active plugins are in play.
- **Type:** Filter · **Since:** 1.3.0
- **File:** `app/functions.php`, mirrored in `uninstall.php`
- **Parameters:** `$protected` (string[], fully-prefixed option names)

---

## Product Gallery & Frontend Rendering Hooks

### `tubebay_gallery_videos`
Filters the array of video entries for a product immediately before the gallery is rendered. Add-ons can add, remove, or reorder entries (e.g. inject a Vimeo/HLS entry).
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Integration/WooCommerce.php`
- **Parameters:** `$videos` (array), `$post` (`WP_Post`)

### `tubebay_gallery_before_videos`
Fires right before the gallery's video-slide loop starts rendering.
- **Type:** Action · **Since:** 1.1.0
- **File:** `app/Integration/WooCommerce.php`
- **Parameters:** `$post` (`WP_Post`)

### `tubebay_gallery_html`
Filters the final combined gallery HTML (product images + injected video slides) before it's returned to WooCommerce.
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Integration/WooCommerce.php`
- **Parameters:** `$output` (string), `$videos` (array), `$placement` (string — `'first'|'last'|'mixed'`)

### `tubebay_videos_assigned`
Fires after one or more videos are assigned to or removed from products (via the metabox save or the bulk-assign REST endpoint).
- **Type:** Action · **Since:** 1.1.0
- **File:** `app/Api/YouTubeController.php`
- **Parameters:** `$product_ids` (array), `$video_ids` (array), `$action` (string — `'assign'|'remove'`)

---

## Shortcode Hooks

### `tubebay_shortcode_atts`
Filters the parsed `[tubebay_video]` shortcode attributes before they're used to render the player.
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Frontend/VideoShortcode.php`
- **Parameters:** `$atts` (array), `$post` (`WP_Post|null`, the current post if any)

### `tubebay_video_type`
Filters the resolved video type (`'youtube'` or `'self_hosted'`) for a shortcode before rendering.
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Frontend/VideoShortcode.php`
- **Parameters:** `$video_type` (string), `$video_id` (string)

### `tubebay_video_type_unknown`
Fires when a shortcode's video type isn't `'youtube'` and doesn't resolve to a self-hosted WordPress attachment either. Add-ons hook here to handle other providers (Vimeo, HLS, etc.).
- **Type:** Action
- **File:** `app/Frontend/VideoShortcode.php`
- **Parameters:** `$video_id` (string), `$video_type` (string)

### `tubebay_shortcode_video_html`
Filters the final rendered HTML of a `[tubebay_video]` shortcode.
- **Type:** Filter · **Since:** 1.1.0
- **File:** `app/Frontend/VideoShortcode.php`
- **Parameters:** `$html` (string), `$atts` (array), `$video_id` (string)

---

## Product Metabox Hooks

### `tubebay_product_metabox_settings`
Fires inside the "Video Gallery Settings" panel of the product-edit metabox. TubeBay Pro hooks here to render the editable (non-disabled) versions of the per-product gallery override fields — Max Videos, Video Position, Autoplay First Video, Show Duration Badge.
- **Type:** Action · **Since:** 1.2.0
- **File:** `app/Admin/ProductMetabox.php`
- **Parameters:** `$post` (`WP_Post`)

### `tubebay_metabox_saved`
Fires after the metabox's video assignments have been saved on `save_post_product`. Pro hooks here to persist its per-product override fields on the same save pass.
- **Type:** Action · **Since:** 1.1.0
- **File:** `app/Admin/ProductMetabox.php`
- **Parameters:** `$post_id` (int), `$sanitized_ids` (array, the saved video entries)

---

## Admin App Hooks

### `tubebay_admin_script_{$context}` / `tubebay_admin_css_{$context}`
Filters the URL of the compiled admin JS/CSS bundle. `$context` is `'admin'` (Channel Library / Manager) or `'settings'`. This is how TubeBay Pro swaps in its own React bundle without touching the free plugin's files.
- **Type:** Filter · **Since:** 1.0.0
- **File:** `app/Admin/Admin.php`
- **Parameters:** `$script_url` / `$style_url` (string)

```php
add_filter( 'tubebay_admin_script_admin', function ( $url ) {
    return 'https://example.com/my-custom-admin.js';
} );
```

### `tubebay_admin_localize`
Filters the data array passed from PHP into the React admin app (`window.tubebay_Localize`). TubeBay Pro sets `is_pro` and `pro_version` here.
- **Type:** Filter · **Since:** 1.0.0
- **File:** `app/Admin/Admin.php`
- **Parameters:** `$localize` (array)
