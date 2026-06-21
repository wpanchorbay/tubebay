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
      "wpab-px-[8px] !wpab-py-[7px] wpab-text-[13px] wpab-leading-[20px]",
    medium:
      "wpab-px-[12px] !wpab-py-[9px] !wpab-text-[13px] !wpab-leading-[20px]",
    large:
      "wpab-px-[12px] !wpab-py-[11px] wpab-text-[13px] wpab-leading-[20px]",
  };

  return (
    <div className={`wpab-w-full ${classNames?.root || ""}`}>
      {label && (
        <label
          className={`wpab-block wpab-text-sm wpab-font-bold wpab-text-gray-900 wpab-mb-2 ${
            classNames?.label || ""
          }`}
        >
          {label}
        </label>
      )}
      <input
        className={`
          wpab-w-full wpab-outline-none
          wpab-bg-white wpab-border wpab-rounded-[8px]
          wpab-text-[#1e1e1e] wpab-placeholder-gray-400
          ${sizeClasses[size]}
          ${borderClasses}
          ${transitionClasses}
          ${error ? errorClasses : hoverClasses}
          ${
            props.disabled
              ? "wpab-opacity-50 wpab-cursor-not-allowed"
              : ""
          }
          ${className}
          ${classNames?.input || ""}
        `}
        {...props}
      />
      {error && (
        <span
          className={`wpab-mt-1 wpab-text-xs wpab-text-red-500 ${
            classNames?.error || ""
          }`}
        >
          {error}
        </span>
      )}
    </div>
  );
};
