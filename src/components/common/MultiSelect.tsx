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
  errorClassName = "wpab-border-danger",
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
      className={`wpab-relative wpab-w-full ${className} ${
        classNames.wrapper || ""
      }`}
      ref={containerRef}
    >
      {label && (
        <label
          className={`wpab-block wpab-text-sm wpab-font-bold wpab-text-gray-900 wpab-mb-2 ${
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
          wpab-relative wpab-flex wpab-flex-wrap wpab-items-center wpab-gap-2 wpab-w-full wpab-px-4 wpab-text-left !wpab-cursor-text
          wpab-transition-all wpab-duration-200 wpab-ease-in-out wpab-border wpab-rounded-[8px] wpab-bg-white
          ${borderClasses}
          ${isCompact ? "wpab-py-[4px]" : "wpab-py-[7px]"}
          ${
            disabled
              ? "wpab-bg-gray-50 wpab-cursor-not-allowed wpab-text-gray-400 wpab-border-gray-200"
              : `hover:!wpab-border-primary`
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
                wpab-inline-flex wpab-items-center wpab-gap-1 wpab-bg-gray-100 wpab-text-gray-800 wpab-px-2 wpab-py-[2px] wpab-rounded-none wpab-text-[13px] wpab-leading-[20px] wpab-font-[400]
                ${classNames.tag || ""}
            `}
          >
            {option.label}
            <button
              type="button"
              onClick={(e) => handleRemove(option.value, e)}
              className="wpab-flex wpab-items-center wpab-justify-center wpab-w-4 wpab-h-4 wpab-rounded-full hover:wpab-bg-gray-200 wpab-transition-colors wpab-text-gray-500"
              aria-label={`Remove ${option.label}`}
            >
              <X className="wpab-w-3 wpab-h-3" />
            </button>
          </span>
        ))}

        {/* Search Input */}
        <input
          ref={searchInputRef}
          type="text"
          className={`
            wpab-flex-1 wpab-min-w-[80px] wpab-bg-transparent !wpab-border-none !wpab-shadow-none wpab-outline-none wpab-px-1 wpab-py-[2px]  !wpab-text-[13px] !wpab-leading-[20px] wpab-font-[400] wpab-text-gray-900 wpab-placeholder-gray-400 !wpab-min-h-[24px]
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
        <span className="wpab-flex-shrink-0 wpab-ml-auto wpab-flex wpab-items-center">
          <ChevronDown
            className={`wpab-h-4 wpab-w-4 wpab-text-gray-500 wpab-transition-transform wpab-duration-200 ${
              isOpen ? "wpab-transform wpab-rotate-180" : ""
            }`}
          />
        </span>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
                wpab-absolute wpab-z-[50000] wpab-w-full wpab-bg-white wpab-border wpab-border-gray-200 wpab-rounded-[12px] wpab-p-[4px] wpab-shadow-[0_4px_12px_rgba(0,0,0,0.1)] wpab-top-full wpab-left-0 -wpab-mt-[1px]
                ${classNames.dropdown || ""}
            `}
        >
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="wpab-max-h-[204px] wpab-overflow-auto focus:wpab-outline-none"
            style={{ scrollbarWidth: "none" }}
          >
            {isLoading ? (
              <li className="wpab-px-3 wpab-py-2 wpab-text-gray-500 wpab-text-sm wpab-text-center wpab-italic !wpab-mb-0 wpab-rounded-[8px]">
                Loading...
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className="wpab-px-3 wpab-py-2 wpab-text-gray-500 wpab-text-sm wpab-text-center wpab-italic !wpab-mb-0 wpab-rounded-[8px]">
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
                        wpab-group wpab-relative wpab-cursor-pointer wpab-select-none wpab-px-4 wpab-py-2.5 wpab-text-sm wpab-transition-colors wpab-border-b wpab-border-gray-50 last:wpab-border-0 !wpab-mb-0 wpab-rounded-[8px]
                        wpab-flex wpab-flex-nowrap wpab-justify-between wpab-items-center
                        ${
                          isDisabled || isPro || isComingSoon
                            ? "wpab-opacity-100 !wpab-cursor-not-allowed wpab-text-gray-500 wpab-bg-gray-100/50"
                            : ""
                        }
                        ${
                          isHighlighted &&
                          !isDisabled &&
                          !isPro &&
                          !isComingSoon
                            ? "wpab-bg-blue-600 wpab-text-white"
                            : "wpab-text-gray-700"
                        }
                        ${
                          isComingSoon
                            ? "hover:!wpab-text-pink-600 !wpab-text-pink-500"
                            : ""
                        }
                        ${option.className || ""}
                        ${classNames.option || ""}
                        `}
                  >
                    <div className="wpab-flex wpab-items-center wpab-min-w-0 wpab-gap-4">
                      <span className="wpab-block wpab-truncate">
                        {renderOption ? renderOption(option) : option.label}
                      </span>
                    </div>

                    {/* Lock Icon for Buy Pro */}
                    {isPro && (
                      <LockKeyhole className="wpab-w-3.5 wpab-h-3.5 wpab-text-[#f02a74] wpab-flex-shrink-0" />
                    )}
                    {isComingSoon && (
                      <span className="wpab-bg-pink-600 wpab-text-white wpab-p-1 wpab-px-2 wpab-rounded-full wpab-text-xs wpab-flex wpab-items-center wpab-gap-1 wpab-flex-nowrap wpab-flex-shrink-0">
                        <Hourglass className="wpab-w-3.5 wpab-h-3.5 wpab-text-white" />
                        <span className="wpab-whitespace-nowrap">
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
            className="wpab-fixed wpab-z-[50001] wpab-flex wpab-flex-col wpab-items-center wpab-gap-1.5 wpab-bg-gray-900 wpab-text-white wpab-text-xs wpab-p-2 wpab-min-w-[140px] wpab-rounded-md wpab-shadow-lg"
            style={{
              top: tooltipState.top + 5,
              left: tooltipState.left,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <span className="wpab-font-medium wpab-whitespace-nowrap">
              Upgrade to unlock
            </span>
            <a
              href="#"
              target="_blank"
              onClick={(e) => e.preventDefault()}
              className="wpab-w-full wpab-bg-[#f02a74] hover:!wpab-bg-[#e71161] wpab-text-white hover:!wpab-text-white wpab-font-bold wpab-py-1.5 wpab-px-3 wpab-transition-colors focus:wpab-outline-none focus:wpab-ring-0 wpab-cursor-pointer wpab-text-center wpab-rounded"
            >
              Buy Pro
            </a>
            {/* Tooltip Arrow */}
            <div className="wpab-absolute wpab-top-full wpab-left-1/2 -wpab-translate-x-1/2 wpab-border-4 wpab-border-transparent wpab-border-t-gray-900"></div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default MultiSelect;
