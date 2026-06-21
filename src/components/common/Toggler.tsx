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
    small: "wpab-px-[8px] wpab-py-[2px] wpab-text-[11px]",
    medium: "wpab-px-[18px] wpab-py-[5px] wpab-text-default",
    large: "wpab-px-[20px] wpab-py-[12px] wpab-text-[15px]",
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
        wpab-relative wpab-inline-flex wpab-items-center
        wpab-bg-white wpab-border ${borderClasses} wpab-rounded-[8px]
        wpab-p-[4px] wpab-select-none
        ${fullWidth ? "wpab-flex wpab-w-full" : ""}
        ${
          disabled
            ? "wpab-opacity-50 wpab-cursor-not-allowed wpab-pointer-events-none"
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
            wpab-absolute wpab-top-[4px] wpab-bottom-[4px]
            wpab-bg-primary wpab-rounded-[6px] wpab-shadow-sm
            wpab-transition-all wpab-duration-300 wpab-ease-[cubic-bezier(0.4,0,0.2,1)]
            wpab-pointer-events-none
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
              wpab-relative wpab-z-10 wpab-flex-1
              wpab-font-medium wpab-text-nowrap wpab-rounded-[6px]
              wpab-transition-colors wpab-duration-300
              focus:wpab-outline-none focus-visible:wpab-ring-2 focus-visible:wpab-ring-primary/20
              ${sizeClasses[size]}
              ${
                isSelected
                  ? "wpab-text-white"
                  : "wpab-text-secondary hover:wpab-text-gray-700"
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
