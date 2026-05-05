# Hooks & Filters

TubeBay provides a set of WordPress action hooks and filters, enabling developers to extend, customize, and integrate with the plugin without modifying its core source files.

::: info Since v1.0.0
All hooks listed on this page were introduced in TubeBay **1.0.0**.
:::

## Hook Naming Convention

All hooks are prefixed with `tubebay_` to avoid collisions:
- **Actions** — Use `do_action( 'tubebay_*' )`
- **Filters** — Use `apply_filters( 'tubebay_*' )`

---

## Core Hooks

### `tubebay_loaded`
Fires after all plugin components are initialized.
- **Type:** Action
- **File:** `app/Core/Plugin.php`

### `tubebay_before_sync`
Fires before the YouTube library sync process starts.
- **Type:** Action
- **File:** `app/Data/Repositories/SyncRepository.php`

### `tubebay_after_sync`
Fires after the YouTube library sync process completes.
- **Type:** Action
- **Parameters:** `$synced_count` (int), `$errors` (array)

---

## Data Filters

### `tubebay_channel_data`
Filters the channel metadata (Title, Description) before it is saved or displayed.
- **Type:** Filter
- **Parameters:** `$data` (array)

### `tubebay_video_data`
Filters individual video data before it is cached.
- **Type:** Filter
- **Parameters:** `$video_data` (array), `$video_id` (string)

---

## Frontend Player Hooks

### `tubebay_player_args`
Filters the arguments passed to the YouTube IFrame API (e.g., `autoplay`, `controls`).
- **Type:** Filter
- **Parameters:** `$args` (array), `$product_id` (int)

### `tubebay_player_html`
Filters the final HTML output of the video player.
- **Type:** Filter
- **Parameters:** `$html` (string), `$video_id` (string), `$product_id` (int)

### `tubebay_before_player` / `tubebay_after_player`
Actions to inject HTML before or after the player wrapper.
- **Type:** Action
- **Parameters:** `$product_id` (int)

---

## Admin Hooks

### `tubebay_admin_script_data`
Filters the data passed to the React admin app.
- **Type:** Filter
- **Parameters:** `$data` (array)

```php
add_filter( 'tubebay_admin_script_data', function( $data ) {
    $data['custom_config'] = 'value';
    return $data;
} );
```

### `tubebay_enqueue_admin_assets`
Action to enqueue additional scripts or styles on TubeBay admin pages.
- **Type:** Action
