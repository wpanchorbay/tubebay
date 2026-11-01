# Embedded Video Player

TubeBay uses a "Video Facade" for every video slide it adds to a product's gallery: a lightweight thumbnail with a play button loads immediately, and the real YouTube IFrame API player (or an HTML5 `<video>` element for self-hosted files) only loads once a shopper clicks it.

## Player Features
- **Responsive Design:** Automatically adjusts to fit any screen size (desktop, tablet, mobile).
- **Fast Loading:** The YouTube API is only requested when a shopper actually clicks to play, minimizing impact on initial page load. See [Lazy-loaded thumbnails](#lazy-loaded-thumbnails) below.
- **Sharp Thumbnails:** When you sync, TubeBay saves the best thumbnail YouTube has for each video — the largest available, which for most videos is full HD — rather than the small default one, so the poster stays crisp on large and high-density screens. Videos you had already synced get the better thumbnail the next time you run a sync; see [Syncing Your Library](/guide/sync-library).
- **No jQuery needed:** The player's front-end script no longer uses jQuery. It works the same on themes and optimisation plugins that remove or defer jQuery.
- **Two Video Sources:** Attach either a synced YouTube video, or a self-hosted video from your WordPress media library, to any product.

## Customization Options
Configure default player behavior in **WooCommerce → Settings → TubeBay → Video Player**:

- **Autoplay First Video:** The first video in a product's gallery starts playing, muted, **as soon as the page loads** — the shopper does not have to click it. The remaining videos still wait for a click. Because this one video loads its player immediately, it costs the page what a normal embed would; leave it off if page weight matters more than the autoplay.
- **Show Player Controls:** Toggle the playback controls (play/pause, volume, fullscreen). This applies to self-hosted videos as well as YouTube ones — with it off, a self-hosted video has no visible way to pause.
- **Show Duration Badge:** Show a small **Video** label in the corner of each video thumbnail, marking which gallery slides are videos rather than images. It is a fixed label, not a running time.
- **Play Icon / Play Icon Color:** Choose the YouTube, circle or triangle play button and its colour.
- **Video Aspect Ratio:** 16:9 (default), 1:1, 4:3 or 9:16. The video is letterboxed inside the gallery's square slot — see [Video shape](#video-shape).
- **Fixed Gallery Height:** Make every slide in the gallery the same height — see [Fixed-height gallery](#fixed-height-gallery).
- **Show Video Description:** Show the video's description under the gallery — see [Video description](#video-description).
- **Allow Fullscreen / Allow Picture-in-Picture:** Turn the player's fullscreen and floating-window buttons on or off — see [Fullscreen and picture-in-picture](#fullscreen-and-picture-in-picture).
- **Video Structured Data:** Add video markup for search engines — see [Video structured data (SEO)](#video-structured-data-seo).
- **Privacy/GDPR Mode:** Embed via `youtube-nocookie.com` instead of `youtube.com`, so YouTube won't set cookies for a visitor unless they actually play the video.
- **Max Videos Per Product:** Cap how many video slides appear in a single product's gallery (0 = unlimited).

A single product can depart from these defaults for four of them — **Max Videos**, **Video Position**, **Autoplay First Video** and **Show Duration Badge** — from the **Video Gallery Settings** panel on that product. **Show Player Controls** and **Privacy/GDPR Mode** are store-wide only and have no per-product setting.

::: tip Per-product settings
Setting these on an individual product is part of TubeBay Pro. [See the pricing](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing).
:::

## Video shape

The video slide always occupies the same square slot as your product photos, so the gallery keeps one steady size. **Video Aspect Ratio** decides the shape of the video *inside* that slot:

| Setting | Result in the square slot |
|---------|---------------------------|
| **16:9** (default) | Wide video, black bars above and below |
| **4:3** | Slightly wide video, thin black bars above and below |
| **1:1** | Fills the slot completely (no bars) |
| **9:16** | Tall video, black bars left and right |

The thumbnail, the play button and the playing video all use the chosen shape, so nothing resizes when a shopper clicks play. Pick the ratio your videos were actually filmed in; a mismatch just adds bars.

::: warning This changes how existing galleries look
**16:9** became the default in 1.4.0. Before that, videos filled the whole square. After updating, your galleries show letterboxed videos until you choose **1:1** in **Video Aspect Ratio**.
:::

## Fixed-height gallery

WooCommerce galleries normally take the height of the current photo, so a page can jump when a shopper moves between a wide video and a tall photo. Turn on **Fixed Gallery Height** and every slide, video or photo, gets the same height. By default that height equals the gallery's width (a square). Photos are fitted inside the slot without being cropped.

It only applies to products that have a video; other products' galleries are untouched. Developers can force an exact height in pixels with the [`tubebay_gallery_fixed_height_px`](/developer/hooks#tubebay-gallery-fixed-height-px) filter.

## Fullscreen and picture-in-picture

**Allow Fullscreen** and **Allow Picture-in-Picture** are both on by default. Turn one off and the matching control is removed from the player, for YouTube and self-hosted videos, in the product gallery and in the [`[tubebay_video]` shortcode](/features/shortcodes). The setting is store-wide.

## Video description

Turn on **Show Video Description** to show the video's description, as synced from YouTube, in a panel directly under the gallery.

- It is **off by default**.
- The panel shows the description of the slide the shopper is looking at, and **hides on photo slides** and for videos that have no description.
- Long descriptions are cut off after **4 lines** with a **Show more** button; **Show less** collapses them again.
- It is shown as plain text. Links and formatting in the YouTube description are not turned into HTML.
- It appears under the **product gallery** only. It is not shown by the `[tubebay_by_pid]` grid from [TubeBay Pro](/guide/pro#tubebay-by-pid-shortcode), nor by the shortcode or blocks.
- Descriptions come from your synced YouTube library, so self-hosted videos have none and show no panel.

## Video structured data (SEO)

With **Video Structured Data** on (the default), TubeBay prints a [VideoObject](https://schema.org/VideoObject) JSON-LD block on single product pages that have videos. It tells Google the page contains videos, which can make the product eligible for video results.

What to know:

- **Where:** single product pages only, for the videos in that product's gallery. A product with several videos gets one block that lists all of them.
- **What's in it:** title, description, thumbnail, upload date, duration and the embed address (`youtube.com`, or `youtube-nocookie.com` when **Privacy/GDPR Mode** is on).
- **Videos with no duration are left out.** Duration and upload date are saved when you sync, so a video that has not been synced since 1.4.0 has neither and is skipped until you run [a sync](/guide/sync-library). Videos without a thumbnail are skipped too, since Google needs one.
- **YouTube videos only.** Self-hosted videos have no synced duration or upload date, so they are not included.
- **Yoast Video SEO:** if that plugin is active, TubeBay prints nothing, so the page never carries two copies.
- **Rank Math and other SEO plugins:** TubeBay does not detect them. If your SEO plugin already outputs video markup, switch **Video Structured Data** off to avoid duplicates.
- **Per product or site-wide in code:** the [`tubebay_output_video_schema`](/developer/hooks#tubebay-output-video-schema) filter overrides the setting.

You can check the result with Google's [Rich Results Test](https://search.google.com/test/rich-results).

## Lazy-loaded thumbnails

Video thumbnails are lazy-loaded so a product with several videos doesn't download every poster up front:

- The **first** video thumbnail loads straight away, because it is usually visible when the page opens (and it is always loaded straight away when it autoplays).
- The remaining thumbnails use the browser's native lazy loading and are fetched as they come near the screen.
- The small **thumbnail strip** under a WooCommerce gallery is built by WooCommerce's slider, which fetches those small images anyway. Lazy loading therefore saves the large posters, not the strip.

## Mobile Considerations
Most mobile browsers block autoplay to save data. Because TubeBay always shows the video thumbnail with a play overlay first, shoppers on mobile always have a clear, working call-to-action to start the video manually.
