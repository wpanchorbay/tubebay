# TubeBay — Features & Capabilities (Marketer & User Guide)

This is a complete, plain-English breakdown of everything TubeBay can do from a storefront, marketing, and user perspective. No code required.

---

## 🚀 The Core Benefit

TubeBay allows store owners to **effortlessly link their YouTube channel** to their WooCommerce store. Instead of manually pasting video links the old way, you browse a beautiful grid of your actual YouTube videos right inside the product editor, click one, and attach it to the product. The plugin automatically optimizes the video so it doesn't slow down the page.

---

## 🎨 1. Front-End Features (What the Shopper Sees)

### Lightning-Fast Video Loading ("Video Façade")

Normal YouTube embeds slow down web pages drastically. TubeBay uses a "Video Façade" technique:

- When the page loads, the shopper only sees a lightweight image thumbnail with a play button.
- The actual heavy YouTube video player **only loads if the shopper actually clicks "Play."**
- _Benefit: Faster page speeds, better SEO, higher Google PageSpeed scores._

### Smart Product Integrations

Where do the videos show up? The store owner gets to decide:

- **Replace Main Product Image**: Swaps the primary product photo for a video player.
- **Below Product Gallery**: Adds the video right below the thumbnails section.
- **Below Main Image**: Places the video alongside the gallery thumbnails.
- **Anywhere (Shortcode)**: Use `[tubebay_video]` to drop the video literally anywhere (blog posts, Elementor, Gutenberg, product descriptions).

> **Note**: Additional placement options (Above Purchase Options, Below 'Add to Cart' Button, etc.) are currently in development and planned for a future release.

### Player Experience Customizations

- **Muted Autoplay On/Off**: Decide if videos should start playing automatically (muted) the second the user interacts with them.
- **Player Controls On/Off**: Hide the YouTube timeline bar and buttons for a cleaner, branding-focused look.

---

## 🛠️ 2. Back-End Features (What the Store Owner Sees)

### The Setup Wizard (Onboarding)

A beautiful 3-step setup guide for first-time users:

1. **Connect Account**: Choose between one-click **Google OAuth** (recommended) or manual API Key. It verifies the connection to ensure everything is working perfectly.
2. **Configure Defaults**: Pick where videos should go globally by default.
3. **Finish**: Automatically syncs your library in the background.

### Channel Library (Video Dashboard)

A dedicated page inside the WordPress admin where you can see every YouTube video you own.

- **Beautiful Grid or List Views**: Toggle between a visual gallery or a detailed list.
- **Instant Search**: Type a word and find a video instantly from your channel.
- **Smart Sorting**: Sort by "Recently Added," "Oldest," "Most Viewed," or "A-Z".
- **Previews**: Click a button to preview the video right there in a popup modal.
- **Copy Shortcode Button**: One click to copy `[tubebay_video id="XYZ"]` to paste elsewhere.

### The Product Editor Modal (WooCommerce Integration)

When editing a specific WooCommerce product, there is a new "TubeBay Video" box on the side.

- Click **"Select Video"** to open a beautiful popup overlay.
- The popup contains your entire YouTube library (searchable and sortable).
- Click a thumbnail to attach it to the product.
- **Override Global Settings**: Decide _just for this specific product_ if autoplay should be on or off.

---

## ⚙️ 3. Automation & Settings

### The Settings Dashboard

A clean, modern React-based settings panel segmented into logical cards:

- **Connection Card**: Shows if you are "Connected" (green) or "Disconnected" (red). Allows you to test or change the linked YouTube channel.
- **Placement Settings Card**: Choose the global defaults (e.g., "Replace Main Image"). Also toggles Global Autoplay and Global Player Controls.
- **Sync Card**:
  - Toggle **Auto-Sync** (automatically pulls new YouTube videos into WordPress every 24 hours).
  - Shows EXACTLY when the last sync happened (e.g., "2 hours ago").
  - "Sync Now" button to manually pull new videos immediately after you upload them to YouTube.
- **Advanced Options**:
  - **Debug Mode**: Turns on hidden developer logs for troubleshooting.
  - **Clean Uninstall**: If toggled on, deleting the plugin will completely wipe all data and settings, leaving the database perfectly clean.

### Smart Caching

TubeBay remembers the YouTube videos so it doesn't have to ask YouTube every single time someone loads a page, saving API quota and speeding up the admin dashboard. The cache refreshes automatically based on user settings (default is every 12 hours).

---

## 👥 Use Cases & Scenarios

**For the Store Owner**:
"I just uploaded a new demo video to YouTube. I click 'Sync Now' in TubeBay, go to my product, click 'Select Video', search for the title, and assign it. Done in 10 seconds."

**For the Marketer / SEO Expert**:
"We need videos to increase conversion rates, but regular embeds tank out Core Web Vitals. TubeBay's Video Façade means we get the conversion boost of video without losing our Google ranking for page speed."

**For the Customer Support Rep**:
"The customer is asking for proof of how the product works. We can use the Channel Library to quickly grab the TubeBay shortcode and paste the exact video directly into a support ticket page or custom FAQ."
