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
      className={`${sizeClass} ${className} wpab-align-middle`}
      ref={containerRef}
    >
      {label && (
        <label htmlFor={selectId} className="wpab-block wpab-mb-1">
          {label}
        </label>
      )}

      <div className="wpab-relative" style={{ width: explicitWidth }}>
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
          className={`wpab-flex wpab-flex-wrap wpab-items-center wpab-gap-1 wpab-bg-white wpab-border wpab-border-[#8c8f94] wpab-rounded-[3px] wpab-p-[3px_24px_3px_6px] wpab-min-h-[30px] wpab-transition-shadow wpab-duration-100 wpab-relative wpab-box-border wpab-w-full ${
            disabled
              ? "wpab-cursor-not-allowed wpab-bg-[#f0f0f1]"
              : "wpab-cursor-text"
          } ${
            isOpen
              ? "wpab-border-[#2271b1] wpab-shadow-[0_0_0_1px_#2271b1] wpab-outline-none"
              : "wpab-shadow-none"
          }`}
        >
          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="wpab-bg-[#f0f0f1] wpab-border wpab-border-[#c3c4c7] wpab-rounded-[3px] wpab-px-1 wpab-flex wpab-items-center wpab-gap-1 wpab-text-xs wpab-text-[#3c434a] wpab-leading-[20px]"
            >
              {opt.label}
              <button
                onClick={(e) => handleRemove(e, opt.value)}
                className="wpab-bg-transparent wpab-border-none wpab-p-0 wpab-cursor-pointer wpab-text-[#8c8f94] wpab-flex wpab-items-center"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {!enableSearch && value.length === 0 && (
            <span className="wpab-text-[#8c8f94] wpab-text-[13px] wpab-pl-1">
              {placeholder}
            </span>
          )}

          {/* Chevron icon pointing down */}
          <span className="wpab-absolute wpab-right-1.5 wpab-top-1/2 -wpab-translate-y-1/2 wpab-flex wpab-pointer-events-none">
            <ChevronDown size={14} color="#50575e" />
          </span>
        </div>

        {isOpen && (
          <div
            className="wpab-absolute wpab-z-[99999] wpab-bg-white wpab-border-2 wpab-border-[#2271b1] wpab-border-t-0  wpab-rounded-b-[3px] wpab-shadow-[0_3px_5px_rgba(0,0,0,0.2)] wpab-p-0 wpab-box-border wpab-top-full wpab-left-[-1px] wpab-mt-[-3px]"
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
                className="wpab-w-[calc(100%-8px)] wpab-px-2 wpab-leading-loose wpab-min-h-[26px] wpab-border wpab-border-[#aaaaaa] wpab-bg-[#fcfcfc] wpab-rounded-[3px] wpab-box-border wpab-text-[13px] focus:wpab-outline-none focus:wpab-shadow-none wpab-m-[4px]"
              />
            )}
            {isLoading ? (
              <div className="wpab-py-2 wpab-px-3 wpab-text-[#646970] wpab-text-[13px] wpab-flex wpab-items-center wpab-gap-2">
                <Hourglass size={14} className="wpab-animate-spin" />{" "}
                Loading...
              </div>
            ) : (
              <ul
                ref={listRef}
                role="listbox"
                className="wpab-max-h-[220px] wpab-overflow-y-auto wpab-m-0 wpab-p-0 wpab-list-none"
              >
                {filteredOptions.length === 0 ? (
                  <li className="wpab-px-3 wpab-py-1.5 wpab-text-[#646970] wpab-italic wpab-text-[13px] wpab-m-0">
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
                        className={`wpab-px-3 wpab-py-1.5 wpab-flex wpab-items-center wpab-justify-between wpab-text-[13px] wpab-m-0 ${
                          isDisabled
                            ? "wpab-cursor-not-allowed"
                            : "wpab-cursor-pointer"
                        } ${
                          isHighlighted
                            ? "wpab-bg-[#2271b1] wpab-text-white"
                            : isDisabled
                            ? "wpab-bg-transparent wpab-text-[#a7aaad]"
                            : "wpab-bg-transparent wpab-text-[#2c3338]"
                        }`}
                      >
                        <div className="wpab-flex wpab-items-center wpab-gap-2">
                          <div
                            className={`
                            wpab-flex wpab-items-center wpab-justify-center
                            wpab-w-4 wpab-h-4 wpab-rounded wpab-border-2 wpab-transition-all wpab-duration-200
                            ${
                              isSelected
                                ? isHighlighted
                                  ? "wpab-border-white wpab-bg-white"
                                  : "wpab-border-[#2271b1] wpab-bg-[#2271b1]"
                                : isHighlighted
                                ? "wpab-border-white wpab-bg-transparent"
                                : "wpab-border-[#8c8f94] wpab-bg-white"
                            }
                          `}
                          >
                            <svg
                              className={`wpab-w-3.5 wpab-h-3.5 wpab-transform wpab-transition-transform wpab-duration-200 ${
                                isSelected
                                  ? "wpab-scale-100"
                                  : "wpab-scale-0"
                              } ${
                                isHighlighted && isSelected
                                  ? "wpab-text-[#2271b1]"
                                  : "wpab-text-white"
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
                            className={`wpab-flex ${
                              isHighlighted
                                ? "wpab-text-white"
                                : "wpab-text-[#ffb900]"
                            }`}
                          >
                            <Lock size={14} />
                          </span>
                        )}
                        {isComingSoon && (
                          <span
                            className={`wpab-text-[10px] wpab-uppercase wpab-px-1.5 wpab-py-0.5 wpab-rounded-[10px] wpab-font-semibold wpab-flex wpab-items-center wpab-gap-1 ${
                              isHighlighted
                                ? "wpab-bg-white/20 wpab-text-white"
                                : "wpab-bg-[#f0f0f1] wpab-text-[#646970]"
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
        <p className="description wpab-mt-1">{description}</p>
      )}

      {tooltipState?.visible && (
        <div
          className="wpab-fixed wpab-bg-[#1d2327] wpab-text-white wpab-px-2.5 wpab-py-1 wpab-rounded-[3px] wpab-text-[12px] wpab-pointer-events-none wpab-z-[100000] wpab-whitespace-nowrap"
          style={{
            top: tooltipState.top - 8,
            left: tooltipState.left,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltipState.text}
          <div className="wpab-absolute -wpab-bottom-1 wpab-left-1/2 -wpab-translate-x-1/2 wpab-border-x-4 wpab-border-t-4 wpab-border-x-transparent wpab-border-b-transparent wpab-border-t-[#1d2327]" />
        </div>
      )}
    </div>
  );
};
