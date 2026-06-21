import React from "react";

// Icons
const LockKeyhole = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="16" r="1" />
    <rect x="3" y="10" width="18" height="12" rx="2" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
  </svg>
);

const Hourglass = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </svg>
);

interface SelectionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: "buy_pro" | "coming_soon";
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  classNames?: {
    root?: string;
    iconWrapper?: string;
    circle?: string;
    dot?: string;
    textWrapper?: string;
    title?: string;
    description?: string;
  };
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  description,
  selected,
  onClick,
  icon,
  disabled,
  variant,
  onMouseEnter,
  onMouseLeave,
  classNames,
}) => {
  const isPro = variant === "buy_pro";
  const isComingSoon = variant === "coming_soon";
  const isDisabled = disabled || isPro || isComingSoon;

  return (
    <div
      onClick={() => !isDisabled && onClick()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        wpab-relative wpab-p-[20px] wpab-rounded-[8px] wpab-transition-all wpab-duration-200
        wpab-flex wpab-items-start wpab-gap-[10px]
        ${
          isDisabled
            ? "wpab-bg-gray-50 wpab-border wpab-border-gray-200 wpab-cursor-not-allowed"
            : "wpab-cursor-pointer"
        }
        ${
          !isDisabled && selected
            ? "wpab-bg-primary wpab-border wpab-border-primary wpab-shadow-sm wpab-shadow-primary/20"
            : !isDisabled
            ? "wpab-bg-white wpab-border wpab-border-gray-100 hover:wpab-border-gray-300"
            : ""
        }
        ${classNames?.root || ""}
      `}
    >
      {/* Badges */}
      {isPro && (
        <div
          className="wpab-absolute wpab-top-3 wpab-right-3"
          title="Upgrade to Pro"
        >
          <LockKeyhole className="wpab-w-5 wpab-h-5 wpab-text-[#f02a74]" />
        </div>
      )}
      {isComingSoon && (
        <div className="wpab-absolute wpab-top-3 wpab-right-3">
          <span className="wpab-bg-pink-100 wpab-text-pink-600 wpab-px-2 wpab-py-0.5 wpab-rounded-full wpab-text-[10px] wpab-font-bold wpab-uppercase wpab-flex wpab-items-center wpab-gap-1">
            <Hourglass className="wpab-w-3 wpab-h-3" />
            Soon
          </span>
        </div>
      )}

      <div className={`wpab-mt-1 ${classNames?.iconWrapper || ""}`}>
        <div
          className={`
            wpab-w-5 wpab-h-5 wpab-rounded-full wpab-border-2 wpab-flex wpab-items-center wpab-justify-center
            ${
              isDisabled
                ? "wpab-border-gray-300 wpab-bg-gray-100"
                : ""
            }
            ${
              !isDisabled && selected
                ? "wpab-border-white"
                : !isDisabled
                ? "wpab-border-gray-300"
                : ""
            }
            ${classNames?.circle || ""}
        `}
        >
          {!isDisabled && selected && (
            <div
              className={`wpab-w-2.5 wpab-h-2.5 wpab-bg-white wpab-rounded-full ${
                classNames?.dot || ""
              }`}
            />
          )}
        </div>
      </div>
      <div className={classNames?.textWrapper || ""}>
        <h3
          className={`wpab-text-[15px] wpab-leading-[24px] wpab-font-[700] wpab-mb-1 ${
            !isDisabled && selected
              ? "wpab-text-white"
              : "wpab-text-gray-900"
          } ${isDisabled ? "!wpab-text-gray-400" : ""} ${
            classNames?.title || ""
          }`}
        >
          {title}
        </h3>
        <p
          className={`wpab-text-[13px] wpab-leading-[20px] ${
            !isDisabled && selected
              ? "wpab-text-blue-100"
              : "wpab-text-gray-500"
          } ${isDisabled ? "!wpab-text-gray-400" : ""} ${
            classNames?.description || ""
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
