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
        className={`wpab-relative wpab-inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <div className="wpab-absolute wpab-right-2 wpab-top-1/2 -wpab-translate-y-1/2 wpab-pointer-events-none">
          <LockKeyhole className="wpab-w-3.5 wpab-h-3.5 wpab-text-[#f02a74]" />
        </div>
      </div>
      {tooltipState?.visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className="wpab-fixed wpab-z-[50001] wpab-flex wpab-flex-col wpab-items-center wpab-gap-1.5 wpab-bg-gray-900 wpab-text-white wpab-text-xs wpab-p-2 wpab-min-w-[140px]"
            style={{
              top: tooltipState.top + 5, // Adjusted to user preference
              left: tooltipState.left,
              transform: "translate(-50%, -100%)",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <span className="wpab-font-medium wpab-whitespace-nowrap">
              {__("Upgrade to unlock", "wpab-boilerplate")}
            </span>
            <a
              href={store.pluginData?.support_uri || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="wpab-w-full wpab-bg-[#f02a74] hover:!wpab-bg-[#e71161] wpab-text-white hover:!wpab-text-white wpab-font-bold wpab-py-1.5 wpab-px-3 wpab-transition-colors focus:wpab-outline-none focus:wpab-ring-0 wpab-cursor-pointer wpab-text-center wpab-no-underline"
            >
              {__("Buy Pro", "wpab-boilerplate")}
            </a>
            {/* Tooltip Arrow */}
            <div className="wpab-absolute wpab-top-full wpab-left-1/2 -wpab-translate-x-1/2 wpab-border-4 wpab-border-transparent wpab-border-t-gray-900"></div>
          </div>,
          document.body,
        )}
    </>
  );
};
