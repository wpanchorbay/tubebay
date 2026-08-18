# Embedded Video Player

TubeBay uses a "Video Facade" for every video slide it adds to a product's gallery: a lightweight thumbnail with a play button loads immediately, and the real YouTube IFrame API player (or an HTML5 `<video>` element for self-hosted files) only loads once a shopper clicks it.

## Player Features
- **Responsive Design:** Automatically adjusts to fit any screen size (desktop, tablet, mobile).
- **Fast Loading:** The YouTube API is only requested when a shopper actually clicks to play, minimizing impact on initial page load.
- **Two Video Sources:** Attach either a synced YouTube video, or a self-hosted video from your WordPress media library, to any product.

## Customization Options
Configure default player behavior in **WooCommerce → Settings → TubeBay → Player**:

- **Autoplay First Video:** Automatically play the first video in a product's gallery, muted, once a shopper clicks into it.
- **Show Player Controls:** Toggle YouTube's playback controls (play/pause, volume, fullscreen).
- **Show Duration Badge:** Display the video length in the corner of the thumbnail.
- **Privacy/GDPR Mode:** Embed via `youtube-nocookie.com` instead of `youtube.com`, so YouTube won't set cookies for a visitor unless they actually play the video.
- **Max Videos Per Product:** Cap how many video slides appear in a single product's gallery (0 = unlimited).

::: tip Pro: Per-Product Overrides
[TubeBay Pro](/guide/pro) lets any individual product override these player settings instead of inheriting the global default — see [TubeBay Pro](/guide/pro#per-product-gallery-overrides). [Buy a license](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).
:::

## Mobile Considerations
Most mobile browsers block autoplay to save data. Because TubeBay always shows the video thumbnail with a play overlay first, shoppers on mobile always have a clear, working call-to-action to start the video manually.
