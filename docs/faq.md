# FAQ

Commonly asked questions about TubeBay.

## Requirements & Compatibility

### Do I need WooCommerce?
Yes. TubeBay is a WooCommerce extension and **will not function** without WooCommerce installed and active. WordPress itself enforces this: TubeBay declares WooCommerce as a required plugin, so WordPress will not let you activate TubeBay until WooCommerce is active.

If WooCommerce is later deactivated or breaks, TubeBay steps aside quietly rather than taking your site down with it — videos simply stop rendering until WooCommerce is back.

### Which WordPress version is required?
TubeBay requires **WordPress 6.8 or later**. We recommend always running the latest stable version of WordPress.

### Which PHP version is required?
TubeBay requires **PHP 7.4 or later**. We recommend **PHP 8.0+** for the best performance and compatibility.

## Connection & Sync

### Why should I use Google OAuth?
OAuth is the recommended connection method because it is more secure and doesn't require you to create a Google Cloud project. It uses a secure token to authenticate, which you can revoke at any time.

### How often do videos sync?
By default, TubeBay syncs your video library once a day. You can trigger a manual sync at any time from the **TubeBay Library** page or the **Sync** tab in Settings.

### Will TubeBay slow down my site?
No. TubeBay is built with performance in mind. It caches your video library using WordPress transients, so fetching videos is instantaneous and doesn't involve constant remote API calls.

## Video Player

### Where can I display the video?
Videos render as extra slides inside the product's image gallery — you control whether they sit before or after your product images (see [Visual Placement](/features/placement)). Anywhere else on your site, use the [video blocks](/features/blocks) in the block editor, or [Shortcodes](/features/shortcodes) in a page builder or template.

### Can I put a video in a post or a page, not just a product?
Yes. TubeBay adds a **TubeBay Video** block and a **TubeBay Video Button** block to the block editor, plus a **Video link** option that turns selected text into a link opening the video in a popup. All of them choose from the same synced library — see [Video Blocks](/features/blocks). For page builders and templates, use a [shortcode](/features/shortcodes) instead.

### Does the player work on mobile?
Yes, the TubeBay player is fully responsive and uses the official YouTube IFrame API to ensure smooth playback across all devices.

## TubeBay Pro

### What does TubeBay Pro add?
Per-product overrides for Max Videos, Video Position, Autoplay First Video, and Show Duration Badge — so an individual product can deviate from your global Player settings — plus automatic plugin updates. See [TubeBay Pro](/guide/pro) or [buy a license](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).

### Can I attach more than one video to a product without Pro?
Yes. Attaching multiple videos (YouTube and self-hosted) to a product is a free-plugin feature. Pro only adds the ability to override the gallery *settings* — max count, position, autoplay, duration badge — on a per-product basis.

## Troubleshooting

### Videos show "Error 153" instead of playing
Update to 1.3.1 or newer. YouTube works out which site is embedding a video from the referrer header, and refuses to play when it cannot see one — so any site whose `Referrer-Policy` withholds the referrer from other domains hit this, on blocks, inline links, the product gallery and shortcodes alike. If you were on 1.3.0, clear any CDN or page cache after updating so visitors get the corrected script rather than a cached copy.

### WooCommerce lists TubeBay under "incompatible plugins"
Update to 1.3.2 or newer. WooCommerce asks every plugin whether it is compatible with High-Performance Order Storage and the block-based Cart & Checkout, and treats silence as "not checked". TubeBay never reads or writes an order, so it was always safe — it simply had not said so. From 1.3.2 it does, and the warning disappears.

### The whole site went blank after WooCommerce was deactivated
Update to 1.3.2 or newer. Earlier versions assumed WooCommerce was always present and stopped the front end with a fatal error if it vanished. TubeBay now steps aside quietly instead: videos stop rendering, the rest of your site keeps working.

## Support

### Where can I get help?
- Use the support forum on the [WordPress.org plugin page](https://wordpress.org/support/plugin/tubebay/).
- Report bugs via the [GitHub Issue Tracker](https://github.com/wpanchorbay/tubebay/issues).
- For premium support, visit our [official website](https://wpanchorbay.com/support/).
