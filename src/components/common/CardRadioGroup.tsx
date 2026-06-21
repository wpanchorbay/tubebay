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
      containerClass = "wpab-flex wpab-flex-col wpab-gap-4";
      break;
    case "horizontal":
      containerClass =
        "wpab-flex wpab-flex-row wpab-gap-4 wpab-overflow-x-auto wpab-pb-2"; // Added overflow handling for safe horizontal scrolling if needed
      break;
    case "responsive":
    default:
      containerClass =
        "wpab-grid wpab-grid-cols-1 md:!wpab-grid-cols-2 wpab-gap-4";
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
            className="wpab-fixed wpab-z-[50001] wpab-flex wpab-flex-col wpab-items-center wpab-gap-1.5 wpab-bg-gray-900 wpab-text-white wpab-text-xs wpab-p-2 wpab-min-w-[140px] wpab-rounded-md wpab-shadow-lg"
            style={{
              top: tooltipState.top - 10, // Slight offset upwards from the card top
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
    </>
  );
};
