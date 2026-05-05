# Global Settings

The **Settings** page allows you to control the overall behavior of TubeBay. Changes made here apply to all videos and product pages across your store.

## General Settings
- **Connection Method:** Toggle between Google OAuth 2.0 and Manual API Key.
- **Sync Frequency:** Set how often TubeBay should check for new videos (e.g., 12 hours, 24 hours, or Weekly).
- **Clear Cache:** Manually clear the transients that store your video library and product mappings.

## Video Library Settings
- **Videos Per Page:** Control how many videos are displayed at once in the Library tab.
- **Thumbnail Quality:** Choose between Low, Medium, and High resolution thumbnails fetched from YouTube.

## Advanced Settings
- **Uninstall Data:** Choose whether to keep or delete all TubeBay data (mappings, settings) when the plugin is deleted.
- **Debug Logging:** Enable detailed logs for troubleshooting API connection issues. Logs can be viewed at `wp-content/uploads/tubebay-logs/`.

## Permissions
By default, only users with the `manage_options` capability (Administrators) can access the TubeBay settings and library. You can use a roles and capabilities editor plugin to grant access to Shop Managers if needed.
