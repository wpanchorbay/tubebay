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
        "tubebay-bottom-full tubebay-mb-2 tubebay-left-1/2 tubebay--translate-x-1/2";
      originClass = "tubebay-origin-bottom";
      break;
    case "top-left":
      positionClasses = "tubebay-bottom-full tubebay-mb-2 tubebay-left-0";
      originClass = "tubebay-origin-bottom-left";
      break;
    case "top-right":
      positionClasses = "tubebay-bottom-full tubebay-mb-2 tubebay-right-0";
      originClass = "tubebay-origin-bottom-right";
      break;
    case "bottom":
      positionClasses =
        "tubebay-top-full tubebay-mt-2 tubebay-left-1/2 tubebay--translate-x-1/2";
      originClass = "tubebay-origin-top";
      break;
    case "bottom-left":
      positionClasses = "tubebay-top-full tubebay-mt-2 tubebay-left-0";
      originClass = "tubebay-origin-top-left";
      break;
    case "bottom-right":
      positionClasses = "tubebay-top-full tubebay-mt-2 tubebay-right-0";
      originClass = "tubebay-origin-top-right";
      break;
    case "left":
      positionClasses =
        "tubebay-right-full tubebay-mr-2 tubebay-top-1/2 tubebay--translate-y-1/2";
      originClass = "tubebay-origin-right";
      break;
    case "right":
      positionClasses =
        "tubebay-left-full tubebay-ml-2 tubebay-top-1/2 tubebay--translate-y-1/2";
      originClass = "tubebay-origin-left";
      break;
    default:
      positionClasses = "tubebay-top-full tubebay-mt-2 tubebay-left-0";
      originClass = "tubebay-origin-top-left";
  }

  // Transition classes (Opacity + Scale)
  const transitionClasses = isOpen
    ? "tubebay-opacity-100 tubebay-scale-100 tubebay-pointer-events-auto"
    : "tubebay-opacity-0 tubebay-scale-95 tubebay-pointer-events-none";

  return (
    <div
      ref={containerRef}
      className={`tubebay-relative tubebay-inline-block ${className} ${
        classNames?.root || ""
      }`}
    >
      {/* Trigger Wrapper */}
      <div
        onClick={toggle}
        className={`tubebay-cursor-pointer tubebay-inline-flex ${
          classNames?.triggerWrapper || ""
        }`}
      >
        {trigger}
      </div>

      {/* Dropdown Content */}
      <div
        className={`
          tubebay-absolute tubebay-z-50 tubebay-w-48
          tubebay-bg-white tubebay-rounded-xl tubebay-shadow-xl tubebay-border tubebay-border-default
          tubebay-transition-all tubebay-duration-200 tubebay-ease-out
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
