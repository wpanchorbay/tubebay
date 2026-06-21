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
        return "wpab-bg-[#f0fff4] wpab-border-l-[#228b22] wpab-text-[#1a472a]";
      case "error":
        return "wpab-bg-[#fff5f5] wpab-border-l-[#cc0000] wpab-text-[#5c2121]";
      case "info":
      default:
        return "wpab-bg-white wpab-border-l-[#2271b1] wpab-text-[#1d2327]";
    }
  };

  const toastClasses = `
    wpab-relative wpab-p-5 wpab-rounded-[4px] wpab-shadow-[0_4px_12px_rgba(0,0,0,0.15)] 
    wpab-flex wpab-items-center wpab-justify-between wpab-gap-[15px] 
    wpab-border-l-[5px] wpab-backdrop-blur-[3px]
    ${isClosing ? "wpab-animate-slide-out" : "wpab-animate-slide-in"}
    ${getToastTypeClasses()}
  `;

  return (
    <div className={toastClasses}>
      <p className="wpab-m-0 wpab-text-[14px] wpab-leading-[1.5] wpab-flex-1 ">
        {toast.message}
      </p>
      <button
        className="wpab-bg-none wpab-border-none wpab-text-inherit wpab-opacity-60 hover:wpab-opacity-100 wpab-cursor-pointer wpab-text-[20px] wpab-leading-none wpab-px-[5px] wpab-self-start -wpab-mt-[5px] -wpab-mr-[5px] -wpab-mb-[5px] wpab-ml-0"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <Icon icon={close} />
      </button>
    </div>
  );
};

export default Toast;
