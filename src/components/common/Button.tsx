import React, { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "danger";
  variant?: "solid" | "outline" | "ghost";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      size = "medium",
      color = "primary",
      variant = "solid",
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      small: "wpab-px-[8px] wpab-py-[5px]",
      medium: "wpab-px-[12px] wpab-py-[6px]",
      large: "wpab-px-[16px] wpab-py-[10px]",
    };

    const colorClasses = {
      primary: {
        solid:
          "wpab-bg-primary wpab-text-white wpab-border wpab-border-primary hover:wpab-bg-primary-hovered hover:wpab-border-primary-hovered",
        outline:
          "wpab-bg-transparent wpab-border wpab-border-primary wpab-text-primary hover:wpab-bg-primary hover:wpab-text-white",
        ghost:
          "wpab-bg-transparent wpab-text-primary hover:wpab-text-primary-hovered hover:wpab-bg-primary/10",
      },
      secondary: {
        solid:
          "wpab-bg-secondary wpab-text-white wpab-border wpab-border-secondary hover:wpab-bg-secondary-hovered",
        outline:
          "wpab-bg-transparent wpab-border wpab-border-secondary wpab-text-secondary hover:wpab-bg-secondary hover:wpab-text-white",
        ghost:
          "wpab-bg-transparent wpab-text-[#1e1e1e] hover:!wpab-text-primary",
      },
      danger: {
        solid:
          "wpab-bg-red-500 wpab-text-white wpab-border wpab-border-red-500 hover:wpab-bg-red-600 hover:wpab-border-red-600",
        outline:
          "wpab-bg-transparent wpab-border wpab-border-red-500 wpab-text-red-500 hover:wpab-bg-red-500 hover:wpab-text-white",
        ghost:
          "wpab-bg-transparent wpab-text-red-500 hover:wpab-bg-red-500/10",
      },
    };

    // Safely access nested properties
    const variantClasses =
      colorClasses[color]?.[variant] ?? colorClasses.primary.solid;
    const finalSizeClass = sizeClasses[size] ?? sizeClasses.medium;

    return (
      <button
        ref={ref}
        className={`
                wpab-flex wpab-items-center wpab-justify-center wpab-gap-[6px]
                wpab-text-default wpab-rounded-[8px] wpab-transition-all wpab-duration-200
                disabled:wpab-opacity-50 disabled:wpab-cursor-not-allowed
                ${finalSizeClass} 
                ${variantClasses} 
                ${className}
            `}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export default Button;
