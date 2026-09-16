# Embedded Video Player

TubeBay uses a "Video Facade" for every video slide it adds to a product's gallery: a lightweight thumbnail with a play button loads immediately, and the real YouTube IFrame API player (or an HTML5 `<video>` element for self-hosted files) only loads once a shopper clicks it.

## Player Features
- **Responsive Design:** Automatically adjusts to fit any screen size (desktop, tablet, mobile).
- **Fast Loading:** The YouTube API is only requested when a shopper actually clicks to play, minimizing impact on initial page load.
- **Two Video Sources:** Attach either a synced YouTube video, or a self-hosted video from your WordPress media library, to any product.

## Customization Options
Configure default player behavior in **WooCommerce → Settings → TubeBay → Player**:

- **Autoplay First Video:** The first video in a product's gallery starts playing, muted, **as soon as the page loads** — the shopper does not have to click it. The remaining videos still wait for a click. Because this one video loads its player immediately, it costs the page what a normal embed would; leave it off if page weight matters more than the autoplay.
- **Show Player Controls:** Toggle the playback controls (play/pause, volume, fullscreen). This applies to self-hosted videos as well as YouTube ones — with it off, a self-hosted video has no visible way to pause.
- **Show Duration Badge:** Show a small **Video** label in the corner of each video thumbnail, marking which gallery slides are videos rather than images. It is a fixed label, not a running time.
- **Privacy/GDPR Mode:** Embed via `youtube-nocookie.com` instead of `youtube.com`, so YouTube won't set cookies for a visitor unless they actually play the video.
- **Max Videos Per Product:** Cap how many video slides appear in a single product's gallery (0 = unlimited).

A single product can depart from these defaults for four of them — **Max Videos**, **Video Position**, **Autoplay First Video** and **Show Duration Badge** — from the **Video Gallery Settings** panel on that product. **Show Player Controls** and **Privacy/GDPR Mode** are store-wide only and have no per-product setting.

::: tip Per-product settings
Setting these on an individual product is part of TubeBay Pro. [See the pricing](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).
:::

## Mobile Considerations
Most mobile browsers block autoplay to save data. Because TubeBay always shows the video thumbnail with a play overlay first, shoppers on mobile always have a clear, working call-to-action to start the video manually.
