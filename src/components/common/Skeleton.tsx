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
  const hClass = height ? (height.includes("[") ? `wpab-h-${height}` : `wpab-h-[${height}]`) : "";
  const wClass = width ? (width.includes("[") ? `wpab-w-${width}` : `wpab-w-[${width}]`) : "";
  const rClass = borderRadius ? (borderRadius.includes("[") ? `wpab-rounded-${borderRadius}` : `wpab-rounded-[${borderRadius}]`) : "wpab-rounded-[6px]";

  return (
    <div
      className={`
        wpab-block wpab-bg-[#e9e9e9] wpab-relative wpab-overflow-hidden
        wpab-animate-shimmer
        ${hClass} ${wClass} ${rClass}
        ${className || ""}
        [&>*]:wpab-opacity-0
      `}
    >
      {children}
    </div>
  );
};

export default Skeleton;
