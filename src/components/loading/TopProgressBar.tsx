import React, { useEffect, useState } from "react";

interface TopProgressBarProps {
  isSaving: boolean;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({ isSaving }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSaving) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          const jump = Math.random() * 10;
          return prev + jump;
        });
      }, 300);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 500); // Wait for transition to finish before resetting

      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSaving]);

  if (!isSaving && progress === 0) return null;

  return (
    <div className="tubebay-fixed tubebay-top-0 tubebay-left-0 tubebay-w-full tubebay-h-[3px] tubebay-z-[99999] tubebay-pointer-events-none">
      <div
        className="tubebay-h-full tubebay-bg-[#2271b1] tubebay-transition-all tubebay-duration-300 tubebay-ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
};
