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
  maxWidth = "tubebay-max-w-2xl",
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
    <div className="tubebay-fixed tubebay-inset-0 tubebay-z-[9998] tubebay-flex tubebay-items-center tubebay-justify-center tubebay-p-4 tubebay-bg-black/75 tubebay-transition-opacity tubebay-duration-300">
      {/* Backdrop click handler */}
      <div
        className="tubebay-absolute tubebay-inset-0"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`
          tubebay-relative tubebay-w-full ${maxWidth} 
          tubebay-bg-white tubebay-shadow-2xl tubebay-rounded-xl 
          tubebay-flex tubebay-flex-col tubebay-max-h-[90vh]
          tubebay-animate-in tubebay-fade-in tubebay-zoom-in-95 tubebay-duration-200
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {showHeader && (
          <div
            className={`tubebay-flex tubebay-items-center tubebay-justify-between tubebay-px-6 tubebay-py-4 tubebay-border-b tubebay-border-gray-100 ${classNames.header}`}
          >
            <h3 className="tubebay-text-lg tubebay-font-semibold tubebay-text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="tubebay-p-1.5 tubebay-text-gray-400 hover:tubebay-text-gray-600 tubebay-transition-colors hover:tubebay-bg-gray-100 tubebay-rounded-full"
              aria-label="Close modal"
            >
              <X className="tubebay-w-5 tubebay-h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          className={`tubebay-p-6 tubebay-overflow-y-auto tubebay-flex-1 ${classNames.body}`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`tubebay-flex tubebay-items-center tubebay-justify-end tubebay-gap-3 tubebay-px-6 tubebay-py-4 tubebay-bg-gray-50 tubebay-border-t tubebay-border-gray-100 tubebay-rounded-b-xl ${classNames.footer}`}
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
