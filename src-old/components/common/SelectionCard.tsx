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
        tubebay-relative tubebay-p-[20px] tubebay-rounded-[8px] tubebay-transition-all tubebay-duration-200
        tubebay-flex tubebay-items-start tubebay-gap-[10px]
        ${
          isDisabled
            ? "tubebay-bg-gray-50 tubebay-border tubebay-border-gray-200 tubebay-cursor-not-allowed"
            : "tubebay-cursor-pointer"
        }
        ${
          !isDisabled && selected
            ? "tubebay-bg-primary tubebay-border tubebay-border-primary tubebay-shadow-sm tubebay-shadow-primary/20"
            : !isDisabled
            ? "tubebay-bg-white tubebay-border tubebay-border-gray-100 hover:tubebay-border-gray-300"
            : ""
        }
        ${classNames?.root || ""}
      `}
    >
      {/* Badges */}
      {isPro && (
        <div
          className="tubebay-absolute tubebay-top-3 tubebay-right-3"
          title="Upgrade to Pro"
        >
          <LockKeyhole className="tubebay-w-5 tubebay-h-5 tubebay-text-[#f02a74]" />
        </div>
      )}
      {isComingSoon && (
        <div className="tubebay-absolute tubebay-top-3 tubebay-right-3">
          <span className="tubebay-bg-pink-100 tubebay-text-pink-600 tubebay-px-2 tubebay-py-0.5 tubebay-rounded-full tubebay-text-[10px] tubebay-font-bold tubebay-uppercase tubebay-flex tubebay-items-center tubebay-gap-1">
            <Hourglass className="tubebay-w-3 tubebay-h-3" />
            Soon
          </span>
        </div>
      )}

      <div className={`tubebay-mt-1 ${classNames?.iconWrapper || ""}`}>
        <div
          className={`
            tubebay-w-5 tubebay-h-5 tubebay-rounded-full tubebay-border-2 tubebay-flex tubebay-items-center tubebay-justify-center
            ${isDisabled ? "tubebay-border-gray-300 tubebay-bg-gray-100" : ""}
            ${
              !isDisabled && selected
                ? "tubebay-border-white"
                : !isDisabled
                ? "tubebay-border-gray-300"
                : ""
            }
            ${classNames?.circle || ""}
        `}
        >
          {!isDisabled && selected && (
            <div
              className={`tubebay-w-2.5 tubebay-h-2.5 tubebay-bg-white tubebay-rounded-full ${
                classNames?.dot || ""
              }`}
            />
          )}
        </div>
      </div>
      <div className={classNames?.textWrapper || ""}>
        <h3
          className={`tubebay-text-[15px] tubebay-leading-[24px] tubebay-font-[700] tubebay-mb-1 ${
            !isDisabled && selected
              ? "tubebay-text-white"
              : "tubebay-text-gray-900"
          } ${isDisabled ? "!tubebay-text-gray-400" : ""} ${
            classNames?.title || ""
          }`}
        >
          {title}
        </h3>
        <p
          className={`tubebay-text-[13px] tubebay-leading-[20px] ${
            !isDisabled && selected
              ? "tubebay-text-blue-100"
              : "tubebay-text-gray-500"
          } ${isDisabled ? "!tubebay-text-gray-400" : ""} ${
            classNames?.description || ""
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
};
