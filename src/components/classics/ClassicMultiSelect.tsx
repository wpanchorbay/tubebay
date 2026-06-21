import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { ChevronDown, X, Lock, Hourglass } from "lucide-react";
import { MultiSelectOption } from "../common/MultiSelect";
import apiFetch from "@wordpress/api-fetch";

// Hook for click outside
function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

interface ClassicMultiSelectProps {
  id?: string;
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  options?: MultiSelectOption[];
  endpoint?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string | React.ReactNode;
  enableSearch?: boolean;
  size?: "short" | "regular";
  renderOption?: (option: MultiSelectOption) => React.ReactNode;
  description?: string;
  differentDropdownWidth?: boolean;
}

export const ClassicMultiSelect: React.FC<ClassicMultiSelectProps> = ({
  id,
  value,
  onChange,
  options = [],
  endpoint,
  placeholder = "Select options...",
  disabled = false,
  className = "",
  label,
  enableSearch = true,
  size = "short",
  renderOption,
  description,
  differentDropdownWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiOptions, setApiOptions] = useState<MultiSelectOption[]>([]);
  const [allSeenOptions, setAllSeenOptions] = useState<MultiSelectOption[]>(
    options || [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const initialFetchDone = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    text: string;
  } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setSearchQuery("");
    setTooltipState(null);
  });

  // Merge fetched options into allSeenOptions so selected items keep their labels
  useEffect(() => {
    if (apiOptions.length > 0) {
      setAllSeenOptions((prev) => {
        const map = new Map(prev.map((o) => [o.value, o]));
        apiOptions.forEach((o) => map.set(o.value, o));
        return Array.from(map.values());
      });
    }
  }, [apiOptions]);

  // Initial fetch when component mounts with pre-selected values
  // Uses the `ids` parameter so the API returns exactly these items
  useEffect(() => {
    if (!endpoint || initialFetchDone.current || value.length === 0) return;
    initialFetchDone.current = true;

    const separator = endpoint.includes("?") ? "&" : "?";
    const path = `${endpoint}${separator}ids=${value.join(",")}`;

    apiFetch({ path, method: "GET" })
      .then((res: any) => {
        const data = res?.data || res || [];
        setAllSeenOptions((prev) => {
          const map = new Map(prev.map((o) => [o.value, o]));
          data.forEach((o: MultiSelectOption) => map.set(o.value, o));
          return Array.from(map.values());
        });
      })
      .catch(() => {});
  }, [endpoint, value]);

  const effectiveOptions = endpoint ? apiOptions : options;

  useEffect(() => {
    if (!endpoint) return;
    if (!isOpen) return; // Only fetch when opened

    let active = true;
    const delayDebounceFn = setTimeout(async () => {
      try {
        setIsLoading(true);
        const separator = endpoint.includes("?") ? "&" : "?";
        const path = `${endpoint}${separator}search=${encodeURIComponent(
          searchQuery,
        )}`;

        const res: any = await apiFetch({ path, method: "GET" });

        if (active) {
          setApiOptions(res?.data || res || []);
          setIsLoading(false);
        }
      } catch {
        if (active) setIsLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [endpoint, searchQuery, isOpen]);

  const filteredOptions = useMemo(() => {
    if (endpoint) return effectiveOptions;
    if (!enableSearch || !searchQuery) return effectiveOptions;
    return effectiveOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [effectiveOptions, searchQuery, enableSearch, endpoint]);

  // Selected values — use allSeenOptions for endpoint mode so labels persist
  const selectedOptions = useMemo(() => {
    const lookupSource = endpoint ? allSeenOptions : effectiveOptions;
    return value.map((v) => {
      const found = lookupSource.find((opt) => opt.value === v);
      return found || { value: v, label: `${v}` };
    });
  }, [effectiveOptions, allSeenOptions, value, endpoint]);

  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      setHighlightedIndex(0);
      interactionType.current = "keyboard";
    } else {
      setSearchQuery("");
      setTooltipState(null);
    }
  }, [isOpen, enableSearch, filteredOptions.length]);

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
        if (elementTop < listTop) list.scrollTop = elementTop;
        else if (elementBottom > listBottom)
          list.scrollTop = elementBottom - list.clientHeight;
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option: MultiSelectOption) => {
    // @ts-ignore - sharing variant types from Select for consistency
    const variant = option.variant;
    if (option.disabled || variant === "buy_pro" || variant === "coming_soon")
      return;

    if (value.includes(option.value)) {
      onChange(value.filter((v) => v !== option.value));
    } else {
      onChange([...value, option.value]);
    }

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleRemove = (e: React.MouseEvent, valToRemove: string | number) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== valToRemove));
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (isOpen && enableSearch) return;

    interactionType.current = "keyboard";
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0,
          );
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        else
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1,
          );
        break;
      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    interactionType.current = "keyboard";
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex])
          handleSelect(filteredOptions[highlightedIndex]);
        break;
      case "Backspace":
        if (!searchQuery && value.length > 0) {
          onChange(value.slice(0, -1));
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const selectId =
    id || `classic-multi-${Math.random().toString(36).slice(2, 9)}`;
  const sizeClass = size === "short" ? "" : "";
  const explicitWidth =
    size === "short" ? "min-content" : size === "regular" ? "auto" : "100%";

  return (
    <div
      className={`${sizeClass} ${className} tubebay-align-middle`}
      ref={containerRef}
    >
      {label && (
        <label htmlFor={selectId} className="tubebay-block tubebay-mb-1">
          {label}
        </label>
      )}

      <div className="tubebay-relative" style={{ width: explicitWidth }}>
        <div
          id={selectId}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          onClick={(e) => {
            if (disabled) return;
            // Don't toggle closed if clicking inside the search input while already open
            if (isOpen && (e.target as HTMLElement).tagName === "INPUT") return;
            setIsOpen(!isOpen);
          }}
          onKeyDown={handleTriggerKeyDown}
          className={`tubebay-flex tubebay-flex-wrap tubebay-items-center tubebay-gap-1 tubebay-bg-white tubebay-border tubebay-border-[#8c8f94] tubebay-rounded-[3px] tubebay-p-[3px_24px_3px_6px] tubebay-min-h-[30px] tubebay-transition-shadow tubebay-duration-100 tubebay-relative tubebay-box-border tubebay-w-full ${
            disabled
              ? "tubebay-cursor-not-allowed tubebay-bg-[#f0f0f1]"
              : "tubebay-cursor-text"
          } ${
            isOpen
              ? "tubebay-border-[#2271b1] tubebay-shadow-[0_0_0_1px_#2271b1] tubebay-outline-none"
              : "tubebay-shadow-none"
          }`}
        >
          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="tubebay-bg-[#f0f0f1] tubebay-border tubebay-border-[#c3c4c7] tubebay-rounded-[3px] tubebay-px-1 tubebay-flex tubebay-items-center tubebay-gap-1 tubebay-text-xs tubebay-text-[#3c434a] tubebay-leading-[20px]"
            >
              {opt.label}
              <button
                onClick={(e) => handleRemove(e, opt.value)}
                className="tubebay-bg-transparent tubebay-border-none tubebay-p-0 tubebay-cursor-pointer tubebay-text-[#8c8f94] tubebay-flex tubebay-items-center"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {!enableSearch && value.length === 0 && (
            <span className="tubebay-text-[#8c8f94] tubebay-text-[13px] tubebay-pl-1">
              {placeholder}
            </span>
          )}

          {/* Chevron icon pointing down */}
          <span className="tubebay-absolute tubebay-right-1.5 tubebay-top-1/2 -tubebay-translate-y-1/2 tubebay-flex tubebay-pointer-events-none">
            <ChevronDown size={14} color="#50575e" />
          </span>
        </div>

        {isOpen && (
          <div
            className="tubebay-absolute tubebay-z-[99999] tubebay-bg-white tubebay-border-2 tubebay-border-[#2271b1] tubebay-border-t-0  tubebay-rounded-b-[3px] tubebay-shadow-[0_3px_5px_rgba(0,0,0,0.2)] tubebay-p-0 tubebay-box-border tubebay-top-full tubebay-left-[-1px] tubebay-mt-[-3px]"
            style={{
              ...(differentDropdownWidth
                ? { minWidth: "calc(100% + 2px)" }
                : { width: "calc(100% + 2px)" }),
            }}
          >
            {enableSearch && (
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (!disabled && !isOpen) setIsOpen(true);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={value.length === 0 ? placeholder : ""}
                disabled={disabled}
                className="tubebay-w-[calc(100%-8px)] tubebay-px-2 tubebay-leading-loose tubebay-min-h-[26px] tubebay-border tubebay-border-[#aaaaaa] tubebay-bg-[#fcfcfc] tubebay-rounded-[3px] tubebay-box-border tubebay-text-[13px] focus:tubebay-outline-none focus:tubebay-shadow-none tubebay-m-[4px]"
              />
            )}
            {isLoading ? (
              <div className="tubebay-py-2 tubebay-px-3 tubebay-text-[#646970] tubebay-text-[13px] tubebay-flex tubebay-items-center tubebay-gap-2">
                <Hourglass size={14} className="tubebay-animate-spin" />{" "}
                Loading...
              </div>
            ) : (
              <ul
                ref={listRef}
                role="listbox"
                className="tubebay-max-h-[220px] tubebay-overflow-y-auto tubebay-m-0 tubebay-p-0 tubebay-list-none"
              >
                {filteredOptions.length === 0 ? (
                  <li className="tubebay-px-3 tubebay-py-1.5 tubebay-text-[#646970] tubebay-italic tubebay-text-[13px] tubebay-m-0">
                    {searchQuery ? "No results found" : "No options available"}
                  </li>
                ) : (
                  filteredOptions.map((opt, index) => {
                    const isSelected = value.includes(opt.value);
                    const isHighlighted = highlightedIndex === index;
                    // @ts-ignore
                    const variant = opt.variant;
                    const isPro = variant === "buy_pro";
                    const isComingSoon = variant === "coming_soon";
                    const isDisabled = opt.disabled || isPro || isComingSoon;

                    return (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={(e) => {
                          interactionType.current = "mouse";
                          setHighlightedIndex(index);
                          if (isPro || isComingSoon) {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setTooltipState({
                              visible: true,
                              top: rect.top,
                              left: rect.left + rect.width / 2,
                              text: isPro ? "Available in Pro" : "Coming Soon",
                            });
                          } else {
                            setTooltipState(null);
                          }
                        }}
                        onMouseLeave={() => setTooltipState(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(opt);
                        }}
                        className={`tubebay-px-3 tubebay-py-1.5 tubebay-flex tubebay-items-center tubebay-justify-between tubebay-text-[13px] tubebay-m-0 ${
                          isDisabled
                            ? "tubebay-cursor-not-allowed"
                            : "tubebay-cursor-pointer"
                        } ${
                          isHighlighted
                            ? "tubebay-bg-[#2271b1] tubebay-text-white"
                            : isDisabled
                            ? "tubebay-bg-transparent tubebay-text-[#a7aaad]"
                            : "tubebay-bg-transparent tubebay-text-[#2c3338]"
                        }`}
                      >
                        <div className="tubebay-flex tubebay-items-center tubebay-gap-2">
                          <div
                            className={`
                            tubebay-flex tubebay-items-center tubebay-justify-center
                            tubebay-w-4 tubebay-h-4 tubebay-rounded tubebay-border-2 tubebay-transition-all tubebay-duration-200
                            ${
                              isSelected
                                ? isHighlighted
                                  ? "tubebay-border-white tubebay-bg-white"
                                  : "tubebay-border-[#2271b1] tubebay-bg-[#2271b1]"
                                : isHighlighted
                                ? "tubebay-border-white tubebay-bg-transparent"
                                : "tubebay-border-[#8c8f94] tubebay-bg-white"
                            }
                          `}
                          >
                            <svg
                              className={`tubebay-w-3.5 tubebay-h-3.5 tubebay-transform tubebay-transition-transform tubebay-duration-200 ${
                                isSelected
                                  ? "tubebay-scale-100"
                                  : "tubebay-scale-0"
                              } ${
                                isHighlighted && isSelected
                                  ? "tubebay-text-[#2271b1]"
                                  : "tubebay-text-white"
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <span>
                            {renderOption ? renderOption(opt) : opt.label}
                          </span>
                        </div>

                        {/* Icons for variants */}
                        {isPro && (
                          <span
                            className={`tubebay-flex ${
                              isHighlighted
                                ? "tubebay-text-white"
                                : "tubebay-text-[#ffb900]"
                            }`}
                          >
                            <Lock size={14} />
                          </span>
                        )}
                        {isComingSoon && (
                          <span
                            className={`tubebay-text-[10px] tubebay-uppercase tubebay-px-1.5 tubebay-py-0.5 tubebay-rounded-[10px] tubebay-font-semibold tubebay-flex tubebay-items-center tubebay-gap-1 ${
                              isHighlighted
                                ? "tubebay-bg-white/20 tubebay-text-white"
                                : "tubebay-bg-[#f0f0f1] tubebay-text-[#646970]"
                            }`}
                          >
                            <Hourglass size={10} />
                            Soon
                          </span>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className="description tubebay-mt-1">{description}</p>
      )}

      {tooltipState?.visible && (
        <div
          className="tubebay-fixed tubebay-bg-[#1d2327] tubebay-text-white tubebay-px-2.5 tubebay-py-1 tubebay-rounded-[3px] tubebay-text-[12px] tubebay-pointer-events-none tubebay-z-[100000] tubebay-whitespace-nowrap"
          style={{
            top: tooltipState.top - 8,
            left: tooltipState.left,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltipState.text}
          <div className="tubebay-absolute -tubebay-bottom-1 tubebay-left-1/2 -tubebay-translate-x-1/2 tubebay-border-x-4 tubebay-border-t-4 tubebay-border-x-transparent tubebay-border-b-transparent tubebay-border-t-[#1d2327]" />
        </div>
      )}
    </div>
  );
};
