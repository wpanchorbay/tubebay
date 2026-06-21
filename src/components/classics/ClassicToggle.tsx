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
    <div className={`wpab-relative wpab-inline-block wpab-w-10 wpab-align-middle wpab-select-none wpab-transition wpab-duration-200 wpab-ease-in ${className}`}>
      <input
        type="checkbox"
        id={toggleId}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="wpab-toggle-checkbox wpab-absolute wpab-block wpab-w-5 wpab-h-5 wpab-rounded-full wpab-bg-white wpab-border-4 wpab-appearance-none wpab-cursor-pointer checked:wpab-right-0 checked:wpab-border-[#2271b1] wpab-right-5 wpab-border-[#8c8f94] wpab-transition-all wpab-duration-200"
      />
      <label
        htmlFor={toggleId}
        className={`wpab-toggle-label wpab-block wpab-overflow-hidden wpab-h-5 wpab-rounded-full wpab-cursor-pointer transition-colors duration-200 ${
          checked ? "wpab-bg-[#2271b1]" : "wpab-bg-[#8c8f94]"
        } ${disabled ? "wpab-opacity-50 wpab-cursor-not-allowed" : ""}`}
      ></label>
      <style>{`
        .wpab-toggle-checkbox:checked {
          right: 0;
          border-color: #2271b1;
        }
        .wpab-toggle-checkbox:focus {
            outline: none;
        }
      `}</style>
    </div>
  );
};
