import React from "react";

export const SkeletonAddonList: React.FC = () => {
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <>
      {skeletonRows.map((index) => (
        <tr key={index} className="tubebay-border-b tubebay-border-gray-200 tubebay-animate-pulse">
          <td className="tubebay-p-2">
            <div className="tubebay-w-4 tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded"></div>
          </td>
          <td className="tubebay-p-2">
            <div className="tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded tubebay-w-3/4"></div>
            <div className="tubebay-h-3 tubebay-bg-gray-200 tubebay-rounded tubebay-w-1/2 tubebay-mt-2"></div>
          </td>
          <td className="tubebay-p-2">
            <div className="tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded tubebay-w-6"></div>
          </td>
          <td className="tubebay-p-2">
            <div className="tubebay-h-4 tubebay-bg-gray-200 tubebay-rounded tubebay-w-1/3"></div>
          </td>
          <td className="tubebay-p-2">
            <div className="tubebay-h-5 tubebay-bg-gray-200 tubebay-rounded tubebay-w-12"></div>
          </td>
        </tr>
      ))}
    </>
  );
};
