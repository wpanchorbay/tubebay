import React from "react";
import { VideoPosition } from "./types";
import { Image as ImageIcon } from "lucide-react";
import { VideoPlaceholder as BaseVideoPlaceholder } from "./VideoPlaceholder";

interface ProductSkeletonProps {
  selectedPosition: VideoPosition;
  useMotion?: boolean;
}

export function ProductSkeleton({
  selectedPosition,
  useMotion = true,
}: ProductSkeletonProps) {
  const VideoPlaceholder = (props: any) => (
    <BaseVideoPlaceholder {...props} useMotion={useMotion} />
  );
  const isSelected = (pos: VideoPosition) => selectedPosition === pos;

  return (
    <div className="tubebay-w-full tubebay-max-w-5xl tubebay-mx-auto tubebay-bg-white tubebay-rounded-xl tubebay-shadow-sm tubebay-border tubebay-border-gray-200 tubebay-overflow-hidden">
      {/* Fake Header */}
      <div className="tubebay-h-16 tubebay-border-b tubebay-border-gray-100 tubebay-flex tubebay-items-center tubebay-px-8 tubebay-justify-between tubebay-bg-gray-50/50">
        <div className="tubebay-w-32 tubebay-h-6 tubebay-bg-gray-200 tubebay-rounded-md tubebay-animate-pulse" />
        <div className="tubebay-flex tubebay-gap-6">
          <div className="tubebay-w-16 tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded-md tubebay-animate-pulse" />
          <div className="tubebay-w-16 tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded-md tubebay-animate-pulse" />
          <div className="tubebay-w-16 tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded-md tubebay-animate-pulse" />
        </div>
      </div>

      <div className="tubebay-p-8">
        {/* woocommerce_before_single_product */}
        {isSelected("woocommerce_before_single_product") && (
          <VideoPlaceholder
            label="Before Single Product"
            className="tubebay-my-4"
          />
        )}

        {/* Breadcrumbs */}
        <div className="tubebay-w-48 tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-mb-8 tubebay-animate-pulse" />

        {/* woocommerce_before_single_product_summary */}
        {isSelected("woocommerce_before_single_product_summary") && (
          <VideoPlaceholder
            label="Before Product Summary"
            className="tubebay-my-4"
          />
        )}

        <div className="tubebay-grid tubebay-grid-cols-1 md:tubebay-grid-cols-2 tubebay-gap-12 tubebay-mt-4">
          {/* Left Column: Gallery */}
          <div className="tubebay-space-y-4">
            {/* Main Image */}
            <div className="tubebay-relative">
              {isSelected("replace_main_image") ? (
                <VideoPlaceholder
                  label="Featured Video (First Slide)"
                  className="tubebay-aspect-square tubebay-w-full"
                />
              ) : (
                <div className="tubebay-w-full tubebay-aspect-square tubebay-bg-gray-100 tubebay-rounded-lg tubebay-flex tubebay-items-center tubebay-justify-center tubebay-text-gray-300 tubebay-animate-pulse">
                  <ImageIcon className="tubebay-w-16 tubebay-h-16 tubebay-opacity-50" />
                </div>
              )}
            </div>

            {/* woocommerce_product_thumbnails */}
            {isSelected("woocommerce_product_thumbnails") && (
              <VideoPlaceholder
                label="Product Thumbnails"
                className="tubebay-my-4"
              />
            )}

            {/* Thumbnails */}
            <div className="tubebay-grid tubebay-grid-cols-4 tubebay-gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="tubebay-aspect-square tubebay-bg-gray-100 tubebay-rounded-md tubebay-animate-pulse"
                />
              ))}

              {isSelected("add_to_gallery_last") ? (
                <VideoPlaceholder
                  label="Video Slot"
                  className="tubebay-aspect-square"
                  hideLabel={true}
                />
              ) : (
                <div className="tubebay-aspect-square tubebay-bg-gray-100 tubebay-rounded-md tubebay-animate-pulse" />
              )}
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="tubebay-space-y-6">
            {/* woocommerce_single_product_summary */}
            {isSelected("woocommerce_single_product_summary") && (
              <VideoPlaceholder
                label="Single Product Summary"
                className="tubebay-my-4"
              />
            )}

            {/* Title & Price */}
            <div className="tubebay-space-y-4">
              <div className="tubebay-w-3/4 tubebay-h-8 tubebay-bg-gray-200 tubebay-rounded-md tubebay-animate-pulse" />
              <div className="tubebay-w-1/4 tubebay-h-6 tubebay-bg-gray-200 tubebay-rounded-md tubebay-animate-pulse" />
            </div>

            {/* Short Description */}
            <div className="tubebay-space-y-2 tubebay-py-4">
              <div className="tubebay-w-full tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
              <div className="tubebay-w-full tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
              <div className="tubebay-w-2/3 tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
            </div>

            {/* woocommerce_before_add_to_cart_form */}
            {isSelected("woocommerce_before_add_to_cart_form") && (
              <VideoPlaceholder
                label="Before Add to Cart Form"
                className="tubebay-my-4"
              />
            )}

            {/* Add to Cart Form Block */}
            <div className="tubebay-p-4 tubebay-border tubebay-border-gray-100 tubebay-rounded-lg tubebay-bg-gray-50/50">
              {/* woocommerce_before_variations_form */}
              {isSelected("woocommerce_before_variations_form") && (
                <VideoPlaceholder
                  label="Before Variations Form"
                  className="tubebay-my-4"
                />
              )}

              {/* Variations Mockup */}
              <div className="tubebay-flex tubebay-gap-4 tubebay-mb-4">
                <div className="tubebay-w-20 tubebay-h-8 tubebay-bg-gray-200 tubebay-rounded tubebay-animate-pulse" />
                <div className="tubebay-flex-1 tubebay-h-8 tubebay-bg-gray-200 tubebay-rounded tubebay-animate-pulse" />
              </div>

              {/* woocommerce_before_add_to_cart_button */}
              {isSelected("woocommerce_before_add_to_cart_button") && (
                <VideoPlaceholder
                  label="Before Add to Cart Button"
                  className="tubebay-my-4"
                />
              )}

              {/* woocommerce_before_single_variation */}
              {isSelected("woocommerce_before_single_variation") && (
                <VideoPlaceholder
                  label="Before Single Variation"
                  className="tubebay-my-4"
                />
              )}

              {/* woocommerce_single_variation */}
              {isSelected("woocommerce_single_variation") && (
                <VideoPlaceholder
                  label="Single Variation"
                  className="tubebay-my-4"
                />
              )}

              {/* Variation Price */}
              <div className="tubebay-w-32 tubebay-h-6 tubebay-bg-gray-200 tubebay-rounded tubebay-my-4 tubebay-animate-pulse" />

              {/* woocommerce_after_single_variation */}
              {isSelected("woocommerce_after_single_variation") && (
                <VideoPlaceholder
                  label="After Single Variation"
                  className="tubebay-my-4"
                />
              )}

              {/* woocommerce_before_add_to_cart_quantity */}
              {isSelected("woocommerce_before_add_to_cart_quantity") && (
                <VideoPlaceholder
                  label="Before Quantity"
                  className="tubebay-my-4"
                />
              )}

              {/* Add to Cart Row */}
              <div className="tubebay-flex tubebay-gap-4 tubebay-mb-4">
                <div className="tubebay-w-20 tubebay-h-12 tubebay-bg-gray-200 tubebay-rounded-md tubebay-animate-pulse" />
                <div className="tubebay-flex-1 tubebay-h-12 tubebay-bg-gray-900 tubebay-rounded-md tubebay-opacity-10 tubebay-animate-pulse" />
              </div>

              {/* woocommerce_after_add_to_cart_button */}
              {isSelected("woocommerce_after_add_to_cart_button") && (
                <VideoPlaceholder
                  label="After Add to Cart Button"
                  className="tubebay-my-4"
                />
              )}

              {/* woocommerce_after_variations_form */}
              {isSelected("woocommerce_after_variations_form") && (
                <VideoPlaceholder
                  label="After Variations Form"
                  className="tubebay-my-4"
                />
              )}
            </div>

            {/* woocommerce_after_add_to_cart_form */}
            {isSelected("woocommerce_after_add_to_cart_form") && (
              <VideoPlaceholder
                label="After Add to Cart Form"
                className="tubebay-my-4"
              />
            )}

            {/* Meta */}
            <div className="tubebay-space-y-2 tubebay-pt-4 tubebay-border-t tubebay-border-gray-100">
              {/* woocommerce_product_meta_start */}
              {isSelected("woocommerce_product_meta_start") && (
                <VideoPlaceholder
                  label="Product Meta Start"
                  className="tubebay-my-4"
                />
              )}

              <div className="tubebay-w-1/3 tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
              <div className="tubebay-w-1/2 tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />

              {/* woocommerce_product_meta_end */}
              {isSelected("woocommerce_product_meta_end") && (
                <VideoPlaceholder
                  label="Product Meta End"
                  className="tubebay-my-4"
                />
              )}

              {/* woocommerce_share */}
              {isSelected("woocommerce_share") && (
                <VideoPlaceholder
                  label="Product Share"
                  className="tubebay-my-4"
                />
              )}
            </div>
          </div>
        </div>

        {/* woocommerce_after_single_product_summary */}
        {isSelected("woocommerce_after_single_product_summary") && (
          <VideoPlaceholder
            label="After Product Summary"
            className="tubebay-my-4"
          />
        )}

        {/* Bottom Section: Tabs */}
        <div className="tubebay-mt-16 tubebay-space-y-6">
          {/* Tabs Header */}
          <div className="tubebay-flex tubebay-gap-8 tubebay-border-b tubebay-border-gray-200 tubebay-pb-4">
            <div className="tubebay-w-24 tubebay-h-4 tubebay-bg-gray-800 tubebay-rounded tubebay-opacity-80 tubebay-animate-pulse" />
            <div className="tubebay-w-24 tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded tubebay-animate-pulse" />
            <div className="tubebay-w-24 tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded tubebay-animate-pulse" />
          </div>

          {/* Tab Content */}
          <div className="tubebay-py-6 tubebay-space-y-4">
            <div className="tubebay-w-full tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
            <div className="tubebay-w-full tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
            <div className="tubebay-w-full tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
            <div className="tubebay-w-4/5 tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
            <div className="tubebay-w-full tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
            <div className="tubebay-w-1/2 tubebay-h-3 tubebay-bg-gray-100 tubebay-rounded tubebay-animate-pulse" />
          </div>
        </div>

        {/* woocommerce_after_single_product */}
        {isSelected("woocommerce_after_single_product") && (
          <VideoPlaceholder
            label="After Single Product"
            className="tubebay-my-4"
          />
        )}
      </div>
    </div>
  );
}
