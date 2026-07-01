import { FC } from "react";
import Skeleton from "../common/Skeleton";

interface VideoGridSkeletonProps {
  viewMode: "grid" | "list";
  count?: number;
}

export const VideoGridSkeleton: FC<VideoGridSkeletonProps> = ({
  viewMode,
  count = 12,
}) => {
  const isGrid = viewMode === "grid";

  return (
    <div
      className={
        isGrid
          ? "tubebay-grid tubebay-grid-cols-1 md:tubebay-grid-cols-2 lg:tubebay-grid-cols-3 xl:tubebay-grid-cols-4 tubebay-gap-[24px]"
          : "tubebay-flex tubebay-flex-col tubebay-gap-[16px]"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`tubebay-bg-white tubebay-border tubebay-border-gray-200 tubebay-rounded-[12px] tubebay-overflow-hidden tubebay-shadow-sm ${
            !isGrid ? "tubebay-flex tubebay-flex-col sm:tubebay-flex-row" : ""
          }`}
        >
          {/* Thumbnail Skeleton */}
          <div
            className={`tubebay-relative tubebay-bg-gray-100 ${
              !isGrid
                ? "sm:tubebay-w-[240px] tubebay-shrink-0"
                : "tubebay-aspect-video"
            }`}
          >
            <Skeleton className="tubebay-absolute tubebay-inset-0 tubebay-w-full tubebay-h-full tubebay-rounded-none" />
          </div>

          {/* Content Skeleton */}
          <div className="tubebay-p-[16px] tubebay-flex-1 tubebay-flex tubebay-flex-col">
            <div className="tubebay-mb-3">
              <Skeleton className="tubebay-h-4 tubebay-w-3/4 tubebay-mb-2 tubebay-rounded" />
              <Skeleton className="tubebay-h-4 tubebay-w-1/2 tubebay-rounded" />
            </div>

            {!isGrid && (
              <div className="tubebay-hidden sm:tubebay-block tubebay-mb-4">
                <Skeleton className="tubebay-h-3 tubebay-w-full tubebay-mb-1 tubebay-rounded" />
                <Skeleton className="tubebay-h-3 tubebay-w-2/3 tubebay-rounded" />
              </div>
            )}

            <div className="tubebay-mt-auto tubebay-flex tubebay-items-center tubebay-gap-3">
              <Skeleton className="tubebay-h-8 tubebay-w-24 tubebay-rounded-md" />
              <div className="tubebay-flex tubebay-gap-2 tubebay-ml-auto">
                <Skeleton className="tubebay-h-8 tubebay-w-8 tubebay-rounded-md" />
                <Skeleton className="tubebay-h-8 tubebay-w-8 tubebay-rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
