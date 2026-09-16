# Library Management

**TubeBay Library** (**Products → TubeBay Library** in the WordPress admin menu) is the central hub of TubeBay. It displays all the videos synchronized from your YouTube channel and provides the interface for mapping them to your WooCommerce products.

## The Video Grid
The Library page shows a responsive grid of your YouTube videos. Each item includes:
- **Thumbnail:** The high-quality thumbnail from YouTube.
- **Title:** The video title as it appears on YouTube.

## Searching Your Library

Use the search bar at the top of the Library to find videos by title. Since 1.3.2 the search looks in two places at once and merges the results:

1. **Your synced library**, matched on any part of a title. Typing `woo` finds "WooCommerce Setup Walkthrough". This is instant and free.
2. **Your whole YouTube channel**, through the YouTube Data API — so you can reach a video that has not been synced yet.

Results from your library come first, and anything the API returns is added after, with duplicates removed.

::: tip Why both?
YouTube's own search matches whole words only. Searching `woo` finds nothing there, even when a dozen of your videos say "WooCommerce" — which is why the library half exists. Searching your library alone would miss anything uploaded since your last sync, which is why the API half exists.
:::

The API half costs **100 units** of your daily YouTube quota per search (the free allowance is 10,000 units a day), so it is limited to administrators. Editors and authors still get the instant library search, which costs nothing. If YouTube is unreachable or your quota is spent, the search quietly falls back to library results rather than failing.

## Sync Timing & Cache
TubeBay caches synced video data for performance (default 12 hours, configurable in **WooCommerce → Settings → TubeBay → Sync**). Automatic daily sync runs when enabled. You can also run a manual sync anytime — see [Syncing Your Library](/guide/sync-library).

## Sorting

Use the sort dropdown to find the right content quickly:

- **Sort by Date (Newest):** Shows your newest YouTube uploads first (default).
- **Sort by Date (Oldest):** View your channel's earliest content.
- **Sort by Title (A-Z / Z-A):** Sort alphabetically by video title.
- **Sort by Views:** Prioritize videos with the highest view counts on YouTube.

## Bulk Product Assignment

For assigning or removing videos across many products at once, use **Products → TubeBay Manager** — a product-centric view for managing video assignments in bulk, complementary to mapping videos one product at a time from the [product edit screen](/features/product-mapping).
