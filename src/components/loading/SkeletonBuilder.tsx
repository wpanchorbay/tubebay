import React from "react";

export const SkeletonBuilder: React.FC = () => {
  return (
    <div className="wpab-animate-pulse wpab-flex wpab-flex-col lg:wpab-flex-row wpab-gap-6 wpab-items-start wpab-w-full">
      {/* Left side */}
      <div className="wpab-w-full wpab-flex wpab-flex-col wpab-gap-6">
        {/* Title Input */}
        <div className="wpab-h-[50px] wpab-bg-gray-200 wpab-rounded-md wpab-w-full"></div>
        
        {/* Assignment rules container */}
        <div className="wpab-h-[100px] wpab-bg-gray-200 wpab-rounded-lg wpab-w-full"></div>
        
        {/* Fields header */}
        <div>
          <div className="wpab-h-6 wpab-bg-gray-200 wpab-rounded wpab-w-32 wpab-mb-2"></div>
          <div className="wpab-h-4 wpab-bg-gray-200 wpab-rounded wpab-w-64"></div>
        </div>

        {/* Fields list */}
        <div className="wpab-border wpab-border-gray-200 wpab-rounded-lg wpab-p-4">
           {Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="wpab-h-12 wpab-bg-gray-100 wpab-rounded-md wpab-w-full wpab-mb-2 wpab-flex wpab-items-center wpab-px-4">
                <div className="wpab-h-4 wpab-w-4 wpab-bg-gray-200 wpab-rounded wpab-mr-4"></div>
                <div className="wpab-h-4 wpab-w-32 wpab-bg-gray-200 wpab-rounded wpab-mr-auto"></div>
                <div className="wpab-h-4 wpab-w-24 wpab-bg-gray-200 wpab-rounded"></div>
             </div>
           ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:wpab-w-[320px] wpab-w-full wpab-flex-shrink-0">
        <div className="wpab-h-[500px] wpab-bg-gray-200 wpab-rounded-lg wpab-w-full"></div>
      </div>
    </div>
  );
};
