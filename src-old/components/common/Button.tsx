import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "danger";
  variant?: "solid" | "outline" | "ghost";
}

const Button = ({
  children,
  className = "",
  size = "medium",
  color = "primary",
  variant = "solid",
  ...props
}: ButtonProps) => {
  const sizeClasses = {
    small: "tubebay-px-[8px] tubebay-py-[5px]",
    medium: "tubebay-px-[12px] tubebay-py-[6px]",
    large: "tubebay-px-[16px] tubebay-py-[10px]",
  };

  const colorClasses = {
    primary: {
      solid:
        "tubebay-bg-primary tubebay-text-white tubebay-border tubebay-border-primary hover:tubebay-bg-primary-hovered hover:tubebay-border-primary-hovered",
      outline:
        "tubebay-bg-transparent tubebay-border tubebay-border-primary tubebay-text-primary hover:tubebay-bg-primary hover:tubebay-text-white",
      ghost:
        "tubebay-bg-transparent tubebay-text-primary hover:tubebay-text-primary-hovered hover:tubebay-bg-blue-500/10",
    },
    secondary: {
      solid:
        "tubebay-bg-secondary tubebay-text-white tubebay-border tubebay-border-secondary hover:tubebay-bg-secondary-hovered",
      outline:
        "tubebay-bg-transparent tubebay-border tubebay-border-secondary tubebay-text-secondary hover:tubebay-border-primary hover:tubebay-bg-transparent hover:tubebay-text-primary",
      ghost:
        "tubebay-bg-transparent tubebay-text-[#1e1e1e] hover:!tubebay-text-primary",
    },
    danger: {
      solid:
        "tubebay-bg-red-500 tubebay-text-white tubebay-border tubebay-border-red-500 hover:tubebay-bg-red-600 hover:tubebay-border-red-600",
      outline:
        "tubebay-bg-transparent tubebay-border tubebay-border-red-500 tubebay-text-red-500 hover:tubebay-bg-red-500 hover:tubebay-text-white",
      ghost:
        "tubebay-bg-transparent tubebay-text-red-500 hover:tubebay-bg-red-500/10",
    },
  };

  // Safely access nested properties
  const variantClasses =
    colorClasses[color]?.[variant] ?? colorClasses.primary.solid;
  const finalSizeClass = sizeClasses[size] ?? sizeClasses.medium;

  return (
    <button
      className={`
                tubebay-flex tubebay-items-center tubebay-justify-center tubebay-gap-[6px]
                tubebay-text-default tubebay-rounded-[8px] tubebay-transition-all tubebay-duration-200
                disabled:tubebay-opacity-50 disabled:tubebay-cursor-not-allowed
                ${finalSizeClass} 
                ${variantClasses} 
                ${className}
            `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
