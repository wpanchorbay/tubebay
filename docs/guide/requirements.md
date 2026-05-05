# Requirements

Before installing TubeBay, make sure your environment meets the following requirements.

## System Requirements

| Requirement | Minimum Version | Recommended |
|-------------|----------------|-------------|
| **WordPress** | 5.8+ | Latest stable |
| **WooCommerce** | 6.0+ | Latest stable |
| **PHP** | 7.4+ | 8.0+ |

::: warning WooCommerce Required
TubeBay is a WooCommerce extension. It **will not activate** without WooCommerce installed and active.
:::

## Connection Requirements

To sync videos from YouTube, you will need one of the following:

1. **Google Account:** For secure OAuth 2.0 connection (highest recommendation).
2. **YouTube Data API Key:** For manual connection if you prefer to use your own Google Cloud projects.

## Browser Compatibility

### Admin Dashboard
The React-based admin dashboard works best in modern evergreen browsers:
- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)

### Frontend Video Player
The embedded video players are powered by the official YouTube IFrame API. They are fully responsive and work in all modern desktop and mobile browsers.

## Hosting & SSL
- **SSL Certificate:** Highly recommended (and required for some OAuth flows) to ensure secure communication between your site and Google APIs.
- **Outbound Requests:** Your server must be able to make outbound HTTPS requests to `google.com` and `googleapis.com`.
