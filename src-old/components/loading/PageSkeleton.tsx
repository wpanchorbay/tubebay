import { FC } from "react";
import Skeleton from "../common/Skeleton";

interface PageSkeletonProps {
  type?: "settings" | "logs" | "default";
}

export const PageSkeleton: FC<PageSkeletonProps> = ({ type = "default" }) => {
  return (
    <div className="tubebay-animate-in tubebay-fade-in tubebay-duration-300">
      <div className="tubebay-mb-8">
        <Skeleton className="tubebay-h-8 tubebay-w-64 tubebay-mb-3 tubebay-rounded-md" />
        <Skeleton className="tubebay-h-4 tubebay-w-96 tubebay-rounded" />
      </div>

      <div className="tubebay-flex tubebay-flex-col tubebay-gap-[24px]">
        {/* Card 1 */}
        <div className="tubebay-bg-white tubebay-rounded-xl tubebay-shadow-sm tubebay-border tubebay-border-gray-200 tubebay-p-[24px]">
          <div className="tubebay-flex tubebay-items-center tubebay-gap-4 tubebay-mb-6">
            <Skeleton className="tubebay-h-12 tubebay-w-12 tubebay-rounded-full" />
            <div className="tubebay-flex-1">
              <Skeleton className="tubebay-h-5 tubebay-w-48 tubebay-mb-2 tubebay-rounded" />
              <Skeleton className="tubebay-h-4 tubebay-w-3/4 tubebay-rounded" />
            </div>
            {type === "settings" && (
              <Skeleton className="tubebay-h-10 tubebay-w-32 tubebay-rounded-md" />
            )}
          </div>

          <div className="tubebay-space-y-4">
            <Skeleton className="tubebay-h-12 tubebay-w-full tubebay-rounded-md" />
            <Skeleton className="tubebay-h-12 tubebay-w-full tubebay-rounded-md" />
            <Skeleton className="tubebay-h-12 tubebay-w-full tubebay-rounded-md" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="tubebay-bg-white tubebay-rounded-xl tubebay-shadow-sm tubebay-border tubebay-border-gray-200 tubebay-p-[24px]">
          <div className="tubebay-mb-6">
            <Skeleton className="tubebay-h-5 tubebay-w-40 tubebay-mb-2 tubebay-rounded" />
            <Skeleton className="tubebay-h-4 tubebay-w-1/2 tubebay-rounded" />
          </div>

          {type === "logs" ? (
            <Skeleton
              height="[400px]"
              className="tubebay-w-full tubebay-rounded-lg"
            />
          ) : (
            <div className="tubebay-grid tubebay-grid-cols-1 md:tubebay-grid-cols-2 tubebay-gap-4">
              <Skeleton className="tubebay-h-24 tubebay-w-full tubebay-rounded-lg" />
              <Skeleton className="tubebay-h-24 tubebay-w-full tubebay-rounded-lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
