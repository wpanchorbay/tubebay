# Uninstallation

This page explains how to properly remove TubeBay from your WordPress site and what happens to your data.

## Deactivation vs. Uninstallation

| Action | What Happens |
|--------|-------------|
| **Deactivate** | The plugin is disabled but your mappings, settings, and synced library are preserved. You can reactivate later without losing anything. |
| **Delete (Uninstall)** | The plugin is removed from your site. Whether your settings and mappings are deleted depends on your configuration. |

## Controlling Data Removal

TubeBay gives you control over what happens when the plugin is deleted:

1. Go to **TubeBay > Settings** in your WordPress admin.
2. Select the **Advanced** tab.
3. Look for the **"Delete data on uninstall"** toggle.
4. Toggle it based on your preference:

| Setting | Effect on Uninstall |
|---------|-------------------|
| **Enabled** | All TubeBay data is permanently deleted: video mappings, connection credentials (API Keys/Tokens), and plugin settings. |
| **Disabled** (default) | Data is preserved in the database even after the plugin is deleted. Useful if you plan to reinstall later or upgrade. |

::: danger Data Deletion Is Permanent
When "Delete data on uninstall" is enabled, deleting the plugin will **permanently remove** all your product mappings and stored YouTube tokens. This cannot be undone.
:::

## What Gets Deleted

When the plugin is uninstalled with data deletion enabled, the following is removed:

- **Video Mappings:** All links between YouTube videos and WooCommerce products.
- **YouTube Credentials:** Your API Key or OAuth Refresh Token.
- **Synced Library Cache:** The local cache of your YouTube video metadata.
- **Plugin Settings:** Global configuration and player settings.

## How to Uninstall

1. Go to **Plugins** in your WordPress admin.
2. Click **Deactivate** next to TubeBay.
3. Click **Delete** to remove the plugin.
4. If "Delete data on uninstall" was enabled, all data is now removed from your database.
