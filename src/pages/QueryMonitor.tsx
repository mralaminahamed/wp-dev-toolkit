import { AlertTriangle } from "lucide-react";
import React from "react";

import { useSelect, useDispatch } from "@wordpress/data";
import { useState, useEffect } from "@wordpress/element";

import { STORE_NAME as SETTINGS_STORE } from "@/stores/settings/constants";

import { Button } from "@/components/ui/button";

import LoadingState from "./QueryMonitor/LoadingState";
import QueryDetails from "./QueryMonitor/QueryDetails";
import QueryFilters from "./QueryMonitor/QueryFilters";
import QueryStatsCards from "./QueryMonitor/QueryStatsCards";
import QueryTable from "./QueryMonitor/QueryTable";

interface QueryItem {
  query: string;
  time: number;
  caller: string;
  backtrace?: string[];
}

interface QueryOptions {
  order: "time" | "caller" | "query";
  direction: "asc" | "desc";
  limit: number;
  search?: string;
}

interface QueryStats {
  slow: number;
  medium: number;
  fast: number;
}

const QueryMonitor: React.FC = () => {
  const { config } = useSelect(
    (select: any) => ({
      config: select(SETTINGS_STORE).getConfig(),
    }),
    [],
  );

  const { toggleTool } = useDispatch(SETTINGS_STORE);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [totalQueries, setTotalQueries] = useState<number>(0);
  const [selectedQuery, setSelectedQuery] = useState<QueryItem | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [stats, setStats] = useState<QueryStats>({
    slow: 0,
    medium: 0,
    fast: 0,
  });
  const [showOptimizationTips, setShowOptimizationTips] =
    useState<boolean>(false);
  const [queryOptions, setQueryOptions] = useState<QueryOptions>({
    order: "time",
    direction: "desc",
    limit: 100,
    search: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filteredQueries, setFilteredQueries] = useState<QueryItem[]>([]);

  useEffect(() => {
    fetchQueries();
  }, [queryOptions]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = queries.filter(
        (query) =>
          query.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (query.caller &&
            query.caller.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredQueries(filtered);
    } else {
      setFilteredQueries(queries);
    }
  }, [searchTerm, queries]);

  useEffect(() => {
    if (queries.length) {
      // Calculate query stats
      const slow = queries.filter((q) => q.time > 0.1).length;
      const medium = queries.filter(
        (q) => q.time <= 0.1 && q.time > 0.05,
      ).length;
      const fast = queries.filter((q) => q.time <= 0.05).length;
      setStats({ slow, medium, fast });
    }
  }, [queries]);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${window.wpDevToolkit.apiUrl}/query-monitor?limit=${queryOptions.limit}&order=${queryOptions.order}&direction=${queryOptions.direction}${queryOptions.search ? `&search=${encodeURIComponent(queryOptions.search)}` : ""}`,
        {
          headers: {
            "X-WP-Nonce": window.wpDevToolkit.nonce,
          },
        },
      );
      const data = await response.json();

      if (data.success) {
        setQueries(data.data.queries || []);
        setTotalTime(data.data.total_time || 0);
        setTotalQueries(data.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderChange = (order: string) => {
    setQueryOptions((prev) => ({
      ...prev,
      order: order as "time" | "caller" | "query",
    }));
  };

  const handleDirectionChange = (direction: string) => {
    setQueryOptions((prev) => ({
      ...prev,
      direction: direction as "asc" | "desc",
    }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);

    // Debounce API search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setQueryOptions((prev) => ({ ...prev, search: term }));
    }, 500);

    setSearchTimeout(timeout);
  };

  const viewQueryDetails = (query: QueryItem) => {
    setSelectedQuery(query);

    // Scroll to details section
    setTimeout(() => {
      const detailsElement = document.getElementById("query-details");
      if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const closeDetails = () => {
    setSelectedQuery(null);
  };

  const formatTime = (time: number): string => {
    return `${(time * 1000).toFixed(2)} ms`;
  };

  const getTimeClass = (time: number): string => {
    if (time > 0.1) {
      return "wdt:bg-red-100 wdt:text-red-800 wdt:border-red-200";
    } else if (time > 0.05) {
      return "wdt:bg-yellow-100 wdt:text-yellow-800 wdt:border-yellow-200";
    }
    return "wdt:bg-green-100 wdt:text-green-800 wdt:border-green-200";
  };

  const toggleQueryMonitoring = () => {
    toggleTool("query_monitoring");
  };

  const getOptimizationTips = () => {
    if (stats.slow === 0) {
      return null;
    }

    return (
      <div className="wdt:p-4 wdt:bg-amber-50 wdt:border wdt:border-amber-100 wdt:rounded-lg wdt:mb-6">
        <div className="wdt:flex wdt:items-start wdt:gap-3">
          <div className="wdt:text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="wdt:font-medium wdt:text-amber-800 wdt:mb-2">
              Query Optimization Suggestions
            </h3>
            <ul className="wdt:list-disc wdt:list-inside wdt:text-sm wdt:text-amber-700 wdt:space-y-1">
              <li>
                You have {stats.slow} slow{" "}
                {stats.slow === 1 ? "query" : "queries"} ({">"} 100ms) that may
                need optimization.
              </li>
              {stats.slow > 3 && (
                <li>
                  Consider adding proper indexes to tables frequently queried.
                </li>
              )}
              <li>
                Check for queries inside loops that could be consolidated.
              </li>
              <li>
                Use{" "}
                <code className="wdt:px-1.5 wdt:py-0.5 wdt:bg-amber-100 wdt:rounded wdt:text-amber-800">
                  get_posts()
                </code>{" "}
                instead of{" "}
                <code className="wdt:px-1.5 wdt:py-0.5 wdt:bg-amber-100 wdt:rounded wdt:text-amber-800">
                  WP_Query
                </code>{" "}
                when you don{"'"}t need pagination.
              </li>
              <li>
                Use{" "}
                <code className="wdt:px-1.5 wdt:py-0.5 wdt:bg-amber-100 wdt:rounded wdt:text-amber-800">
                  $wpdb-{">"} prepare()
                </code>{" "}
                for all SQL queries with variables.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="wdt:space-y-6 wdt:p-6">
      {/* Header */}
      <div className="wdt:space-y-2">
        <h1 className="wdt:text-3xl wdt:font-bold">Query Monitor</h1>
        <p className="wdt:text-muted-foreground">
          Track and analyze database queries
        </p>
      </div>

      {/* Quick Actions */}
      <div className="wdt:bg-card wdt:rounded-lg wdt:shadow-sm wdt:p-4 wdt:mb-6 wdt:border wdt:border-border">
        <div className="wdt:flex wdt:flex-wrap wdt:items-center wdt:gap-4">
          <Button onClick={fetchQueries} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh Queries"}
          </Button>

          <Button
            variant={config.query_monitoring ? "secondary" : "default"}
            onClick={toggleQueryMonitoring}
          >
            {config.query_monitoring
              ? "Disable Query Monitor"
              : "Enable Query Monitor"}
          </Button>

          <div className="wdt:ml-auto wdt:flex wdt:items-center wdt:gap-2">
            <label className="wdt:flex wdt:items-center wdt:gap-2 wdt:cursor-pointer">
              <input
                type="checkbox"
                checked={showOptimizationTips}
                onChange={() => setShowOptimizationTips(!showOptimizationTips)}
                className="wdt:rounded wdt:border-input wdt:text-primary wdt:focus:ring-ring"
              />
              <span className="wdt:text-sm wdt:font-medium">
                Show optimization tips
              </span>
            </label>
          </div>
        </div>
      </div>

      <QueryStatsCards
        totalQueries={totalQueries}
        totalTime={totalTime}
        stats={stats}
        formatTime={formatTime}
      />

      {showOptimizationTips && getOptimizationTips()}

      <QueryFilters
        searchTerm={searchTerm}
        onSearch={handleSearch}
        queryOptions={queryOptions}
        onOrderChange={handleOrderChange}
        onDirectionChange={handleDirectionChange}
        filteredQueriesCount={filteredQueries.length}
      />

      {isLoading && <LoadingState />}

      {!isLoading && selectedQuery && (
        <QueryDetails
          selectedQuery={selectedQuery}
          onClose={closeDetails}
          formatTime={formatTime}
          getTimeClass={getTimeClass}
        />
      )}

      {!isLoading && (
        <QueryTable
          queries={filteredQueries}
          onViewDetails={viewQueryDetails}
          formatTime={formatTime}
          getTimeClass={getTimeClass}
        />
      )}
    </div>
  );
};

export default QueryMonitor;
