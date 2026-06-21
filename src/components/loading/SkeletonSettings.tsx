import React from "react";

export const SkeletonSettings: React.FC = () => {
  const SkeleBox = () => (
    <div className="wpab-mb-8 wpab-bg-white wpab-border wpab-border-gray-200 wpab-rounded-lg wpab-overflow-hidden">
      <div className="wpab-px-6 wpab-py-5 wpab-border-b wpab-border-gray-200">
        <div className="wpab-h-6 wpab-bg-gray-200 wpab-rounded wpab-w-48 wpab-mb-2"></div>
        <div className="wpab-h-4 wpab-bg-gray-200 wpab-rounded wpab-w-96"></div>
      </div>
      <div className="wpab-px-6 wpab-py-6 wpab-flex wpab-flex-col wpab-gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="wpab-flex wpab-gap-4">
            <div className="wpab-w-1/3">
              <div className="wpab-h-5 wpab-bg-gray-200 wpab-rounded wpab-w-32 wpab-mb-2"></div>
              <div className="wpab-h-3 wpab-bg-gray-200 wpab-rounded wpab-w-24"></div>
            </div>
            <div className="wpab-w-2/3">
              <div className="wpab-h-10 wpab-bg-gray-200 wpab-rounded wpab-w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="wpab-animate-pulse wpab-w-full">
      <SkeleBox />
      <SkeleBox />
      <div className="wpab-h-10 wpab-bg-gray-200 wpab-rounded wpab-w-32 wpab-mt-8"></div>
    </div>
  );
};
