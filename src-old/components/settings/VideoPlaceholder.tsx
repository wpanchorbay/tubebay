import React, { memo } from "react";
import { Play } from "lucide-react";
// import { motion } from 'motion/react';

interface VideoPlaceholderProps {
  label: string;
  className?: string;
  theme?: "blue" | "red";
  useMotion?: boolean;
}

export const VideoPlaceholder = memo(function VideoPlaceholder({
  label,
  className = "",
  theme = "blue",
  useMotion = false,
}: VideoPlaceholderProps) {
  const isBlue = theme === "blue";
  const baseClasses = `tubebay-w-full tubebay-aspect-video tubebay-border-2 tubebay-border-dashed tubebay-rounded-lg tubebay-flex tubebay-flex-col tubebay-items-center tubebay-justify-center tubebay-relative tubebay-overflow-hidden tubebay-group ${
    isBlue
      ? "tubebay-bg-blue-50 tubebay-border-blue-200 tubebay-text-blue-500"
      : "tubebay-bg-red-50 tubebay-border-red-200 tubebay-text-red-500"
  } ${className}`;

  const innerContent = (
    <>
      <div
        className={`tubebay-absolute tubebay-inset-0 tubebay-pattern-grid-lg tubebay-opacity-50 ${
          isBlue ? "tubebay-bg-blue-100/30" : "tubebay-bg-red-100/30"
        }`}
      />
      <div className="tubebay-z-10 tubebay-bg-white tubebay-p-2 tubebay-rounded-full tubebay-shadow-sm tubebay-mb-1 tubebay-group-hover:tubebay-scale-110 tubebay-transition-transform">
        <Play className="tubebay-w-5 tubebay-h-5 tubebay-fill-current" />
      </div>
      <span className="tubebay-z-10 tubebay-text-xs tubebay-font-medium tubebay-text-center tubebay-px-2">
        {label}
      </span>
    </>
  );

  //   if (useMotion) {
  //     return (
  //       <motion.div
  //         layoutId="video-placeholder"
  //         className={baseClasses}
  //       >
  //         {innerContent}
  //       </motion.div>
  //     );
  //   }

  return (
    <div
      className={`${baseClasses} tubebay-animate-[popIn_0.3s_ease-out_forwards]`}
    >
      {innerContent}
    </div>
  );
});
