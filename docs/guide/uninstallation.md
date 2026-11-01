# Uninstallation

This page explains how to properly remove TubeBay from your WordPress site and what happens to your data.

## Deactivation vs. Uninstallation

| Action | What Happens |
|--------|-------------|
| **Deactivate** | The plugin is disabled but your mappings, settings, and synced library are preserved. You can reactivate later without losing anything. |
| **Delete (Uninstall)** | The plugin is removed from your site. Whether your settings and mappings are deleted depends on your configuration. |

## Controlling Data Removal

TubeBay gives you control over what happens when the plugin is deleted:

1. Go to **WooCommerce → Settings → TubeBay** in your WordPress admin.
2. Select the **Advanced** tab.
3. Look for the **"Clean Uninstall"** toggle ("Delete all plugin data upon uninstallation").
4. Toggle it based on your preference:

| Setting | Effect on Uninstall |
|---------|-------------------|
| **Enabled** | All TubeBay data is permanently deleted: video mappings, connection credentials (API Keys/Tokens), and plugin settings. |
| **Disabled** (default) | Data is preserved in the database even after the plugin is deleted. Useful if you plan to reinstall later or upgrade. |

::: danger Data Deletion Is Permanent
When "Clean Uninstall" is enabled, deleting the plugin will **permanently remove** all your product mappings and stored YouTube tokens. This cannot be undone.
:::

You can also wipe everything immediately, without uninstalling the plugin, using the **Delete All Data** button on the same Advanced tab — see [Global Settings](/features/global-settings#advanced-tab).

## What Gets Deleted

When the plugin is uninstalled with data deletion enabled, the following is removed:

- **Video Mappings:** All links between YouTube videos and WooCommerce products.
- **YouTube Credentials:** Your API Key or OAuth Refresh Token.
- **Synced Library Cache:** The local cache of your YouTube video metadata, including the `{prefix}tubebay_videos` database table (titles, descriptions, durations, upload dates and thumbnails) added in 1.4.0. The table is dropped, not just emptied.
- **Plugin Settings:** Global configuration and player settings.

## Removing TubeBay Pro

Each plugin cleans up only its own data, so removing one never damages the other.

Since Pro 1.0.2, deleting TubeBay Pro removes its licence key and the per-product overrides it owns — Max Videos, Video Position, Autoplay First Video and Show Duration Badge. It also removes Pro's gallery settings: thumbnail navigation, sticky video, the Video / Images toggle, thumbnail border, radius and active colour, and your Custom CSS. It respects the same **Clean Uninstall** setting: leave that off and Pro's data stays put, ready for when you reinstall.

Two things are worth knowing:

- **Removing Pro does not disturb the order of your video galleries.** That ordering belongs to TubeBay itself, and Pro leaves it alone.
- **Removing TubeBay does not delete your licence key** — as long as Pro is still *active*. TubeBay deliberately steps around the key so you never have to re-enter one you paid for.

::: warning Deactivate Pro first and the key goes
The protection depends on Pro being active, not merely installed. If you deactivate Pro and then run **Delete All Data** or delete TubeBay, the licence key is wiped with everything else. Leave Pro active until TubeBay is gone.
:::

::: tip Removing both?
Order does not matter. Each plugin removes its own data whenever it is deleted, and whichever goes second still cleans up correctly.
:::

## How to Uninstall

1. Go to **Plugins** in your WordPress admin.
2. Click **Deactivate** next to TubeBay.
3. Click **Delete** to remove the plugin.
4. If "Delete data on uninstall" was enabled, all data is now removed from your database.
