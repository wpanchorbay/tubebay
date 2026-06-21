import React from "react";

export const SkeletonAddonList: React.FC = () => {
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <>
      {skeletonRows.map((index) => (
        <tr key={index} className="wpab-border-b wpab-border-gray-200 wpab-animate-pulse">
          <td className="wpab-p-2">
            <div className="wpab-w-4 wpab-h-4 wpab-bg-gray-200 wpab-rounded"></div>
          </td>
          <td className="wpab-p-2">
            <div className="wpab-h-4 wpab-bg-gray-200 wpab-rounded wpab-w-3/4"></div>
            <div className="wpab-h-3 wpab-bg-gray-200 wpab-rounded wpab-w-1/2 wpab-mt-2"></div>
          </td>
          <td className="wpab-p-2">
            <div className="wpab-h-4 wpab-bg-gray-200 wpab-rounded wpab-w-6"></div>
          </td>
          <td className="wpab-p-2">
            <div className="wpab-h-4 wpab-bg-gray-200 wpab-rounded wpab-w-1/3"></div>
          </td>
          <td className="wpab-p-2">
            <div className="wpab-h-5 wpab-bg-gray-200 wpab-rounded wpab-w-12"></div>
          </td>
        </tr>
      ))}
    </>
  );
};
