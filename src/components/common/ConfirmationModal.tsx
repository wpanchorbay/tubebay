import React, { useEffect, useRef } from "react";
import Button from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  autoFocus?: "confirm" | "cancel";
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
  autoFocus = "confirm",
  classNames = {},
}) => {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (autoFocus === "cancel") {
        cancelRef.current?.focus();
      } else {
        confirmRef.current?.focus();
      }
    }
  }, [isOpen, autoFocus]);

  if (!isOpen) return null;

  return (
    <div
      className={`wpab-fixed wpab-inset-0 wpab-z-[60000] wpab-flex wpab-items-center wpab-justify-center wpab-bg-black/50 wpab-backdrop-blur-sm wpab-transition-opacity ${
        classNames.overlay || ""
      }`}
    >
      <div
        className={`wpab-bg-white wpab-rounded-lg wpab-shadow-xl wpab-pt-6 wpab-pb-3 wpab-px-8 wpab-max-w-sm wpab-w-full wpab-mx-4 wpab-transform wpab-transition-all wpab-scale-100 ${
          classNames.content || ""
        }`}
      >
        <h3
          className={`wpab-text-lg wpab-font-bold wpab-text-gray-900 wpab-mb-2 wpab-text-nowrap ${
            classNames.title || ""
          }`}
        >
          {title}
        </h3>
        <p
          className={`wpab-text-gray-600 wpab-mb-6 wpab-text-sm wpab-leading-relaxed ${
            classNames.message || ""
          }`}
        >
          {message}
        </p>
        <div
          className={`wpab-flex wpab-justify-end wpab-gap-3 ${
            classNames.footer || ""
          }`}
        >
          <Button
            ref={cancelRef}
            className={classNames.button?.cancelClassName || ""}
            variant={classNames.button?.cancelVariant || "ghost"}
            color={classNames.button?.cancelColor || "secondary"}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
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
