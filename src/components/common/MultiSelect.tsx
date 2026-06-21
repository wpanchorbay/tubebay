import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import apiFetch from "@wordpress/api-fetch";
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

export interface MultiSelectOption {
  value: string | number;
  label: string;
  className?: string;
  disabled?: boolean;
  variant?: "buy_pro" | "coming_soon";
}

export interface MultiSelectProps {
  id?: string;
  ref?: React.Ref<HTMLDivElement>;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options?: MultiSelectOption[];
  endpoint?: string;
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

  /**
   * Custom render function for option display.
   * Receives the option object and returns a ReactNode.
   */
  renderOption?: (option: MultiSelectOption) => React.ReactNode;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  id,
  ref,
  value = [],
  onChange,
  options = [],
  endpoint,
  placeholder = "Select options...",
  disabled = false,
  className = "",
  label,
  enableSearch = true,
  isError = false,
  errorClassName = "tubebay-border-danger",
  classNames = {},
  isCompact = false,
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Tooltip state
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number;
    index: number;
  } | null>(null);

  // Endpoint fetching state
  const [fetchedOptions, setFetchedOptions] = useState<MultiSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allSeenOptions, setAllSeenOptions] = useState<MultiSelectOption[]>(
    options || [],
  );

  useEffect(() => {
    if (options && options.length > 0) {
      setAllSeenOptions((prev) => {
        const unique = new Map(prev.map((o) => [o.value, o]));
        options.forEach((o) => unique.set(o.value, o));
        return Array.from(unique.values());
      });
    }
  }, [options]);

  useEffect(() => {
    if (fetchedOptions.length > 0) {
      setAllSeenOptions((prev) => {
        const unique = new Map(prev.map((o) => [o.value, o]));
        fetchedOptions.forEach((o) => unique.set(o.value, o));
        return Array.from(unique.values());
      });
    }
  }, [fetchedOptions]);

  // Fetch from endpoint with debounce
  useEffect(() => {
    if (!endpoint) return;

    let isMounted = true;
    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsLoading(true);
        const separator = endpoint.includes("?") ? "&" : "?";
        const path = `${endpoint}${separator}search=${encodeURIComponent(
          searchQuery,
        )}`;

        const response: any = await apiFetch({
          path,
          method: "GET",
        });

        if (isMounted && Array.isArray(response)) {
          const newOptions = response.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setFetchedOptions(newOptions);
        }
      } catch (error) {
        console.error("MultiSelect fetch error:", error);
        if (isMounted) setFetchedOptions([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery, endpoint]);

  // Handle outside click logic including Portal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      const target = event.target as Node;

      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (tooltipRef.current && tooltipRef.current.contains(target)) {
        return;
      }

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
        setTooltipState(null);
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
    const combinedOptions = endpoint ? allSeenOptions : options || [];
    return value.map((val) => {
      const found = combinedOptions.find((opt) => opt.value === val);
      return found ? found : { value: val, label: `${val}` };
    });
  }, [options, value, endpoint, allSeenOptions]);

  // Filter options based on search query (exclude already selected)
  const filteredOptions = useMemo(() => {
    const baseOptions = endpoint ? fetchedOptions : options || [];
    let filtered = baseOptions.filter((opt) => !value.includes(opt.value));

    // Process local search only if no endpoint is specified
    if (!endpoint && enableSearch && searchQuery) {
      filtered = filtered.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return filtered;
  }, [options, value, searchQuery, enableSearch, endpoint, fetchedOptions]);

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
      setTooltipState(null);
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
    if (
      option.disabled ||
      option.variant === "buy_pro" ||
      option.variant === "coming_soon"
    ) {
      return;
    }
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

  const handleOptionMouseEnter = (
    e: React.MouseEvent<HTMLLIElement>,
    index: number,
    isPro: boolean,
  ) => {
    interactionType.current = "mouse";
    setHighlightedIndex(index);

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    if (isPro) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipState({
        visible: true,
        top: rect.top,
        left: rect.left + rect.width / 2,
        width: rect.width,
        index,
      });
    } else {
      setTooltipState(null);
    }
  };

  const handleOptionMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState((prev) => (prev ? { ...prev, visible: false } : null));
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setTooltipState((prev) => (prev ? { ...prev, visible: true } : null));
  };

  const handleTooltipMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setTooltipState(null);
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
                tubebay-absolute tubebay-z-[50000] tubebay-w-full tubebay-bg-white tubebay-border tubebay-border-gray-200 tubebay-rounded-[12px] tubebay-p-[4px] tubebay-shadow-[0_4px_12px_rgba(0,0,0,0.1)] tubebay-top-full tubebay-left-0 -tubebay-mt-[1px]
                ${classNames.dropdown || ""}
            `}
        >
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="tubebay-max-h-[204px] tubebay-overflow-auto focus:tubebay-outline-none"
            style={{ scrollbarWidth: "none" }}
          >
            {isLoading ? (
              <li className="tubebay-px-3 tubebay-py-2 tubebay-text-gray-500 tubebay-text-sm tubebay-text-center tubebay-italic !tubebay-mb-0 tubebay-rounded-[8px]">
                Loading...
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className="tubebay-px-3 tubebay-py-2 tubebay-text-gray-500 tubebay-text-sm tubebay-text-center tubebay-italic !tubebay-mb-0 tubebay-rounded-[8px]">
                {searchQuery ? "No results found" : "No more options"}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isHighlighted = highlightedIndex === index;
                const isDisabled = option.disabled;
                const isPro = option.variant === "buy_pro";
                const isComingSoon = option.variant === "coming_soon";

                return (
                  <li
                    key={`${option.value}-${index}`}
                    role="option"
                    aria-selected={false}
                    onMouseEnter={(e) => {
                      handleOptionMouseEnter(e, index, !!isPro);
                    }}
                    onMouseLeave={handleOptionMouseLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option);
                    }}
                    className={`
                        tubebay-group tubebay-relative tubebay-cursor-pointer tubebay-select-none tubebay-px-4 tubebay-py-2.5 tubebay-text-sm tubebay-transition-colors tubebay-border-b tubebay-border-gray-50 last:tubebay-border-0 !tubebay-mb-0 tubebay-rounded-[8px]
                        tubebay-flex tubebay-flex-nowrap tubebay-justify-between tubebay-items-center
                        ${
                          isDisabled || isPro || isComingSoon
                            ? "tubebay-opacity-100 !tubebay-cursor-not-allowed tubebay-text-gray-500 tubebay-bg-gray-100/50"
                            : ""
                        }
                        ${
                          isHighlighted &&
                          !isDisabled &&
                          !isPro &&
                          !isComingSoon
                            ? "tubebay-bg-blue-600 tubebay-text-white"
                            : "tubebay-text-gray-700"
                        }
                        ${
                          isComingSoon
                            ? "hover:!tubebay-text-pink-600 !tubebay-text-pink-500"
                            : ""
                        }
                        ${option.className || ""}
                        ${classNames.option || ""}
                        `}
                  >
                    <div className="tubebay-flex tubebay-items-center tubebay-min-w-0 tubebay-gap-4">
                      <span className="tubebay-block tubebay-truncate">
                        {renderOption ? renderOption(option) : option.label}
                      </span>
                    </div>

                    {/* Lock Icon for Buy Pro */}
                    {isPro && (
                      <LockKeyhole className="tubebay-w-3.5 tubebay-h-3.5 tubebay-text-[#f02a74] tubebay-flex-shrink-0" />
                    )}
                    {isComingSoon && (
                      <span className="tubebay-bg-pink-600 tubebay-text-white tubebay-p-1 tubebay-px-2 tubebay-rounded-full tubebay-text-xs tubebay-flex tubebay-items-center tubebay-gap-1 tubebay-flex-nowrap tubebay-flex-shrink-0">
                        <Hourglass className="tubebay-w-3.5 tubebay-h-3.5 tubebay-text-white" />
                        <span className="tubebay-whitespace-nowrap">
                          Coming Soon
                        </span>
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
              top: tooltipState.top + 5,
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

export default MultiSelect;
