# Visual Placement

TubeBay allows you to choose exactly where the video player should appear on your product pages. This is managed via hooks and can be configured globally or overridden for specific needs.

## Global Placement Settings
In **Settings > Video Player**, you can choose from several predefined locations:

| Location | Technical Hook | Description |
|-----------|----------------|-------------|
| **Above Product Gallery** | `woocommerce_before_single_product_summary` (priority 5) | Places the video at the very top of the product image area. |
| **Below Product Gallery** | `woocommerce_product_thumbnails` (priority 20) | Displays the video underneath the main product images. |
| **After Product Summary** | `woocommerce_after_single_product_summary` | Inserts the player after the short description and add-to-cart area. |

## Shortcodes (Manual Placement)
If you need to place a video in a custom location (like within the product description or a page builder layout), you can use our [Shortcode system](/features/shortcodes).

## Custom Hooks
Developers can use the `tubebay_video_player` hook to render the player manually within their own theme templates.

```php
<?php echo do_shortcode('[tubebay_video]'); ?>
```

## CSS Customization
Each player is wrapped in a dedicated container with the class `.tubebay-video-wrapper`. You can use this class to add custom margins, borders, or shadows via your theme's custom CSS.
