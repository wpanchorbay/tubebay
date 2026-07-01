import React from "react";

interface CheckboxProps {
  label?: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  classNames?: {
    root?: string;
    box?: string;
    icon?: string;
    label?: string;
  };
}

export const Checkbox: React.FC<CheckboxProps> = ({
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
        tubebay-flex tubebay-items-center tubebay-justify-center
        tubebay-w-4 tubebay-h-4 tubebay-rounded tubebay-border-2 tubebay-transition-all tubebay-duration-200
        ${
          checked
            ? "tubebay-border-primary tubebay-bg-primary"
            : "tubebay-border-[#949494] tubebay-bg-transparent hover:tubebay-border-primary"
        }
        ${classNames?.box || ""}
      `}
      >
        <svg
          className={`tubebay-w-3.5 tubebay-h-3.5 tubebay-text-white tubebay-transform tubebay-transition-transform tubebay-duration-200 ${
            checked ? "tubebay-scale-100" : "tubebay-scale-0"
          } ${classNames?.icon || ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <input
          type="checkbox"
          className="!tubebay-hidden"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
      </div>
      {label && (
        <span
          className={`tubebay-text-[13px] tubebay-font-[400] tubebay-leading-[20px] tubebay-text-[#1e1e1e] ${
            classNames?.label || ""
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
};
