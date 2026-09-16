# Product Mapping

Product Mapping is the core feature of TubeBay: it lets you attach one or more videos to a WooCommerce product, so shoppers see them right in the product image gallery.

## How it works

Each product can have **multiple videos** attached — a mix of synced YouTube videos and self-hosted videos from your WordPress media library. All attached videos render as extra slides in that product's image gallery (see [Visual Placement](/features/placement)).

## Mapping Videos to a Product

1. Go to **Products → All Products** and edit the product you want to add videos to. Look for the **TubeBay Video** meta box in the sidebar.

::: warning No meta box?
When no YouTube channel is connected, TubeBay hides the meta box on products that have no videos yet — there would be nothing to choose from. Connect your channel and it reappears. On a product that *does* already have videos the box stays, so you can still reorder or remove them; **Add YouTube Video** is replaced by a note pointing you at the connection settings, while **Add Self-Hosted Video** keeps working, since media-library videos do not need YouTube.
:::

![Step 1: Meta Box Location](/public/img/feature-mapping-step1.png)

2. Click **Add YouTube Video** to open a modal listing your synced library — click any thumbnail to attach it. Or click **Add Self-Hosted Video** to attach a video already in your WordPress media library.

![Step 2: Video Selection Modal](/public/img/feature-mapping-step2.png)

3. Attached videos appear as a sortable list in the meta box. Drag to reorder them, or remove one by clicking its remove icon.

![Step 3: Selected Video Preview](/public/img/feature-mapping-step3.png)

4. Optionally expand **Video Gallery Settings** to give this one product its own behaviour, instead of following your store defaults.
5. Click **Update** or **Publish** in the WooCommerce "Publish" box to save your changes.

### Video Gallery Settings

Four fields, each of which falls back to the store default from the [Player tab](/features/global-settings#player-tab) when left on **Inherit (Global)**:

| Field | What it controls for this product |
|-------|-----------------------------------|
| **Max Videos** | How many video slides this product shows. Choose 1–10, or **Unlimited**. |
| **Video Position** | Whether this product's videos come First (before its images) or Last (after them). |
| **Autoplay First Video** | Whether this product's first video starts playing, muted, when the page loads. |
| **Show Duration Badge** | Whether the small **Video** label appears on this product's video thumbnails. |

**Show Player Controls** and **Privacy/GDPR Mode** are store-wide only — they have no per-product field.

![Video Gallery Settings in the product meta box](/public/img/pro-metabox-overrides-active.png)

::: tip Per-product settings
Setting these on an individual product is part of TubeBay Pro. Without an active license the four fields are still shown, greyed out and each marked with a purple **PRO** badge; the screenshot above shows them as they look once Pro is active. [See the pricing](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).
:::

![Step 4: Save Mapping](/public/img/feature-mapping-step4.png)

## Bulk Assignment

To attach the same video or videos to many products at once, use **Products → TubeBay Manager** instead of editing products one at a time — see [The Manager](/features/library-management#assigning-videos-to-many-products). Bulk assignment **adds** to whatever a product already has, and skips any video already attached, so running it twice is harmless. Removing a video is done one product at a time, from that product's **TubeBay Video** panel.

---

## Technical Details

- **Storage:** Attached videos are stored as product meta (`_tubebay_video_ids`, a JSON array), so one product can hold multiple videos of mixed type. The same YouTube video can be attached to multiple products.
- **Performance:** TubeBay uses cached queries to fetch mapped videos, keeping product pages fast.
- **Auto-Cleanup:** If you delete a product in WooCommerce, its video-mapping metadata is deleted along with it.
- **Persistent Links:** An attached video stays attached until you manually remove it or delete the product.

## Video Search

The **Add YouTube Video** modal searches your synced library by title — any part of a title matches — and supports sorting by Recently Added, Oldest First, Title (A-Z/Z-A), or Most Viewed. Administrators can additionally search the whole channel through YouTube; see [Searching Your Library](/features/library-management#searching-your-library).

The **TubeBay Manager** product search searches WooCommerce products by title.
