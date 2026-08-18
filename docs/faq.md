# FAQ

Commonly asked questions about TubeBay.

## Requirements & Compatibility

### Do I need WooCommerce?
Yes. TubeBay is a WooCommerce extension and **will not function** without WooCommerce installed and active. The plugin checks for WooCommerce on activation and will display a notice if it's missing.

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
Videos render as extra slides inside the product's image gallery — you control whether they sit before, after, or interleaved with your product images (see [Visual Placement](/features/placement)). For custom locations outside the gallery, use [Shortcodes](/features/shortcodes).

### Does the player work on mobile?
Yes, the TubeBay player is fully responsive and uses the official YouTube IFrame API to ensure smooth playback across all devices.

## TubeBay Pro

### What does TubeBay Pro add?
Per-product overrides for Max Videos, Video Position, Autoplay First Video, and Show Duration Badge — so an individual product can deviate from your global Player settings — plus automatic plugin updates. See [TubeBay Pro](/guide/pro) or [buy a license](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).

### Can I attach more than one video to a product without Pro?
Yes. Attaching multiple videos (YouTube and self-hosted) to a product is a free-plugin feature. Pro only adds the ability to override the gallery *settings* — max count, position, autoplay, duration badge — on a per-product basis.

## Support

### Where can I get help?
- Use the support forum on the [WordPress.org plugin page](https://wordpress.org/support/plugin/tubebay/).
- Report bugs via the [GitHub Issue Tracker](https://github.com/wpanchorbay/tubebay/issues).
- For premium support, visit our [official website](https://wpanchorbay.com/support/).
