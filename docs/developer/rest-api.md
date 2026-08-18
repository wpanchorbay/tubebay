# REST API

TubeBay registers its own REST API endpoints under the `tubebay/v1` namespace. TubeBay Pro adds a `tubebay-pro/v1` namespace for license management.

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

Search WooCommerce products by name (used by the mapping UI). Params: `search`, `page`.

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

#### Delete All Data

```http
DELETE /wp-json/tubebay/v1/settings/delete-all-data
```

Wipes every `tubebay_*` option, all TubeBay product meta, and all cached transients, then restores default settings. Used by the **Delete All Data** button on the Advanced tab.

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
