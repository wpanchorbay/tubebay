# TubeBay — Supplemental Details (What Summaries 01–05 Didn't Cover)

This file fills every gap found during a file-by-file verification audit of all 117 project files.

---

## 1. Product Metabox JavaScript (`assets/js/admin/product-metabox.js`)

A **jQuery-based** script (separate from the React SPA) that powers the video selection modal on the WooCommerce product edit screen.

**How It Works**:

1. Binds to "Select Video" and "Edit Video" buttons → opens modal overlay
2. Uses **AJAX** (`$.ajax`) to call `GET /tubebay/v1/youtube/videos` with search, sort, and page_token params
3. Renders a grid of video thumbnails dynamically
4. On video click: populates hidden input fields (`_tubebay_video_id`, `_tubebay_video_title`, `_tubebay_video_thumbnail`) and updates the preview card
5. "Remove Video" clears all hidden fields and switches UI back to "Select" state
6. **Search**: Debounced 500ms input handler resets pagination and re-fetches
7. **Sort**: Change handler resets pagination and re-fetches
8. **Load More**: Pagination via `nextPageToken` from YouTube API
9. All REST requests include `X-WP-Nonce` header for security

**UX States**:

- Loading text while fetching
- Error text if no videos found
- Show/hide "Load More" button based on pagination token

---

## 2. Public Façade Script (`assets/js/public.js`)

The Video Façade is TubeBay's core performance optimization. Here's exactly what it does:

```
Page loads → Static thumbnail + SVG play button (lightweight)
User clicks → JavaScript creates <iframe> dynamically → YouTube player loads
```

**Detailed behavior**:

1. On `DOMContentLoaded`, finds all `.tubebay-video-facade` elements
2. Adds click listener to each
3. On click:
   - Prevents default (stops WooCommerce lightbox from opening)
   - Stops event propagation
   - Reads `data-video-id` attribute
   - Creates an `<iframe>` with `autoplay=1&rel=0`
   - Positions iframe absolutely (fills 16:9 container)
   - Replaces the thumbnail + play button with the iframe
   - Removes cursor pointer styling

---

## 3. Product Metabox CSS (`assets/css/admin/product-metabox.css`)

315 lines of custom CSS covering:

| Section          | What It Styles                                                                    |
| ---------------- | --------------------------------------------------------------------------------- |
| Video Card       | Thumbnail with 16:9 aspect ratio, play icon overlay, action buttons (edit/remove) |
| Toggle Switch    | Custom iOS-style toggle (`.tubebay-switch`, `.tubebay-slider`)                    |
| Setting Rows     | Horizontal flex layout with label + control                                       |
| Modal Overlay    | Full-screen dark overlay (`rgba(0,0,0,0.6)`)                                      |
| Modal Content    | Centered 800px max, 80vh max-height, rounded corners, shadow                      |
| Modal Header     | Title + close button                                                              |
| Filter Toolbar   | Search input + sort dropdown on gray background                                   |
| Video Grid       | CSS Grid with `auto-fill, minmax(200px, 1fr)`                                     |
| Video Items      | Hover effects: blue border + shadow                                               |
| Load More Footer | Centered at bottom of modal                                                       |

---

## 4. Public CSS (`assets/css/public.css`)

37 lines covering:

- `.tubebay-product-video-wrapper` — Full-width video container with margin
- `.tubebay-responsive-iframe-container` — 16:9 aspect ratio via `padding-bottom: 56.25%`
- `.tubebay-video-facade:hover .tubebay-play-bg` — YouTube red (#ff0000) play button on hover
- `.tubebay-video-facade:hover img` — Slight dimming on hover (opacity 0.85)

---

## 5. Admin Menu CSS (`assets/css/admin-menu.css`)

21 lines styling the custom admin menu icon:

- Sets TubeBay SVG icon to 20px width
- Aligns icon within WordPress admin sidebar using flexbox

---

## 6. Missing Frontend Components

### VideoGridSkeleton (`components/loading/VideoGridSkeleton.tsx`)

- Shimmer loading skeleton for the video library
- Supports **two view modes**: `grid` and `list`
- Grid mode: 4-column responsive grid
- List mode: vertical card layout with horizontal flex
- Each skeleton card has thumbnail, title, description, and action button placeholders
- Default count: 12 skeleton items

### useClickOutside Hook (`components/common/hooks/useClickOutside.ts`)

- Custom React hook to detect clicks outside a referenced element
- Used by dropdown/select/popover components to close on outside click
- Listens to both `mousedown` and `touchstart` events
- Cleans up listeners on unmount

---

## 7. Navbar Component Details (`components/common/Navbar.tsx`)

The top navigation bar (281 lines) includes:

**Structure**:

- TubeBay logo (loaded from `assets/img/TubeBay.svg`)
- Navigation links: Channel Library, Settings
- Connection status indicator (color-coded)
- Last sync time display
- External links: Documentation, Support
- Mobile hamburger menu

**Connection Status Display**:

- Uses `getConnectionStatusText()` helper
- Shows colored WiFi icon based on status
- Displays `timeDiff()` for last sync time

---

## 8. Date Utility Functions (`utils/Dates.ts`)

| Function                         | Purpose                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `formatDateTime(dateTimeString)` | Formats a date/timestamp per WordPress date + time format settings                                   |
| `formatDate(dateTimeString)`     | Formats date-only per WordPress settings                                                             |
| `timeDiff(dateTimeString)`       | Returns human-readable relative time (e.g., "3 hours ago"), falls back to absolute time if > 10 days |
| `currentDateTime()`              | Returns current server time formatted per WordPress settings                                         |

All functions respect WordPress timezone offset settings.

---

## 9. API Fetch Utility (`utils/apiFetch.ts`)

A secondary initialization file for `@wordpress/api-fetch`:

- Declares global `window.tubebay_Localize` TypeScript type
- Sets up nonce middleware and root URL middleware
- This is an alternative to the primary setup in `wpabStore.tsx`

---

## 10. Status Helpers (`utils/status_helpers.tsx`)

Provides `getConnectionStatusText()` function that maps connection status strings to human-readable display text for the Navbar and status indicators.

---

## 11. getBool Utility (`utils/getBool.ts`)

Simple utility that safely converts any value to a boolean, handling strings like `"true"`, `"false"`, `"1"`, `"0"`.

---

## 12. useMenuSync Hook (`utils/useMenuSync.ts`)

Synchronizes React Router navigation with WordPress admin sidebar menu:

- When user navigates within the React SPA, updates the highlighted menu item in the WordPress admin sidebar
- Uses `useLocation()` from React Router to detect route changes
- Manipulates WordPress admin menu DOM classes to keep sidebar highlighting in sync

---

## 13. Configuration Files Not Detailed Earlier

### PostCSS Config (`postcss.config.js`)

```js
plugins: { tailwindcss: {}, autoprefixer: {} }
```

Processes TailwindCSS utilities and adds vendor prefixes.

### TailwindCSS Config (`tailwind.config.js`)

- **Prefix**: `tubebay-` (all Tailwind classes get this prefix)
- **Content**: Scans only `src/**/*.{js,jsx,ts,tsx}`
- **No custom plugins**

### TypeScript Config (`tsconfig.json`)

- Target: ES2020
- Module: ESNext
- Strict mode enabled
- JSX: `react-jsx` (automatic runtime)
- Includes: `src/` directories (pages, components, store, utils)
- Excludes: `node_modules`, `build`, `vendor`
- `noEmit: true` (webpack handles emission)

### Composer Config (`composer.json`)

```json
{
  "name": "dipta-sdd/tubebay",
  "type": "wordpress-plugin",
  "require": { "php": ">=7.4" },
  "autoload": { "psr-4": { "TubeBay\\": "app/" } }
}
```

PSR-4 autoloading maps `TubeBay\` namespace to `app/` directory.

---

## 14. Package Script (`package.sh`)

Creates a distribution-ready `tubebay.zip` for WordPress.org submission:

**Included in ZIP**:
| What | Source |
|---|---|
| `app/` | PHP backend |
| `languages/` | Translation files |
| `assets/` | CSS, JS, images |
| `build/` | Compiled React SPA |
| `index.php` | Security file |
| `readme.txt` | WordPress.org listing |
| `uninstall.php` | Cleanup script |
| `tubebay.php` | Plugin entry point |

**Excluded from ZIP** (not included):

- `src/` (source code)
- `node_modules/`
- `vendor/`
- `package.json` / `composer.json`
- Build config files
- `.git/`

---

## 15. Git Configuration (`.gitignore`)

Ignored files/directories:
| Entry | Reason |
|---|---|
| `/node_modules` | npm dependencies |
| `/vendor` | Composer dependencies |
| `/build` | Compiled output |
| `package-lock.json` | Lock file |
| `tubebay.zip` | Distribution package |
| `routing.json`, `wp-cli.phar` | Development tools |
| `all_php_code.txt`, `todo.txt`, `todo.md` | Dev notes |
| `documentation.zip`, `campaignbay.zip` | Archives |

---

## 16. VS Code Configuration (`.vscode/`)

### settings.json

- Custom title bar and activity bar colors (`#f02a74` — brand pink/red)
- Intelephense PHP autocomplete includes WooCommerce path

### tasks.json

- Two build tasks configured:
  1. `npm: build` — Modern build (default)
  2. `npm: build:legacy` — Legacy build

---

## 17. Translation File (`languages/tubebay.pot`)

POT (Portable Object Template) file for i18n — contains all translatable strings extracted from the plugin. Generated via `npm run makepot`.

---

## 18. Development Directory (`.dev/`)

Contains a `ui/` subdirectory — likely used for UI mockups/design references during development. Currently empty or not version-controlled.

---

## 19. Security Index Files

Every directory contains an `index.php` file with content like:

```php
<?php
// Silence is golden.
```

This prevents directory listing if the web server's directory indexing is enabled. Present in: `app/`, `app/Core/`, `app/Admin/`, `app/Api/`, `app/Data/`, `app/Data/Entities/`, `app/Frontend/`, `app/Helper/`, `app/Integration/`, `assets/`, `assets/img/`, `config/`, root `index.php`.
