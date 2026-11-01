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

### My videos have black bars above and below after updating. Why?
Since 1.4.0 videos are shown in their real **16:9** shape inside the gallery's square slot, instead of being stretched to fill it. To get the old full-square look back, set **Video Aspect Ratio** to **1:1** in **WooCommerce → Settings → TubeBay → Video Player**. See [Video shape](/features/embedded-player#video-shape).

### Does TubeBay add video structured data (SEO)? I already use Yoast or Rank Math.
Yes, on by default: a VideoObject JSON-LD block on product pages. With **Yoast Video SEO** active, TubeBay stays quiet automatically. TubeBay does not detect **Rank Math** (or other SEO plugins that print their own video markup), so if you use one of those, switch **Video Structured Data** off in the Video Player settings to avoid duplicates. Videos without a synced duration are left out until you [run a sync](/guide/sync-library). Details: [Video structured data](/features/embedded-player#video-structured-data-seo).

### Can I stop visitors going fullscreen or using picture-in-picture?
Yes. Turn off **Allow Fullscreen** or **Allow Picture-in-Picture** in the Video Player settings. They apply to the product gallery and the `[tubebay_video]` shortcode.

### Does the player work on mobile?
Yes, the TubeBay player is fully responsive and uses the official YouTube IFrame API to ensure smooth playback across all devices.

## Licensing

### How do I activate a license?
**WooCommerce → Settings → TubeBay → Advanced**, paste the key into **License Settings** and click **Activate License**. A license enables automatic updates for TubeBay Pro and entitles you to support — see [License & Activation](/guide/pro).

### Can I attach more than one video to a product?
Yes. A product can hold as many videos as you like, mixing synced YouTube videos with self-hosted ones, and you can drag them into the order you want. Cap how many actually appear with **Max Videos Per Product**.

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
