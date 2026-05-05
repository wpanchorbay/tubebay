# Connection Guide

To start using TubeBay, you need to connect your YouTube account. This allows the plugin to read your video library and synchronize content to your WooCommerce store.

TubeBay offers two connection methods: **Google OAuth (Recommended)** and **Manual Setup (Advanced)**.

## Google OAuth 2.0 (Recommended)

This is the easiest and most secure way to connect. It uses our secure authentication proxy to link your account without requiring you to create a personalized Google Cloud project.

### Step 1: Authorize via Google

1. Navigate to **TubeBay > Settings** in your WordPress dashboard.
2. Select the **Google OAuth** tab.
3. Click the **Sign in with Google** button. This will open the TubeBay Authorization Proxy.

![Settings Tab Authorization](/public/img/connection-oauth-settings.png)

### Step 2: Grant Permissions

1. Choose the Google Account associated with your YouTube channel.
2. Grant TubeBay permission to view your YouTube account (Read-only access).
3. Confirm the authorization on the Google security screen.

![Google Authorization Screen](/public/img/connection-oauth-google.png)

### Step 3: Copy & Paste the Access Code

1. Once authorized, the proxy will display a secure **Access Code**.
2. Click the **Copy** button to copy the code to your clipboard.
3. Return to your WordPress dashboard and paste the code into the **Access Code** field.
4. Click **Connect Account**.

![Proxy Access Code Page](/public/img/connection-oauth-proxy-token.png)

---

## Manual Setup (Advanced)

If you prefer to use your own Google Cloud project and API credentials, you can use the Manual method.

### How to get your Google Cloud API Key:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "My TubeBay App").
3. Navigate to **APIs & Services > Library** and search for **YouTube Data API v3**. Click **Enable**.
4. Go to **APIs & Services > Credentials**.
5. Click **+ Create Credentials** and select **API Key**.
6. Copy the generated key. (We recommend restricting this key to your website URL for extra security).

![GCP API Key Generation](/public/img/connection-manual-api-key.png)

### How to find your YouTube Channel ID:

1. Sign in to your YouTube account.
2. Visit your [YouTube Account Advanced Settings](https://www.youtube.com/account_advanced).
3. Locate the **Channel ID** field (it starts with `UC...`).
4. Click **Copy**.

![YouTube Advanced Settings - Channel ID](/public/img/connection-manual-channel-id.png)

### Finalizing Manual Connection:

1. In WordPress, go to **TubeBay > Settings** and select the **Manual Setup** tab.
2. Enter your **YouTube Channel ID** and **Google Cloud API Key**.
3. Click **Save & Connect**.

---

## Verifying the Connection

Once connected, TubeBay will attempt to fetch your channel details. If successful, you will see your Channel Name and Profile Image in the dashboard.

![Successful Connection Dashboard](/public/img/dashboard-main.png)

::: tip Security Note
We never store your Google password. TubeBay only uses secure tokens (OAuth) or public API keys (Manual) to read your public video data.
:::
