import { check, edit, Icon } from "@wordpress/icons";
import React, { useState, useRef, useEffect } from "react";

interface EditableTextProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  classNames?: {
    root?: string;
    text?: string;
    input?: string;
    iconButton?: string;
    icon?: string;
  };
  error?: string | undefined;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  placeholder = "Click to edit...",
  className = "",
  disabled = false,
  classNames,
  error,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state when prop value changes
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleSave = () => {
    if (localValue !== (value ?? "")) {
      onChange(localValue);
    }
    setIsEditing(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setLocalValue(value ?? "");
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const onFocus = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const onBlur = () => {
    // Trigger save on blur
    handleSave();
  };

  return (
    <div>
      <div
        className={`tubebay-flex tubebay-items-center tubebay-gap-2 ${className} ${
          classNames?.root || ""
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          readOnly={disabled}
          placeholder={placeholder}
          className={`
          !tubebay-bg-transparent !tubebay-shadow-none
          tubebay-text-[#1e1e1e] tubebay-font-[700] tubebay-text-[20px] tubebay-leading-[32px]
          tubebay-px-1 tubebay-py-0.5
          tubebay-w-auto 
          !tubebay-border-t-0 !tubebay-border-l-0 !tubebay-border-r-0 !tubebay-border-b-2
           !tubebay-rounded-[0px]
          focus:tubebay-outline-none
          tubebay-transition-colors tubebay-duration-200 placeholder:tubebay-italic
          ${
            error
              ? "!tubebay-border-red-500"
              : "!tubebay-border-transparent focus:!tubebay-border-[#3858e9]"
          }
          ${isEditing ? "" : "tubebay-cursor-pointer"}
          ${disabled ? "tubebay-cursor-not-allowed tubebay-opacity-60" : ""}
          ${isEditing ? classNames?.input || "" : classNames?.text || ""}
        `}
        />

        {!disabled && (
          <button
            type="button"
            // Prevent blur on mousedown so click event fires properly
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing) {
                handleSave();
              } else {
                inputRef.current?.focus();
              }
            }}
            className={`
            tubebay-p-1 tubebay-rounded-full tubebay-transition-colors
            ${
              isEditing
                ? "tubebay-text-primary hover:tubebay-bg-blue-50"
                : "tubebay-text-gray-400 hover:tubebay-text-primary hover:tubebay-bg-gray-100"
            }
            ${classNames?.iconButton || ""}
          `}
            aria-label={isEditing ? "Save" : "Edit"}
          >
            {isEditing ? (
              <Icon icon={check} fill="currentColor" />
            ) : (
              <Icon icon={edit} fill="currentColor" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="tubebay-text-red-500 tubebay-text-sm tubebay-mt-1">
          {error}
        </span>
      )}
    </div>
  );
};
