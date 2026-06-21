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
    <div className="wpab-fixed wpab-top-0 wpab-left-0 wpab-w-full wpab-h-[3px] wpab-z-[99999] wpab-pointer-events-none">
      <div
        className="wpab-h-full wpab-bg-[#2271b1] wpab-transition-all wpab-duration-300 wpab-ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
};
