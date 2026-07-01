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
    <div className="tubebay-w-full">
      <textarea
        className={`tubebay-w-full tubebay-p-3 tubebay-border tubebay-border-gray-300 tubebay-rounded-md tubebay-text-[14px] ${className}`}
        {...props}
      />
      {description && (
        <p className="description tubebay-mt-1 tubebay-text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};
