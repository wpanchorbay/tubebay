import React, { useEffect, useState, FC } from "react";

import { Toast as ToastType } from "../../store/toast/use-toast";
import { close, Icon } from "@wordpress/icons";

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}
export const Toast: FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // 300ms animation
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // 5 seconds
    return () => {
      clearTimeout(timer);
    };
  }, [toast.id]);

  const getToastTypeClasses = () => {
    switch (toast.type) {
      case "success":
        return "tubebay-bg-[#f0fff4] tubebay-border-l-[#228b22] tubebay-text-[#1a472a]";
      case "error":
        return "tubebay-bg-[#fff5f5] tubebay-border-l-[#cc0000] tubebay-text-[#5c2121]";
      case "info":
      default:
        return "tubebay-bg-white tubebay-border-l-[#2271b1] tubebay-text-[#1d2327]";
    }
  };

  const toastClasses = `
    tubebay-relative tubebay-p-5 tubebay-rounded-[4px] tubebay-shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
    tubebay-flex tubebay-items-center tubebay-justify-between tubebay-gap-[15px] 
    tubebay-border-l-[5px] tubebay-backdrop-blur-[3px]
    ${isClosing ? "tubebay-animate-slide-out" : "tubebay-animate-slide-in"}
    ${getToastTypeClasses()}
  `;

  return (
    <div className={toastClasses}>
      <p className="tubebay-m-0 tubebay-text-[14px] tubebay-leading-[1.5] tubebay-flex-1 ">
        {toast.message}
      </p>
      <button
        className="tubebay-bg-none tubebay-border-none tubebay-text-inherit tubebay-opacity-60 hover:tubebay-opacity-100 tubebay-cursor-pointer tubebay-text-[20px] tubebay-leading-none tubebay-px-[5px] tubebay-self-start -tubebay-mt-[5px] -tubebay-mr-[5px] -tubebay-mb-[5px] tubebay-ml-0"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <Icon icon={close} />
      </button>
    </div>
  );
};

export default Toast;
