=== TubeBay - YouTube Product Videos for WooCommerce ===
Contributors: sankarsan, wpanchorbay, forhadkhan, arifac
Tags: woocommerce video, youtube, lazy loading, performance, product video, video gallery, youtube embed
Requires at least: 5.8
Tested up to: 6.9
Requires PHP: 7.4
Requires Plugins: woocommerce
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your YouTube channel to WooCommerce and show fast, click-to-play product videos on product pages.

== Description ==

Add YouTube videos to WooCommerce product pages with TubeBay.

TubeBay helps WooCommerce store owners assign YouTube videos to products and display those videos on product pages without manual embeds.

Product pages need more than static images. Shoppers want context before they buy. TubeBay helps you bring video closer to the buying decision while keeping your store fast and clean.

With its guided setup wizard, synced channel library, flexible placement controls, and performance-friendly Video Facade, TubeBay gives WooCommerce stores a practical way to use YouTube content where it matters most.

**Why Store Owners Use TubeBay:**

- Connect Once - Link your YouTube channel and manage videos from WordPress.
- Sync Automatically - Keep your video library updated with scheduled syncing.
- Assign Videos Faster - Browse synced videos and use them across WooCommerce products.
- Keep Pages Fast - Load a lightweight video preview first, then load YouTube only on click.
- Control Placement - Choose where videos appear on WooCommerce product pages.
- Stay Organized - Manage connection status, settings, diagnostics, and support from one admin area.

[**Product Page**](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/) | [**Official Documentation**](https://docs.wpanchorbay.com/tubebay) | [**Support**](https://wpanchorbay.com/support/) | [**Live Demo**](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#demo-section)

**Key Features:**

- WooCommerce Product Video Display - Show video content directly on product pages.
- Video Assignment - Easily assign synced YouTube videos to specific WooCommerce products.
- Flexible Placement Controls - Choose how videos appear in the WooCommerce product experience.
- Channel Library - Browse synced YouTube videos inside the WordPress admin.
- Google OAuth Connection - Connect your YouTube channel through a guided Google OAuth flow.
- Video Facade Technology - Display a lightweight preview before loading the full YouTube player.
- Player Settings - Configure muted autoplay and player controls.
- Automatic Daily Sync - Refresh your video library without manual work.
- Force Sync Option - Manually refresh videos after adding new YouTube content.
- Setup Wizard - Guide store owners through Google OAuth or manual API setup.
- Connection Status Panel - See API connection status and last sync time.
- Help and Diagnostics - Review debug logs and troubleshoot connection issues.
- Shortcode Support - Embed a TubeBay video where shortcode output is supported.
- Data Controls - Manage debug mode, uninstall cleanup, and full data removal.

**How TubeBay Works:**

- **Connect Your Channel** - Use the setup wizard to connect YouTube with Google OAuth or manual API credentials.

- **Sync Your Videos** - TubeBay imports video references, titles, and thumbnails into the WordPress admin.

- **Choose Video Placement** - Set the default product page placement from TubeBay settings.

- **Show Product Videos** - Display video previews on WooCommerce product pages so shoppers can see more before they buy.

- **Protect Page Speed** - TubeBay shows a lightweight preview first. The YouTube player loads only when a shopper clicks play.

**TubeBay Admin Experience:**

- Channel Library - View synced videos, preview items, and manage video access.
- Settings - Manage account connection, placement, player behavior, and sync controls.
- Help and Diagnostics - Check logs and confirm API connection status.
- Setup Wizard - Onboard with Google OAuth or manual setup.
- Connection Status - See connected channel information and recent sync time.

== Use Cases ==

- **Product Demonstrations** - Show how a product works directly on the product page.
- **Video Reviews** - Add social proof and product context with YouTube videos.
- **Tutorial-Based Selling** - Help shoppers understand setup, usage, and product value.
- **Creator-Led Commerce** - Connect a YouTube channel to a WooCommerce store workflow.
- **Better Product Storytelling** - Use video to make product pages more useful and convincing.
- **Performance-Friendly Embeds** - Avoid loading heavy YouTube iframes before shoppers interact.

== Installation ==

**Requirements:** WooCommerce must be installed and activated.

**From WordPress Dashboard**

1.  Navigate to Plugins > Add New.
2.  Search for "TubeBay".
3.  Click "Install Now", then "Activate".

**Manual Upload**

1.  Download tubebay.zip.
2.  Go to Plugins > Add New > Upload Plugin.
3.  Upload the zip file and click "Install Now".
4.  Click "Activate".

**Getting Started**

After activation, open TubeBay from your WordPress admin area. Start the setup wizard, connect your YouTube channel, sync your video library, and choose where videos should appear on your WooCommerce product pages.

== Frequently Asked Questions ==

= Does TubeBay require WooCommerce? =
Yes. TubeBay is built for WooCommerce product pages and requires WooCommerce to be installed and active.

= What are the system requirements? =
TubeBay requires WordPress 5.8+, WooCommerce 6.0+, and PHP 7.4+.

= Does TubeBay require a YouTube connection? =
Yes. TubeBay needs access to your YouTube video data so it can sync your video library and display selected videos in WooCommerce.

= Can I connect with Google OAuth? =
Yes. TubeBay includes a guided Google OAuth setup flow for connecting your YouTube channel.

= Can I use manual API setup? =
Yes. TubeBay also supports manual setup with a YouTube channel ID and Google Cloud API key.

= Will TubeBay slow down my product pages? =
TubeBay is built with a Video Facade approach. It shows a lightweight video preview first and loads the YouTube player only after the shopper clicks play.

= Can I control where videos appear? =
Yes. TubeBay includes placement and player settings so you can control how videos appear on product pages.

= Can TubeBay sync new videos automatically? =
Yes. TubeBay includes automatic daily sync. You can also run a manual force sync when needed.

= Does TubeBay include diagnostics? =
Yes. TubeBay includes debug logs and connection status tools to help store owners confirm that their YouTube connection is working.

= Where can I get support? =
Visit [WPAnchorBay Support](https://wpanchorbay.com/support/).

== External Services ==

TubeBay connects to external services to sync and display YouTube video data.

**YouTube Data API v3**

TubeBay uses the YouTube Data API v3 from Google to retrieve video information from the connected YouTube channel.

- What the service does: TubeBay uses the API to fetch video IDs, titles, thumbnails, and related video metadata for the store administrator.
- What data is sent: TubeBay may send the configured YouTube channel ID, API key, OAuth access data, and video lookup requests to Google.
- When data is sent: Data is sent when an administrator connects a channel, syncs the library, refreshes videos, or displays a synced video where YouTube playback is requested.
- Shopper data: TubeBay does not need shopper personal data to sync the administrator's YouTube video library.

[YouTube Terms of Service](https://www.youtube.com/t/terms)

[Google Privacy Policy](https://policies.google.com/privacy)

[Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)

**WPAnchorBay OAuth Connection Service**

TubeBay may use a WPAnchorBay connection service to help complete the Google OAuth flow and return connection data to the site administrator.

- What the service does: It helps start and complete the Google OAuth connection flow for TubeBay.
- What data is sent: It may process the site connection request, OAuth response data, and related authorization details needed to complete the connection.
- When data is sent: Data is sent only when an administrator starts or completes the OAuth connection flow.
- Shopper data: This service is used for administrator setup and does not require shopper personal data.

WPAnchorBay [Terms and Conditions](https://wpanchorbay.com/terms-and-conditions/)

WPAnchorBay [Privacy Policy](https://wpanchorbay.com/privacy-policy/)

== Screenshots ==

1.  **Frontend Product Video Preview** - Show product videos directly in the WooCommerce product gallery.
2.  **TubeBay Channel Library** - Manage and preview synced YouTube videos from the TubeBay channel library.
3.  **Placement and Player Settings** - Control video placement, autoplay, player controls, and library sync settings.
4.  **TubeBay Settings: Connected Account** - Connect a YouTube account once and manage the active TubeBay connection.
5.  **Setup Wizard: Google OAuth** - Authorize TubeBay with Google OAuth for a guided connection flow.
6.  **Setup Wizard: Manual API Setup** - Connect TubeBay manually with a YouTube channel ID and Google Cloud API key.
7.  **Welcome to TubeBay** - Start the TubeBay setup wizard from a clean onboarding screen.
8.  **Getting Started Resources** - Review setup benefits, system requirements, documentation, and support links.
9.  **Advanced Settings and Data Controls** - Manage debug mode, uninstall cleanup, and TubeBay data removal controls.
10. **Help and Diagnostics: Debug Logs** - Review diagnostic logs and confirm YouTube API connection status.

== Changelog ==

= 1.0.0 =

- Initial release.

== Upgrade Notice ==

= 1.0.0 =
Initial release of TubeBay for WooCommerce.
