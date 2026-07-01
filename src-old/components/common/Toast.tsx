import React, { useEffect, useState, FC } from "react";

import { Toast as ToastType } from "../../store/toast/use-toast";
import { close, Icon } from "@wordpress/icons";

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
  index: number;
  isStackHovered: boolean;
  totalCount: number;
}
export const Toast: FC<ToastProps> = ({
  toast,
  onDismiss,
  index,
  isStackHovered,
  totalCount,
}) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure the browser has painted the initial state
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  useEffect(() => {
    // Only auto-dismiss the newest toast if it's the only one,
    // or keep top 3 toasts but dismiss after 5s
    if (index === 0) {
      const timer = setTimeout(() => {
        handleDismiss({ stopPropagation: () => {} } as React.MouseEvent);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, index]);

  // Stack calculation logic
  const topToastIndex = 0; // index from top (newest is 0)
  const stackLimit = 3;
  const isStacked = !isStackHovered && index >= 1;
  const isHiddenByStack = !isStackHovered && index >= stackLimit;

  let style: React.CSSProperties = {};

  if (!isStackHovered) {
    // When stacked, we layer them peeking out from the top
    const offset = index * 4;
    const scale = 1 - index * 0.04;

    style = {
      transform: mounted
        ? `translateY(${-offset}px) scale(${scale})`
        : "translateY(20px) scale(0.95)",
      transformOrigin: "bottom center",
      zIndex: totalCount - index,
      opacity: mounted ? (isHiddenByStack ? 0 : 1) : 0,
      position: index === 0 ? "relative" : "absolute",
      bottom: 0,
      right: 0,
    };
  } else {
    // When hovered, expand naturally
    style = {
      transform: mounted
        ? "translateY(0) scale(1)"
        : "translateY(20px) scale(0.95)",
      zIndex: totalCount - index,
      opacity: mounted ? 1 : 0,
      position: "relative",
    };
  }

  const toastClasses = `toast toast--${toast.type} ${
    isClosing ? "toast--closing" : ""
  } ${isStacked ? "toast--stacked" : ""}`;

  return (
    <div
      className={toastClasses}
      style={{
        ...style,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        width: "100%",
      }}
    >
      <div className="tubebay-flex-1 tubebay-pr-[10px]">
        <p className="tubebay-m-0 tubebay-text-[14px] tubebay-font-medium tubebay-leading-[20px]">
          {toast.message}
        </p>
      </div>
      <button
        className="tubebay-bg-transparent tubebay-border-none tubebay-text-inherit tubebay-opacity-40 hover:tubebay-opacity-100 tubebay-cursor-pointer tubebay-p-[4px] tubebay-rounded-md hover:tubebay-bg-black/5 tubebay-transition-all"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <span className="tubebay-flex tubebay-items-center tubebay-justify-center">
          <Icon icon={close} size={20} />
        </span>
      </button>
    </div>
  );
};

export default Toast;
