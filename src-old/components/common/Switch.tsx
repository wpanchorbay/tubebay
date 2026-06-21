import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
  classNames?: {
    root?: string;
    thumb?: string;
  };
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled,
  size = "medium",
  className = "",
  classNames,
}) => {
  const sizeConfig = {
    small: {
      switch: "tubebay-h-4 tubebay-w-7",
      thumb: "tubebay-h-3 tubebay-w-3",
      translate: "tubebay-translate-x-3",
    },
    medium: {
      switch: "tubebay-h-6 tubebay-w-11",
      thumb: "tubebay-h-5 tubebay-w-5",
      translate: "tubebay-translate-x-5",
    },
    large: {
      switch: "tubebay-h-7 tubebay-w-14",
      thumb: "tubebay-h-6 tubebay-w-6",
      translate: "tubebay-translate-x-7",
    },
  };

  const currentSize = sizeConfig[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        tubebay-group tubebay-relative tubebay-inline-flex tubebay-shrink-0 tubebay-cursor-pointer tubebay-items-center tubebay-rounded-full tubebay-border-2 tubebay-border-transparent tubebay-transition-colors tubebay-duration-200 tubebay-ease-in-out focus:tubebay-outline-none focus:tubebay-ring-2 focus:tubebay-ring-primary focus:tubebay-ring-offset-2
        ${currentSize.switch}
        ${
          checked
            ? className.includes("tubebay-bg-")
              ? ""
              : "tubebay-bg-primary"
            : className.includes("tubebay-bg-")
            ? ""
            : "tubebay-bg-gray-200"
        }
        ${disabled ? "tubebay-opacity-50 tubebay-cursor-not-allowed" : ""}
        ${className}
        ${classNames?.root || ""}
      `}
    >
      <span className="tubebay-sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        className={`
          tubebay-pointer-events-none tubebay-inline-block tubebay-transform tubebay-rounded-full tubebay-bg-white tubebay-shadow tubebay-ring-0 tubebay-transition tubebay-duration-200 tubebay-ease-in-out
          ${currentSize.thumb}
          ${checked ? currentSize.translate : "tubebay-translate-x-0"}
          ${classNames?.thumb || ""}
        `}
      />
    </button>
  );
};
