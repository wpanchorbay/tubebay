import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { SelectionCard } from "./SelectionCard";

export interface CardOption {
  value: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: "buy_pro" | "coming_soon";
}

interface CardRadioGroupProps {
  options: CardOption[];
  value: string;
  onChange: (value: string) => void;
  layout?: "vertical" | "horizontal" | "responsive";
  className?: string;
  classNames?: {
    root?: string;
    card?: {
      root?: string;
      iconWrapper?: string;
      circle?: string;
      dot?: string;
      textWrapper?: string;
      title?: string;
      description?: string;
    };
  };
}

export const CardRadioGroup: React.FC<CardRadioGroupProps> = ({
  options,
  value,
  onChange,
  layout = "responsive",
  className = "",
  classNames,
}) => {
  let containerClass = "";

  switch (layout) {
    case "vertical":
      containerClass = "tubebay-flex tubebay-flex-col tubebay-gap-4";
      break;
    case "horizontal":
      containerClass =
        "tubebay-flex tubebay-flex-row tubebay-gap-4 tubebay-overflow-x-auto tubebay-pb-2"; // Added overflow handling for safe horizontal scrolling if needed
      break;
    case "responsive":
    default:
      containerClass =
        "tubebay-grid tubebay-grid-cols-1 md:!tubebay-grid-cols-2 tubebay-gap-4";
      break;
  }

  // Tooltip State
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleCardMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    isPro: boolean,
  ) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (isPro) {
      const rect = e.currentTarget.getBoundingClientRect();
      // Calculate center position
      const centerX = rect.left + rect.width / 2;
      // Position above the card
      const topY = rect.top;

      setTooltipState({
        visible: true,
        top: topY,
        left: centerX,
        width: rect.width,
      });
    } else {
      setTooltipState(null);
    }
  };

  const handleCardMouseLeave = () => {
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
    <>
      <div
        className={`${containerClass} ${className} ${classNames?.root || ""}`}
      >
        {options.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.title}
            description={option.description}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
            icon={option.icon}
            disabled={option.disabled}
            variant={option.variant}
            onMouseEnter={(e) =>
              handleCardMouseEnter(e, option.variant === "buy_pro")
            }
            onMouseLeave={handleCardMouseLeave}
            classNames={classNames?.card}
          />
        ))}
      </div>

      {/* Tooltip Portal */}
      {tooltipState?.visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="tubebay-fixed tubebay-z-[50001] tubebay-flex tubebay-flex-col tubebay-items-center tubebay-gap-1.5 tubebay-bg-gray-900 tubebay-text-white tubebay-text-xs tubebay-p-2 tubebay-min-w-[140px] tubebay-rounded-md tubebay-shadow-lg"
            style={{
              top: tooltipState.top - 10, // Slight offset upwards from the card top
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
    </>
  );
};
