# Account Connection

TubeBay supports a dual-mode authentication architecture to ensure compatibility with all types of users and environments. Whether you want a "one-click" experience or full control over your API keys, TubeBay has you covered.

## Google OAuth 2.0 (Proxy Mode)

OAuth is the gold standard for secure, limited-access authentication. TubeBay uses a secure authentication proxy to facilitate this connection.

### How it works:
1. **Request:** The plugin requests an authorization code from the TubeBay Auth Proxy.
2. **Consent:** You authorize the TubeBay application to "View your YouTube account" on Google's secure consent screen.
3. **Exchange:** Google sends an authorization code back to the proxy, which then provides you with a **Refresh Token**.
4. **Storage:** Only the Refresh Token is stored on your WordPress site.

### Advantages:
- **No Project Hassle:** You don't need to create a Google Cloud project or manage API quotas.
- **Revocable:** You can disconnect the plugin at any time from your Google account dashboard.
- **Secure:** Your permanent Google credentials are never shared with your website.

## API Key Mode (Legacy)

For power users or those who wish to maintain their own API quotas and Google Cloud projects, TubeBay allows for manual credential entry.

### Requirements:
- **Google Cloud Project:** You must have an active project.
- **YouTube Data API v3:** This specific API must be enabled.
- **API Key:** A standard unrestricted or IP-restricted API key.
- **Channel ID:** The unique ID of the YouTube channel you wish to sync.

### Comparison Table

| Feature | Google OAuth | API Key (Legacy) |
|---------|--------------|------------|
| Ease of Setup | High | Moderate |
| Security | Excellent | Good |
| Project Required | No | Yes |
| Custom Quotas | No | Yes |
| Stability | High | High |

## Disconnecting

**Disconnect**, on the Connection tab, signs your site out of YouTube. It clears the credentials — API key, channel ID, OAuth tokens — along with the channel name and thumbnail it discovered, and empties the cached copy of your video library. The page reloads into the disconnected state.

What it does **not** touch is just as important: every video already attached to a product stays attached, and your player, sync and advanced settings are all untouched. Reconnect the same channel and everything resumes; the library refills on the next sync. Switching between OAuth and API Key is the same operation — disconnect, then connect again with the other method.

::: tip Disconnecting is not uninstalling
To remove TubeBay's data rather than just its connection, see [Uninstallation](/guide/uninstallation).
:::

## Connection Status & Discovery
When you connect via either method, TubeBay automatically attempts to:
1. **Validate Credentials:** Ensure the token or key is valid.
2. **Discover Metadata:** Pull the Channel Name and Thumbnail to personalize your dashboard.
3. **Cache the Result:** Record the connection status and last-sync time, ready for the first library sync.
