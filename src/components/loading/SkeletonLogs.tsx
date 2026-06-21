import React from "react";

export const SkeletonLogs: React.FC = () => {
  return (
    <div className="wpab-animate-pulse wpab-bg-gray-900 wpab-rounded-lg wpab-overflow-hidden wpab-shadow-sm wpab-w-full">
      <div className="wpab-p-4 wpab-bg-gray-800 wpab-border-b wpab-border-gray-700 wpab-flex wpab-justify-between wpab-items-center">
        <div className="wpab-h-3 wpab-bg-gray-600 wpab-rounded wpab-w-24"></div>
      </div>
      <div className="wpab-p-4 wpab-h-[400px]">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="wpab-h-3 wpab-bg-gray-700 wpab-rounded wpab-mb-3" style={{ width: `${Math.random() * 40 + 40}%` }}></div>
        ))}
      </div>
    </div>
  );
};
