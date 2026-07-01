import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { borderClasses, hoverBorderClasses } from "./classes";

// Inline Icons to replace lucide-react
const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export interface MultiSelectOption {
  value: string | number;
  label: string;
  labelNode?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  id?: string;
  ref?: React.Ref<HTMLDivElement>;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string | React.ReactNode;
  enableSearch?: boolean;
  isError?: boolean;
  errorClassName?: string;
  classNames?: {
    wrapper?: string;
    label?: string;
    container?: string;
    tag?: string;
    dropdown?: string;
    option?: string;
    search?: string;
    error?: string;
  };
  isCompact?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  ref,
  value = [],
  onChange,
  options,
  placeholder = "Select options...",
  disabled = false,
  className = "",
  label,
  enableSearch = true,
  isError = false,
  errorClassName = "tubebay-border-danger",
  classNames = {},
  isCompact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Handle outside click logic including Portal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;

      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Get selected options objects
  const selectedOptions = useMemo(() => {
    return options.filter((opt) => value.includes(opt.value));
  }, [options, value]);

  // Filter options based on search query (exclude already selected)
  const filteredOptions = useMemo(() => {
    let filtered = options.filter((opt) => !value.includes(opt.value));
    if (enableSearch && searchQuery) {
      filtered = filtered.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [options, value, searchQuery, enableSearch]);

  // Reset search and highlighted index when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
      setHighlightedIndex(0);
      interactionType.current = "keyboard";
    } else {
      setSearchQuery("");
    }
  }, [isOpen, enableSearch]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      isOpen &&
      listRef.current &&
      highlightedIndex >= 0 &&
      interactionType.current === "keyboard"
    ) {
      const list = listRef.current;
      const element = list.children[highlightedIndex] as HTMLElement;
      if (element) {
        const listTop = list.scrollTop;
        const listBottom = listTop + list.clientHeight;
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;

        if (elementTop < listTop) {
          list.scrollTop = elementTop;
        } else if (elementBottom > listBottom) {
          list.scrollTop = elementBottom - list.clientHeight;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option: MultiSelectOption) => {
    if (option.disabled) return;
    const newValue = [...value, option.value];
    onChange(newValue);
    setSearchQuery("");
    // Keep dropdown open for multi-select convenience
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const handleRemove = (optionValue: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);
    onChange(newValue);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    interactionType.current = "keyboard";
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Backspace":
        if (searchQuery === "" && value.length > 0) {
          handleRemove(value[value.length - 1]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(true);
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  return (
    <div
      className={`tubebay-relative tubebay-w-full ${className} ${
        classNames.wrapper || ""
      }`}
      ref={containerRef}
    >
      {label && (
        <label
          className={`tubebay-block tubebay-text-sm tubebay-font-bold tubebay-text-gray-900 tubebay-mb-2 ${
            classNames.label || ""
          }`}
        >
          {label}
        </label>
      )}

      {/* Trigger / Selected Items Container */}
      <div
        id={id}
        ref={ref}
        onClick={handleTriggerClick}
        className={`
          tubebay-relative tubebay-flex tubebay-flex-wrap tubebay-items-center tubebay-gap-2 tubebay-w-full tubebay-px-4 tubebay-text-left !tubebay-cursor-text
          tubebay-transition-all tubebay-duration-200 tubebay-ease-in-out tubebay-border tubebay-rounded-[8px] tubebay-bg-white
          ${borderClasses}
          ${isCompact ? "tubebay-py-[4px]" : "tubebay-py-[7px]"}
          ${
            disabled
              ? "tubebay-bg-gray-50 tubebay-cursor-not-allowed tubebay-text-gray-400 tubebay-border-gray-200"
              : `hover:!tubebay-border-primary`
          }
          ${isOpen ? hoverBorderClasses : ""}
          ${isError ? errorClassName : ""}
          ${classNames.container || ""}
        `}
      >
        {/* Selected Tags */}
        {selectedOptions.map((option) => (
          <span
            key={option.value}
            className={`
                tubebay-inline-flex tubebay-items-center tubebay-gap-1 tubebay-bg-gray-100 tubebay-text-gray-800 tubebay-px-2 tubebay-py-[2px] tubebay-rounded-none tubebay-text-[13px] tubebay-leading-[20px] tubebay-font-[400]
                ${classNames.tag || ""}
            `}
          >
            {option.label}
            <button
              type="button"
              onClick={(e) => handleRemove(option.value, e)}
              className="tubebay-flex tubebay-items-center tubebay-justify-center tubebay-w-4 tubebay-h-4 tubebay-rounded-full hover:tubebay-bg-gray-200 tubebay-transition-colors tubebay-text-gray-500"
              aria-label={`Remove ${option.label}`}
            >
              <X className="tubebay-w-3 tubebay-h-3" />
            </button>
          </span>
        ))}

        {/* Search Input */}
        <input
          ref={searchInputRef}
          type="text"
          className={`
            tubebay-flex-1 tubebay-min-w-[80px] tubebay-bg-transparent !tubebay-border-none !tubebay-shadow-none tubebay-outline-none tubebay-px-1 tubebay-py-[2px]  !tubebay-text-[13px] !tubebay-leading-[20px] tubebay-font-[400] tubebay-text-gray-900 tubebay-placeholder-gray-400 !tubebay-min-h-[24px]
            ${classNames.search || ""}
          `}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder={selectedOptions.length === 0 ? placeholder : ""}
          disabled={disabled}
        />

        {/* Chevron Icon */}
        <span className="tubebay-flex-shrink-0 tubebay-ml-auto tubebay-flex tubebay-items-center">
          <ChevronDown
            className={`tubebay-h-4 tubebay-w-4 tubebay-text-gray-500 tubebay-transition-transform tubebay-duration-200 ${
              isOpen ? "tubebay-transform tubebay-rotate-180" : ""
            }`}
          />
        </span>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
                tubebay-absolute tubebay-z-[50000] tubebay-w-full tubebay-bg-white tubebay-border tubebay-border-gray-200 tubebay-rounded-[12px] tubebay-p-[4px] tubebay-shadow-xl
                ${classNames.dropdown || ""}
            `}
          style={{
            top: "100%",
            left: 0,
            marginTop: "-1px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="tubebay-max-h-[204px] tubebay-overflow-auto focus:tubebay-outline-none"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredOptions.length === 0 ? (
              <li className="tubebay-px-3 tubebay-py-2 tubebay-text-gray-500 tubebay-text-sm tubebay-text-center tubebay-italic !tubebay-mb-0 tubebay-rounded-[8px]">
                {searchQuery ? "No results found" : "No more options"}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isHighlighted = highlightedIndex === index;
                const isDisabled = option.disabled;

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={false}
                    onMouseEnter={() => {
                      interactionType.current = "mouse";
                      setHighlightedIndex(index);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    className={`
                        tubebay-px-4 tubebay-py-2.5 tubebay-cursor-pointer tubebay-text-sm tubebay-transition-colors tubebay-border-b tubebay-border-gray-50 last:tubebay-border-0 !tubebay-mb-0  tubebay-rounded-[8px]
                        ${
                          isDisabled
                            ? "tubebay-opacity-50 !tubebay-cursor-not-allowed tubebay-text-gray-400"
                            : ""
                        }
                        ${
                          isHighlighted && !isDisabled
                            ? "tubebay-bg-blue-600 tubebay-text-white"
                            : "tubebay-text-gray-700"
                        }
                        ${option.className || ""}
                        ${classNames.option || ""}
                        `}
                  >
                    {option.labelNode || option.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
