# Visual Placement

TubeBay doesn't place videos in a separate section of the product page — it injects each assigned video as an extra **slide inside the WooCommerce product image gallery** itself, right alongside your product photos. "Placement" controls where those video slides sit relative to your images.

## Video Position

In **WooCommerce → Settings → TubeBay → Player**, the **Video Position in Gallery** setting controls this globally:

| Position | Description |
|-----------|-------------|
| **First (Before images)** | Video slides appear before the product images, so a video is the first thing shoppers see. |
| **Last (After images)** | Video slides appear after the product images. |

::: warning "Mixed" was removed in 1.3.0
Earlier versions offered a third option, **Mixed (Based on drag/drop order)**. It was never actually implemented — it behaved exactly like **Last**. It was removed in 1.3.0, and any product still set to it is converted to **Last (After images)** automatically when you update. Nothing changes about how those products display.
:::

An individual product can sit somewhere different from your store default. The **Video Gallery Settings** panel on each product offers its own **Video Position**, alongside Max Videos, Autoplay First Video and Show Duration Badge. Leave a field on **Inherit (Global)** and it follows the store setting.

::: tip Per-product settings
Setting these on an individual product is part of TubeBay Pro; without an active license the fields are shown greyed out, each marked with a purple **PRO** badge. [See the pricing](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).
:::

## How It Renders

Each video slide shows the video's thumbnail with a play button overlay (and, if enabled, a small **Video** label in the corner marking it as a video rather than a photo). Clicking it swaps in the actual YouTube (or self-hosted) player — the iframe itself is never loaded until a shopper clicks, which is what keeps product pages fast (TubeBay's "Video Facade" technique).

Video slides are **square**, to sit flush with WooCommerce's default square gallery images. YouTube thumbnails are widescreen, so the thumbnail is scaled up to fill that square and cropped at the left and right edges — worth knowing if a video's thumbnail has text near its edges. This affects the still image only: the player that loads on click is 16:9 as usual.

## Shortcodes (Manual Placement)
If you need to place a video somewhere other than the product gallery — a custom page, a landing page, a page-builder layout — use the [Shortcode system](/features/shortcodes) instead.

## CSS Customization
Each video slide is wrapped in a `.tubebay-video-facade` element and sits inside a `.tubebay-video-slide` gallery item. You can target these classes from your theme's custom CSS to adjust styling.

## Extending Placement
Developers can filter the gallery videos, hook before the gallery renders, or filter the final gallery HTML — see [Hooks & Filters](/developer/hooks#product-gallery-frontend-rendering-hooks) (`tubebay_gallery_videos`, `tubebay_gallery_before_videos`, `tubebay_gallery_html`).
