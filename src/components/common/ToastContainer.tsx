import { FC } from "react";
import { useToast } from "../../store/toast/use-toast";
import { Toast } from "./Toast";

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div className="wpab-fixed wpab-bottom-[30px] wpab-right-[10px] wpab-z-[999999] wpab-flex wpab-flex-col wpab-gap-[10px] wpab-min-w-[200px] wpab-pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
