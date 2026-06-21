import React from "react";

export const SkeletonSettings: React.FC = () => {
  const SkeleBox = () => (
    <div className="tubebay-mb-8 tubebay-bg-white tubebay-border tubebay-border-gray-200 tubebay-rounded-lg tubebay-overflow-hidden">
      <div className="tubebay-px-6 tubebay-py-5 tubebay-border-b tubebay-border-gray-200">
        <div className="tubebay-h-6 tubebay-bg-gray-200 tubebay-rounded tubebay-w-48 tubebay-mb-2"></div>
        <div className="tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded tubebay-w-96"></div>
      </div>
      <div className="tubebay-px-6 tubebay-py-6 tubebay-flex tubebay-flex-col tubebay-gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="tubebay-flex tubebay-gap-4">
            <div className="tubebay-w-1/3">
              <div className="tubebay-h-5 tubebay-bg-gray-200 tubebay-rounded tubebay-w-32 tubebay-mb-2"></div>
              <div className="tubebay-h-3 tubebay-bg-gray-200 tubebay-rounded tubebay-w-24"></div>
            </div>
            <div className="tubebay-w-2/3">
              <div className="tubebay-h-10 tubebay-bg-gray-200 tubebay-rounded tubebay-w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tubebay-animate-pulse tubebay-w-full">
      <SkeleBox />
      <SkeleBox />
      <div className="tubebay-h-10 tubebay-bg-gray-200 tubebay-rounded tubebay-w-32 tubebay-mt-8"></div>
    </div>
  );
};
