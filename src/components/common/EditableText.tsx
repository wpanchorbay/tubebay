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
        className={`wpab-flex wpab-items-center wpab-gap-2 ${className} ${
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
          !wpab-bg-transparent !wpab-shadow-none
          wpab-text-[#1e1e1e] wpab-font-[700] wpab-text-[20px] wpab-leading-[32px]
          wpab-px-1 wpab-py-0.5
          wpab-w-auto 
          !wpab-border-t-0 !wpab-border-l-0 !wpab-border-r-0 !wpab-border-b-2
           !wpab-rounded-[0px]
          focus:wpab-outline-none
          wpab-transition-colors wpab-duration-200 placeholder:wpab-italic
          ${
            error
              ? "!wpab-border-red-500"
              : "!wpab-border-transparent focus:!wpab-border-[#3858e9]"
          }
          ${isEditing ? "" : "wpab-cursor-pointer"}
          ${disabled ? "wpab-cursor-not-allowed wpab-opacity-60" : ""}
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
            wpab-p-1 wpab-rounded-full wpab-transition-colors
            ${
              isEditing
                ? "wpab-text-primary hover:wpab-bg-blue-50"
                : "wpab-text-gray-400 hover:wpab-text-primary hover:wpab-bg-gray-100"
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
        <span className="wpab-text-red-500 wpab-text-sm wpab-mt-1">
          {error}
        </span>
      )}
    </div>
  );
};
