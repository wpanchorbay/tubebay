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
      switch: "wpab-h-4 wpab-w-7",
      thumb: "wpab-h-3 wpab-w-3",
      translate: "wpab-translate-x-3",
    },
    medium: {
      switch: "wpab-h-6 wpab-w-11",
      thumb: "wpab-h-5 wpab-w-5",
      translate: "wpab-translate-x-5",
    },
    large: {
      switch: "wpab-h-7 wpab-w-14",
      thumb: "wpab-h-6 wpab-w-6",
      translate: "wpab-translate-x-7",
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
        wpab-group wpab-relative wpab-inline-flex wpab-shrink-0 wpab-cursor-pointer wpab-items-center wpab-rounded-full wpab-border-2 wpab-border-transparent wpab-transition-colors wpab-duration-200 wpab-ease-in-out focus:wpab-outline-none focus:wpab-ring-2 focus:wpab-ring-primary focus:wpab-ring-offset-2
        ${currentSize.switch}
        ${checked ? "wpab-bg-green-500" : "wpab-bg-black"}
        ${disabled ? "wpab-opacity-50 wpab-cursor-not-allowed" : ""}
        ${className}
        ${classNames?.root || ""}
      `}
    >
      <span className="wpab-sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        className={`
          wpab-pointer-events-none wpab-inline-block wpab-transform wpab-rounded-full wpab-bg-white wpab-shadow wpab-ring-0 wpab-transition wpab-duration-200 wpab-ease-in-out
          ${currentSize.thumb}
          ${checked ? currentSize.translate : "wpab-translate-x-0"}
          ${classNames?.thumb || ""}
        `}
      />
    </button>
  );
};
