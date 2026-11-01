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
      {/*
        wp-admin's forms.css styles input[type=checkbox] (square, 1rem, a
        checkmark in ::before) with more specificity than a single class, so
        the knob is restated here with the element and type in the selector.
      */}
      <style>{`
        input[type="checkbox"].tubebay-toggle-checkbox {
          top: 0;
          width: 1.25rem;
          height: 1.25rem;
          min-width: 0;
          margin: 0;
          padding: 0;
          border: 4px solid #8c8f94;
          border-radius: 9999px;
          background: #fff;
          box-shadow: none;
        }
        input[type="checkbox"].tubebay-toggle-checkbox:checked {
          right: 0;
          border-color: #2271b1;
        }
        input[type="checkbox"].tubebay-toggle-checkbox:checked::before {
          content: none;
        }
        input[type="checkbox"].tubebay-toggle-checkbox:focus {
          outline: none;
        }
        input[type="checkbox"].tubebay-toggle-checkbox:focus-visible {
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px #2271b1;
        }
      `}</style>
    </div>
  );
};
