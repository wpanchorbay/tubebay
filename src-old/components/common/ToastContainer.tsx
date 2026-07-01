import React, { FC } from "react";
import { useToast } from "../../store/toast/use-toast";
import { Toast } from "./Toast";

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();
  const [isHovered, setIsHovered] = React.useState(false);

  // We want the newest toast to be the "top" one (most visible)
  // Our array has the newest at the end
  const reversedToasts = [...toasts].reverse();

  return (
    <div
      className="tubebay-fixed tubebay-bottom-[20px] tubebay-right-[20px] tubebay-z-[999999] tubebay-flex tubebay-flex-col tubebay-items-end tubebay-gap-[10px] tubebay-w-[350px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {reversedToasts.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={removeToast}
          index={index}
          isStackHovered={isHovered}
          totalCount={reversedToasts.length}
        />
      ))}
    </div>
  );
};
