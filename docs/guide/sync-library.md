# Syncing Your Library

Once connected, TubeBay's primary job is to keep a local cache of your YouTube video library within WordPress. This makes searching and mapping videos extremely fast without hitting YouTube's rate limits constantly.

## Automatic Sync

When **Enable daily automatic sync** is on (the default), TubeBay refreshes your video library once a day via WP-Cron.

- **How it works:** A background WP-Cron job fetches the channel's latest uploads once per day.
- **When it runs:** 03:00 **UTC** — not 03:00 in your site's timezone. It is an off-peak slot chosen to spread API usage, and WP-Cron fires it on the first page view after that time, so on a quiet site the real run can be later.
- **What is fetched:** Your latest 50 uploads.
- **Between syncs:** Video data stays cached for the duration set by **Cache Duration** (default 12 hours) in **WooCommerce → Settings → TubeBay → Sync**.

::: tip Background Processing
The automatic sync happens in the background. If you just uploaded a video to YouTube and want to see it immediately in TubeBay, use **Manual Sync** instead of waiting for the next scheduled run.
:::

Turning **Enable daily automatic sync** off unschedules the job entirely, and deactivating TubeBay clears it too. Both are reversed by switching the setting back on.

## Manual Sync

If you need to fetch your latest videos immediately, trigger a manual sync from either the Library page or Settings:

1. Go to **Products → TubeBay Library**.
2. Click the **Sync Now** button.

![Sync Library Button](/public/img/library-sync-button.png)

3. Wait for the process to complete. You'll see a notification once the new videos are cached.

![Sync Progress and Success](/public/img/library-sync-progress.png)

You can also trigger a sync from **WooCommerce → Settings → TubeBay → Sync** using the **Manual Sync** button.

## What a Sync Stores

Besides the list of videos, a sync saves each video's details in a small database table of its own (`{prefix}tubebay_videos`): its title, description, **duration**, **upload date** and the **best thumbnail YouTube has** (full HD where it exists, falling back through smaller sizes). These details power the [video description](/features/embedded-player#video-description), the [video structured data](/features/embedded-player#video-structured-data-seo) and sharper thumbnails in the gallery.

- Videos you have already assigned to products are filled in too, even if they are older than your latest 50 uploads (up to 500 per sync). Searching your channel in the Library also records any video it shows that is not stored yet.
- After updating to 1.4.0 the table starts empty. Run **Sync Now** once so existing videos get their duration and upload date; until then they play normally but are left out of the structured data.
- The table is removed by **Delete All Data** and when the plugin is uninstalled with **Clean Uninstall** on; see [Uninstallation](/guide/uninstallation).

## Sync Status

When your channel is connected, the Library page shows how many videos it holds and when they last refreshed — for example *"21 videos available · Last sync: 2 hours ago"*.

![Dashboard Sync Status](/public/img/dashboard-sync-status.png)

If the channel is **not** connected, the Library page does not show a status panel at all: the whole page is replaced by a notice reading *"Your YouTube library is currently disconnected"* and a **Go to Setup** button. Sync problems therefore surface as a disconnected library rather than as a "failed" badge — see [Troubleshooting Sync](#troubleshooting-sync) below.

## Troubleshooting Sync

- **Quota Exceeded:** YouTube limits the number of requests per day. If you reach this limit, sync will pause until the next day.
- **Invalid Credentials:** If your OAuth token expires or your API key is deleted, the sync will fail. Reconnect your account from **WooCommerce → Settings → TubeBay → Connection**.

![Sync Error State](/public/img/library-sync-error.png)
