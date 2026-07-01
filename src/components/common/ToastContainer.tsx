import { FC } from "react";
import { useToast } from "../../store/toast/use-toast";
import { Toast } from "./Toast";

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div className="tubebay-fixed tubebay-bottom-[30px] tubebay-right-[10px] tubebay-z-[999999] tubebay-flex tubebay-flex-col tubebay-gap-[10px] tubebay-min-w-[200px] tubebay-pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
