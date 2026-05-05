# Product Mapping

Product Mapping is the core feature of TubeBay. it allows you to link specific YouTube videos to your WooCommerce products, making your store more interactive and helping customers see your products in action.

## How it works

Each video in your synced library can be "Attached" to one or more WooCommerce products. Once attached, the video will automatically appear on the single product page of your store.

## Mapping a Video

Unlike traditional mapping where you link from a library, TubeBay allows you to link videos directly while you are editing your products.

1. Go to **Products > All Products** and edit the product you want to add a video to. Look for the **TubeBay Video** meta box in the sidebar and click **Select Video from Library**.

![Step 1: Meta Box Location](/public/img/feature-mapping-step1.png)

2. A modal will open displaying your entire synced YouTube library. Simply click on any video thumbnail to select it for this product.

![Step 2: Video Selection Modal](/public/img/feature-mapping-step2.png)

3. Once selected, you will see a preview of the video inside the meta box. You can change it at any time by clicking the edit icon or remove it entirely.

![Step 3: Selected Video Preview](/public/img/feature-mapping-step3.png)

4. Finally, click the **Update** or **Publish** button in the WooCommerce "Publish" box to save your mapping.

![Step 4: Save Mapping](/public/img/feature-mapping-step4.png)

---

## Mapping Multiple Products

Each WooCommerce product can be mapped to one YouTube video. If you want to change the video, simply click the **Select Video from Library** button again in the meta box and choose a new one.

---

## Technical Details

- **Storage:** Mappings are stored in a custom WordPress database table (`wp_tubebay_mappings`).
- **Performance:** TubeBay uses optimized queries to fetch mapped videos, ensuring your product pages remain fast.
- **Auto-Sync:** If you delete a product in WooCommerce, the mapping will automatically be cleaned up during the next sync.
- **Persistent Links:** Once a video is mapped, the link remains until you manually unmap it or delete the product.

## Product Search

The mapping search bar utilizes the WooCommerce product search API, allowing you to find products by:

- Title
- SKU
- ID

