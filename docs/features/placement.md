# Visual Placement

TubeBay doesn't place videos in a separate section of the product page — it injects each assigned video as an extra **slide inside the WooCommerce product image gallery** itself, right alongside your product photos. "Placement" controls where those video slides sit relative to your images.

## Video Position

In **WooCommerce → Settings → TubeBay → Player**, the **Video Position in Gallery** setting controls this globally:

| Position | Description |
|-----------|-------------|
| **First (Before images)** | Video slides appear before the product images, so a video is the first thing shoppers see. |
| **Last (After images)** | Video slides appear after the product images. |
| **Mixed (Based on drag/drop order)** | Videos are interleaved with images according to the order you arrange in the product's TubeBay Video meta box. |

::: tip Pro: Per-Product Overrides
[TubeBay Pro](/guide/pro) lets you override **Video Position** — along with Max Videos, Autoplay First Video, and Show Duration Badge — for an individual product, instead of relying on the global setting for every product. [Buy a license](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).
:::

## How It Renders

Each video slide shows the video's thumbnail with a play button overlay (and, if enabled, a duration badge in the corner). Clicking it swaps in the actual YouTube (or self-hosted) player — the iframe itself is never loaded until a shopper clicks, which is what keeps product pages fast (TubeBay's "Video Facade" technique).

## Shortcodes (Manual Placement)
If you need to place a video somewhere other than the product gallery — a custom page, a landing page, a page-builder layout — use the [Shortcode system](/features/shortcodes) instead.

## CSS Customization
Each video slide is wrapped in a `.tubebay-video-facade` element and sits inside a `.tubebay-video-slide` gallery item. You can target these classes from your theme's custom CSS to adjust styling.

## Extending Placement
Developers can filter the gallery videos, hook before the gallery renders, or filter the final gallery HTML — see [Hooks & Filters](/developer/hooks#product-gallery-frontend-rendering-hooks) (`tubebay_gallery_videos`, `tubebay_gallery_before_videos`, `tubebay_gallery_html`).
