import React from "react";
import {
  borderClasses,
  errorClasses,
  hoverClasses,
  transitionClasses,
} from "./classes";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  size?: "small" | "medium" | "large";
  classNames?: {
    root?: string;
    label?: string;
    input?: string;
    error?: string;
  };
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  size = "medium",
  className = "",
  classNames,
  ...props
}) => {
  const sizeClasses = {
    small:
      "tubebay-px-[8px] !tubebay-py-[7px] tubebay-text-[13px] tubebay-leading-[20px]",
    medium:
      "tubebay-px-[12px] !tubebay-py-[9px] !tubebay-text-[13px] !tubebay-leading-[20px]",
    large:
      "tubebay-px-[12px] !tubebay-py-[11px] tubebay-text-[13px] tubebay-leading-[20px]",
  };

  return (
    <div className={`tubebay-w-full ${classNames?.root || ""}`}>
      {label && (
        <label
          className={`tubebay-block tubebay-text-sm tubebay-font-bold tubebay-text-gray-900 tubebay-mb-2 ${
            classNames?.label || ""
          }`}
        >
          {label}
        </label>
      )}
      <input
        className={`
          tubebay-w-full tubebay-outline-none
          tubebay-bg-white tubebay-border tubebay-rounded-[8px]
          tubebay-text-[#1e1e1e] tubebay-placeholder-gray-400
          ${sizeClasses[size]}
          ${borderClasses}
          ${transitionClasses}
          ${error ? errorClasses : hoverClasses}
          ${
            props.disabled
              ? "tubebay-opacity-50 tubebay-cursor-not-allowed"
              : ""
          }
          ${className}
          ${classNames?.input || ""}
        `}
        {...props}
      />
      {error && (
        <span
          className={`tubebay-mt-1 tubebay-text-xs tubebay-text-red-500 ${
            classNames?.error || ""
          }`}
        >
          {error}
        </span>
      )}
    </div>
  );
};
