import React from "react";

interface ClassicTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  description?: string;
  className?: string;
}

export const ClassicTextarea: React.FC<ClassicTextareaProps> = ({
  description,
  className = "",
  ...props
}) => {
  return (
    <div className="wpab-w-full">
      <textarea
        className={`wpab-w-full wpab-p-3 wpab-border wpab-border-gray-300 wpab-rounded-md wpab-text-[14px] ${className}`}
        {...props}
      />
      {description && (
        <p className="description wpab-mt-1 wpab-text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};
