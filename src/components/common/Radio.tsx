import React from "react";

interface RadioProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  classNames?: {
    root?: string;
    circle?: string;
    dot?: string;
    label?: string;
  };
}

export const Radio: React.FC<RadioProps> = ({
  label,
  checked,
  onChange,
  disabled,
  classNames,
}) => {
  return (
    <label
      className={`wpab-flex wpab-items-center wpab-gap-3 wpab-cursor-pointer ${
        disabled ? "wpab-opacity-50 wpab-cursor-not-allowed" : ""
      } ${classNames?.root || ""}`}
    >
      <div
        className={`
        wpab-relative wpab-flex wpab-items-center wpab-justify-center
        wpab-w-5 wpab-h-5 wpab-rounded-full wpab-border-2 wpab-transition-all wpab-duration-200
        ${
          checked
            ? "wpab-border-primary wpab-bg-primary"
            : "wpab-border-gray-300 wpab-bg-white hover:wpab-border-primary"
        }
        ${classNames?.circle || ""}
      `}
      >
        {/* Inner white dot for selected state */}
        <div
          className={`
                wpab-w-2 wpab-h-2 wpab-bg-white wpab-rounded-full wpab-transform wpab-transition-transform wpab-duration-200
                ${checked ? "wpab-scale-100" : "wpab-scale-0"}
                ${classNames?.dot || ""}
            `}
        />
        <input
          type="radio"
          className="wpab-hidden"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <span
        className={`wpab-text-[15px] wpab-font-semibold ${
          checked ? "wpab-text-gray-900" : "wpab-text-gray-700"
        } ${classNames?.label || ""}`}
      >
        {label}
      </span>
    </label>
  );
};
