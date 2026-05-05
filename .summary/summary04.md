# TubeBay — Frontend Deep Dive (React/TypeScript Admin SPA)

## 1. Overview

The admin interface is a **React Single-Page Application (SPA)** built with TypeScript. It renders inside the WordPress admin dashboard within a `<div id="tubebay">` container.

| Aspect           | Detail                                 |
| ---------------- | -------------------------------------- |
| Framework        | React 18+                              |
| Language         | TypeScript                             |
| Router           | `react-router-dom` (HashRouter)        |
| State Management | React Context API (`wpabStore`)        |
| API Client       | `@wordpress/api-fetch`                 |
| Icons            | `lucide-react` + custom SVG icons      |
| Styling          | TailwindCSS 3.x with `tubebay-` prefix |
| Build            | Webpack via `@wordpress/scripts`       |
| i18n             | `@wordpress/i18n`                      |

---

## 2. Entry Point & App Structure

### index.tsx

- Mounts the React app into `#tubebay` DOM element
- Imports global SCSS styles

### App.tsx — Root Component

```
WpabProvider (Context Store)
  └── ToastProvider (Notifications)
       └── ToastContainer
       └── HashRouter
            └── MenuSyncProvider (Syncs WP sidebar)
                 └── AppLayout (Shared layout wrapper)
                      ├── / → ChannelLibrary
                      ├── /onboarding → Onboarding
                      ├── /logs → Logs
                      ├── /settings → Settings
                      └── /library → ChannelLibrary
```

---

## 3. Pages (Admin Views)

### Onboarding Page (`pages/Onboarding.tsx`)

A **3-step guided wizard** for first-time setup:

| Step | Title              | What Happens                                                       |
| ---- | ------------------ | ------------------------------------------------------------------ |
| 1    | Connect YouTube    | User chooses connection method (OAuth or API Key) → Connect account |
| 2    | Configure Settings | Set video placement, autoplay, controls, cache duration, auto-sync |
| 3    | Done               | Success screen with link to Channel Library                        |

**Key Functions**:

- `handleConnect()` — Handles OAuth redirect or API key validation
- `handleTestConnection()` — Calls `POST /youtube/test-connection` endpoint
- `handleSyncLibrary()` — Calls `GET /youtube/sync-library-status` to sync videos
- `handleSaveSettings()` — Saves all settings, triggers library sync
- `handleFinish()` — Marks onboarding complete, navigates to library

**Auto-Navigation**: If onboarding is already completed, redirects to Channel Library.

---

### Channel Library Page (`pages/ChannelLibrary.tsx`)

The main dashboard view — displays the YouTube video library.

**Features**:

- Video grid showing thumbnails, titles, and publish dates
- Real-time search filter
- Sort by: Recently Added, Oldest, Title A-Z/Z-A, Most Viewed
- "Sync Now" button to refresh from YouTube API
- "Load More" pagination
- Per-video shortcode copy (`[tubebay_video id="..."]`)
- Connection status indicator
- Last sync time display
- Links to Products admin for quick video assignment

**Data Flow**:

1. Fetches videos from `GET /youtube/videos`
2. For search/sort: passes `?search=X&sort=Y` params
3. Uses `page_token` for pagination

**UI States**:

- Loading skeleton while fetching
- Empty state with connect prompt if no channel connected
- Error state with retry option

---

### Settings Page (`pages/Settings.tsx`)

Full plugin configuration split into cards:

**Settings Cards**:

| Card Component          | Contents                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ConnectAccountCard`    | Toggle between OAuth (recommended) and API Key, test connection, view channel info display                            |
| `SyncCard`              | Auto-sync toggle, cache duration slider, manual sync button, last sync time                                           |
| `PlacementSettingsCard` | Video placement selector (radio cards with visual previews), muted autoplay, show controls, video placeholder preview |
| `AdvancedSettingsCard`  | Debug mode toggle, delete all data on uninstall toggle, "Delete All Data Now" button with confirmation modal          |

**Key Functions**:

- `fetchSettings()` — Loads current settings from `GET /settings`
- `handleConnect()` — Saves connection credentials, updates status
- `handleSaveSettings()` — Saves all configurable settings
- `handleTestConnection()` — Tests YouTube connection
- `handleSyncLibrary()` — Triggers library sync
- `credentialsChanged()` / `otherSettingsChanged()` — Dirty state tracking for save button

---

### Logs Page (`pages/Logs.tsx`)

Debug log viewer for development/troubleshooting:

- Fetches logs from `GET /logs`
- Shows in a dark-themed monospace code viewer
- "Refresh" button to reload
- "Clear Logs" button to delete all logs (with confirmation)
- Shows log file path info

---

## 4. Component Library (`src/components/`)

### Common Components (33 components)

| Component                    | Purpose                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| `AppLayout`                  | Shared page layout wrapper with Navbar                                |
| `Navbar`                     | Top navigation bar with branding, navigation links, save button       |
| `Sidebar`                    | Slide-in sidebar panel                                                |
| `Page`                       | Base page container                                                   |
| `Header` / `HeaderContainer` | Section headers                                                       |
| `Button`                     | Styled button with variants (primary, secondary, danger, ghost, link) |
| `Input`                      | Text input with label, prefix/suffix, validation                      |
| `Select`                     | Feature-rich dropdown with search, grouping                           |
| `MultiSelect`                | Multi-value select with tags                                          |
| `NumberInput`                | Numeric input with increment/decrement controls                       |
| `Checkbox`                   | Styled checkbox                                                       |
| `Switch`                     | Toggle switch                                                         |
| `Toggler`                    | Label + toggle switch combo                                           |
| `Radio`                      | Radio button group                                                    |
| `CardRadioGroup`             | Visual card-based radio selection                                     |
| `SelectionCard`              | Clickable selection card with icon                                    |
| `Card`                       | Generic content card                                                  |
| `Toast`                      | Toast notification component                                          |
| `ToastContainer`             | Fixed-position toast stack                                            |
| `Loader`                     | Spinning loader indicator                                             |
| `Skeleton`                   | Shimmer skeleton placeholder                                          |
| `Stepper`                    | Step indicator for onboarding                                         |
| `ConfirmationModal`          | Confirmation dialog                                                   |
| `CustomModal`                | Generic modal overlay                                                 |
| `CopyToClipboard`            | Click-to-copy text utility                                            |
| `EditableText`               | Inline editable text                                                  |
| `ListSelect`                 | Simple list-based selector                                            |
| `Popover`                    | Floating popover                                                      |
| `ToolTip`                    | Hover tooltip                                                         |
| `BuyProTooltip`              | Pro feature upsell tooltip                                            |
| `Icons`                      | 30+ custom SVG icon components                                        |
| `classes.ts`                 | CSS class utility helpers                                             |

### Settings Components (7 components)

| Component               | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `ConnectAccountCard`    | YouTube connection management UI                          |
| `SyncCard`              | Sync settings and manual sync                             |
| `PlacementSettingsCard` | Video placement configuration with visual previews        |
| `AdvancedSettingsCard`  | Debug mode and data management                            |
| `ProductSkeleton`       | Product page preview skeleton for placement visualization |
| `VideoPlaceholder`      | Video player placeholder display                          |
| `types.ts`              | Settings-specific TypeScript interfaces                   |

### Loading Components (2 components)

| Component      | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| `PageSkeleton` | Full-page skeleton loader with variants (default, logs) |

---

## 5. State Management (`src/store/`)

### wpabStore.tsx — Global State via React Context

**Data Source**: PHP passes initial data via `wp_localize_script()` as `tubebay_Localize` global.

**Store Shape** (`BoilerplateStore`):

```typescript
{
  version: string; // Plugin version
  root_id: string; // 'tubebay'
  nonce: string; // WP REST nonce
  store: string; // Store name
  rest_url: string; // REST API base URL
  pluginData: PluginData; // Branding info
  wpSettings: WpSettings; // Date/time formats
  plugin_settings: PluginSettings; // All plugin settings
  products_url: string; // Admin products URL
}
```

**Actions**:

- `updateStore(key, value)` — Update any top-level store key
- `updateSettings(key, value)` — Update a specific plugin setting

**Features**:

- API fetch middleware setup (nonce + root URL)
- Server time synchronization (updates every 60 seconds)

### Toast System (`store/toast/use-toast.tsx`)

- Toast notification provider with add/remove capabilities
- Supports `info`, `success`, `error` variants
- Auto-dismiss with configurable duration

---

## 6. Custom Hooks (`src/hooks/`)

### useYouTubeActions.tsx

Shared hook for YouTube-related actions:

- `handleTestConnection(apiKey, channelId)` — Tests connection
- `handleSyncLibrary()` — Triggers library sync
- Manages loading/error states

---

## 7. Utilities (`src/utils/`)

| File                 | Purpose                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `types.ts`           | Core TypeScript interfaces (`PluginData`, `WpSettings`, `PluginSettings`, `BoilerplateStore`, `SyncPlacementSettings`) |
| `Dates.ts`           | Date formatting utilities, `timeDiff()` for relative time display                                                      |
| `apiFetch.ts`        | Wrapper around `@wordpress/api-fetch`                                                                                  |
| `getBool.ts`         | Safely converts values to boolean                                                                                      |
| `status_helpers.tsx` | Status badge rendering helpers                                                                                         |
| `useMenuSync.ts`     | Syncs React Router location with WordPress admin sidebar menu highlighting                                             |

---

## 8. Styling (`src/styles/`)

### index.scss

- Imports TailwindCSS (`@tailwind base/components/utilities`)
- Custom TailwindCSS component layer with `tubebay-` prefixed utilities:
  - Color tokens: primary `#3858e9`, secondary `#f1f5f9`
  - Typography scale: `tubebay-t-1` through `tubebay-t-6`
  - Layout utilities: max-width, padding, gaps
- WordPress admin overrides (removes padding, hides WP notices and footer)
- Skeleton shimmer animation
- Toast animations (slide-in/out with variants)
- Modal and tooltip animations
- Responsive breakpoints for modals

### TailwindCSS Configuration

- Prefix: `tubebay-` (prevents conflicts with WordPress admin CSS)
- Scoped to `src/**/*.{js,ts,jsx,tsx}` files only

---

## 9. Data Flow: PHP → React → YouTube API

```
PHP Activation                  React SPA Boot
      │                              │
      ▼                              ▼
Settings::get_all()         tubebay_Localize (global)
      │                              │
      └── wp_localize_script() ──────┘
                                     │
                                     ▼
                              wpabStore (Context)
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ChannelLibrary    Settings        Onboarding
                    │                │                │
                    ▼                ▼                ▼
              apiFetch()         apiFetch()      apiFetch()
              GET /videos        POST /settings  POST /test-connection
                    │                │                │
                    ▼                ▼                ▼
            YouTubeController  SettingsController  YouTubeController
                    │                │                │
                    ▼                │                ▼
              Channel.php           │          Channel.php
                    │                │                │
                    ▼                │                ▼
            YouTube API v3          │          YouTube API v3
            (playlistItems/         │          (channels endpoint)
             search)                │
                    │                │
                    ▼                ▼
              WP Transient     wp_options table
              (video cache)    (individual settings)
```
