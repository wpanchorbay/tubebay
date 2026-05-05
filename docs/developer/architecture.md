# Architecture

This page provides a technical overview of TubeBay's internal architecture. It is intended for developers who want to understand how the plugin is built or contribute to it.

## High-Level Architecture

TubeBay follows a **Modern Hybrid Architecture** pattern, splitting responsibilities between a dynamic React-based admin layer and a lightweight PHP backend for YouTube integration and frontend rendering.

```
┌──────────────────────────────────────────────────────────┐
│                    WordPress Core                        │
├────────────────────────┬─────────────────────────────────┤
│     Admin (React SPA)  │       Frontend API / Player     │
│                        │                                 │
│  React 18 + TypeScript │  YouTube IFrame API             │
│  Tailwind CSS          │  PHP Renderers + Transients     │
│  Zustand State         │  WP-Cron Sync Engine            │
│  React Router (Hash)   │  SEO-friendly HTML              │
│                        │                                 │
│  ┌──────────────────┐  │  ┌───────────────────────────┐  │
│  │   REST API       │◄─┼──│   YouTube Controller      │  │
│  │  /tubebay/v1     │  │  │   Library Syncing         │  │
│  └────────┬─────────┘  │  └───────────────────────────┘  │
│           │            │                                 │
├───────────┼────────────┴─────────────────────────────────┤
│           ▼                                              │
│  ┌─────────────────┐  ┌──────────────────────────────┐   │
│  │  Controllers    │  │  Data Layer                  │   │
│  │  (API Layer)    │──│  (Channel / Video Entities)  │   │
│  └─────────────────┘  └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Backend (PHP)

### Directory Structure

```
app/
├── Api/             # REST API controllers
│   ├── ApiController.php       # Base controller
│   ├── YouTubeController.php   # Library sync and management
│   ├── SettingsController.php  # OAuth and generic settings
│   └── OnboardingController.php # Setup wizard logic
├── Core/            # Plugin initialization and hooks
├── Data/            # Business logic and entities
│   ├── Entities/    # Channel and Video models
│   └── Repositories/ # Persistence logic
├── Helper/          # Reusable utility functions
└── Templates/       # Frontend player template fragments
```

### Key Components

- **YouTubeController:** Handles library synchronization, mapping requests, and search queries against the local cache.
- **Channel Entity:** Encapsulates the configuration for a YouTube channel (API Key, OAuth Token) and manages the connection to the YouTube Data API.
- **Sync Engine:** A WP-Cron based background process that periodically refreshes the local video transient.

## Frontend (React/TypeScript)

### Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI library (via `@wordpress/element`) |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Zustand | State management for the library and settings |
| Lucide React | Modern icon set |
| Vite | Production build tool and development server |

### State Management
TubeBay uses **Zustand** for lightweight state management within the admin dashboard. This allows for immediate UI updates when a user maps a video or triggers a sync, without waiting for page refreshes.

## Data Persistence
- **Mappings:** Stored in `wp_options` as a serialized array or in a dedicated custom table (Pro).
- **Video Library:** Cached via WordPress **Transients** to ensure high performance and quota safety.
- **Auth Tokens:** Stored securely in `wp_options` with restricted access.

## Build System
TubeBay uses **Vite** for the fastest possible development experience. The production builds are optimized into a single JS/CSS bundle that is enqueued only on the plugin's administrative pages.
