# License &amp; Activation

A license unlocks automatic updates for TubeBay Pro and entitles you to support. This page covers buying one, activating it, and what happens when it lapses.

::: tip Get a license
[See the pricing](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing) for TubeBay Pro.
:::

::: tip Requires TubeBay 1.3.0+
TubeBay Pro will not activate unless TubeBay is installed, active, and at version 1.3.0 or newer. WordPress will refuse to activate Pro at all if TubeBay is missing; if TubeBay is present but older, Pro stays inactive and tells you which version it needs.
:::

## What TubeBay Pro Adds

Everything below is on top of the free TubeBay features. Pro's gallery options live in the **Pro Gallery Options** section of **WooCommerce → Settings → TubeBay → Video Player**; without Pro that section is shown greyed out. Settings are saved with the normal **Save changes** button.

::: tip Update the free plugin first
These features rely on parts of TubeBay that arrive in 1.4.0. Update the free plugin before Pro, or Pro's gallery options will not appear.
:::

### Gallery options

#### Thumbnail navigation
**Thumbnail Navigation** (default **Click**) decides how shoppers move through the gallery using the thumbnail strip.

- **Click:** the slide changes when a thumbnail is clicked or tapped, as in a standard WooCommerce gallery.
- **Hover:** the slide changes when the mouse rests on a thumbnail (after a very short pause, so sweeping across the strip does not flicker through every slide). Keyboard focus on a thumbnail switches slides as well. On touch-only devices, which cannot hover, thumbnails keep working as taps.

#### Sticky video
Turn on **Sticky Video** to keep a playing video in view. When a shopper starts a video and then scrolls the gallery off the screen, the player shrinks into a small floating window in the corner of the screen and keeps playing. Scrolling back to the gallery puts it back; the **Close** button on the floating window stops the video and keeps it from floating again until the page is reloaded.

- Only videos playing **with sound** float. A muted video (for example one started by **Autoplay First Video**) stays where it is, because a silent looping clip in the corner would only be a nuisance.
- The window sits in the **bottom-right** corner. Developers can move it to another corner, for example to avoid a theme's sticky add-to-cart bar, with the [`tubebaypro_sticky_video_position`](/developer/hooks#tubebaypro-sticky-video-position) filter.

#### Video / Images toggle
**Video/Image Toggle** adds a small **Video | Images** switch above the product gallery, so shoppers can look at one kind of media at a time. Choosing **Video** hides the photo thumbnails and shows the video thumbnails, and **Images** does the opposite.

- The switch only appears on products that have **at least one video and at least one photo**.
- It remembers the shopper's choice for the rest of their visit (until the browser tab is closed).

#### Thumbnail style
Four settings restyle the thumbnail strip under the main gallery image:

| Setting | Range | Default |
|---------|-------|---------|
| **Thumbnail Border Width** | 0 to 10 px (0 = no border) | 0 |
| **Thumbnail Border Color** | any colour | `#dcdcde` |
| **Thumbnail Corner Radius** | 0 to 50 px | 0 |
| **Active Thumbnail Color** | any colour | `#2271b1` |

The **Active Thumbnail Color** marks the thumbnail that is currently selected, and also the one the mouse is over or the keyboard is focused on. When the border width is 0 there is no border to recolour, so the selected thumbnail gets a thin 2 px ring in that colour instead.

The styling applies to product pages only. While the border width and corner radius are both 0 and the active colour is left at its default, Pro adds nothing to the page. (The border colour only matters once the border width is above 0.)

#### Custom CSS
The **Custom CSS** box lets you add your own CSS to tweak the gallery, the video slides or the play button without editing your theme. For example:

```css
.tubebay-video-slide .tubebay-video-frame { background: #111; }
```

- The CSS is loaded **after** TubeBay's own stylesheets on the front end, so your rules win when specificity is equal. It loads on every front-end page, not only on products, so scope your selectors.
- Only users who are allowed to post **unfiltered HTML** (administrators on a standard single-site install) can save changes to this box. Other users see it but cannot alter what is stored. On multisite, only super admins have this capability by default.
- Any `<` character is removed when the CSS is saved, so the CSS can never close its own `<style>` tag. Child selectors written as `a > b` are fine.
- The box holds up to 64 KB.

### Import / Export settings
**WooCommerce → Settings → TubeBay → Advanced → Import / Export Settings** moves your TubeBay setup between sites, for example from a staging site to the live store, or keeps a backup.

**Export** downloads a `.json` file of your settings.

- By default your connection details are **left out**: API key, OAuth tokens, channel and connection status. The file is safe to hand to a colleague or keep in a repository.
- Tick **Include API credentials** to put the API key and tokens in the file. A warning appears, because anyone holding that file can use your YouTube connection. Keep it private and never email it.
- Debug mode, the clean-uninstall option, setup-wizard progress, your last sync time and your **license key and status** are **never** exported.

**Import** reads a settings file from another site.

1. Click **Choose File and Import** and pick a TubeBay settings `.json` file.
2. If anything in the file is unknown or the wrong type, the whole import is **rejected and nothing is changed**; the message lists the offending settings.
3. On success the page reloads with the new settings.

If the file contains API credentials, importing them triggers a **live connection test** against YouTube, exactly as when you save new credentials by hand, so the imported connection is checked straight away. A file without credentials leaves the site's existing connection alone.

Settings you imported replace the current values; settings not in the file keep theirs. Product video assignments are not part of the file (they belong to your products), and neither is your synced library; run a [sync](/guide/sync-library) on the new site.

### `[tubebay_by_pid]` shortcode
`[tubebay_by_pid]` shows **one product's videos anywhere**: a landing page, a blog post, a category description, a page-builder block. Unlike the free [`[tubebay_video]`](/features/shortcodes) shortcode, which embeds a single YouTube ID, this one is given a *product* and displays every video assigned to it in a responsive grid. Each video keeps the click-to-play thumbnail used in the gallery, so nothing heavy loads until a shopper clicks.

```text
[tubebay_by_pid id="123"]
[tubebay_by_pid id="123" columns="3" play_icon="circle" aspect_ratio="4:3"]
```

| Attribute | Values | Default | What it does |
|-----------|--------|---------|--------------|
| `id` | a product ID | none (required) | The product whose videos to show. `pid` and `product_id` are accepted as alternative names; the first one given wins. |
| `columns` | `1` to `6` | automatic | Number of columns. Leave it out for an automatic grid that fits as many 260 px columns as will fit. On phones the grid is always one column. |
| `autoplay` | `true` / `false` (also `1`/`0`, `yes`/`no`) | off | Autoplay the first video, muted. Only the first video on the whole page autoplays. |
| `play_icon` | `youtube`, `circle`, `triangle` | the setting in **Video Player** | Play button style. |
| `play_icon_color` | hex colour such as `#e11d48` | the setting in **Video Player** | Colour of the play button. A value that is not a hex colour is ignored. |
| `aspect_ratio` | `16-9`, `1-1`, `4-3`, `9-16` (`16:9` and `16/9` also work) | the setting in **Video Player** | Shape of each video tile. Unlike the gallery, tiles here are sized to the video's own shape rather than to a square. |
| `show_duration` | `true` / `false` | the product's **Show Duration Badge**, then the global setting | Show the small **Video** label on each tile. |
| `show_description` | `true` / `false` | the global setting | Accepted, but it has no visible effect: the description panel belongs to the product gallery and is not shown in the grid. |

An attribute you leave out falls back to the product's own gallery options and then to the global settings, so a bare `[tubebay_by_pid id="123"]` looks like that product's gallery videos. The product's **Max Videos** limit applies.

**When nothing is shown.** The shortcode prints nothing, and no error, when:

- `id` is missing, `0` or not a number;
- the product does not exist, is not **published**, or is **password-protected**. A draft, private or protected product's videos are never revealed through someone else's page;
- the product has no videos assigned;
- the page is a feed or an excerpt (those cannot carry the player).

Because the shortcode needs the free plugin's player, it also prints nothing if TubeBay is older than the version Pro expects.

## Activating Your License

1. Install and activate the TubeBay Pro plugin (**Plugins → Add New → Upload Plugin**, then **Activate**).
2. Go to **WooCommerce → Settings → TubeBay → Advanced**. A **License Settings** section appears below the standard Advanced fields.
3. Paste your license key into **License Key**.
4. Click **Activate License**.

![License Settings with a key entered, before activating](/public/img/pro-license-activation.png)

Once active, the field is locked and a **Deactivate License** button appears.

![License Settings after successful activation](/public/img/pro-license-active.png)

::: warning Moving a license between sites
**Deactivate License** clears the key on *this* site only — it does not release the seat on our licensing server. If you are moving a license to a different domain, [contact support](https://wpanchorbay.com/support/) so we can free the old one, rather than deactivating and expecting the new site to activate.
:::

### If activation is rejected

An invalid, mistyped or already-used key is not saved: the key field stays empty and the message from the licensing server is shown once. Because nothing was stored, reloading the page returns you to an ordinary empty form with no error on screen — so if activation appears to have silently done nothing, the key was rejected. Check it for stray spaces and confirm the seat is free.

## Automatic Updates

While a license is active, TubeBay Pro checks for new releases and they appear in **Plugins → Updates** like any other plugin.

Three things follow from that, which are easy to trip over:

- **Without an active license there is no update path at all.** TubeBay Pro is not on WordPress.org, so updating means downloading the new version and uploading it by hand.
- **Deactivating the license also ends update checks**, immediately and silently.
- **TubeBay itself updates independently**, from WordPress.org, and needs no license.

::: warning Update both plugins together
Some fixes reach a Pro site only when **Pro** is updated, even when the release notes credit the change to TubeBay — Pro ships its own copy of the admin interface, so the version it carries is the one you see. If something described in the changelog isn't behaving as written, check that both plugins are current before anything else.
:::

### Expiry

Nothing re-checks a key after activation. An expired license keeps showing as active in **License Settings** while the update server quietly stops offering new versions — so the first sign of expiry is usually updates that never arrive. Renew from the [pricing page](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).

## Requirements

| | |
|---|---|
| **TubeBay** | 1.3.0 or newer, installed and active |
| **License** | Required for automatic updates and support |
| **Outbound HTTPS** | Your server must be able to reach `wpanchorbay.com` for activation and update checks |

## Buying a License

Licenses are sold from the [TubeBay pricing page](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing). Support for licensed sites is available at [wpanchorbay.com/support](https://wpanchorbay.com/support/).
