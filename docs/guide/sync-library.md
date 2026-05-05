# Syncing Your Library

Once connected, TubeBay's primary job is to keep a local cache of your YouTube video library within WordPress. This makes searching and mapping videos extremely fast without hitting YouTube's rate limits constantly.

## Automatic Sync

By default, TubeBay automatically checks for new videos every **12 hours**.

- **How it works:** A background process (WP-Cron) triggers a request to the YouTube API.
- **What is fetched:** Your latest 50 uploads.
- **Cache Duration:** You can adjust the sync frequency in **Settings > Advanced**.

::: tip Background Processing
The automatic sync happens in the background. If you just uploaded a video to YouTube and want to see it immediately in TubeBay, use the **Manual Sync** option.
:::

## Manual Sync

If you need to fetch your latest videos immediately, you can trigger a manual sync.

1. Go to **TubeBay > Library**.
2. Click the **Sync Library** button at the top right.

![Sync Library Button](/public/img/library-sync-button.png)

3. Wait for the process to complete. You will see a notification once the new videos are cached.

![Sync Progress and Success](/public/img/library-sync-progress.png)

## Sync Status

You can monitor the sync status in the **TubeBay Dashboard**.

![Dashboard Sync Status](/public/img/dashboard-sync-status.png)

- **Connected:** The last sync was successful.
- **Failed:** There was an error during the last sync attempt (usually due to an expired token or API quota).
- **Last Sync:** Displays the timestamp of the most recent successful update.

## Troubleshooting Sync

- **Quota Exceeded:** YouTube limits the number of requests per day. If you reach this limit, sync will pause until the next day.
- **Invalid Credentials:** If your OAuth token expires or your API key is deleted, the sync will fail. You will need to reconnect your account.

<!-- ![Sync Error State](/public/img/library-sync-error.png) -->
