# REST API

TubeBay registers its own REST API endpoints under the `tubebay/v1` namespace. TubeBay Pro adds a `tubebay-pro/v1` namespace for license management and settings import / export.

::: warning Internal API
These REST API endpoints are used internally by the TubeBay admin panel and Setup Wizard. They are not intended as a public API and may change in future versions.
:::

## Authentication

All `tubebay/v1` endpoints require:
- The user to be **logged in** to WordPress
- The user to have the **`manage_tubebay`** capability (granted to the Administrator role on activation — see [Architecture](/developer/architecture#key-components); grant it to another role with a capabilities plugin if you want Shop Managers to have access)
- A valid **WordPress REST API nonce** (handled automatically by the admin panel)

## Base URL

```
/wp-json/tubebay/v1/
```

## Endpoints

### Authentication & Connection

#### Connect (OAuth & Manual)

```http
POST /wp-json/tubebay/v1/auth/connect
```

Saves connection credentials and tests them. Body:
- `connection_method` (required): `oauth` or `api`
- `api_key`, `channel_id`: required if `connection_method` is `api`
- `refresh_token`: required if `connection_method` is `oauth`

#### Start OAuth Flow

```http
GET /wp-json/tubebay/v1/youtube/oauth-connect
```

Redirects the browser to the WPAnchorBay OAuth proxy to begin the Google consent flow. This is the URL behind the **Sign in with YouTube** button on the Connection tab.

#### Test Connection

```http
POST /wp-json/tubebay/v1/youtube/test-connection
```

Validates credentials (without saving them) and returns channel metadata.

#### Disconnect

```http
DELETE /wp-json/tubebay/v1/youtube/disconnect
```

Clears the connection status and channel name (does not delete stored credentials).

---

### Library Management

#### Sync Library (Manual)

```http
GET /wp-json/tubebay/v1/youtube/sync-library
```

Triggers an immediate fetch from the YouTube API, bypassing the cached transient.

#### Sync Status

```http
GET /wp-json/tubebay/v1/youtube/sync-library-status
```

Returns the current sync status and the timestamp of the last successful update.

#### Get Synced Videos

```http
GET /wp-json/tubebay/v1/youtube/videos
```

Fetch synced videos from the local cache, with search and sort support.
- `search` (optional): filter by title
- `sort`: `date_desc`, `date_asc`, `title_asc`, `title_desc`, `view_count`
- `page_token` (optional): for pagination

---

### Product Mapping

#### Search Products

```http
GET /wp-json/tubebay/v1/products
```

Search WooCommerce products by name (used by the mapping UI). Params: `search`, `page`, `video_filter`.

`video_filter` limits the list by video assignment: `all` (default), `with` (products that have at least one video) or `without` (products that have none). Any other value is rejected with a 400. The Manager's **Without video** filter uses `without`. Each product in the response also carries an `edit_link`, and the response echoes the applied `video_filter`.

#### Bulk Assign Videos

```http
POST /wp-json/tubebay/v1/products/bulk-assign
```

Assigns or removes videos across multiple products at once (used by the Manager view).

#### Save Video Order

```http
POST /wp-json/tubebay/v1/products/video-order
```

Persists the drag-and-drop order of a product's assigned videos.

---

### Settings

#### Get All Settings

```http
GET /wp-json/tubebay/v1/settings
```

#### Update Settings

```http
POST /wp-json/tubebay/v1/settings
```

Accepts any of the [saveable setting keys](/features/global-settings). Changing connection credentials (`api_key`, `channel_id`, `refresh_token`, `connection_method`) automatically re-tests the connection. Add-ons can register additional saveable keys via the `tubebay_settings_saveable_keys` filter.

Values are validated before anything is saved, and a bad value rejects the **whole** request with HTTP 400, so a failed save never leaves half the settings changed:

- **Booleans are strict.** Every on/off setting (for example `allow_fullscreen`, `allow_pip`, `show_description`, `video_schema`, `gallery_fixed_height`) must be a real boolean or something clearly meaning one: `true`/`false`, `1`/`0`, `"true"`/`"false"`, `"on"`/`"off"`, `"yes"`/`"no"`. Anything else returns `tubebay_invalid_boolean` (*The value for "…" must be true or false.*). Strings such as `"false"` used to be stored as *on*; they are now read correctly as *off*.
- **Choice settings must be one of the allowed values:** `play_icon` (`youtube`, `circle`, `triangle`, error `tubebay_invalid_play_icon`) and `video_aspect_ratio` (`16-9`, `1-1`, `4-3`, `9-16`, error `tubebay_invalid_video_aspect_ratio`), in addition to `connection_method` and `video_position`.
- `play_icon_color` must be a valid hex colour; an invalid value is replaced by the default `#212121`.

#### Delete All Data

```http
DELETE /wp-json/tubebay/v1/settings/delete-all-data
```

Wipes every `tubebay_*` option, all TubeBay product meta, all cached transients and the `{prefix}tubebay_videos` table of synced video details (dropped), then restores default settings. Used by the **Delete All Data** button on the Advanced tab.

---

### Logs

#### Clear Debug Logs

```http
DELETE /wp-json/tubebay/v1/logs
```

Deletes all files under `wp-content/uploads/tubebay-logs/`. There is no GET endpoint for reading log contents over the API — inspect the log files directly on the filesystem.

---

## TubeBay Pro: License Endpoints

Namespace: `tubebay-pro/v1`. Same `manage_tubebay` capability requirement.

#### Activate License

```http
POST /wp-json/tubebay-pro/v1/license/activate
```

Body: `license_key`. Calls the remote license server and, on success, sets `tubebay_license_status` to `active`.

#### Deactivate License

```http
POST /wp-json/tubebay-pro/v1/license/deactivate
```

#### Export Settings

```http
GET /wp-json/tubebay-pro/v1/settings/export?include_credentials=0
```

Returns the store's settings as JSON: `plugin` (`"tubebay"`), `format` (`1`), `version`, `exported_at` and a `settings` object. With `include_credentials` left at `0` (default) the API key, OAuth tokens, channel details and connection status are left out. Debug mode, the clean-uninstall flag, onboarding state, last sync time and the license key and status are **never** exported. Each value keeps the type of its default (booleans stay booleans, numbers stay numbers) so the file can be imported again as it is. Used by **Export Settings** on the Advanced tab.

#### Import Settings

```http
POST /wp-json/tubebay-pro/v1/settings/import
```

Body: the JSON produced by the export endpoint. The file is checked in full before anything is saved, and the request fails with HTTP 400 and saves nothing if it is not valid JSON (`tubebay_import_invalid_file`), was not exported from TubeBay (`tubebay_import_wrong_plugin`), has an unsupported `format` (`tubebay_import_wrong_format`), has a `settings` entry that is not an object (`tubebay_import_invalid_settings`), contains unknown setting names (`tubebay_import_unknown_keys`), contains a value of the wrong type (`tubebay_import_invalid_types`), or contains nothing importable (`tubebay_import_nothing`). Keys that may never be transferred (see above) and keys derived from a connection (access token expiry, channel name, connection status, thumbnails) are skipped and listed under `ignored`.

The accepted values are then saved through the normal `POST /tubebay/v1/settings` endpoint, so the same validation applies and importing credentials re-tests the connection. The response lists the keys under `imported` and `ignored`.
