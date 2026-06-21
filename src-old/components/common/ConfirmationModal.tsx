import React from "react";
import Button from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  classNames?: {
    overlay?: string;
    content?: string;
    title?: string;
    message?: string;
    footer?: string;
    button?: {
      cancelClassName?: string;
      confirmClassName?: string;
      cancelVariant?: "solid" | "outline" | "ghost";
      confirmVariant?: "solid" | "outline" | "ghost";
      cancelColor?: "primary" | "secondary" | "danger";
      confirmColor?: "primary" | "secondary" | "danger";
    };
  };
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  classNames = {},
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`tubebay-fixed tubebay-inset-0 tubebay-z-[60000] tubebay-flex tubebay-items-center tubebay-justify-center tubebay-bg-black/50 tubebay-backdrop-blur-sm tubebay-transition-opacity ${
        classNames.overlay || ""
      }`}
    >
      <div
        className={`tubebay-bg-white tubebay-rounded-lg tubebay-shadow-xl tubebay-pt-6 tubebay-pb-3 tubebay-px-8 tubebay-max-w-sm tubebay-w-full tubebay-mx-4 tubebay-transform tubebay-transition-all tubebay-scale-100 ${
          classNames.content || ""
        }`}
      >
        <h3
          className={`tubebay-text-lg tubebay-font-bold tubebay-text-gray-900 tubebay-mb-2 tubebay-text-nowrap ${
            classNames.title || ""
          }`}
        >
          {title}
        </h3>
        <p
          className={`tubebay-text-gray-600 tubebay-mb-6 tubebay-text-sm tubebay-leading-relaxed ${
            classNames.message || ""
          }`}
        >
          {message}
        </p>
        <div
          className={`tubebay-flex tubebay-justify-end tubebay-gap-3 ${
            classNames.footer || ""
          }`}
        >
          <Button
            className={classNames.button?.cancelClassName || ""}
            variant={classNames.button?.cancelVariant || "ghost"}
            color={classNames.button?.cancelColor || "secondary"}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className={classNames.button?.confirmClassName || ""}
            variant={classNames.button?.confirmVariant || "solid"}
            color={classNames.button?.confirmColor || "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
