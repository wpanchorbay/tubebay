import React from "react";

export interface ListItem {
  label: string;
  value: string;
}

interface ListSelectProps {
  items: ListItem[];
  selectedValues: string[];
  onChange: (value: string) => void;
  className?: string;
  size?: "small" | "medium" | "large";
  classNames?: {
    root?: string;
    item?: string;
    iconWrapper?: string;
    icon?: string;
    label?: string;
  };
}

export const ListSelect: React.FC<ListSelectProps> = ({
  items,
  selectedValues,
  onChange,
  className = "",
  size = "medium",
  classNames,
}) => {
  const sizeStyles = {
    small: {
      item: "wpab-px-3 wpab-py-2",
      label: "wpab-text-xs",
      iconWrapper: "wpab-w-4",
      icon: "wpab-w-3 wpab-h-3",
    },
    medium: {
      item: "wpab-px-4 wpab-py-3",
      label: "wpab-text-sm",
      iconWrapper: "wpab-w-5",
      icon: "wpab-w-4 wpab-h-4",
    },
    large: {
      item: "wpab-px-5 wpab-py-4",
      label: "wpab-text-base",
      iconWrapper: "wpab-w-6",
      icon: "wpab-w-5 wpab-h-5",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div
      className={`wpab-flex wpab-flex-col wpab-border wpab-border-default wpab-rounded-lg wpab-bg-white wpab-overflow-hidden ${className} ${
        classNames?.root || ""
      }`}
    >
      {items.map((item, index) => {
        const isSelected = selectedValues.includes(item.value);
        return (
          <div
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`
              wpab-flex wpab-items-center wpab-gap-3 
              wpab-cursor-pointer wpab-transition-colors
              hover:wpab-bg-gray-50
              ${currentSize.item}
              ${
                index !== items.length - 1
                  ? "wpab-border-b wpab-border-gray-100"
                  : ""
              }
              ${classNames?.item || ""}
            `}
          >
            <div
              className={`wpab-flex wpab-justify-center ${
                currentSize.iconWrapper
              } ${classNames?.iconWrapper || ""}`}
            >
              {isSelected && (
                <svg
                  className={`wpab-text-gray-900 ${currentSize.icon} ${
                    classNames?.icon || ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <span
              className={`${currentSize.label} ${
                isSelected
                  ? "wpab-text-gray-900 wpab-font-medium"
                  : "wpab-text-gray-500"
              } ${classNames?.label || ""}`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
