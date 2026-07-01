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
  return (
    <div
      className={`tubebay-skeleton ${height ? `tubebay-h-${height}` : ""} ${
        width ? `tubebay-w-${width}` : ""
      } ${borderRadius ? `tubebay-br-${borderRadius}` : ""} ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default Skeleton;
