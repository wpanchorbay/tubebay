import React from "react";

export const SkeletonBuilder: React.FC = () => {
  return (
    <div className="tubebay-animate-pulse tubebay-flex tubebay-flex-col lg:tubebay-flex-row tubebay-gap-6 tubebay-items-start tubebay-w-full">
      {/* Left side */}
      <div className="tubebay-w-full tubebay-flex tubebay-flex-col tubebay-gap-6">
        {/* Title Input */}
        <div className="tubebay-h-[50px] tubebay-bg-gray-200 tubebay-rounded-md tubebay-w-full"></div>
        
        {/* Assignment rules container */}
        <div className="tubebay-h-[100px] tubebay-bg-gray-200 tubebay-rounded-lg tubebay-w-full"></div>
        
        {/* Fields header */}
        <div>
          <div className="tubebay-h-6 tubebay-bg-gray-200 tubebay-rounded tubebay-w-32 tubebay-mb-2"></div>
          <div className="tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded tubebay-w-64"></div>
        </div>

        {/* Fields list */}
        <div className="tubebay-border tubebay-border-gray-200 tubebay-rounded-lg tubebay-p-4">
           {Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="tubebay-h-12 tubebay-bg-gray-100 tubebay-rounded-md tubebay-w-full tubebay-mb-2 tubebay-flex tubebay-items-center tubebay-px-4">
                <div className="tubebay-h-4 tubebay-w-4 tubebay-bg-gray-200 tubebay-rounded tubebay-mr-4"></div>
                <div className="tubebay-h-4 tubebay-w-32 tubebay-bg-gray-200 tubebay-rounded tubebay-mr-auto"></div>
                <div className="tubebay-h-4 tubebay-w-24 tubebay-bg-gray-200 tubebay-rounded"></div>
             </div>
           ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:tubebay-w-[320px] tubebay-w-full tubebay-flex-shrink-0">
        <div className="tubebay-h-[500px] tubebay-bg-gray-200 tubebay-rounded-lg tubebay-w-full"></div>
      </div>
    </div>
  );
};
