import React, { Dispatch, SetStateAction } from "react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  setStep: (step: number) => void | Dispatch<SetStateAction<number>>;
  classNames?: {
    root?: string;
    container?: string;
    backgroundLine?: string;
    progressLine?: string;
    stepContainer?: string;
    stepCircle?: string;
    stepLabel?: string;
  };
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  setStep,
  classNames,
}) => {
  // Calculate width percentage for the green progress line
  // Total segments = steps.length - 1
  // If currentStep is 1, progress is 0%
  // If currentStep is 2, progress covers the first segment
  const progressPercentage = Math.max(
    0,
    Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100),
  );

  return (
    <div className={`tubebay-w-full tubebay-py-6 ${classNames?.root || ""}`}>
      <div
        className={`tubebay-flex tubebay-justify-between tubebay-items-start tubebay-relative ${
          classNames?.container || ""
        }`}
      >
        {/* Background Grey Line */}
        {/* Positioned with left-16 and right-16 (4rem) to start/end at the center of the first/last circles (w-32 items) */}
        <div
          className={`tubebay-absolute tubebay-top-5 tubebay-left-16 tubebay-right-16 tubebay-h-[2px] tubebay-bg-gray-200 tubebay-z-0 ${
            classNames?.backgroundLine || ""
          }`}
        >
          {/* Foreground Green Line */}
          <div
            className={`tubebay-h-full tubebay-bg-green-500 tubebay-transition-all tubebay-duration-500 tubebay-ease-out ${
              classNames?.progressLine || ""
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={step}
              className={`tubebay-flex tubebay-flex-col tubebay-items-center tubebay-relative tubebay-z-10 tubebay-w-32  ${
                classNames?.stepContainer || ""
              }`}
            >
              <div
                onClick={isCompleted ? () => setStep(stepNum) : undefined}
                className={`
                  tubebay-w-10 tubebay-h-10 tubebay-rounded-full tubebay-flex tubebay-items-center tubebay-justify-center
                  tubebay-transition-colors tubebay-duration-300 tubebay-border-2
                  ${
                    isCompleted
                      ? "tubebay-cursor-pointer"
                      : "tubebay-cursor-not-allowed"
                  }
                  ${
                    isCompleted || isActive
                      ? "tubebay-bg-green-500 tubebay-border-green-500 tubebay-text-white"
                      : "tubebay-bg-gray-300 tubebay-border-gray-300 tubebay-text-white"
                  }
                  ${classNames?.stepCircle || ""}
                `}
              >
                {isCompleted ? (
                  <svg
                    className="tubebay-w-6 tubebay-h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="tubebay-text-sm tubebay-font-bold">
                    {stepNum.toString().padStart(2, "0")}
                  </span>
                )}
              </div>
              <div
                className={`tubebay-mt-3 tubebay-text-xs tubebay-font-bold tubebay-text-center tubebay-transition-colors ${
                  isActive || isCompleted
                    ? "tubebay-text-gray-900"
                    : "tubebay-text-gray-500"
                } ${classNames?.stepLabel || ""}`}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
