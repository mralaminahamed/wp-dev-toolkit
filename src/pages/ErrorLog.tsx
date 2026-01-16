import React, { useState, useEffect, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  Filter,
  Search,
  X,
  Database,
  Zap,
  Clock,
  Code,
  Wrench,
  AlertTriangle,
  Info,
} from "lucide-react";

import { useSelect, useDispatch } from "@wordpress/data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { STORE_NAME as ERROR_LOG_STORE } from "@/stores/error-log/constants";
import { STORE_NAME as SETTINGS_STORE } from "@/stores/settings/constants";

import { ErrorLogResponse } from "@/types";

interface ParsedLogEntry {
  timestamp: string;
  level: string;
  message: string;
  file?: string | undefined;
  line?: number | undefined;
  raw: string;
}

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  debug: number;
  other: number;
}

const ErrorLog: React.FC = () => {
  const {
    entries: errorLog,
    isResolving,
    getError,
  } = useSelect(
    (select: any) => ({
      entries: select(ERROR_LOG_STORE).getEntries(),
      isResolving: (key: string) => select(ERROR_LOG_STORE).isResolving(key),
      getError: (key: string) => select(ERROR_LOG_STORE).getError(key),
    }),
    [],
  );

  const { config } = useSelect(
    (select: any) => ({
      config: select(SETTINGS_STORE).getConfig(),
    }),
    [],
  );

  const { fetchEntries, clearLog } = useDispatch(ERROR_LOG_STORE);
  const { toggleTool } = useDispatch(SETTINGS_STORE);
  const [logContent, setLogContent] = useState("");
  const [parsedLogs, setParsedLogs] = useState<ParsedLogEntry[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [logSize, setLogSize] = useState(0);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshRate, setRefreshRate] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [logStats, setLogStats] = useState<LogStats>({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    debug: 0,
    other: 0,
  });
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchErrorLog();

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(fetchErrorLog, refreshRate * 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshRate]);

  // Calculate log statistics when parsedLogs change
  useEffect(() => {
    const stats: LogStats = {
      total: parsedLogs.length,
      errors: getLogLevelCount("ERROR"),
      warnings: getLogLevelCount("WARNING"),
      info: getLogLevelCount("INFO"),
      debug: getLogLevelCount("DEBUG"),
      other: 0,
    };

    stats.other =
      stats.total - (stats.errors + stats.warnings + stats.info + stats.debug);
    setLogStats(stats);
  }, [parsedLogs]);

  const fetchErrorLog = async () => {
    if (isFetching) {
      return;
    } // Prevent multiple simultaneous requests

    setIsFetching(true);
    try {
      await fetchEntries();
      // The store will update the entries automatically
      // For now, we'll keep the local state for backward compatibility
      const entries = errorLog || [];
      if (entries.length > 0) {
        // Convert entries to log content format
        const logContent = entries
          .map(
            (entry: any) =>
              `[${entry.timestamp}] ${entry.level}: ${entry.message}`,
          )
          .join("\n");
        setLogContent(logContent);
        setParsedLogs(entries);
        setLogSize(logContent.length);
      } else {
        setLogContent("No errors logged.");
        setParsedLogs([]);
        setLogSize(0);
      }
    } catch (error: any) {
      console.error("Failed to fetch error log:", error);
      setLogContent("Error loading log file.");
      setParsedLogs([]);
    } finally {
      setIsFetching(false);
    }
  };

  const parseLogContent = (content: string): ParsedLogEntry[] => {
    if (!content) {
      return [];
    }

    // More comprehensive regex to extract file and line information
    const logEntryRegex =
      /\[([\d\s\-:.]+)\]\s*\[([A-Z]+)\]\s*(.*?)(?:\s+in\s+(\S+)\s+on\s+line\s+(\d+))?(?=\n\[\d|\n\s*$|$)/gs;
    const entries: ParsedLogEntry[] = [];

    let match;
    while ((match = logEntryRegex.exec(content)) !== null) {
      entries.push({
        timestamp: match[1]?.trim() || "",
        level: match[2]?.trim() || "",
        message: match[3]?.trim() || "",
        file: match[4] ? match[4].trim() : undefined,
        line: match[5] ? parseInt(match[5].trim(), 10) : undefined,
        raw: match[0] || "",
      });
    }

    return sortDirection === "desc" ? entries.reverse() : entries;
  };

  const clearErrorLog = async () => {
    if (!window.confirm("Are you sure you want to clear the error log?")) {
      return;
    }

    setIsClearing(true);
    try {
      await clearLog();
      setLogContent("Error log cleared successfully.");
      setParsedLogs([]);
      setLogSize(0);
    } catch (error) {
      console.error("Error clearing error log:", error);
      setLogContent("Failed to clear error log.");
    }
    setIsClearing(false);
  };

  const toggleLogging = () => {
    toggleTool("error_logging");
  };

  const getFilteredLogs = () => {
    let filtered = parsedLogs;

    // Apply level filter if set
    if (filterLevel) {
      filtered = filtered.filter((log) => log.level === filterLevel);
    }

    // Apply search filter if set
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          (log.file && log.file.toLowerCase().includes(query)),
      );
    }

    // Apply date filter if set
    if (dateFilter) {
      filtered = filtered.filter((log) => {
        const logDate = log.timestamp.split(" ")[0]; // Extract date part
        return logDate === dateFilter;
      });
    }

    return filtered;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getLogLevelCount = (level: string): number => {
    return parsedLogs.filter((log) => log.level === level).length;
  };

  const getLogLevelClass = (level: string): string => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return "wdt:bg-red-100 wdt:text-red-800";
      case "WARNING":
        return "wdt:bg-yellow-100 wdt:text-yellow-800";
      case "INFO":
        return "wdt:bg-blue-100 wdt:text-blue-800";
      case "DEBUG":
        return "wdt:bg-gray-100 wdt:text-gray-800";
      default:
        return "wdt:bg-gray-100 wdt:text-gray-800";
    }
  };

  const getLogLevelBgClass = (level: string): string => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return "wdt:bg-red-500";
      case "WARNING":
        return "wdt:bg-yellow-500";
      case "INFO":
        return "wdt:bg-blue-500";
      case "DEBUG":
        return "wdt:bg-gray-500";
      default:
        return "wdt:bg-gray-500";
    }
  };

  const getLogLevelIcon = (
    level: string,
  ): React.ComponentType<{ size?: number; className?: string }> => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return AlertTriangle;
      case "WARNING":
        return Zap;
      case "INFO":
        return Info;
      case "DEBUG":
        return Code;
      default:
        return Wrench;
    }
  };

  const getExpandIcon = (
    isExpanded: boolean,
  ): React.ComponentType<{ size?: number; className?: string }> => {
    return isExpanded ? ChevronUp : ChevronDown;
  };

  const toggleExpandLog = (index: number) => {
    if (expanded === index) {
      setExpanded(null);
    } else {
      setExpanded(index);
      // Scroll to the expanded log after a short delay to allow rendering
      setTimeout(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const toggleSortDirection = () => {
    const newDirection = sortDirection === "desc" ? "asc" : "desc";
    setSortDirection(newDirection);

    // Re-sort the logs based on the new direction
    setParsedLogs((prevLogs) =>
      newDirection === "desc"
        ? [...prevLogs].reverse()
        : [...prevLogs].reverse(),
    );
  };

  // Get unique dates from logs for the date filter
  const getUniqueDates = (): string[] => {
    const dates = new Set<string>();
    parsedLogs.forEach((log) => {
      const datePart = log.timestamp.split(" ")[0]; // Extract date part
      if (datePart) {
        dates.add(datePart);
      }
    });
    return Array.from(dates).sort((a, b) => b.localeCompare(a)); // Sort descending
  };

  return (
    <div className="wdt:space-y-6 wdt:p-6">
      <div className="wdt:space-y-2">
        <h1>Error Log</h1>
        <p>Monitor and manage PHP errors, warnings and notices</p>
      </div>

      {/* Control Panel */}
      <div className="wdt:bg-white wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:mb-6">
        <div className="wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-4">
          <Button
            className=""
            onClick={fetchErrorLog}
            disabled={isFetching || isClearing}
            icon="refresh"
          >
            {isFetching ? "Refreshing..." : "Refresh Log"}
          </Button>

          <Button
            variant="secondary"
            onClick={clearErrorLog}
            disabled={isFetching || isClearing || parsedLogs.length === 0}
          >
            {isClearing ? "Clearing..." : "Clear Log"}
          </Button>

          <Button
            variant={config.error_logging ? "secondary" : "default"}
            onClick={toggleLogging}
          >
            {config.error_logging ? "Disable Logging" : "Enable Logging"}
          </Button>

          <div className="wdt:ml-auto wdt:flex wdt:items-center wdt:gap-2">
            <label className="wdt:flex wdt:items-center wdt:gap-2 wdt:cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="wdt:rounded wdt:border-gray-300 wdt:text-blue-600 wdt:focus:ring-blue-500"
              />
              <span className="wdt:text-sm wdt:font-medium">Auto-refresh</span>
            </label>

            {autoRefresh && (
              <SelectControl
                label="Refresh rate"
                value={refreshRate.toString()}
                options={[
                  { label: "5 seconds", value: "5" },
                  { label: "10 seconds", value: "10" },
                  { label: "30 seconds", value: "30" },
                  { label: "60 seconds", value: "60" },
                ]}
                onChange={(value: string) =>
                  setRefreshRate(parseInt(value, 10))
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="wdt:grid wdt:grid-cols-2 sm:wdt:grid-cols-3 md:wdt:grid-cols-5 wdt:gap-4 wdt:mb-6">
        <div className="wdt:bg-white wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:text-center">
          <div className="wdt:text-sm wdt:text-gray-500 wdt:mb-1">
            Total Entries
          </div>
          <div className="wdt:text-2xl wdt:font-bold">{logStats.total}</div>
        </div>

        <div className="wdt:bg-white wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:text-center">
          <div className="wdt:text-sm wdt:text-gray-500 wdt:mb-1">Errors</div>
          <div className="wdt:text-2xl wdt:font-bold wdt:text-red-600">
            {logStats.errors}
          </div>
        </div>

        <div className="wdt:bg-white wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:text-center">
          <div className="wdt:text-sm wdt:text-gray-500 wdt:mb-1">Warnings</div>
          <div className="wdt:text-2xl wdt:font-bold wdt:text-yellow-600">
            {logStats.warnings}
          </div>
        </div>

        <div className="wdt:bg-white wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:text-center">
          <div className="wdt:text-sm wdt:text-gray-500 wdt:mb-1">Info</div>
          <div className="wdt:text-2xl wdt:font-bold wdt:text-blue-600">
            {logStats.info}
          </div>
        </div>

        <div className="wdt:bg-white wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:text-center">
          <div className="wdt:text-sm wdt:text-gray-500 wdt:mb-1">
            File Size
          </div>
          <div className="wdt:text-2xl wdt:font-bold">
            {formatFileSize(logSize)}
          </div>
        </div>
      </div>

      <div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm">
        <div className="wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6">
          <div className="wdt:flex wdt:items-center wdt:gap-2">
            <AlertTriangle />
            <h2>Error Log</h2>
          </div>
        </div>
        <div className="wdt:px-6">
          {/* Filters */}
          <div className="wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-4 wdt:mb-6">
            <div className="wdt:flex-1 wdt:min-w-[200px]">
              <TextControl
                label="Search logs"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search for error messages or files..."
                className="wdt:w-full"
              />
            </div>

            <div className="wdt:flex wdt:flex-col">
              <label className="wdt:text-xs wdt:font-medium wdt:text-gray-700 wdt:mb-1">
                Filter by level
              </label>
              <div className="wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-2">
                <button
                  className={`wdt:px-3 wdt:py-1 wdt:rounded-md wdt:text-xs wdt:font-medium wdt:transition-colors ${filterLevel === null ? "wdt:bg-blue-100 wdt:text-blue-800" : "wdt:bg-gray-100 wdt:text-gray-700 hover:wdt:bg-gray-200"}`}
                  onClick={() => setFilterLevel(null)}
                >
                  All ({logStats.total})
                </button>
                <button
                  className={`wdt:px-3 wdt:py-1 wdt:rounded-md wdt:text-xs wdt:font-medium wdt:transition-colors ${filterLevel === "ERROR" ? "wdt:bg-red-100 wdt:text-red-800" : "wdt:bg-gray-100 wdt:text-gray-700 hover:wdt:bg-gray-200"}`}
                  onClick={() => setFilterLevel("ERROR")}
                >
                  Errors ({logStats.errors})
                </button>
                <button
                  className={`wdt:px-3 wdt:py-1 wdt:rounded-md wdt:text-xs wdt:font-medium wdt:transition-colors ${filterLevel === "WARNING" ? "wdt:bg-yellow-100 wdt:text-yellow-800" : "wdt:bg-gray-100 wdt:text-gray-700 hover:wdt:bg-gray-200"}`}
                  onClick={() => setFilterLevel("WARNING")}
                >
                  Warnings ({logStats.warnings})
                </button>
                <button
                  className={`wdt:px-3 wdt:py-1 wdt:rounded-md wdt:text-xs wdt:font-medium wdt:transition-colors ${filterLevel === "INFO" ? "wdt:bg-blue-100 wdt:text-blue-800" : "wdt:bg-gray-100 wdt:text-gray-700 hover:wdt:bg-gray-200"}`}
                  onClick={() => setFilterLevel("INFO")}
                >
                  Info ({logStats.info})
                </button>
              </div>
            </div>

            {getUniqueDates().length > 0 && (
              <div>
                <label className="wdt:text-xs wdt:font-medium wdt:text-gray-700 wdt:mb-1">
                  Filter by date
                </label>
                <SelectControl
                  value={dateFilter || ""}
                  options={[
                    { label: "All dates", value: "" },
                    ...getUniqueDates().map((date) => ({
                      label: date,
                      value: date,
                    })),
                  ]}
                  onChange={(value: string) => setDateFilter(value || null)}
                />
              </div>
            )}

            <div className="wdt:ml-auto">
              <Button
                icon={
                  sortDirection === "desc" ? "arrow-down-alt2" : "arrow-up-alt2"
                }
                onClick={toggleSortDirection}
                variant="secondary"
                iconSize={16}
              >
                {sortDirection === "desc" ? "Newest first" : "Oldest first"}
              </Button>
            </div>
          </div>

          {/* Log Content */}
          {isFetching ? (
            <div className="wdt:flex wdt:justify-center wdt:items-center wdt:p-8">
              <Spinner /> <span className="wdt:ml-2">Loading error log...</span>
            </div>
          ) : parsedLogs.length > 0 ? (
            <>
              <div className="wdt:border wdt:rounded-lg wdt:overflow-hidden wdt:divide-y wdt:divide-gray-200">
                {getFilteredLogs().length > 0 ? (
                  getFilteredLogs().map((log, index) => (
                    <div
                      key={index}
                      className={`wdt:transition-colors ${expanded === index ? "wdt:bg-gray-50" : "hover:wdt:bg-gray-50"}`}
                    >
                      <div className="wdt:p-4">
                        <div className="wdt:flex wdt:items-center wdt:gap-2 wdt:mb-2">
                          <button
                            onClick={() => toggleExpandLog(index)}
                            className="wdt:flex wdt:items-center wdt:justify-center wdt:w-6 wdt:h-6 wdt:rounded-full wdt:text-white"
                            aria-label={
                              expanded === index
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
                            {React.createElement(getLogLevelIcon(log.level), {
                              size: 14,
                            })}
                          </button>
                          <span
                            className={`wdt:px-2 wdt:py-0.5 wdt:rounded-full wdt:text-xs wdt:font-medium ${getLogLevelClass(log.level)}`}
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
                            onClick={() => toggleExpandLog(index)}
                            className="wdt:ml-auto wdt:text-gray-400 hover:wdt:text-gray-600"
                            aria-label={
                              expanded === index
                                ? "Collapse log entry"
                                : "Expand log entry"
                            }
                          >
                            {React.createElement(getExpandIcon(expanded === index), { size: 16 })}
                            />
                          </button>
                        </div>

                        {/* Truncated message for collapsed view */}
                        {expanded !== index && (
                          <div className="wdt:font-mono wdt:text-sm wdt:bg-gray-50 wdt:p-3 wdt:rounded-lg wdt:border wdt:border-gray-200 wdt:truncate">
                            {log.message}
                          </div>
                        )}

                        {/* Full details for expanded view */}
                        {expanded === index && (
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
                              <div className="wdt:font-medium wdt:mb-1">
                                Timestamp:
                              </div>
                              <div>{log.timestamp}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="wdt:p-8 wdt:text-center wdt:text-gray-500">
                    No logs match your search criteria. Try adjusting your
                    filters.
                  </div>
                )}
              </div>
              <div ref={logEndRef}></div>{" "}
              {/* Reference for scrolling to expanded log */}
            </>
          ) : (
            <div className="wdt:bg-gray-50 wdt:p-8 wdt:rounded-lg wdt:text-center">
              <CheckCircle
                className="wdt:text-green-500 wdt:mb-2"
                size={30}
              />
              <p className="wdt:text-gray-700">
                No log entries found. Your application is running smoothly!
              </p>
            </div>
          )}

          {/* Log entry count */}
          {parsedLogs.length > 0 && (
            <div className="wdt:mt-4 wdt:text-sm wdt:text-gray-500 wdt:text-right">
              Showing {getFilteredLogs().length} of {parsedLogs.length} log
              entries
            </div>
          )}
        </div>
      </div>

      <div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm wdt:mt-6">
        <div className="wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6">
          <div className="wdt:flex wdt:items-center wdt:gap-2">
            <Wrench />
            <h2>Log Settings</h2>
          </div>
        </div>
        <div className="wdt:px-6">
          <div className="wdt:grid wdt:grid-cols-1 md:wdt:grid-cols-2 wdt:gap-6">
            <div>
              <p className="wdt:mb-4">
                The error log captures PHP errors, warnings, and notices based
                on your WordPress and PHP configurations.
              </p>
              <div className="wdt:bg-gray-50 wdt:p-4 wdt:rounded-lg wdt:border wdt:border-gray-200">
                <div className="wdt:font-medium wdt:mb-1">
                  Log file location:
                </div>
                <code className="code">
                  {window.wpDevToolkit?.logPath ||
                    "wp-content/wp-dev-toolkit-error.log"}
                </code>
              </div>
            </div>
            <div className="wdt:bg-blue-50 wdt:p-4 wdt:rounded-lg wdt:border wdt:border-blue-100">
              <div className="wdt:flex wdt:items-start wdt:gap-3">
                <Info
                  className="wdt:text-blue-500 wdt:mt-0.5"
                />
                <div>
                  <div className="wdt:font-medium wdt:text-blue-800 wdt:mb-1">
                    PHP Error Levels
                  </div>
                  <ul className="wdt:text-sm wdt:text-blue-700 wdt:space-y-1">
                    <li>
                      <strong>E_ERROR:</strong> Fatal run-time errors that
                      cannot be recovered from
                    </li>
                    <li>
                      <strong>E_WARNING:</strong> Run-time warnings that do not
                      interrupt script execution
                    </li>
                    <li>
                      <strong>E_NOTICE:</strong> Notices indicating possible
                      coding issues
                    </li>
                    <li>
                      <strong>E_DEPRECATED:</strong> Functions or features that
                      will be removed in future PHP versions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorLog;
