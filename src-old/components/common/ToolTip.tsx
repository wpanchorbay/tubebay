import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  disabled?: boolean;
  classNames?: {
    root?: string;
    trigger?: string;
    content?: string;
    arrow?: string;
  };
  docLink?: string;
  color?: "dark" | "light";
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  delay = 200,
  className = "",
  disabled = false,
  classNames,
  docLink,
  color = "dark",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;

    // If there's a timeout to hide the tooltip, cancel it
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Set a timeout to show the tooltip if it's not already visible
    if (!showTimeoutRef.current && !isVisible) {
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const handleMouseLeave = () => {
    // If there's a timeout to show the tooltip, cancel it
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // Set a short timeout to hide the tooltip, allowing the user to move their cursor to it
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100); // A small delay before hiding
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Boundary collision checks to keep the tooltip within the viewport
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > window.innerHeight - padding) {
      top = window.innerHeight - tooltipRect.height - padding;
    }

    setCoords({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();

      const handleResizeOrScroll = () => calculatePosition();
      window.addEventListener("resize", handleResizeOrScroll);
      window.addEventListener("scroll", handleResizeOrScroll, true);

      return () => {
        window.removeEventListener("resize", handleResizeOrScroll);
        window.removeEventListener("scroll", handleResizeOrScroll, true);
      };
    }
  }, [isVisible, position]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const arrowClasses = {
    top: `${
      color === "dark" ? "tubebay-border-t-gray-900" : "tubebay-border-t-gray-100"
    } tubebay-top-full tubebay-left-1/2 tubebay--translate-x-1/2 `,
    bottom: `${
      color === "dark" ? "tubebay-border-b-gray-900" : "tubebay-border-b-gray-100"
    } tubebay-bottom-full tubebay-left-1/2 tubebay--translate-x-1/2 `,
    left: `${
      color === "dark" ? "tubebay-border-l-gray-900" : "tubebay-border-l-gray-100"
    } tubebay-left-full tubebay-top-1/2 tubebay--translate-y-1/2 `,
    right: `${
      color === "dark" ? "tubebay-border-r-gray-900" : "tubebay-border-r-gray-100"
    } tubebay-right-full tubebay-top-1/2 tubebay--translate-y-1/2 `,
  }[position];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={`tubebay-inline-block ${classNames?.trigger || ""}`}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
            tubebay-fixed tubebay-z-[60]
            tubebay-max-w-[300px]
            ${className}
            ${classNames?.root || ""}
          `}
            style={{
              top: coords.top,
              left: coords.left,
            }}
          >
            <div
              className={`tubebay-animate-tooltip tubebay-relative tubebay-px-2.5 tubebay-py-1.5 ${
                color === "dark"
                  ? "tubebay-bg-gray-900 tubebay-text-white"
                  : "tubebay-bg-gray-100 tubebay-text-black"
              }  tubebay-text-xs tubebay-rounded tubebay-shadow-lg ${
                classNames?.content || ""
              }`}
            >
              {content}
              {docLink && (
                <>
                  {" "}
                  <a
                    href={docLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tubebay-text-blue-400 hover:tubebay-text-blue-300 tubebay-underline"
                  >
                    Read More
                  </a>
                </>
              )}
              <div
                className={`
                tubebay-absolute tubebay-border-[5px] tubebay-border-transparent
                ${arrowClasses}
                ${classNames?.arrow || ""}
              `}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
