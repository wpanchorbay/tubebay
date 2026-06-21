import React, { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  closeOnOutsideClick?: boolean;
  className?: string;
  showHeader?: boolean;
  classNames?: {
    header?: string;
    body?: string;
    footer?: string;
  };
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "wpab-max-w-2xl",
  closeOnOutsideClick = true,
  className = "",
  showHeader = true,
  classNames = {
    header: "",
    body: "",
    footer: "",
  },
}) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="wpab-fixed wpab-inset-0 wpab-z-[9998] wpab-flex wpab-items-center wpab-justify-center wpab-p-4 wpab-bg-black/75 wpab-transition-opacity wpab-duration-300">
      {/* Backdrop click handler */}
      <div
        className="wpab-absolute wpab-inset-0"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`
          wpab-relative wpab-w-full ${maxWidth} 
          wpab-bg-white wpab-shadow-2xl wpab-rounded-xl 
          wpab-flex wpab-flex-col wpab-max-h-[90vh]
          wpab-animate-in wpab-fade-in wpab-zoom-in-95 wpab-duration-200
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {showHeader && (
          <div
            className={`wpab-flex wpab-items-center wpab-justify-between wpab-px-6 wpab-py-4 wpab-border-b wpab-border-gray-100 ${classNames.header}`}
          >
            <h3 className="wpab-text-lg wpab-font-semibold wpab-text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="wpab-p-1.5 wpab-text-gray-400 hover:wpab-text-gray-600 wpab-transition-colors hover:wpab-bg-gray-100 wpab-rounded-full"
              aria-label="Close modal"
            >
              <X className="wpab-w-5 wpab-h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className={`wpab-p-6 wpab-overflow-y-auto wpab-flex-1 ${classNames.body}`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`wpab-flex wpab-items-center wpab-justify-end wpab-gap-3 wpab-px-6 wpab-py-4 wpab-bg-gray-50 wpab-border-t wpab-border-gray-100 wpab-rounded-b-xl ${classNames.footer}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default CustomModal;
