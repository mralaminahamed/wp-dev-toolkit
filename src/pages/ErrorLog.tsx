import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, Info, CheckCircle, Wrench } from "lucide-react";

import { useSelect, useDispatch } from "@wordpress/data";

import { STORE_NAME as ERROR_LOG_STORE } from "@/stores/error-log/constants";
import { STORE_NAME as SETTINGS_STORE } from "@/stores/settings/constants";

import ErrorLogHeader from "./ErrorLog/ErrorLogHeader";
import LogStats from "./ErrorLog/LogStats";
import LogFilters from "./ErrorLog/LogFilters";
import LogTable from "./ErrorLog/LogTable";

interface LogStats {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  debug: number;
  other: number;
}

const ErrorLog: React.FC = () => {
  const { entries } = useSelect(
    (select: any) => ({
      entries: select(ERROR_LOG_STORE).getEntries(),
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

  const [isFetching, setIsFetching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshRate, setRefreshRate] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [logStats, setLogStats] = useState<LogStats>({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    debug: 0,
    other: 0,
  });
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
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

  // Calculate log statistics when entries change
  useEffect(() => {
    const currentLogs = entries || [];
    const stats: LogStats = {
      total: currentLogs.length,
      errors: getLogLevelCount("ERROR"),
      warnings: getLogLevelCount("WARNING"),
      info: getLogLevelCount("INFO"),
      debug: getLogLevelCount("DEBUG"),
      other: 0,
    };

    stats.other =
      stats.total - (stats.errors + stats.warnings + stats.info + stats.debug);
    setLogStats(stats);
  }, [entries]);

  const fetchErrorLog = async () => {
    if (isFetching) {
      return;
    } // Prevent multiple simultaneous requests

    setIsFetching(true);
    try {
      await fetchEntries();
      // The store will update the entries automatically
      // parsedLogs is derived from the store data
    } catch (error: any) {
      console.error("Failed to fetch error log:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const clearErrorLog = async () => {
    if (!window.confirm("Are you sure you want to clear the error log?")) {
      return;
    }

    setIsClearing(true);
    try {
      await clearLog();
      // The store will update the entries automatically
    } catch (error) {
      console.error("Error clearing error log:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const toggleLogging = () => {
    toggleTool("error_logging");
  };

  const getFilteredLogs = () => {
    let filtered = entries || [];

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
    return (entries || []).filter((log) => log.level === level).length;
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

  const toggleExpandLog = (index: number) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.clear(); // Only allow one expanded at a time for now
        newSet.add(index);
        // Scroll to the expanded log after a short delay to allow rendering
        setTimeout(() => {
          logEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
      return newSet;
    });
  };

  // Get unique dates from logs for the date filter
  const getUniqueDates = (): string[] => {
    const dates = new Set<string>();
    (entries || []).forEach((log) => {
      const datePart = log.timestamp.split(" ")[0]; // Extract date part
      if (datePart) {
        dates.add(datePart);
      }
    });
    return Array.from(dates).sort((a, b) => b.localeCompare(a)); // Sort descending
  };

  return (
    <div className="wdt:space-y-6 wdt:p-6">
      <ErrorLogHeader
        title="Error Log"
        description="Monitor and manage PHP errors, warnings and notices"
      />

      {/* Control Panel */}
      <div className="wdt:bg-card wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:mb-6 wdt:border wdt:border-border">
        <div className="wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-4">
          <button
            className="wdt:px-4 wdt:py-2 wdt:bg-primary wdt:text-primary-foreground wdt:rounded-md wdt:hover:bg-primary/90 wdt:disabled:opacity-50"
            onClick={fetchErrorLog}
            disabled={isFetching || isClearing}
          >
            {isFetching ? "Refreshing..." : "Refresh Log"}
          </button>

          <button
            className="wdt:px-4 wdt:py-2 wdt:bg-secondary wdt:text-secondary-foreground wdt:rounded-md wdt:hover:bg-secondary/80 wdt:disabled:opacity-50"
            onClick={clearErrorLog}
            disabled={
              isFetching || isClearing || (entries && entries.length === 0)
            }
          >
            {isClearing ? "Clearing..." : "Clear Log"}
          </button>

          <button
            className={`wdt:px-4 wdt:py-2 wdt:rounded-md ${
              config.error_logging
                ? "wdt:bg-secondary wdt:text-secondary-foreground wdt:hover:bg-secondary/80"
                : "wdt:bg-primary wdt:text-primary-foreground wdt:hover:bg-primary/90"
            }`}
            onClick={toggleLogging}
          >
            {config.error_logging ? "Disable Logging" : "Enable Logging"}
          </button>

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
              <label className="wdt:block">
                <span className="wdt:text-sm wdt:font-medium wdt:text-gray-700">
                  Refresh rate
                </span>
                <select
                  value={refreshRate.toString()}
                  onChange={(e) => setRefreshRate(parseInt(e.target.value, 10))}
                  className="wdt:mt-1 wdt:block wdt:w-full wdt:px-3 wdt:py-2 wdt:border wdt:border-gray-300 wdt:rounded-md wdt:shadow-sm wdt:focus:outline-none wdt:focus:ring-blue-500 wdt:focus:border-blue-500"
                >
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                </select>
              </label>
            )}
          </div>
        </div>
      </div>

      <LogStats
        stats={logStats}
        fileSize={(entries || []).length * 100} // Rough estimate for demo
        formatFileSize={formatFileSize}
      />

      <div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm">
        <div className="wdt:/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[\.border-b]:pb-6">
          <div className="wdt:flex wdt:items-center wdt:gap-2">
            <AlertTriangle />
            <h2>Error Log</h2>
          </div>
        </div>
        <div className="wdt:px-6">
          <LogFilters
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            selectedLevel={filterLevel}
            onLevelChange={setFilterLevel}
            selectedDate={dateFilter}
            onDateChange={setDateFilter}
            availableDates={getUniqueDates()}
            filteredCount={(entries || []).length}
            config={config}
            toggleLogging={toggleLogging}
          />

          {/* Log Content */}
          {isFetching ? (
            <div className="wdt:flex wdt:justify-center wdt:items-center wdt:p-8">
              <div className="wdt:animate-spin wdt:rounded-full wdt:h-8 wdt:w-8 wdt:border-b-2 wdt:border-blue-600"></div>
              <span className="wdt:ml-2">Loading error log...</span>
            </div>
          ) : entries && entries.length > 0 ? (
            <>
              <LogTable
                logs={getFilteredLogs()}
                expandedLogs={expandedLogs}
                onToggleExpanded={toggleExpandLog}
                getLogLevelBgClass={getLogLevelClass}
              />
              <div ref={logEndRef}></div>{" "}
              {/* Reference for scrolling to expanded log */}
            </>
          ) : (
            <div className="wdt:bg-gray-50 wdt:p-8 wdt:rounded-lg wdt:text-center">
              <CheckCircle className="wdt:text-green-500 wdt:mb-2" size={30} />
              <p className="wdt:text-gray-700">
                No log entries found. Your application is running smoothly!
              </p>
            </div>
          )}

          {/* Log entry count */}
          {entries && entries.length > 0 && (
            <div className="wdt:mt-4 wdt:text-sm wdt:text-gray-500 wdt:text-right">
              Showing {getFilteredLogs().length} of {entries.length} log entries
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
                <Info className="wdt:text-blue-500 wdt:mt-0.5" />
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
