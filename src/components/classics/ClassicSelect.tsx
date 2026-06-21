import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Lock, Hourglass } from "lucide-react";
import { SelectOption } from "../common/Select";

// Hook for click outside
function useClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // If any ref contains the target, don't trigger handler
      const isInside = refs.some(ref => ref.current && ref.current.contains(event.target as Node));
      if (isInside) {
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
  }, [refs, handler]);
}

export interface ClassicSelectClassNames {
  container?: string;
  label?: string;
  innerContainer?: string;
  trigger?: string;
  triggerOpen?: string;
  triggerDisabled?: string;
  value?: string;
  dropdown?: string;
  searchContainer?: string;
  searchInput?: string;
  list?: string;
  option?: string;
  optionHighlighted?: string;
  optionSelected?: string;
  description?: string;
}

interface ClassicSelectProps {
  id?: string;
  value: SelectOption["value"] | null;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  classNames?: ClassicSelectClassNames;
  label?: string;
  description?: string;
  enableSearch?: boolean;
  size?: "short" | "regular";
  renderOption?: (option: SelectOption) => React.ReactNode;
  differentDropdownWidth?: boolean;
}

export const ClassicSelect: React.FC<ClassicSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  classNames,
  label,
  description,
  enableSearch = false,
  size = "short",
  renderOption,
  differentDropdownWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const interactionType = useRef<"mouse" | "keyboard">("keyboard");

  // Portal coordinates
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // Tooltip state for buy_pro
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number | "max-content";
    text: string;
  } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  useClickOutside([containerRef, dropdownRef], () => {
    setIsOpen(false);
    setTooltipState(null);
  });

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery, enableSearch]);

  const updateCoords = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (enableSearch && searchInputRef.current) {
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      const selectedIndex = value
        ? filteredOptions.findIndex((opt) => opt.value === value)
        : 0;
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      interactionType.current = "keyboard";
    } else {
      setSearchQuery("");
      setTooltipState(null);
    }
  }, [isOpen, value, enableSearch, filteredOptions.length]);

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

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (isOpen && enableSearch) return;

    interactionType.current = "keyboard";
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (filteredOptions[highlightedIndex])
            handleSelect(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
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
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleOptionHover = (
    e: React.MouseEvent<HTMLLIElement>,
    index: number,
    option: SelectOption,
  ) => {
    interactionType.current = "mouse";
    setHighlightedIndex(index);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (option.variant === "buy_pro" || option.variant === "coming_soon") {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipState({
        visible: true,
        top: rect.top,
        left: rect.left + rect.width / 2,
        width: rect.width,
        text:
          option.variant === "buy_pro"
            ? "Available in Pro Version"
            : "Coming Soon",
      });
    } else {
      setTooltipState(null);
    }
  };

  const selectId =
    id || `classic-select-${Math.random().toString(36).slice(2, 9)}`;
  const sizeClass = size === "short" ? "min-content" : "";
  const explicitWidth =
    size === "short" ? "min-content" : size === "regular" ? "auto" : "100%";

  return (
    <div
      className={`${sizeClass} ${className} ${
        classNames?.container || ""
      } wpab-align-middle`.trim()}
      ref={containerRef}
    >
      {label && (
        <label
          htmlFor={selectId}
          className={`wpab-block wpab-mb-1 ${
            classNames?.label || ""
          }`.trim()}
        >
          {label}
        </label>
      )}

      <div
        className={`wpab-relative ${classNames?.innerContainer}`}
        style={{ width: explicitWidth }}
      >
        {/* Trigger that looks like WP native select */}
        <div
          id={selectId}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          className={`
            wpab-flex wpab-items-center wpab-justify-between 
            wpab-appearance-none wpab-border wpab-border-[#8c8f94] 
            wpab-rounded-[3px] wpab-px-2 wpab-pr-6 wpab-min-h-[30px] 
            wpab-leading-loose wpab-transition-all wpab-duration-100 
            wpab-select-none wpab-relative wpab-box-border wpab-w-full 
            ${
              disabled
                ? `wpab-cursor-not-allowed wpab-bg-[#f0f0f1] wpab-text-[#a7aaad] ${
                    classNames?.triggerDisabled || ""
                  }`
                : `wpab-cursor-pointer wpab-bg-white wpab-text-[#2c3338]`
            } 
            ${
              isOpen
                ? `!wpab-border-[#2271b1] wpab-shadow-[0_0_0_1px_#2271b1] wpab-outline-none ${
                    classNames?.triggerOpen || ""
                  }`
                : "wpab-shadow-none"
            } 
            ${classNames?.trigger || ""}
          `.trim()}
        >
          <span
            className={`wpab-overflow-hidden wpab-text-ellipsis wpab-whitespace-nowrap wpab-flex-1 ${
              classNames?.value || ""
            }`.trim()}
          >
            {selectedOption
              ? renderOption
                ? renderOption(selectedOption)
                : selectedOption.label
              : placeholder}
          </span>

          {/* Native-looking arrow */}
          <span className="wpab-absolute wpab-right-1.5 wpab-flex wpab-items-center wpab-pointer-events-none">
            <ChevronDown size={14} color="#50575e" />
          </span>
        </div>

        {/* Dropdown Menu */}
        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className={`wpab-fixed wpab-z-[999999] wpab-bg-white wpab-border-2 wpab-border-[#2271b1] ${
                differentDropdownWidth
                  ? "wpab-rounded-[3px]"
                  : "wpab-border-t-0 wpab-mt-[-3px] wpab-rounded-b-[3px]"
              } 
              wpab-rounded-b-[3px] wpab-shadow-[0_3px_5px_rgba(0,0,0,0.2)] wpab-p-0 wpab-box-border ${
                classNames?.dropdown || ""
              }`.trim()}
              style={{
                top: coords.top,
                left: coords.left - 1, // Offset for border alignment
                width: coords.width + 2, // Compensate for border
                ...(differentDropdownWidth ? { width: "max-content" } : {}),
              }}
            >
              {enableSearch && (
                <div
                  className={`wpab-p-1.5 ${
                    classNames?.searchContainer || ""
                  }`.trim()}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Search..."
                    className={`wpab-w-full wpab-px-2 wpab-leading-loose wpab-min-h-[26px] wpab-border wpab-border-[#aaaaaa] wpab-bg-[#fcfcfc] wpab-rounded-[3px] wpab-box-border wpab-text-[13px] focus:wpab-outline-none focus:wpab-shadow-none ${
                      classNames?.searchInput || ""
                    }`.trim()}
                  />
                </div>
              )}

              <ul
                ref={listRef}
                role="listbox"
                className={`wpab-max-h-[220px] wpab-overflow-y-auto wpab-m-0 wpab-p-0 wpab-list-none ${
                  classNames?.list || ""
                }`.trim()}
                style={{
                  scrollbarWidth: "thin",
                }}
              >
                {filteredOptions.length === 0 ? (
                  <li className="wpab-px-3 wpab-py-1.5 wpab-text-[#646970] wpab-italic wpab-text-[13px] wpab-m-0">
                    {searchQuery ? "No results found" : "No options available"}
                  </li>
                ) : (
                  filteredOptions.map((opt, index) => {
                    const isSelected = selectedOption?.value === opt.value;
                    const isHighlighted = highlightedIndex === index;
                    const isPro = opt.variant === "buy_pro";
                    const isComingSoon = opt.variant === "coming_soon";
                    const isDisabled = opt.disabled || isPro || isComingSoon;

                    return (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={(e) => handleOptionHover(e, index, opt)}
                        onMouseLeave={() => {
                          hoverTimeoutRef.current = window.setTimeout(
                            () => setTooltipState(null),
                            150,
                          );
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(opt);
                        }}
                        className={`
                        wpab-px-3 wpab-py-1.5 wpab-flex wpab-items-center 
                        wpab-justify-between wpab-text-[13px] wpab-m-0 
                        ${
                          isDisabled
                            ? "wpab-cursor-not-allowed"
                            : "wpab-cursor-pointer"
                        } 
                        ${
                          isHighlighted
                            ? `wpab-bg-[#2271b1] wpab-text-white ${
                                classNames?.optionHighlighted || ""
                              }`
                            : isDisabled
                            ? "wpab-bg-transparent wpab-text-[#a7aaad]"
                            : `wpab-bg-transparent wpab-text-[#2c3338]`
                        } 
                        ${isSelected ? classNames?.optionSelected || "" : ""}
                        ${classNames?.option || ""}
                      `.trim()}
                      >
                        <span className="wpab-flex wpab-items-center wpab-gap-2 wpab-overflow-hidden wpab-text-ellipsis wpab-whitespace-nowrap">
                          {renderOption ? renderOption(opt) : opt.label}
                        </span>

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
            </div>,
            document.body,
          )}
      </div>

      {description && (
        <p
          className={`description wpab-mt-1 ${
            classNames?.description || ""
          }`.trim()}
        >
          {description}
        </p>
      )}

      {/* Portal Tooltip or absolute Tooltip for variants */}
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
          {/* Tooltip caret */}
          <div className="wpab-absolute -wpab-bottom-1 wpab-left-1/2 -wpab-translate-x-1/2 wpab-border-x-4 wpab-border-t-4 wpab-border-x-transparent wpab-border-b-transparent wpab-border-t-[#1d2327]" />
        </div>
      )}
    </div>
  );
};
