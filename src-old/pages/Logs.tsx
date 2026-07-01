import { useState, useEffect } from "react";
import apiFetch from "@wordpress/api-fetch";
import Page from "../components/common/Page";
import { PageSkeleton } from "../components/loading/PageSkeleton";

const Logs = () => {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<{ content: string }>({
        path: "/tubebay/v1/logs",
      });
      setLogs(response.content || "No logs found.");
    } catch (err: any) {
      setError(err.message || "Failed to fetch logs.");
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm("Are you sure you want to clear the logs?")) return;

    try {
      await apiFetch({ path: "/tubebay/v1/logs", method: "DELETE" });
      setLogs("No logs found.");
    } catch (err: any) {
      alert(err.message || "Failed to clear logs.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Page>
      <div className="tubebay-flex tubebay-justify-between tubebay-items-center tubebay-mb-6">
        <div>
          <h1 className="tubebay-text-2xl tubebay-font-bold tubebay-text-gray-900">
            Debug Logs
          </h1>
          <p className="tubebay-text-sm tubebay-text-gray-500 tubebay-mt-1">
            View logs stored in /wp-content/uploads/tubebay-logs/debug.log
          </p>
        </div>
        <div className="tubebay-flex tubebay-gap-2">
          <button
            onClick={fetchLogs}
            className="tubebay-px-4 tubebay-py-2 tubebay-bg-white tubebay-border tubebay-border-gray-300 tubebay-rounded-md tubebay-text-sm tubebay-font-medium tubebay-text-gray-700 hover:tubebay-bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={clearLogs}
            className="tubebay-px-4 tubebay-py-2 tubebay-bg-red-600 tubebay-text-white tubebay-rounded-md tubebay-text-sm tubebay-font-medium hover:tubebay-bg-red-700"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="tubebay-bg-red-50 tubebay-border tubebay-border-red-200 tubebay-text-red-700 tubebay-px-4 tubebay-py-3 tubebay-rounded tubebay-mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <PageSkeleton type="logs" />
      ) : (
        <div className="tubebay-bg-gray-900 tubebay-rounded-lg tubebay-overflow-hidden tubebay-shadow-sm">
          <div className="tubebay-p-4 tubebay-bg-gray-800 tubebay-border-b tubebay-border-gray-700 tubebay-flex tubebay-justify-between tubebay-items-center">
            <span className="tubebay-text-xs tubebay-text-gray-400 tubebay-font-mono">
              debug.log
            </span>
          </div>
          <pre className="tubebay-p-4 tubebay-text-gray-300 tubebay-font-mono tubebay-text-xs tubebay-overflow-x-auto tubebay-max-h-[600px] tubebay-whitespace-pre-wrap">
            {logs}
          </pre>
        </div>
      )}
    </Page>
  );
};

export default Logs;
