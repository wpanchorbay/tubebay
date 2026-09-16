# Global Settings

TubeBay's settings live under **WooCommerce → Settings → TubeBay** (a dedicated tab, not a separate top-level menu), organized into four sub-tabs: Connection, Player, Sync, and Advanced. Changes apply store-wide unless overridden per product (Pro).

## Connection Tab
See the [Connection Guide](/guide/connection) for the full walkthrough. Fields:
- **Connection Method:** OAuth 2.0 (Recommended) or API Key (Legacy).
- OAuth: **Sign in with YouTube** button + pasted **Access Code** field.
- API Key mode: **YouTube API Key** and **YouTube Channel ID** fields.
- **Test Connection** / **Save Connection** actions, plus a **Disconnect** button once connected.

## Player Tab
Controls how videos display in the product gallery — see [Embedded Player](/features/embedded-player) for details on each field:
- **Max Videos Per Product** (default: unlimited)
- **Video Position in Gallery** — First / Last (default: First). A third option, **Mixed**, was removed in 1.3.0; see [Visual Placement](/features/placement).
- **Autoplay First Video** (default: off)
- **Show Duration Badge** (default: on)
- **Privacy/GDPR Mode** — embed via `youtube-nocookie.com` (default: off)
- **Show Player Controls** (default: on)
- **Autoplay Shortcode Videos** (default: off) — added in 1.3.0. Applies to [`[tubebay_video]`](/features/shortcodes) embeds only, not the product gallery and not the [video blocks](/features/blocks). Before 1.3.0 shortcode autoplay followed **Autoplay First Video**, so you could not have one without the other. An individual shortcode still wins over this setting with `autoplay="1"` or `autoplay="0"`. Browsers only permit autoplay when the video starts muted, so TubeBay mutes it.

## Sync Tab
- **Enable daily automatic sync** — toggles the WP-Cron job that refreshes your video library once a day.
- **Cache Duration** — how long fetched video data is cached before TubeBay re-checks YouTube: 1 Hour, 6 Hours, 12 Hours (default), 24 Hours, or 1 Week.
- **Manual Sync** — force an immediate refresh; see [Syncing Your Library](/guide/sync-library).

## Advanced Tab
- **Debug Mode** — logs detailed API errors/events to `wp-content/uploads/tubebay-logs/` for troubleshooting. Since 1.3.0 each log file carries a random 32-character suffix and a `.log.php` extension, so it cannot be found and read over the web. Earlier versions used a predictable name that was readable on servers ignoring `.htaccess`, such as nginx. API keys and OAuth tokens are stripped from every line before it is written.
- **Clean Uninstall** — delete all TubeBay settings, cached videos, and product assignments when the plugin is uninstalled (off by default; see [Uninstallation](/guide/uninstallation)).
- **Delete All Data** — immediately and permanently wipe all TubeBay settings, credentials, cached videos, and product mappings, resetting the plugin to a factory state. Requires typing `DELETE` to confirm.
- **License Settings** *(TubeBay Pro only)* — activate/deactivate your license; see [TubeBay Pro](/guide/pro) or [buy a license](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).

## Permissions
Access to TubeBay's admin pages and REST endpoints requires the `manage_tubebay` capability, which is automatically granted to the Administrator role on activation. To give Shop Managers or another role access, add that capability to their role with a roles-and-capabilities plugin.
