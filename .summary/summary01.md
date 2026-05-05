# TubeBay — Project Overview & Executive Summary

## What Is TubeBay?

**TubeBay** is a WordPress / WooCommerce plugin that bridges a merchant's YouTube channel with their online store. It lets shop owners replace static product images with high-performance YouTube videos — directly from the WordPress admin dashboard — without copying embed codes.

| Attribute         | Detail                                          |
| ----------------- | ----------------------------------------------- |
| **Plugin Name**   | TubeBay                                         |
| **Version**       | 1.0.0                                           |
| **Author**        | WPAnchorBay (sankarsan)                         |
| **Platform**      | WordPress 6.8+ / WooCommerce                    |
| **PHP**           | 7.4+                                            |
| **License**       | GPLv2 or later                                  |
| **Frontend Tech** | React + TypeScript (admin), Vanilla JS (public) |
| **Backend Tech**  | PHP with WordPress Plugin API                   |
| **Styling**       | TailwindCSS 3.x (admin), Vanilla CSS (public)   |
| **Build Tool**    | Webpack via `@wordpress/scripts`                |

---

## The Problem It Solves

WooCommerce merchants who use YouTube to market products face friction:

- Manually copying YouTube embed codes is tedious and error-prone.
- Standard embeds are slow (YouTube loads heavy scripts on page load), hurting page speed and SEO.
- There's no centralized way to manage which videos are on which products.

---

## How TubeBay Solves It

1. **Connect Securely** — Connect via Google OAuth 2.0 (recommended) for one-click setup or use a manual API key.
2. **Auto-Sync Library** — TubeBay fetches the channel's video library and caches it.
3. **Assign Videos to Products** — A custom metabox on each WooCommerce product edit screen lets you browse and pick a video from a visual grid.
4. **Automatic Frontend Display** — The chosen video automatically appears in the product gallery (or other configurable positions) on the live store.
5. **Video Façade Technology** — Instead of loading a full YouTube iframe on page load, TubeBay shows a lightweight thumbnail+play-button. The actual player only loads when the visitor clicks — keeping Largest Contentful Paint (LCP) scores excellent.

---

## Development Phases

| Phase                 | Description                                                                                                          | Status     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Phase 1** | Manual API Key connection — core features and initial development.                         | ✅ Done  |
| **Phase 2** | One-click OAuth Proxy connection via `wpanchorbay.com/oauth` — professional authentication approved by Google. | ✅ Active |

OAuth is now the primary and recommended connection method, providing a seamless and secure experience for users without requiring manual API key creation.

---

## Target Audience

| Audience                     | What They Get                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| **WooCommerce Store Owners** | A no-code way to add YouTube videos to product pages and boost conversions                   |
| **Marketers**                | Video content embedded where it matters most — on product pages — for higher engagement      |
| **Developers**               | A well-structured, extensible plugin with clean separation of PHP backend and React frontend |

---

## Key Features at a Glance

- ✅ **Google OAuth 2.0 Connection** (One-click, secure authentication)
- ✅ Native WooCommerce gallery integration (replace main image or add to gallery)
- ✅ Performance-first Video Façade (lazy-loading YouTube embeds)
- ✅ Guided onboarding wizard
- ✅ Real-time video search and sort (by date, title, views)
- ✅ Per-product and global autoplay/controls settings
- ✅ Automatic daily sync via WP-Cron
- ✅ Debug logging system
- ✅ Clean uninstall with optional data deletion
- ✅ PHPCS / WordPress coding standards compliant
- ✅ Internationalization (i18n) ready
- ✅ `[tubebay_video]` shortcode for embedding videos anywhere
