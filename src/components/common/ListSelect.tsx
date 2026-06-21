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
      item: "tubebay-px-3 tubebay-py-2",
      label: "tubebay-text-xs",
      iconWrapper: "tubebay-w-4",
      icon: "tubebay-w-3 tubebay-h-3",
    },
    medium: {
      item: "tubebay-px-4 tubebay-py-3",
      label: "tubebay-text-sm",
      iconWrapper: "tubebay-w-5",
      icon: "tubebay-w-4 tubebay-h-4",
    },
    large: {
      item: "tubebay-px-5 tubebay-py-4",
      label: "tubebay-text-base",
      iconWrapper: "tubebay-w-6",
      icon: "tubebay-w-5 tubebay-h-5",
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <div
      className={`tubebay-flex tubebay-flex-col tubebay-border tubebay-border-default tubebay-rounded-lg tubebay-bg-white tubebay-overflow-hidden ${className} ${
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
              tubebay-flex tubebay-items-center tubebay-gap-3 
              tubebay-cursor-pointer tubebay-transition-colors
              hover:tubebay-bg-gray-50
              ${currentSize.item}
              ${
                index !== items.length - 1
                  ? "tubebay-border-b tubebay-border-gray-100"
                  : ""
              }
              ${classNames?.item || ""}
            `}
          >
            <div
              className={`tubebay-flex tubebay-justify-center ${
                currentSize.iconWrapper
              } ${classNames?.iconWrapper || ""}`}
            >
              {isSelected && (
                <svg
                  className={`tubebay-text-gray-900 ${currentSize.icon} ${
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
                  ? "tubebay-text-gray-900 tubebay-font-medium"
                  : "tubebay-text-gray-500"
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
