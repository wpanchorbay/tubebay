# REST API

TubeBay registers its own REST API endpoints under the `tubebay/v1` namespace. All endpoints require the `manage_options` capability (WordPress administrator).

::: warning Internal API
These REST API endpoints are used internally by the TubeBay admin panel and Setup Wizard. They are not intended as a public API and may change in future versions.
:::

## Authentication

All endpoints require:
- The user to be **logged in** to WordPress
- The user to have the **`manage_options`** capability
- A valid **WordPress REST API nonce** (handled automatically by the admin panel)

## Base URL

```
/wp-json/tubebay/v1/
```

## Endpoints

### Authentication & Connection

#### Handle Connect (OAuth & Manual)

```http
POST /wp-json/tubebay/v1/auth/connect
```

Unified endpoint to connect a YouTube channel.
- **connection_method**: `oauth` or `api`
- **api_key**: (Required if method is `api`)
- **channel_id**: (Required if method is `api`)
- **refresh_token**: (Required if method is `oauth`)

---

#### Test Connection

```http
POST /wp-json/tubebay/v1/youtube/test-connection
```

Validates credentials and returns channel metadata (title, description).

---

### Library Management

#### Sync Library (Manual)

```http
GET /wp-json/tubebay/v1/youtube/sync-library
```

Triggers an immediate fetch from the YouTube API, bypassing cached transients.

---

#### Sync Status

```http
GET /wp-json/tubebay/v1/youtube/sync-library-status
```

Returns the current sync status and the timestamp of the last successful update.

---

#### Get Synced Videos

```http
GET /wp-json/tubebay/v1/youtube/videos
```

Fetch synced videos from the local cache with support for searching and sorting.
- **search**: (Optional) Filter by title
- **sort**: `date_desc`, `date_asc`, `title_asc`, `title_desc`
- **page_token**: (Optional) For pagination

---

### Mappings

#### Get Product Mappings

```http
GET /wp-json/tubebay/v1/mappings
```

Returns the full list of video-to-product mappings.

---

#### Update Mapping

```http
POST /wp-json/tubebay/v1/mappings
```

Creates or updates a mapping between a YouTube Video ID and a WooCommerce Product ID.

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

---

### Products (WooCommerce Wrapper)

#### Search Products

```http
GET /wp-json/tubebay/v1/products
```

Utility endpoint used by the mapping interface to find WooCommerce products by name or SKU.
- **search**: (Required) Search query
