=== TubeBay - YouTube Product Video Gallery & Embeds for WooCommerce ===
Contributors: sankarsan, wpanchorbay, forhadkhan, arifac
Tags: woocommerce video, product video, product videos, youtube video, youtube embed
Requires at least: 6.8
Tested up to: 7.1
Requires PHP: 7.4
Requires Plugins: woocommerce
WC requires at least: 9.0
WC tested up to: 11.0
Stable tag: 1.3.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Sync a YouTube channel, assign its videos to WooCommerce products and show click-to-play product videos that lazy load the YouTube player.

== Description ==

TubeBay puts YouTube product videos on WooCommerce product pages without pasting an embed code into each product. Connect a YouTube channel once, and TubeBay syncs the channel's videos into a library inside WordPress; from the product editor you pick the videos that belong to a product, and they appear in the product video gallery at the placement you choose. The YouTube player itself is not loaded until a shopper clicks play, so product pages stay as fast as they were before the video was added.

[Product Page](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/) | [Documentation](https://docs.wpanchorbay.com/tubebay/) | [Live Demo](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#demo-section) | [Support](https://wordpress.org/support/plugin/tubebay/)

= YouTube product videos on WooCommerce product pages =

A product video is a YouTube video attached to a WooCommerce product. TubeBay stores the link between product and video in WordPress, renders a thumbnail preview in the product gallery, and hands off to YouTube only when the shopper asks to watch. Demonstrations, unboxings and review videos sit next to the product images instead of somewhere lower on the page.

= YouTube channel sync and video library =

Instead of copying URLs, TubeBay reads the connected channel through the YouTube Data API and keeps a library of video IDs, titles and thumbnails in the WordPress admin. A daily sync picks up new uploads, and a force sync refreshes the library on demand after you publish a video. Assigning a video to a product is then a search in the product editor, not a trip to YouTube.

= Click-to-play YouTube embed with lazy loading =

A standard YouTube iframe loads several hundred kilobytes of player script before anyone presses play. TubeBay uses a video facade: the page shows the thumbnail and a play button, and the real YouTube player is inserted only on click. Product pages keep their load time and layout stability, and muted autoplay and player controls can be set in the plugin settings for when the player does load.

= Product video gallery and placement =

A product can carry more than one video, and TubeBay displays them as a product video gallery. The default placement on the product page is set once in TubeBay settings, so every product with videos shows them in the same spot without per-product work. Product-to-video mappings are object cached, so the extra lookups do not add database queries on busy stores.

= Setup wizard: Google OAuth or API key =

The setup wizard connects the channel in one of two ways: a guided Google OAuth sign-in, or a manual setup with a YouTube channel ID and a Google Cloud API key. Either way the connection status panel shows whether the channel is connected and when it last synced. A debug logging toggle writes API and sync events to a local file, with API keys and OAuth tokens redacted, for troubleshooting.

= Shortcode =

A TubeBay shortcode embeds a synced video anywhere shortcode output is supported, so a product video can also appear in a page built with a page builder or in a post.

= Everything in the free version =

* YouTube channel connection through Google OAuth or a manual API key
* Synced video library in the WordPress admin
* Automatic daily sync and manual force sync
* Assign one or more YouTube videos to any WooCommerce product
* Product video gallery on the product page
* Store-wide placement setting for product videos
* Click-to-play video facade; the YouTube player loads only on click
* Muted autoplay and player control settings
* Object caching for product-to-video mappings
* Shortcode for embedding a synced video
* Connection status panel and debug logging with secrets redacted
* Uninstall cleanup and full data removal controls
* Extension hooks for add-ons

= TubeBay Pro =

TubeBay Pro adds per-product gallery override controls, so an individual product can use a placement and player behavior different from the store default, and license activation for updates and support. See the [product page](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/) for the current Pro feature list.

== Installation ==

WooCommerce must be installed and active.

1. Go to Plugins > Add New and search for "TubeBay".
2. Click Install Now, then Activate.
3. Open TubeBay in the admin sidebar, run the setup wizard, connect your YouTube channel and sync the library.
4. Edit a product and assign a video from the TubeBay box.

To install manually, download tubebay.zip, go to Plugins > Add New > Upload Plugin, upload the file and activate it.

== Frequently Asked Questions ==

= How do I add a YouTube video to a WooCommerce product page? =

Connect your channel in the setup wizard and sync the library. Then edit the product, open the TubeBay box, search the synced videos and select one. The video appears in the product gallery at the placement set in TubeBay settings.

= Can I show a product video gallery with more than one video per product? =

Yes. Since 1.1.0 a product can carry multiple videos, and they are displayed together as a gallery on the product page.

= Does the YouTube embed slow down my product pages? =

No. TubeBay lazy loads the player. The page shows a thumbnail and a play button, and the YouTube iframe is inserted only when a shopper clicks play.

= Do I need a Google API key, or can I connect with Google OAuth? =

Either works. The setup wizard offers a guided Google OAuth sign-in, and a manual option that takes a YouTube channel ID and a Google Cloud API key. TubeBay needs one of these to read your channel's video list.

= Does TubeBay sync new YouTube videos automatically? =

Yes. The library refreshes once a day. A force sync button refreshes it immediately after you upload a new video.

= Can I choose where the video appears on the product page? =

Yes. Placement, muted autoplay and player controls are set store-wide in TubeBay settings. Per-product overrides are part of TubeBay Pro.

= Is there a shortcode to embed a product video? =

Yes. The TubeBay shortcode places a synced video wherever shortcode output is supported, including page builder layouts.

= Does TubeBay require WooCommerce? =

Yes. TubeBay is a WooCommerce extension and does nothing without it.

= What are the system requirements? =

WordPress 6.8 or newer, WooCommerce 9.0 or newer, PHP 7.4 or newer, and a YouTube channel to connect.

= Is TubeBay free? =

Yes. Channel sync, video assignment, the product video gallery and the click-to-play facade are all in the free version. TubeBay Pro adds per-product override controls.

= Where can I get support? =

Use the support forum on this plugin's WordPress.org page. We aim to reply within two business days. Pro customers can also reach us at https://wpanchorbay.com/support/.

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

1. Setup wizard welcome screen: start connecting a YouTube channel to WooCommerce.
2. Setup wizard: connect the YouTube channel with Google OAuth.
3. Setup wizard: manual setup with a YouTube channel ID and Google Cloud API key.
4. Settings: connected YouTube account and connection status.
5. Channel library: synced YouTube videos ready to assign to WooCommerce products.
6. Placement and player settings: where product videos appear, muted autoplay and controls.
7. Product editor: assign a YouTube video to a WooCommerce product.
8. Product page: click-to-play YouTube product video in the WooCommerce product gallery.
9. Advanced settings: debug logging, uninstall cleanup and data removal.

== Changelog ==

= 1.3.2 =

- Fixed: "Show Player Controls" could not be turned off. Switching it off looked like it worked, but nothing was saved and controls stayed on. Stores updating from 1.2.0 were affected.
- Fixed: a player toggle could show as on while it was stored as off, and the next save switched it back on.
- Fixed: stores whose Video Position was the retired "Mixed" value could not save the Video Player settings at all. That value is now converted to "Last (After images)" once, automatically, on update.
- Fixed: the setup wizard could not be finished on those stores.
- Fixed: searching the video library found nothing unless you typed a whole word. Searching "woo" now finds your "WooCommerce ..." videos, matching your synced library as well as YouTube.
- Changed: Video Position, Video Placement and Connection Method are validated when saved, so an unrecognised value is rejected instead of stored.
- Changed: the play badge on the video blocks is drawn from the stylesheet instead of being saved into each post, so future changes to it cannot invalidate posts you have already published.
- Removed development source maps from the release build.

= 1.3.1 =

- Fixed: videos showed "Error 153 - Video player configuration error" instead of playing, on sites whose Referrer-Policy withholds the referrer from other domains. YouTube identifies the embedding site from that header and refuses to play without it. Affects the blocks, the inline link, the product gallery and the shortcode.
- Version bumped so browsers and CDNs fetch the corrected script rather than a cached copy of the previous build.

= 1.3.0 =

- New: TubeBay Video block - a click-to-play thumbnail that plays in place or opens a popup, with an optional caption.
- New: TubeBay Video Button block - a button that opens a video in a popup, styled by your theme.
- New: inline video links - select words in any paragraph, heading or list and turn them into a link that opens the video popup, straight from the block toolbar.
- New: video shape (16:9, 4:3, 1:1, 9:16), start time and popup width can be set per block and per inline link.
- New: the Video Button block can open its fallback link in a new tab and mark it nofollow.
- New: "Autoplay Shortcode Videos" setting, so shortcode autoplay no longer follows the product gallery's setting.
- Editors and authors can now choose videos from your channel when adding a block. Live channel searches stay limited to administrators to protect your YouTube API quota.
- Fixed: Privacy/GDPR mode had no effect on the product gallery, which always embedded youtube.com.
- Fixed: "Show Player Controls" had no effect anywhere, and was stored as off while the settings screen showed it on.
- Fixed: "Autoplay First Video" never actually autoplayed in the gallery.
- Fixed: the setup wizard discarded five of the player settings you chose in it.
- Fixed: the start time field rewrote what you typed, so entering 1:30 saved 30 seconds.
- Fixed: "Delete All Data" and uninstalling the free plugin removed a TubeBay Pro licence key.
- Fixed: the connection status, connection method and video position are now validated, so an unrecognised value can no longer leave a settings screen showing nothing selected.
- Removed: the "Mixed" video position. It was offered on the settings screen and in the product metabox but was never implemented, and behaved exactly like "Last". Products already set to it now show as "Last".
- Security: debug log files are given an unguessable name and can no longer be read directly over the web. They previously sat at a predictable URL under uploads and were readable on servers that ignore .htaccess, such as nginx.

= 1.2.0 =

- Security: redact secrets (API keys, OAuth tokens) from debug log output.
- Added settings and engine extension hooks for add-ons.
- Per-product gallery override controls moved to TubeBay Pro.
- Hardening and stability fixes across the REST API and sync engine.

= 1.1.0 =

- Added support for multiple videos per product and gallery display.
- Added object caching for product-to-video mappings.
- Added a "No videos found" message when a video search returns empty.
- Aligned the product metabox UI with the classic WordPress dashboard styling.

= 1.0.0 =

- Initial release.

== Upgrade Notice ==

= 1.3.2 =
Fixes "Show Player Controls" being impossible to turn off, and lets stores on the retired "Mixed" video position save their Player settings again. Recommended for everyone on 1.3.x or earlier.

= 1.3.1 =
Fixes YouTube "Error 153" on sites that restrict the referrer header. If you are on 1.3.0, clear any CDN or page cache after updating.

= 1.3.0 =
Adds Gutenberg blocks and inline video links. Fixes several Player settings that had no effect, and hardens debug log files against direct web access.

= 1.2.0 =
Security and stability update: secrets are now redacted from logs and per-product controls moved to Pro.

= 1.0.0 =
Initial release of TubeBay for WooCommerce.
