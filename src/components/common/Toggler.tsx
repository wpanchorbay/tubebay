import React, { useState, useRef, useEffect } from "react";
import { borderClasses } from "./classes";

export interface TogglerOption {
  label: React.ReactNode;
  value: string | number;
}

interface TogglerProps {
  options: TogglerOption[];
  value: string | number;
  onChange: (value: any) => void;
  className?: string;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  classNames?: {
    root?: string;
    pill?: string;
    button?: string;
  };
}

export const Toggler: React.FC<TogglerProps> = ({
  options,
  value,
  onChange,
  className = "",
  fullWidth = false,
  size = "medium",
  disabled = false,
  classNames = {},
}) => {
  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Size configuration
  const sizeClasses = {
    small: "tubebay-px-[8px] tubebay-py-[2px] tubebay-text-[11px]",
    medium: "tubebay-px-[18px] tubebay-py-[5px] tubebay-text-default",
    large: "tubebay-px-[20px] tubebay-py-[12px] tubebay-text-[15px]",
  };

  useEffect(() => {
    // Find the currently selected element
    const activeIndex = options.findIndex((opt) => opt.value === value);
    const activeEl = itemsRef.current[activeIndex];

    if (activeEl) {
      // Update pill position and width based on the active element's dimensions
      setPillStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [value, options, size]); // Recalculate when value, options, or size changes

  return (
    <div
      className={`
        tubebay-relative tubebay-inline-flex tubebay-items-center
        tubebay-bg-white tubebay-border ${borderClasses} tubebay-rounded-[8px]
        tubebay-p-[4px] tubebay-select-none
        ${fullWidth ? "tubebay-flex tubebay-w-full" : ""}
        ${
          disabled
            ? "tubebay-opacity-50 tubebay-cursor-not-allowed tubebay-pointer-events-none"
            : ""
        }
        ${className}
        ${classNames.root || ""}
      `}
      role="group"
      aria-disabled={disabled}
    >
      {/* Sliding Background Pill */}
      <div
        className={`
            tubebay-absolute tubebay-top-[4px] tubebay-bottom-[4px]
            tubebay-bg-primary tubebay-rounded-[6px] tubebay-shadow-sm
            tubebay-transition-all tubebay-duration-300 tubebay-ease-[cubic-bezier(0.4,0,0.2,1)]
            tubebay-pointer-events-none
            ${classNames.pill || ""}
        `}
        style={{
          left: pillStyle?.left ?? 0,
          width: pillStyle?.width ?? 0,
          opacity: pillStyle ? 1 : 0, // Prevent initial flash at wrong position
        }}
      />

      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(option.value)}
            className={`
              tubebay-relative tubebay-z-10 tubebay-flex-1
              tubebay-font-medium tubebay-text-nowrap tubebay-rounded-[6px]
              tubebay-transition-colors tubebay-duration-300
              focus:tubebay-outline-none focus-visible:tubebay-ring-2 focus-visible:tubebay-ring-primary/20
              ${sizeClasses[size]}
              ${
                isSelected
                  ? "tubebay-text-white"
                  : "tubebay-text-secondary hover:tubebay-text-gray-700"
              }
              ${classNames.button || ""}
            `}
            aria-pressed={isSelected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
