import React from "react";

export const getConnectionStatusText = (status: string) => {
  switch (status) {
    case "connected":
      return <span className="tubebay-text-green-500">Connected</span>;
    case "disconnected":
      return <span className="tubebay-text-yellow-500">Disconnected</span>;
    case "failed":
      return <span className="tubebay-text-red-500">Failed</span>;
    default:
      return <span className="tubebay-text-gray-400">Inactive</span>;
  }
};
