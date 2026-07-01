import React from "react";

interface ClassicCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  className?: string;
  id?: string;
}

export const ClassicCheckbox: React.FC<ClassicCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  description,
  className = "",
  id,
}) => {
  const checkboxId =
    id || `classic-cb-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div
      className={`tubebay-flex tubebay-flex-col tubebay-gap-1 ${className}`}
    >
      <label
        htmlFor={checkboxId}
        className={`tubebay-flex tubebay-items-center tubebay-gap-2 tubebay-cursor-pointer ${
          disabled ? "tubebay-opacity-50 tubebay-cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`
          tubebay-flex tubebay-items-center tubebay-justify-center
          tubebay-w-4 tubebay-h-4 tubebay-rounded tubebay-border-2 tubebay-transition-all tubebay-duration-200
          ${
            checked
              ? "tubebay-border-[#2271b1] tubebay-bg-[#2271b1]"
              : "tubebay-border-[#8c8f94] tubebay-bg-white hover:tubebay-border-[#2271b1]"
          }
        `}
        >
          <svg
            className={`tubebay-w-3.5 tubebay-h-3.5 tubebay-text-white tubebay-transform tubebay-transition-transform tubebay-duration-200 ${
              checked ? "tubebay-scale-100" : "tubebay-scale-0"
            }`}
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
            id={checkboxId}
            type="checkbox"
            className="!tubebay-hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
        </div>
        {label && <span>{label}</span>}
      </label>
      {description && (
        <p
          className="description tubebay-block tubebay-mt-0 tubebay-pl-6"
        >
          {description}
        </p>
      )}
    </div>
  );
};
