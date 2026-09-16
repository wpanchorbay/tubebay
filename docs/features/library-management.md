# Library Management

**TubeBay Library** (**Products → TubeBay Library** in the WordPress admin menu) is the central hub of TubeBay. It displays all the videos synchronized from your YouTube channel and provides the interface for mapping them to your WooCommerce products.

## The Library Table

Your synced videos are listed in a standard WordPress list table:

| Column | What it shows |
|--------|---------------|
| Checkbox | Selects videos for a bulk action. |
| **Thumbnail** | The thumbnail YouTube holds for the video. |
| **Title** | The video title, with two row actions beneath it. |
| **Products** | **Assigned to _n_ products**, or a dash if the video is not attached to anything yet. Click the badge to expand the list — every product name links straight to its edit screen. |
| **Published** | The date the video went live on YouTube. |

Two actions sit under each title:

- **View on YouTube** opens the video in a popup **inside your dashboard**. Despite the wording you are not sent to YouTube and you do not leave the Library.
- **Copy Shortcode** copies `[tubebay_video id="…"]` for that video to your clipboard, ready to paste into any post, page or widget. It reads **Copied!** for a moment to confirm.

The toolbar above the table holds a **Bulk Actions** dropdown, the [sort dropdown](#sorting), the [search box](#searching-your-library), and **Sync Now** on the right. Below it, a bar reports how many videos are loaded and when the library last refreshed. If your channel holds more than the table currently shows, **Load More Videos** appears underneath it.

If the channel is not connected, the table is replaced by a notice and a **Go to Setup** button — see [Syncing Your Library](/guide/sync-library#sync-status).

## Searching Your Library

Use the search bar at the top of the Library to find videos by title. Since 1.3.2 the search looks in two places at once and merges the results:

1. **Your synced library**, matched on any part of a title. Typing `woo` finds "WooCommerce Setup Walkthrough". This is instant and free.
2. **Your whole YouTube channel**, through the YouTube Data API — so you can reach a video that has not been synced yet.

Results from your library come first, and anything the API returns is added after, with duplicates removed.

::: tip Why both?
YouTube's own search matches whole words only. Searching `woo` finds nothing there, even when a dozen of your videos say "WooCommerce" — which is why the library half exists. Searching your library alone would miss anything uploaded since your last sync, which is why the API half exists.
:::

The API half costs **100 units** of your daily YouTube quota per search (the free allowance is 10,000 units a day), so it is limited to administrators. Editors and authors still get the instant library search, which costs nothing. If YouTube is unreachable or your quota is spent, the search quietly falls back to library results rather than failing.

::: warning Sorting and Load more use your API quota
Only the default view — newest first, nothing typed, first page — is served from the synced cache. Changing the sort, or clicking **Load More Videos**, asks YouTube directly and costs 100 units of your daily 10,000 each time. Clicking through several sorts in a row adds up faster than you would expect.
:::

## Sync Timing & Cache
TubeBay caches synced video data for performance (default 12 hours, configurable in **WooCommerce → Settings → TubeBay → Sync**). Automatic daily sync runs when enabled. You can also run a manual sync anytime — see [Syncing Your Library](/guide/sync-library).

## Sorting

Use the sort dropdown to find the right content quickly:

- **Sort by Date (Newest):** Shows your newest YouTube uploads first (default).
- **Sort by Date (Oldest):** View your channel's earliest content.
- **Sort by Title (A-Z / Z-A):** Sort alphabetically by video title.
- **Sort by Views:** Prioritize videos with the highest view counts on YouTube.

## The Manager

**Products → TubeBay Manager** turns the Library around. Instead of listing videos and telling you which products use them, it lists your WooCommerce products and tells you how many videos each one carries.

| Column | What it shows |
|--------|---------------|
| Checkbox | Selects products for a bulk action. |
| **Image** | The product's featured image. |
| **Product Name** | Links to the product edit screen. |
| **SKU** | The product's SKU, or a dash. |
| **Assigned Videos** | How many videos the product currently has, or **None**. |
| **Actions** | **Edit Videos** — opens that product's edit screen, where the **TubeBay Video** panel lives. |

Search by product title with the box on the right, and move between pages with the arrows beside the item count.

### Assigning videos to many products

1. Tick the products you want. The header checkbox takes the whole page.
2. Choose **Assign Videos** under **Bulk Actions** and click **Apply**.
3. Pick one or more videos in the window that opens, then click **Assign Videos**.

Bulk assignment **adds** to whatever each product already holds, and skips any video that product already carries — so running it twice is harmless. There is no bulk *remove*: take a video off a product from its own **TubeBay Video** panel, as described in [Product Mapping](/features/product-mapping).

::: warning Start from the Manager, not the Library
The Library's **Bulk Actions → Assign to Products** carries your chosen videos to the Manager but selects no products, and the assignment then fails with *"No products specified."* Until that is fixed, pick the products first, from the Manager.
:::
