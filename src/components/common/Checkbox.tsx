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
      className={`wpab-flex wpab-items-center wpab-gap-3 wpab-cursor-pointer ${
        disabled ? "wpab-opacity-50 wpab-cursor-not-allowed" : ""
      } ${classNames?.root || ""}`}
    >
      <div
        className={`
        wpab-flex wpab-items-center wpab-justify-center
        wpab-w-4 wpab-h-4 wpab-rounded wpab-border-2 wpab-transition-all wpab-duration-200
        ${
          checked
            ? "wpab-border-primary wpab-bg-primary"
            : "wpab-border-[#949494] wpab-bg-transparent hover:wpab-border-primary"
        }
        ${classNames?.box || ""}
      `}
      >
        <svg
          className={`wpab-w-3.5 wpab-h-3.5 wpab-text-white wpab-transform wpab-transition-transform wpab-duration-200 ${
            checked ? "wpab-scale-100" : "wpab-scale-0"
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
          className="!wpab-hidden"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
      </div>
      {label && (
        <span
          className={`wpab-text-[13px] wpab-font-[400] wpab-leading-[20px] wpab-text-[#1e1e1e] ${
            classNames?.label || ""
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
};
