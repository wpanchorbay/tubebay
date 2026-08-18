# Connection Guide

To start using TubeBay, connect your YouTube channel from **WooCommerce → Settings → TubeBay → Connection**. This lets the plugin read your video library and sync content to your WooCommerce store.

TubeBay offers two connection methods: **OAuth 2.0 (Recommended)** and **API Key (Legacy)**.

## OAuth 2.0 (Recommended)

This is the easiest and most secure way to connect. It uses a secure authentication proxy so you don't need to create your own Google Cloud project.

### Step 1: Start Sign-In

1. Go to **WooCommerce → Settings → TubeBay → Connection**.
2. Select **OAuth 2.0 (Recommended)** as the Connection Method.
3. Click **Sign in with YouTube**. This opens the TubeBay Authorization Proxy in a new tab.

![Settings Tab Authorization](/public/img/connection-oauth-settings.png)

### Step 2: Grant Permissions

1. Choose the Google Account associated with your YouTube channel.
2. Grant TubeBay read-only access to your YouTube account.
3. Confirm on Google's consent screen. You'll see "WPAnchorBay" as the requesting app — that's TubeBay's publisher, and is expected.

![Google Authorization Screen](/public/img/connection-oauth-google.png)

### Step 3: Copy & Paste the Access Code

1. Once authorized, the proxy displays a secure **Access Code**.
2. Copy it.
3. Return to your WordPress dashboard and paste it into the **Enter Access Code** field.
4. Click **Save Connection**.

![Proxy Access Code Page](/public/img/connection-oauth-proxy-token.png)

---

## API Key (Legacy)

If you'd rather use your own Google Cloud project and API credentials, use the API Key method.

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

### Finalizing the API Key Connection:

1. In **WooCommerce → Settings → TubeBay → Connection**, select **API Key (Legacy)** as the Connection Method.
2. Enter your **YouTube API Key** and **YouTube Channel ID**.
3. Optionally click **Test Connection** to verify before saving.
4. Click **Save Connection**.

---

## Verifying the Connection

Once connected, the Connection tab shows a green **Connected to YouTube** notice with your channel name, and a **Disconnect** button.

![Successful Connection Dashboard](/public/img/dashboard-main.png)

::: tip Security Note
We never store your Google password. TubeBay only uses secure tokens (OAuth) or a public API key (API Key mode) to read your public video data.
:::
