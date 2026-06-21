import React, { useState, useRef, useEffect } from "react";

export type PopoverAlign =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: PopoverAlign;
  className?: string;
  classNames?: {
    root?: string;
    triggerWrapper?: string;
    content?: string;
  };
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  align = "bottom-left",
  className = "",
  classNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);

  // Position & Origin Logic
  let positionClasses = "";
  let originClass = "";

  switch (align) {
    case "top":
      positionClasses =
        "wpab-bottom-full wpab-mb-2 wpab-left-1/2 wpab--translate-x-1/2";
      originClass = "wpab-origin-bottom";
      break;
    case "top-left":
      positionClasses = "wpab-bottom-full wpab-mb-2 wpab-left-0";
      originClass = "wpab-origin-bottom-left";
      break;
    case "top-right":
      positionClasses =
        "wpab-bottom-full wpab-mb-2 wpab-right-0";
      originClass = "wpab-origin-bottom-right";
      break;
    case "bottom":
      positionClasses =
        "wpab-top-full wpab-mt-2 wpab-left-1/2 wpab--translate-x-1/2";
      originClass = "wpab-origin-top";
      break;
    case "bottom-left":
      positionClasses = "wpab-top-full wpab-mt-2 wpab-left-0";
      originClass = "wpab-origin-top-left";
      break;
    case "bottom-right":
      positionClasses = "wpab-top-full wpab-mt-2 wpab-right-0";
      originClass = "wpab-origin-top-right";
      break;
    case "left":
      positionClasses =
        "wpab-right-full wpab-mr-2 wpab-top-1/2 wpab--translate-y-1/2";
      originClass = "wpab-origin-right";
      break;
    case "right":
      positionClasses =
        "wpab-left-full wpab-ml-2 wpab-top-1/2 wpab--translate-y-1/2";
      originClass = "wpab-origin-left";
      break;
    default:
      positionClasses = "wpab-top-full wpab-mt-2 wpab-left-0";
      originClass = "wpab-origin-top-left";
  }

  // Transition classes (Opacity + Scale)
  const transitionClasses = isOpen
    ? "wpab-opacity-100 wpab-scale-100 wpab-pointer-events-auto"
    : "wpab-opacity-0 wpab-scale-95 wpab-pointer-events-none";

  return (
    <div
      ref={containerRef}
      className={`wpab-relative wpab-inline-block ${className} ${
        classNames?.root || ""
      }`}
    >
      {/* Trigger Wrapper */}
      <div
        onClick={toggle}
        className={`wpab-cursor-pointer wpab-inline-flex ${
          classNames?.triggerWrapper || ""
        }`}
      >
        {trigger}
      </div>

      {/* Dropdown Content */}
      <div
        className={`
          wpab-absolute wpab-z-50 wpab-w-48
          wpab-bg-white wpab-rounded-xl wpab-shadow-xl wpab-border wpab-border-default
          wpab-transition-all wpab-duration-200 wpab-ease-out
          ${positionClasses}
          ${originClass}
          ${transitionClasses}
          ${classNames?.content || ""}
        `}
      >
        {content}
      </div>
    </div>
  );
};
