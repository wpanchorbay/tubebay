import React from "react";

interface ClassicToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const ClassicToggle: React.FC<ClassicToggleProps> = ({
  checked,
  onChange,
  disabled,
  className = "",
  id,
}) => {
  const toggleId = id || `classic-toggle-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={`tubebay-relative tubebay-inline-block tubebay-w-10 tubebay-align-middle tubebay-select-none tubebay-transition tubebay-duration-200 tubebay-ease-in ${className}`}>
      <input
        type="checkbox"
        id={toggleId}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="tubebay-toggle-checkbox tubebay-absolute tubebay-block tubebay-w-5 tubebay-h-5 tubebay-rounded-full tubebay-bg-white tubebay-border-4 tubebay-appearance-none tubebay-cursor-pointer checked:tubebay-right-0 checked:tubebay-border-[#2271b1] tubebay-right-5 tubebay-border-[#8c8f94] tubebay-transition-all tubebay-duration-200"
      />
      <label
        htmlFor={toggleId}
        className={`tubebay-toggle-label tubebay-block tubebay-overflow-hidden tubebay-h-5 tubebay-rounded-full tubebay-cursor-pointer transition-colors duration-200 ${
          checked ? "tubebay-bg-[#2271b1]" : "tubebay-bg-[#8c8f94]"
        } ${disabled ? "tubebay-opacity-50 tubebay-cursor-not-allowed" : ""}`}
      ></label>
      <style>{`
        .tubebay-toggle-checkbox:checked {
          right: 0;
          border-color: #2271b1;
        }
        .tubebay-toggle-checkbox:focus {
            outline: none;
        }
      `}</style>
    </div>
  );
};
