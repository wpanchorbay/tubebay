import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useClickOutside } from "./hooks/useClickOutside";
import {
  borderClasses,
  errorClasses,
  errorClassesManual,
  hoverBorderClasses,
  hoverClassesManual,
} from "./classes";

// SVGs replacement for lucide-react
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

const LockKeyhole = ({ className }: { className?: string }) => (
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
    <circle cx="12" cy="16" r="1" />
    <rect x="3" y="10" width="18" height="12" rx="2" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
  </svg>
);

const Hourglass = ({ className }: { className?: string }) => (
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
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
);

export interface SelectOption {
  value: string | number;
  label: string;
  labelNode?: React.ReactNode;
  /**
   * Optional custom classes for this specific option.
   * Useful for multi-color dropdowns (e.g., badges, status colors).
   */
  className?: string;
  disabled?: boolean;
  /**
   * Special variants for the option.
   * 'buy_pro' will disable the option and show a tooltip.
   */
  variant?: "buy_pro" | "coming_soon";
}

export interface SelectProps {
  id?: string;
  /**
   * The current selected value(s)
   */
  value: SelectOption["value"] | null;
  /**
   * Callback when an option is selected
   */
  onChange: (value: string | number) => void;
  /**
   * List of available options
   */
  options: SelectOption[];
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;

  /**
   * Font size for the select options
   */
  fontSize?: number;

  /**
   * Font weight for the select options
   */
  fontWeight?: number;
  /**
   * Disable the entire interaction
   */
  disabled?: boolean;
  /**
   * Custom class for the container
   */
  className?: string;
  /**
   * Helper text or label (optional)
   */
  label?: string;

  /**
   * Enable search functionality within the dropdown
   */
  enableSearch?: boolean;
  /**
   * Reference to the container element
   */
  con_ref?: React.Ref<HTMLDivElement>;
  /**
   * Custom border class
   */
  border?: string;
  /**
   * Custom hover border class
   */
  hoverBorder?: string;
  /**
   * Custom text color class
   */
  color?: string;

  isError?: boolean;

  errorClassName?: string;

  differentDropdownWidth?: boolean;

  hideIcon?: boolean;

  isCompact?: boolean;

  classNames?: {
    wrapper?: string;
    container?: string;
    label?: string;
    select?: string;
    option?: string;
    dropdown?: string;
    search?: string;
    error?: string;
  };
}

const Select: React.FC<SelectProps> = ({
  id,
  value,
  con_ref,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  fontSize = 13,
  fontWeight = 500,
  label,
  enableSearch = false,
  border = borderClasses,
  hoverBorder = hoverBorderClasses,
  color = "tubebay-text-[#0a4b78]",
  isError = false,
  errorClassName = errorClasses,
  differentDropdownWidth = false,
  hideIcon = false,
  isCompact = false,
  classNames = {} as NonNullable<SelectProps["classNames"]>,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  // Tooltip state
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number;
    index: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Track interaction type to prevent auto-scrolling on mouse hover
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Close dropdown when clicking outside
  useClickOutside(containerRef, (event) => {
    if (
      tooltipRef.current &&
      tooltipRef.current.contains(event.target as Node)
    ) {
      return;
    }
    setIsOpen(false);
    setTooltipState(null);
  });

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery, enableSearch]);

  // Reset search and highlighted index when opening/closing
  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        // Wait for render, then focus
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }

      // Highlight the currently selected item in the filtered list if present
      const selectedIndex = value
        ? filteredOptions.findIndex((opt) => opt.value === value)
        : 0;
      const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setHighlightedIndex(initialIndex);

      // Ensure we allow scrolling to the initial selection
      interactionType.current = "keyboard";
    } else {
      // Clear search when closed
      setSearchQuery("");
      setTooltipState(null);
    }
  }, [isOpen, value, enableSearch, filteredOptions.length]);

  // Scroll highlighted item into view (Only if interaction was keyboard or initial open)
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

  const handleSelect = (option: SelectOption) => {
    if (
      option.disabled ||
      option.variant === "buy_pro" ||
      option.variant === "coming_soon"
    )
      return;
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery("");
    setTooltipState(null);
  };

  // Keyboard handler for the Main Trigger Div
  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    // If search is enabled and open, the input handles keys, not this div
    // But if closed, or if search is disabled, this handles keys.
    if (isOpen && enableSearch) return;

    interactionType.current = "keyboard";

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
        } else {
          setIsOpen((prev) => !prev);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Navigation when open but search disabled
          setHighlightedIndex((prev) => {
            const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
            return next;
          });
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Navigation when open but search disabled
          setHighlightedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
            return next;
          });
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };

  // Keyboard handler for the Search Input
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
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        // Return focus to the trigger
        if (containerRef.current) {
          const trigger = containerRef.current.querySelector(
            '[role="combobox"]',
          ) as HTMLElement;
          trigger?.focus();
        }
        break;
      default:
        break;
    }
  };

  // Handle showing tooltip with delay logic
  const handleOptionMouseEnter = (
    e: React.MouseEvent<HTMLLIElement>,
    index: number,
    isPro: boolean,
  ) => {
    interactionType.current = "mouse";
    setHighlightedIndex(index);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (isPro) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipState({
        visible: true,
        top: rect.top,
        left: rect.left + rect.width / 2,
        width: rect.width,
        index: index,
      });
    } else {
      // If moving to a non-pro item, close tooltip immediately
      setTooltipState(null);
    }
  };

  const handleOptionMouseLeave = () => {
    // Delay hiding tooltip to allow moving mouse into the tooltip itself
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 150);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 150);
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
          className={`tubebay-block tubebay-text-sm tubebay-font-medium tubebay-text-gray-700 tubebay-mb-1 ${
            classNames.label || ""
          }`}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <div
        id={id}
        ref={con_ref}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="custom-select-list"
        aria-disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`
          tubebay-ring-1 tubebay-ring-transparent
          tubebay-relative tubebay-flex tubebay-flex-wrap  tubebay-items-center tubebay-justify-between tubebay-w-full tubebay-gap-0 tubebay-px-4  tubebay-text-left !tubebay-cursor-pointer 
          tubebay-transition-all tubebay-duration-200 tubebay-ease-in-out tubebay-border tubebay-rounded-[8px] tubebay-bg-white ${border} 
          ${isCompact ? "tubebay-py-[5px]" : "tubebay-py-[9px]"}
          ${!disabled && !isOpen ? ` ${color} ` : ""}
          ${
            disabled
              ? "tubebay-bg-gray-100 tubebay-cursor-not-allowed tubebay-text-gray-400 tubebay-border-gray-200"
              : isError
              ? ""
              : "hover:!tubebay-border-[#3858e9]"
          }
          ${isOpen ? (isError ? errorClassesManual : hoverClassesManual) : ""}
          ${isError ? `${errorClassName} ${classNames.error || ""}` : ""}
          ${classNames.select || ""} ${classNames.container || ""}
        `}
      >
        <div className="tubebay-flex-1 tubebay-min-w-0">
          {enableSearch && isOpen ? (
            <input
              ref={searchInputRef}
              type="text"
              className={`tubebay-w-full !tubebay-bg-transparent !tubebay-border-none !tubebay-shadow-none !tubebay-outline-none !tubebay-p-0 !tubebay-font-[${fontWeight}] !tubebay-text-[${fontSize}px] !tubebay-leading-[20px] !tubebay-min-h-[unset] ${
                classNames.search || ""
              }`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHighlightedIndex(0); // Reset highlight on search
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
            />
          ) : (
            <span
              className={`tubebay-block tubebay-truncate ${color} hover:!tubebay-text-[#3858e9] tubebay-text-[${fontSize}px] tubebay-font-[${fontWeight}]`}
            >
              {value ? (
                <span
                  className={`tubebay-flex tubebay-items-center tubebay-gap-2 `}
                >
                  {selectedOption?.labelNode || selectedOption?.label}
                </span>
              ) : (
                placeholder
              )}
            </span>
          )}
        </div>

        {/* Chevron Icon */}
        {!hideIcon ? (
          <span className="tubebay-flex-shrink-0 tubebay-ml-2 tubebay-flex tubebay-items-center">
            <ChevronDown
              className={`tubebay-h-4 tubebay-w-4 tubebay-text-gray-700 tubebay-transition-transform tubebay-duration-200 ${
                isOpen ? "tubebay-transform tubebay-rotate-180" : ""
              }`}
            />
          </span>
        ) : null}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`tubebay-absolute tubebay-z-50  tubebay-bg-white tubebay-border tubebay-border-gray-200 tubebay-rounded-b-lg ${
            differentDropdownWidth ? "" : "tubebay-w-full"
          } ${classNames.dropdown || ""}`}
          style={{
            zIndex: 50000,
            boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.3)",
            marginTop: "-1px",
            borderRadius: "12px",
            padding: "4px",
          }}
        >
          {/* Options List */}
          <ul
            ref={listRef}
            id="custom-select-list"
            role="listbox"
            tabIndex={-1}
            onScroll={() => setTooltipState(null)} // Hide tooltip on scroll to prevent detachment
            className={`tubebay-max-h-60 tubebay-overflow-auto focus:tubebay-outline-none tubebay-scrollbar-hide tubebay-relative ${color} tubebay-font-[${fontWeight}] tubebay-text-[${fontSize}px]`}
            style={{ scrollbarWidth: "none" }}
          >
            {filteredOptions.length === 0 ? (
              <li className="tubebay-relative tubebay-cursor-default tubebay-select-none tubebay-p-1  tubebay-italic tubebay-text-center tubebay-rounded-[8px]">
                {searchQuery ? "No results found" : "No options available"}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = selectedOption?.value === option.value;
                // Highlight if matched index OR if it's the item keeping the tooltip open
                const isHighlighted =
                  highlightedIndex === index ||
                  (tooltipState?.visible && tooltipState.index === index);
                const isPro = option.variant === "buy_pro";
                const isComingSoon = option.variant === "coming_soon";
                const isDisabled = option.disabled || isPro;

                return (
                  <li
                    key={`${option.value}-${index}`}
                    id={`option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={(e) =>
                      handleOptionMouseEnter(e, index, !!isPro)
                    }
                    onMouseLeave={handleOptionMouseLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    className={`
                      tubebay-group tubebay-relative tubebay-cursor-pointer tubebay-select-none tubebay-px-3  tubebay-flex tubebay-flex-nowrap tubebay-justify-between tubebay-min-h-[36px]tubebay-font-medium tubebay-transition-colors tubebay-duration-150 !tubebay-mb-0 tubebay-border-b-[1px] tubebay-border-gray-100  tubebay-rounded-[8px] 
                      ${
                        isDisabled
                          ? "tubebay-opacity-100 !tubebay-cursor-not-allowed tubebay-text-gray-500 tubebay-bg-gray-200"
                          : ""
                      }
                      ${
                        isComingSoon
                          ? "tubebay-opacity-100 !tubebay-cursor-not-allowed !tubebay-text-pink-500 hover:!tubebay-text-pink-600 tubebay-bg-gray-200"
                          : ""
                      }
                      ${
                        isHighlighted && !isDisabled
                          ? "tubebay-bg-blue-600 tubebay-text-white"
                          : isDisabled
                          ? "tubebay-text-gray-400"
                          : ""
                      }
                      ${
                        !isHighlighted && !isDisabled
                          ? option.className || ""
                          : ""
                      }
                      ${classNames.option || ""}
                    `}
                  >
                    <div className="tubebay-flex tubebay-items-center tubebay-justify-between tubebay-min-h-[36px] tubebay-w-full tubebay-gap-4">
                      <span
                        className={`tubebay-block tubebay-truncate ${
                          isSelected
                            ? "tubebay-font-semibold"
                            : "tubebay-font-normal"
                        }`}
                      >
                        {option.labelNode || option.label}
                      </span>

                      {/* Lock Icon for Buy Pro */}
                      {isPro && (
                        <LockKeyhole className="tubebay-w-3.5 tubebay-h-3.5 tubebay-text-[#f02a74]" />
                      )}
                      {isComingSoon && (
                        <span className="tubebay-bg-pink-600 tubebay-text-white tubebay-p-1 tubebay-px-2 tubebay-rounded-full tubebay-text-xs tubebay-flex tubebay-items-center tubebay-gap-1 tubebay-flex-nowrap">
                          <Hourglass className="tubebay-w-3.5 tubebay-h-3.5 tubebay-text-white" />
                          <span className="tubebay-whitespace-nowrap">
                            Coming Soon
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Checkmark for selected item */}
                    {isSelected && !isPro && !isComingSoon && (
                      <span
                        className={`tubebay-px-3 tubebay-pr-0 tubebay-flex-nowrap tubebay-flex tubebay-items-center tubebay-pr-4 ${
                          isHighlighted && !isDisabled
                            ? "tubebay-text-white"
                            : "tubebay-text-blue-600"
                        }`}
                      >
                        <svg
                          className="tubebay-h-5 tubebay-w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Tooltip Portal - Renders to body to avoid clipping and stacking issues */}
      {isOpen &&
        tooltipState?.visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="tubebay-fixed tubebay-z-[50001] tubebay-flex tubebay-flex-col tubebay-items-center tubebay-gap-1.5 tubebay-bg-gray-900 tubebay-text-white tubebay-text-xs tubebay-p-2 tubebay-min-w-[140px] tubebay-rounded-md tubebay-shadow-lg"
            style={{
              top: tooltipState.top + 5, // Adjusted to user preference
              left: tooltipState.left,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <span className="tubebay-font-medium tubebay-whitespace-nowrap">
              Upgrade to unlock
            </span>
            <a
              href="#"
              target="_blank"
              onClick={(e) => e.preventDefault()}
              className="tubebay-w-full tubebay-bg-[#f02a74] hover:!tubebay-bg-[#e71161] tubebay-text-white hover:!tubebay-text-white tubebay-font-bold tubebay-py-1.5 tubebay-px-3 tubebay-transition-colors focus:tubebay-outline-none focus:tubebay-ring-0 tubebay-cursor-pointer tubebay-text-center tubebay-rounded"
            >
              Buy Pro
            </a>
            {/* Tooltip Arrow */}
            <div className="tubebay-absolute tubebay-top-full tubebay-left-1/2 -tubebay-translate-x-1/2 tubebay-border-4 tubebay-border-transparent tubebay-border-t-gray-900"></div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Select;
