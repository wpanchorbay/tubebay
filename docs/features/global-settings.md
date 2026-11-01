# Global Settings

TubeBay's settings live under **WooCommerce → Settings → TubeBay** (a dedicated tab, not a separate top-level menu), organized into four sub-tabs: **Connection**, **Video Player**, **Synchronization** and **Advanced**. Changes apply store-wide unless a product overrides them — see [Product Mapping](/features/product-mapping#video-gallery-settings).

WooCommerce's **Save changes** button stays greyed out until you actually change something, and switching sub-tabs with unsaved edits asks you to confirm first.

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
- **Show Duration Badge** (default: on) — shows a small **Video** label on each video thumbnail so shoppers can tell video slides from image slides. It is a fixed label, not the running time.
- **Privacy/GDPR Mode** — embed via `youtube-nocookie.com` (default: off)
- **Show Player Controls** (default: on)
- **Autoplay Shortcode Videos** (default: off) — added in 1.3.0. Applies to [`[tubebay_video]`](/features/shortcodes) embeds only, not the product gallery and not the [video blocks](/features/blocks). Before 1.3.0 shortcode autoplay followed **Autoplay First Video**, so you could not have one without the other. An individual shortcode still wins over this setting with `autoplay="1"` or `autoplay="0"`. Browsers only permit autoplay when the video starts muted, so TubeBay mutes it.

![The Video Player tab, showing all seven settings](/public/img/settings-autoplay-shortcode.png)

### Appearance & Behavior
A second section on the same tab, added in 1.4.0. These settings change how the video slide looks and what visitors are allowed to do with it. All of them apply to the product gallery; where they also apply to the `[tubebay_video]` shortcode it is noted.

- **Play Icon** — the play button drawn over each video thumbnail: **YouTube** (the rounded rectangle, default), **Circle** or **Triangle**.
- **Play Icon Color** (default `#212121`) — the colour of the play icon. With the default colour the **YouTube** button turns YouTube-red when a shopper hovers over it; if you pick your own colour it stays that colour.
- **Video Aspect Ratio** — the shape of the video: **16:9** (default), **1:1**, **4:3** or **9:16**. See the note below before you update.
- **Fixed Gallery Height** (default: off) — gives every slide in the gallery, videos and photos alike, the same height, so the page no longer jumps when a shopper moves between a wide video and a tall photo. By default that height is the gallery's width (a square). Developers can set an exact pixel height with the [`tubebay_gallery_fixed_height_px`](/developer/hooks#tubebay-gallery-fixed-height-px) filter. Products with no video are left alone.
- **Show Video Description** (default: off) — shows the video's YouTube description in a panel under the gallery while that video's slide is active. See [Video description](/features/embedded-player#video-description).
- **Allow Fullscreen** (default: on) — lets visitors expand the player to full screen. Turn it off to remove the fullscreen button. Also applies to the `[tubebay_video]` shortcode, for YouTube and self-hosted videos alike.
- **Allow Picture-in-Picture** (default: on) — lets visitors pop the video out into a floating window. Also applies to the `[tubebay_video]` shortcode.
- **Video Structured Data** (default: on) — adds VideoObject markup for your product videos so search engines can show them as video results. See [Video structured data (SEO)](/features/embedded-player#video-structured-data-seo).

::: warning New default shape: videos are now 16:9
Before 1.4.0 a video was stretched to fill the same square slot as your product photos. Videos are now **16:9** by default. They still sit in that square slot, so the gallery does not change size, but the video is **letterboxed**: shown at its true shape with black bars above and below. After you update, every existing gallery will look this way.

To get the old look back, set **Video Aspect Ratio** to **1:1**. The setting is store-wide.
:::

::: details Fullscreen and picture-in-picture are the player's own buttons
Both options remove the control from the player, and the browser is told not to allow the feature either. For YouTube videos this relies on YouTube honouring the embed settings TubeBay sends; for a self-hosted file it uses the browser's own `<video>` options. A visitor can still watch the video normally.
:::

### Pro Gallery Options
Below the settings above, the Player tab shows a **Pro Gallery Options** section. Without TubeBay Pro it is greyed out; with Pro active it holds thumbnail navigation, thumbnail styling, the sticky video, the Video / Images toggle and a Custom CSS box. See [TubeBay Pro features](/guide/pro#gallery-options) for what each one does.

## Sync Tab
- **Enable daily automatic sync** — toggles the WP-Cron job that refreshes your video library once a day.
- **Cache Duration** — how long fetched video data is cached before TubeBay re-checks YouTube: 1 Hour, 6 Hours, 12 Hours (default), 24 Hours, or 1 Week.
- **Manual Sync** — force an immediate refresh; see [Syncing Your Library](/guide/sync-library).

## Advanced Tab
- **Debug Mode** — logs detailed API errors/events to `wp-content/uploads/tubebay-logs/` for troubleshooting. There is no screen for reading or clearing these files: switch Debug Mode off when you have finished troubleshooting, and delete the folder's contents over FTP or your host's file manager if you want the space back. Since 1.3.0 each log file carries a random 32-character suffix and a `.log.php` extension, so it cannot be found and read over the web. Earlier versions used a predictable name that was readable on servers ignoring `.htaccess`, such as nginx. API keys and OAuth tokens are stripped from every line before it is written.
- **Clean Uninstall** — delete all TubeBay settings, cached videos, and product assignments when the plugin is uninstalled (off by default; see [Uninstallation](/guide/uninstallation)).
- **Delete All Data** — immediately and permanently wipe all TubeBay settings, credentials, cached videos, and product mappings, resetting the plugin to a factory state. Requires typing `DELETE` to confirm.
- **License Settings** *(appears with TubeBay Pro installed)* — activate or deactivate your license; see [License & Activation](/guide/pro).
- **Import / Export Settings** *(TubeBay Pro)* — save your settings to a `.json` file or load them on another site; see [Moving settings between sites](/guide/pro#import-export-settings).

## Permissions
TubeBay's admin pages — the Library, the Manager and these Settings — require the `manage_tubebay` capability, which is granted to the Administrator role automatically on activation. To give Shop Managers or another role access, add that capability to their role with a roles-and-capabilities plugin.

::: warning Deactivating TubeBay removes the capability
Deactivation strips `manage_tubebay` from **every** role that holds it, and reactivating grants it back to Administrator only. Any grant you made to Shop Manager or a custom role has to be made again after the plugin is reactivated — including after an update that deactivates and reactivates the plugin.
:::

Since 1.3.0 there is one deliberate exception. Anyone who can edit posts can browse your synced library when adding a [video block](/features/blocks), because otherwise editors and authors could not put a video in a post without being handed the keys to your YouTube connection. They see titles and thumbnails only; the connection settings, API key and OAuth tokens stay behind `manage_tubebay`, and searching the whole channel through the YouTube API stays administrator-only to protect your quota.
