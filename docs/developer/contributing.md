# Contributing to TubeBay

Thank you for your interest in contributing to TubeBay! This guide will help you set up a local development environment.

## Getting Started

### Prerequisites
- **PHP 7.4+**
- **Composer**
- **Node.js 18+** and **npm**
- **WordPress** local environment (LocalWP, DevKinsta, Lando, etc.)

### Setup
1. Fork the TubeBay repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/wpanchorbay/tubebay.git
   cd tubebay
   ```
3. Install PHP dependencies:
   ```bash
   composer install
   ```
4. Install JS dependencies and build assets:
   ```bash
   npm install
   npm run build
   ```

## Development Workflow

### Admin UI (React)
The admin interface is located in the `src/` directory and built with Vite.
- Run `npm run dev` for hot-module reloading.
- All styles are built with Tailwind CSS.

### Backend (PHP)
- Follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/).
- Prefix all global functions and classes with `tubebay_` or use the `TubeBay\\` namespace.

### Documentation
Documentation is built with VitePress and located in the `docs/` folder.
- Run `cd docs && npm run docs:dev` to preview changes.

## Submitting Pull Requests
- Create a new branch for each feature or bugfix.
- Ensure your code follows the project's coding standards.
- Update documentation if you add new features or change existing ones.
- Provide a clear description of the changes in your PR.

## Bug Reports
Found a bug or have a suggestion? Please open an issue on the [GitHub Issue Tracker](https://github.com/wpanchorbay/tubebay/issues).

Thank you for helping make TubeBay better! 🚀
