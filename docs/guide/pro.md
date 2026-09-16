# License &amp; Activation

A license unlocks automatic updates for TubeBay Pro and entitles you to support. This page covers buying one, activating it, and what happens when it lapses.

::: tip Get a license
[See the pricing](https://wpanchorbay.com/plugins/tubebay-youtube-product-videos-for-woocommerce/#pricing) for TubeBay Pro.
:::

::: tip Requires TubeBay 1.3.0+
TubeBay Pro will not activate unless TubeBay is installed, active, and at version 1.3.0 or newer. WordPress will refuse to activate Pro at all if TubeBay is missing; if TubeBay is present but older, Pro stays inactive and tells you which version it needs.
:::

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
