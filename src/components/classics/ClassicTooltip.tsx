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
        className={`wpab-cursor-help wpab-inline-flex wpab-items-center wpab-justify-center wpab-w-[16px] wpab-h-[16px] wpab-rounded-full wpab-bg-[#72777c] hover:wpab-bg-[#50575e] wpab-text-white wpab-transition-colors wpab-ml-1 ${className}`}
      >
        <CircleQuestionMarkIcon />
      </span>
      {visible &&
        createPortal(
          <div
            className="wpab-fixed wpab-z-[999999] wpab-bg-[#333] wpab-text-white wpab-px-2 wpab-py-1 wpab-rounded wpab-text-xs wpab-leading-snug wpab-max-w-[200px] wpab-text-center wpab-pointer-events-none wpab-shadow-sm"
            style={{
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {tip}
            <div
              className="wpab-absolute wpab-border-[5px] wpab-border-solid wpab-border-t-[#333] wpab-border-x-transparent wpab-border-b-transparent"
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
