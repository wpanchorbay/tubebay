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
      className={`tubebay-flex tubebay-items-center tubebay-gap-3 tubebay-cursor-pointer ${
        disabled ? "tubebay-opacity-50 tubebay-cursor-not-allowed" : ""
      } ${classNames?.root || ""}`}
    >
      <div
        className={`
        tubebay-relative tubebay-flex tubebay-items-center tubebay-justify-center
        tubebay-w-5 tubebay-h-5 tubebay-rounded-full tubebay-border-2 tubebay-transition-all tubebay-duration-200
        ${
          checked
            ? "tubebay-border-primary tubebay-bg-primary"
            : "tubebay-border-gray-300 tubebay-bg-white hover:tubebay-border-primary"
        }
        ${classNames?.circle || ""}
      `}
      >
        {/* Inner white dot for selected state */}
        <div
          className={`
                tubebay-w-2 tubebay-h-2 tubebay-bg-white tubebay-rounded-full tubebay-transform tubebay-transition-transform tubebay-duration-200
                ${checked ? "tubebay-scale-100" : "tubebay-scale-0"}
                ${classNames?.dot || ""}
            `}
        />
        <input
          type="radio"
          className="tubebay-hidden"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <span
        className={`tubebay-text-[15px] tubebay-font-semibold ${
          checked ? "tubebay-text-gray-900" : "tubebay-text-gray-700"
        } ${classNames?.label || ""}`}
      >
        {label}
      </span>
    </label>
  );
};
