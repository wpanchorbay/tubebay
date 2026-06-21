import { CircleQuestionMark, CircleQuestionMarkIcon } from "lucide-react";
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

interface ClassicTooltipProps {
  tip: string;
  className?: string;
}

/**
 * Renders the WooCommerce-native help tip icon.
 * Implements a pure React Portal tooltip instead of relying on
 * WooCommerce's bundled jQuery (tipTip) which fails on dynamically rendered React nodes.
 */
export const ClassicTooltip: React.FC<ClassicTooltipProps> = ({
  tip,
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLSpanElement>(null);

  const updateCoords = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  };
  return (
    <>
      <span
        ref={iconRef}

        onPointerEnter={(e) => {
          updateCoords();
          setVisible(true);
        }}
        onPointerLeave={(e) => {
          setVisible(false);
        }}
        onFocus={(e) => {
          updateCoords();
          setVisible(true);
        }}
        onBlur={(e) => {
          setVisible(false);
        }}
        tabIndex={0}
        className={`tubebay-cursor-help tubebay-inline-flex tubebay-items-center tubebay-justify-center tubebay-w-[16px] tubebay-h-[16px] tubebay-rounded-full tubebay-bg-[#72777c] hover:tubebay-bg-[#50575e] tubebay-text-white tubebay-transition-colors tubebay-ml-1 ${className}`}
      >
        <CircleQuestionMarkIcon />
      </span>
      {visible &&
        createPortal(
          <div
            className="tubebay-fixed tubebay-z-[999999] tubebay-bg-[#333] tubebay-text-white tubebay-px-2 tubebay-py-1 tubebay-rounded tubebay-text-xs tubebay-leading-snug tubebay-max-w-[200px] tubebay-text-center tubebay-pointer-events-none tubebay-shadow-sm"
            style={{
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tip}
            <div
              className="tubebay-absolute tubebay-border-[5px] tubebay-border-solid tubebay-border-t-[#333] tubebay-border-x-transparent tubebay-border-b-transparent"
              style={{
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
};
