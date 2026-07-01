import React from "react";

export const SkeletonLogs: React.FC = () => {
  return (
    <div className="tubebay-animate-pulse tubebay-bg-gray-900 tubebay-rounded-lg tubebay-overflow-hidden tubebay-shadow-sm tubebay-w-full">
      <div className="tubebay-p-4 tubebay-bg-gray-800 tubebay-border-b tubebay-border-gray-700 tubebay-flex tubebay-justify-between tubebay-items-center">
        <div className="tubebay-h-3 tubebay-bg-gray-600 tubebay-rounded tubebay-w-24"></div>
      </div>
      <div className="tubebay-p-4 tubebay-h-[400px]">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="tubebay-h-3 tubebay-bg-gray-700 tubebay-rounded tubebay-mb-3" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
        ))}
      </div>
    </div>
  );
};
