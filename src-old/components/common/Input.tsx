import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";
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
  showToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  size = "medium",
  className = "",
  classNames,
  type = "text",
  showToggle = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const displayType = isPassword && showPassword ? "text" : type;

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
      <div className="tubebay-relative">
        <input
          type={displayType}
          className={`
            tubebay-w-full tubebay-outline-none
            tubebay-bg-white tubebay-border !tubebay-rounded-[8px]
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
            ${isPassword && showToggle ? "tubebay-pr-[40px]" : ""}
            ${className}
            ${classNames?.input || ""}
          `}
          {...props}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            className="tubebay-absolute tubebay-right-[12px] tubebay-top-1/2 -tubebay-translate-y-1/2 tubebay-text-gray-400 hover:tubebay-text-gray-600 tubebay-focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
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
