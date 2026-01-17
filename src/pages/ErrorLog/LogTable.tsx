import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ParsedLogEntry {
  timestamp: string;
  level: string;
  message: string;
  file?: string | undefined;
  line?: number | undefined;
  raw: string;
}

interface LogTableProps {
  logs: ParsedLogEntry[];
  expandedLogs: Set<number>;
  onToggleExpanded: (index: number) => void;
  getLogLevelBgClass: (level: string) => string;
}

const LogTable: React.FC<LogTableProps> = ({
  logs,
  expandedLogs,
  onToggleExpanded,
  getLogLevelBgClass,
}) => {
  const getLogLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return "🚨";
      case "WARNING":
        return "⚠️";
      case "INFO":
        return "ℹ️";
      case "DEBUG":
        return "🐛";
      default:
        return "📝";
    }
  };

  const getExpandIcon = (isExpanded: boolean) => {
    return isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="wdt:border wdt:rounded-lg wdt:overflow-hidden wdt:divide-y wdt:divide-gray-200">
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <div
            key={index}
            className={`wdt:transition-colors ${expandedLogs.has(index) ? "wdt:bg-gray-50" : "hover:wdt:bg-gray-50"}`}
          >
            <div className="wdt:p-4">
              <div className="wdt:flex wdt:items-center wdt:gap-2 wdt:mb-2">
                <button
                  onClick={() => onToggleExpanded(index)}
                  className="wdt:flex wdt:items-center wdt:justify-center wdt:w-6 wdt:h-6 wdt:rounded-full wdt:text-white"
                  aria-label={
                    expandedLogs.has(index)
                      ? "Collapse log entry"
                      : "Expand log entry"
                  }
                  style={{
                    backgroundColor:
                      log.level === "ERROR"
                        ? "#ef4444"
                        : log.level === "WARNING"
                          ? "#f59e0b"
                          : log.level === "INFO"
                            ? "#3b82f6"
                            : "#6b7280",
                  }}
                >
                  <span className="wdt:text-xs">
                    {getLogLevelIcon(log.level)}
                  </span>
                </button>
                <span
                  className={`wdt:px-2 wdt:py-0.5 wdt:rounded-full wdt:text-xs wdt:font-medium ${getLogLevelBgClass(log.level)}`}
                >
                  {log.level}
                </span>
                <span className="wdt:text-xs wdt:text-gray-500">
                  {log.timestamp}
                </span>

                {log.file && (
                  <span className="wdt:text-xs wdt:bg-gray-100 wdt:px-2 wdt:py-0.5 wdt:rounded wdt:truncate wdt:max-w-[200px] wdt:hidden md:wdt:inline-block">
                    {log.file} {log.line && `(line ${log.line})`}
                  </span>
                )}

                <button
                  onClick={() => onToggleExpanded(index)}
                  className="wdt:ml-auto wdt:text-gray-400 hover:wdt:text-gray-600"
                  aria-label={
                    expandedLogs.has(index)
                      ? "Collapse log entry"
                      : "Expand log entry"
                  }
                >
                  {getExpandIcon(expandedLogs.has(index))}
                </button>
              </div>

              {/* Truncated message for collapsed view */}
              {!expandedLogs.has(index) && (
                <div className="wdt:font-mono wdt:text-sm wdt:bg-gray-50 wdt:p-3 wdt:rounded-lg wdt:border wdt:border-gray-200 wdt:truncate">
                  {log.message}
                </div>
              )}

              {/* Full details for expanded view */}
              {expandedLogs.has(index) && (
                <div className="wdt:mt-3 wdt:space-y-3">
                  <div className="wdt:font-mono wdt:text-sm wdt:bg-gray-50 wdt:p-3 wdt:rounded-lg wdt:whitespace-pre-wrap wdt:border wdt:border-gray-200">
                    {log.message}
                  </div>

                  {log.file && (
                    <div className="wdt:text-sm wdt:bg-gray-50 wdt:p-3 wdt:rounded-lg wdt:border wdt:border-gray-200">
                      <div className="wdt:font-medium wdt:mb-1">
                        File Location:
                      </div>
                      <div className="wdt:font-mono">
                        {log.file} {log.line && `(line ${log.line})`}
                      </div>
                    </div>
                  )}

                  <div className="wdt:text-sm wdt:bg-gray-50 wdt:p-3 wdt:rounded-lg wdt:border wdt:border-gray-200">
                    <div className="wdt:font-medium wdt:mb-1">Timestamp:</div>
                    <div>{log.timestamp}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="wdt:p-8 wdt:text-center wdt:text-gray-500">
          No logs match your search criteria. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default LogTable;
