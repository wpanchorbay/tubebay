import { FC, ReactNode } from "react";

interface SkeletonProps {
  height?: string;
  width?: string;
  borderRadius?: string;
  children?: ReactNode;
  className?: string;
}

const Skeleton: FC<SkeletonProps> = ({
  height,
  width,
  borderRadius,
  children,
  className,
}) => {
  // Helpers to handle arbitrary values safely
  const hClass = height ? (height.includes("[") ? `tubebay-h-${height}` : `tubebay-h-[${height}]`) : "";
  const wClass = width ? (width.includes("[") ? `tubebay-w-${width}` : `tubebay-w-[${width}]`) : "";
  const rClass = borderRadius ? (borderRadius.includes("[") ? `tubebay-rounded-${borderRadius}` : `tubebay-rounded-[${borderRadius}]`) : "tubebay-rounded-[6px]";

  return (
    <div
      className={`
        tubebay-block tubebay-bg-[#e9e9e9] tubebay-relative tubebay-overflow-hidden
        tubebay-animate-shimmer
        ${hClass} ${wClass} ${rClass}
        ${className || ""}
        [&>*]:tubebay-opacity-0
      `}
    >
      {children}
    </div>
  );
};

export default Skeleton;
