# Video Blocks

TubeBay puts videos on WooCommerce product pages automatically, but posts, pages and templates need a different tool. TubeBay adds two blocks and one inline link to the WordPress block editor, so a video from your channel can sit anywhere you write — a landing page, a blog post, a site template. All three pick from the library you have already synced, and all three use the same click-to-play facade as the product gallery: nothing from YouTube loads until a visitor clicks.

## TubeBay Video block

A click-to-play thumbnail. It either plays where it sits or opens in a popup, and it can carry a caption.

Add it the way you add any block — click **+**, type `TubeBay`, and choose **TubeBay Video**.

![The block inserter with both TubeBay blocks listed](/public/img/blocks-inserter.png)

The empty block offers two ways to choose a video:

- **Choose from channel** — opens your synced library.
- **Or paste a YouTube URL or ID** — for a video that isn't in your channel. Any normal YouTube address works, including `youtu.be` short links.

![Choosing a video from the synced channel library](/public/img/blocks-video-picker.png)

The picker opens on your most recent uploads, newest first. The **Search** box filters the videos already loaded, and **Sort by** reorders them. **Load more** fetches the next batch.

Type something the loaded videos don't match and administrators get one extra option — **Search your whole channel instead**, which asks YouTube directly rather than looking only at what has been synced. See [Who can use the blocks](#who-can-use-the-blocks) for why that one is limited.

Once a video is chosen the block shows its thumbnail with a play badge, exactly as visitors will see it.

![A placed video block showing the thumbnail and play badge](/public/img/blocks-video-placed.png)

### Block settings

Open the sidebar (the gear icon) for two panels — **Video** and **Display**.

| Setting | What it does |
|---------|--------------|
| **Replace video** | Swap in a different video, keeping every other setting. |
| **Video shape** | 16:9 — Widescreen (default), 4:3 — Standard, 1:1 — Square, 9:16 — Shorts. |
| **Start at** | Begin part-way in. Accepts clock format — `1:30` means one minute thirty, not thirty seconds. Leave empty to start at the beginning. |
| **Open in a popup instead** | Off, the video plays in place — the block tells you so: *"Clicking plays the video in place."* On, it becomes *"Clicking opens the video in a lightbox."* |
| **Popup width** | How wide that popup is, as a percentage of the screen. This control only appears once **Open in a popup instead** is on, since it has nothing to affect otherwise. |

![The block sidebar showing Video shape, Start at and Popup width](/public/img/blocks-sidebar-controls.png)

To add a caption, click beneath the thumbnail where it says **Add a caption…**

## TubeBay Video Button block

A button that opens a video in a popup, styled by your theme so it matches every other button on your site. Use it where a large thumbnail would be too much — inside a hero section, at the end of a product description, beside a call to action.

![The Video Button block in the editor](/public/img/blocks-video-button.png)

Its sidebar has three panels:

| Panel | Setting | What it does |
|-------|---------|--------------|
| **Video** | Replace video | Swap the video without losing the button's styling. |
| **Popup** | Video shape, Start at, Popup width | Same as the Video block above. |
| **Popup** | Show play icon | Puts a small play triangle before the button text. |
| **Link fallback** | Open in new tab | Opens the video's YouTube page in a new tab for anyone whose browser blocks the popup. |
| **Link fallback** | Add nofollow | Adds `rel="nofollow"` to that fallback link. |

Edit the button's text by typing directly on it, and set its width from the block toolbar.

::: tip Why a fallback link?
The button is a real link to the video on YouTube. Visitors with JavaScript disabled still reach the video instead of clicking something that does nothing. **Link fallback** controls how that link behaves.
:::

## Inline video links

Sometimes a video belongs inside a sentence rather than in a block of its own. Select any words — in a paragraph, a heading, or a list item — and choose **Video link** from the block toolbar. The selected text becomes a link that opens the video in a popup.

![Turning selected text into a video link from the block toolbar](/public/img/blocks-inline-link.png)

The popover offers the same **Choose from channel** picker, or a pasted YouTube URL. Two more choices sit below it:

| Setting | What it does |
|---------|--------------|
| **Appearance** | **Link** keeps your text looking like a link. **Button** styles it as a button instead, without leaving the sentence. |
| **▸ Advanced** | Expands to the familiar **Video shape**, **Start at** and **Popup width**, so an inline link can start part-way in just as a block can. |

Click **Apply** to set the link. Selecting it again reopens the popover, where **Remove** turns it back into ordinary text.

This is the lightest-touch option of the three: no thumbnail, no separate block, just a phrase like "the two minute walkthrough" that opens the video where the reader already is.

## What visitors see

All three open into the same popup player.

![The video popup open on the front end](/public/img/blocks-popup-frontend.png)

Because every one of them uses the facade, the page loads a thumbnail image and nothing else. The YouTube player is inserted only when someone actually clicks, so a page with five videos on it costs no more to load than a page with five images.

If you have enabled **Privacy (GDPR) Mode** in [Global Settings](/features/global-settings), the blocks embed through `youtube-nocookie.com` just as the product gallery does.

## Who can use the blocks

Editors and authors can add all three and choose from your synced library — they do not need TubeBay's own permissions to write a post with a video in it.

**Search your whole channel instead** is limited to administrators. That search calls the YouTube Data API, and every call spends part of your daily quota; browsing and filtering the synced library costs nothing. See [Library Management](/features/library-management) for how the two differ.

## Blocks or shortcode?

Both work, and they do different jobs:

- **Blocks** — you are editing in the block editor and want to see the video while you write. Start here.
- **[Shortcode](/features/shortcodes)** — you are in a page builder, a widget, a template file, or anywhere the block editor isn't.
