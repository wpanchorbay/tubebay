import React, { useState, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { LockKeyhole } from "lucide-react";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../../store/wpabStore";

interface BuyProTooltipProps {
  children: ReactNode;
  className?: string;
}

export const BuyProTooltip: React.FC<BuyProTooltipProps> = ({
  children,
  className = "",
}) => {
  const store = useWpabStore();
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    top: number;
    left: number;
  } | null>(null);

  const hoverTimeoutRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipState({
      visible: true,
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
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
        className={`tubebay-relative tubebay-inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <div className="tubebay-absolute tubebay-right-2 tubebay-top-1/2 -tubebay-translate-y-1/2 tubebay-pointer-events-none">
          <LockKeyhole className="tubebay-w-3.5 tubebay-h-3.5 tubebay-text-[#f02a74]" />
        </div>
      </div>
      {tooltipState?.visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="tubebay-fixed tubebay-z-[50001] tubebay-flex tubebay-flex-col tubebay-items-center tubebay-gap-1.5 tubebay-bg-gray-900 tubebay-text-white tubebay-text-xs tubebay-p-2 tubebay-min-w-[140px]"
            style={{
              top: tooltipState.top + 5, // Adjusted to user preference
              left: tooltipState.left,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <span className="tubebay-font-medium tubebay-whitespace-nowrap">
              {__("Upgrade to unlock", "tubebay")}
            </span>
            <a
              href={store.pluginData?.support_uri || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="tubebay-w-full tubebay-bg-[#f02a74] hover:!tubebay-bg-[#e71161] tubebay-text-white hover:!tubebay-text-white tubebay-font-bold tubebay-py-1.5 tubebay-px-3 tubebay-transition-colors focus:tubebay-outline-none focus:tubebay-ring-0 tubebay-cursor-pointer tubebay-text-center tubebay-no-underline"
            >
              {__("Buy Pro", "tubebay")}
            </a>
            {/* Tooltip Arrow */}
            <div className="tubebay-absolute tubebay-top-full tubebay-left-1/2 -tubebay-translate-x-1/2 tubebay-border-4 tubebay-border-transparent tubebay-border-t-gray-900"></div>
          </div>,
          document.body,
        )}
    </>
  );
};
