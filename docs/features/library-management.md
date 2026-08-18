# Library Management

**TubeBay Library** (**Products → TubeBay Library** in the WordPress admin menu) is the central hub of TubeBay. It displays all the videos synchronized from your YouTube channel and provides the interface for mapping them to your WooCommerce products.

## The Video Grid
The Library page shows a responsive grid of your YouTube videos. Each item includes:
- **Thumbnail:** The high-quality thumbnail from YouTube.
- **Title:** The video title as it appears on YouTube.

## Searching Your Library
Use the search bar at the top of the Library to find specific videos by title. This search is performed against the local WordPress cache, making it instantaneous.

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
