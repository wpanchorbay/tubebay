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
    <div
      className={`wpab-w-full wpab-py-6 ${classNames?.root || ""}`}
    >
      <div
        className={`wpab-flex wpab-justify-between wpab-items-start wpab-relative ${
          classNames?.container || ""
        }`}
      >
        {/* Background Grey Line */}
        {/* Positioned with left-16 and right-16 (4rem) to start/end at the center of the first/last circles (w-32 items) */}
        <div
          className={`wpab-absolute wpab-top-5 wpab-left-16 wpab-right-16 wpab-h-[2px] wpab-bg-gray-200 wpab-z-0 ${
            classNames?.backgroundLine || ""
          }`}
        >
          {/* Foreground Green Line */}
          <div
            className={`wpab-h-full wpab-bg-green-500 wpab-transition-all wpab-duration-500 wpab-ease-out ${
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
              className={`wpab-flex wpab-flex-col wpab-items-center wpab-relative wpab-z-10 wpab-w-32  ${
                classNames?.stepContainer || ""
              }`}
            >
              <div
                onClick={isCompleted ? () => setStep(stepNum) : undefined}
                className={`
                  wpab-w-10 wpab-h-10 wpab-rounded-full wpab-flex wpab-items-center wpab-justify-center
                  wpab-transition-colors wpab-duration-300 wpab-border-2
                  ${
                    isCompleted
                      ? "wpab-cursor-pointer"
                      : "wpab-cursor-not-allowed"
                  }
                  ${
                    isCompleted || isActive
                      ? "wpab-bg-green-500 wpab-border-green-500 wpab-text-white"
                      : "wpab-bg-gray-300 wpab-border-gray-300 wpab-text-white"
                  }
                  ${classNames?.stepCircle || ""}
                `}
              >
                {isCompleted ? (
                  <svg
                    className="wpab-w-6 wpab-h-6"
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
                  <span className="wpab-text-sm wpab-font-bold">
                    {stepNum.toString().padStart(2, "0")}
                  </span>
                )}
              </div>
              <div
                className={`wpab-mt-3 wpab-text-xs wpab-font-bold wpab-text-center wpab-transition-colors ${
                  isActive || isCompleted
                    ? "wpab-text-gray-900"
                    : "wpab-text-gray-500"
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
