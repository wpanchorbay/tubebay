# TubeBay — Architecture & File Structure

## High-Level Architecture

TubeBay follows a classic WordPress plugin architecture with a **PHP backend** and a **React/TypeScript admin SPA**:

```
┌─────────────────────────────────────────────────────────────┐
│                        WordPress                            │
│  ┌──────────────────┐    ┌─────────────────────────────┐    │
│  │  WooCommerce      │    │  WordPress REST API         │    │
│  │  (Product Pages)  │    │  (tubebay/v1/*)             │    │
│  └────────┬─────────┘    └──────────┬──────────────────┘    │
│           │                         │                       │
│  ┌────────▼─────────────────────────▼──────────────────┐    │
│  │             TubeBay PHP Backend                      │    │
│  │  ┌─────────┐ ┌─────┐ ┌──────┐ ┌───────────────┐    │    │
│  │  │  Core   │ │Admin│ │ API  │ │  Integration   │    │    │
│  │  │         │ │     │ │      │ │  (WooCommerce) │    │    │
│  │  └─────────┘ └─────┘ └──────┘ └───────────────┘    │    │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────┐           │    │
│  │  │  Data   │ │  Helper  │ │  Frontend  │           │    │
│  │  │(Channel,│ │(Settings,│ │(Shortcode) │           │    │
│  │  │ Video)  │ │ Loader,  │ │            │           │    │
│  │  │         │ │ Logger)  │ │            │           │    │
│  │  └─────────┘ └──────────┘ └────────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │        React/TypeScript Admin SPA (build/)           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐           │    │
│  │  │  Pages   │ │Components│ │   Store   │           │    │
│  │  │          │ │ (38 UI)  │ │ (Context) │           │    │
│  │  └──────────┘ └──────────┘ └───────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │           YouTube Data API v3 (External)             │    │
│  │  Channels · PlaylistItems · Search endpoints         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
tubebay/
├── tubebay.php              ← Plugin entry point (bootstrap)
├── index.php                ← Security: prevents directory listing
├── uninstall.php            ← Runs on plugin deletion
│
├── app/                     ← PHP Backend
│   ├── Core/                ← Plugin lifecycle
│   │   ├── Plugin.php       ← Main plugin class (singleton)
│   │   ├── Activator.php    ← Activation logic
│   │   ├── Deactivator.php  ← Deactivation logic
│   │   ├── Base.php         ← Abstract singleton base
│   │   └── Cron.php         ← WP-Cron daily sync
│   ├── Admin/               ← WordPress admin UI
│   │   ├── Admin.php        ← Menu, scripts, admin pages
│   │   └── ProductMetabox.php ← WooCommerce product metabox
│   ├── Api/                 ← REST API controllers
│   │   ├── ApiController.php     ← Base controller
│   │   ├── SettingsController.php ← Settings CRUD
│   │   ├── YouTubeController.php  ← YouTube operations
│   │   ├── LogController.php      ← Log viewer
│   ├── Data/                ← Data layer
│   │   ├── DbManager.php    ← Database table management
│   │   └── Entities/
│   │       ├── Channel.php  ← YouTube channel operations
│   │       └── Video.php    ← Video data model
│   ├── Frontend/            ← Public-facing features
│   │   └── VideoShortcode.php ← [tubebay_video] shortcode
│   ├── Helper/              ← Utilities
│   │   ├── Loader.php       ← Hook registration manager
│   │   ├── Logger.php       ← Logging wrapper
│   │   └── Settings.php     ← Settings management
│   ├── Integration/         ← Third-party integrations
│   │   └── WooCommerce.php  ← WooCommerce gallery hooks
│   └── functions.php        ← Global helper functions
│
├── config/                  ← PHP configuration files
│   ├── api.php              ← Registered API controllers
│   └── core.php             ← Registered core classes
│
├── src/                     ← React/TypeScript Frontend (source)
│   ├── index.tsx            ← App entry point
│   ├── App.tsx              ← Router + providers
│   ├── pages/               ← Admin page components
│   │   ├── Onboarding.tsx   ← Setup wizard (3 steps)
│   │   ├── ChannelLibrary.tsx ← Video library browser
│   │   ├── Settings.tsx     ← Plugin settings
│   │   └── Logs.tsx         ← Debug log viewer
├── components/          ← Reusable UI components
│   ├── common/          ← 32 shared components
│   ├── settings/        ← 6 settings-specific components
│   │   └── loading/         ← Skeleton loaders
│   ├── store/               ← State management
│   │   ├── wpabStore.tsx    ← React Context store
│   │   └── toast/           ← Toast notification system
│   ├── hooks/               ← Custom React hooks
│   │   └── useYouTubeActions.tsx
│   ├── utils/               ← Utilities
│   │   ├── types.ts         ← TypeScript interfaces
│   │   ├── Dates.ts         ← Date formatting
│   │   ├── apiFetch.ts      ← API helper
│   │   └── useMenuSync.ts   ← WP menu sync
│   └── styles/
│       └── index.scss       ← Global styles (Tailwind + custom)
│
├── build/                   ← Compiled output (not in repo)
├── assets/                  ← Static assets
│   ├── css/                 ← Stylesheets
│   │   ├── public.css       ← Frontend video styles
│   │   ├── admin-menu.css   ← Admin menu styles
│   │   └── admin/product-metabox.css
│   ├── js/
│   │   ├── public.js        ← Frontend video facade script
│   │   └── admin/product-metabox.js
│   └── img/                 ← Logo and icons
│
├── languages/               ← Translation files
├── vendor/                  ← Composer dependencies
├── node_modules/            ← npm dependencies
│
├── package.json             ← npm config
├── composer.json            ← Composer config
├── webpack.config.js        ← Webpack configuration
├── tailwind.config.js       ← TailwindCSS configuration
├── tsconfig.json            ← TypeScript configuration
├── postcss.config.js        ← PostCSS configuration
│
├── build.sh                 ← Production build script
├── package.sh               ← ZIP packaging script
│
├── README.md                ← Developer documentation
└── readme.txt               ← WordPress.org listing
```

---

## Design Patterns Used

| Pattern                        | Where                                           | Purpose                                 |
| ------------------------------ | ----------------------------------------------- | --------------------------------------- |
| **Singleton**                  | All PHP classes (Plugin, Admin, Settings, etc.) | Ensures single instance per class       |
| **Hook Loader**                | `Helper/Loader.php`                             | Centralized WordPress hook registration |
| **Config-Driven Registration** | `config/api.php`, `config/core.php`             | Declarative class registration          |
| **MVC-lite**                   | API Controllers + Data Entities + Admin Views   | Separation of concerns                  |
| **React Context**              | `wpabStore.tsx`                                 | Frontend state management               |
| **Hash Router**                | `App.tsx`                                       | SPA navigation within WordPress admin   |
| **Transient Caching**          | `Channel.php`                                   | YouTube API response caching            |
| **Façade Pattern**             | `public.js` + WooCommerce integration           | Lazy-loading YouTube embeds             |

---

## Plugin Lifecycle Flow

```
WordPress Boot
     │
     ▼
tubebay.php
     │
     ├── define constants (TUBEBAY_PATH, TUBEBAY_URL, etc.)
     ├── load Composer autoloader
     ├── require app/functions.php
     ├── register activation/deactivation hooks
     │
     └── tubebay_run()
           │
           ▼
     Plugin::get_instance()  →  __construct()
           │
           ├── define_core_hooks()    →  Register REST API controllers from config/api.php
           ├── define_admin_hooks()   →  Initialize core classes from config/core.php
           │     ├── Admin         →  add_admin_menu, enqueue_resources
           │     ├── ProductMetabox →  add_metabox, save_metabox_data
           │     ├── Settings      →  (no hooks needed)
           │     ├── Cron          →  check_and_schedule, do_daily_sync
           │     ├── WooCommerce   →  render_product_video / render_video_in_gallery
           │     └── VideoShortcode →  register [tubebay_video] shortcode
           │
           └── define_public_hooks() →  enqueue_public_styles (CSS + JS)
                    │
                    ▼
           add_action('plugins_loaded', Plugin::run)
                    │
                    ▼
           Loader::run()  →  Registers all collected actions & filters with WordPress
```
