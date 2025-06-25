import { Button, SelectControl, Spinner, Dashicon, TextControl, ToggleControl } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import React from 'react';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';

// Local interface to match the component's needs
interface QueryItem {
  query: string;
  time: number;
  caller: string;
  backtrace?: string[];
}

interface QueryOptions {
  order: 'time' | 'caller' | 'query';
  direction: 'asc' | 'desc';
  limit: number;
  search?: string;
}

interface QueryStats {
  slow: number;
  medium: number;
  fast: number;
}

const QueryMonitor: React.FC = () => {
  const { config, toggleTool } = useWPDevToolkit();
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [totalQueries, setTotalQueries] = useState<number>(0);
  const [selectedQuery, setSelectedQuery] = useState<QueryItem | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stats, setStats] = useState<QueryStats>({ slow: 0, medium: 0, fast: 0 });
  const [showOptimizationTips, setShowOptimizationTips] = useState<boolean>(false);
  const [queryOptions, setQueryOptions] = useState<QueryOptions>({
    order: 'time',
    direction: 'desc',
    limit: 100,
    search: '',
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
          (query.caller && query.caller.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredQueries(filtered);
    } else {
      setFilteredQueries(queries);
    }
  }, [searchTerm, queries]);

  useEffect(() => {
    if (queries.length) {
      // Calculate query stats
      const slow = queries.filter(q => q.time > 0.1).length;
      const medium = queries.filter(q => q.time <= 0.1 && q.time > 0.05).length;
      const fast = queries.filter(q => q.time <= 0.05).length;
      setStats({ slow, medium, fast });
    }
  }, [queries]);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${window.wpDevToolkit.apiUrl}/query-monitor?limit=${queryOptions.limit}&order=${queryOptions.order}&direction=${queryOptions.direction}${queryOptions.search ? `&search=${encodeURIComponent(queryOptions.search)}` : ''}`, 
        {
          headers: {
            'X-WP-Nonce': window.wpDevToolkit.nonce,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setQueries(data.data.queries || []);
        setTotalTime(data.data.total_time || 0);
        setTotalQueries(data.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderChange = (order: string) => {
    setQueryOptions(prev => ({ ...prev, order: order as 'time' | 'caller' | 'query' }));
  };

  const handleDirectionChange = (direction: string) => {
    setQueryOptions(prev => ({ ...prev, direction: direction as 'asc' | 'desc' }));
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Debounce API search
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setQueryOptions(prev => ({ ...prev, search: term }));
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const viewQueryDetails = (query: QueryItem) => {
    setSelectedQuery(query);
    
    // Scroll to details section
    setTimeout(() => {
      const detailsElement = document.getElementById('query-details');
      if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: 'smooth' });
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
      return 'wdt-bg-red-100 wdt-text-red-800 wdt-border-red-200';
    } else if (time > 0.05) {
      return 'wdt-bg-yellow-100 wdt-text-yellow-800 wdt-border-yellow-200';
    }
    return 'wdt-bg-green-100 wdt-text-green-800 wdt-border-green-200';
  };

  const toggleQueryMonitoring = () => {
    toggleTool('query_monitoring');
  };

  const getOptimizationTips = () => {
    if (stats.slow === 0) return null;
    
    return (
      <div className="wdt-p-4 wdt-bg-amber-50 wdt-border wdt-border-amber-100 wdt-rounded-lg wdt-mb-6">
        <div className="wdt-flex wdt-items-start wdt-gap-3">
          <div className="wdt-text-amber-600">
            <Dashicon icon="warning" size={24} />
          </div>
          <div>
            <h3 className="wdt-font-medium wdt-text-amber-800 wdt-mb-2">Query Optimization Suggestions</h3>
            <ul className="wdt-list-disc wdt-list-inside wdt-text-sm wdt-text-amber-700 wdt-space-y-1">
              <li>You have {stats.slow} slow {stats.slow === 1 ? 'query' : 'queries'} ({">"} 100ms) that may need optimization.</li>
              {stats.slow > 3 && <li>Consider adding proper indexes to tables frequently queried.</li>}
              <li>Check for queries inside loops that could be consolidated.</li>
              <li>Use <code className="wdt-px-1.5 wdt-py-0.5 wdt-bg-amber-100 wdt-rounded wdt-text-amber-800">get_posts()</code> instead of <code className="wdt-px-1.5 wdt-py-0.5 wdt-bg-amber-100 wdt-rounded wdt-text-amber-800">WP_Query</code> when you don{"'"}t need pagination.</li>
              <li>Use <code className="wdt-px-1.5 wdt-py-0.5 wdt-bg-amber-100 wdt-rounded wdt-text-amber-800">$wpdb-{">"} prepare()</code> for all SQL queries with variables.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="wp-dev-toolkit-query-monitor">
      <div className="wp-dev-toolkit-page-header">
        <h1>Query Monitor</h1>
        <p>Track and analyze database queries</p>
      </div>

      {/* Quick Actions */}
      <div className="wdt-bg-white wdt-rounded-lg wdt-shadow-sm wdt-p-4 wdt-mb-6">
        <div className="wdt-flex wdt-flex-wrap wdt-items-center wdt-gap-4">
          <Button 
            className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
            onClick={fetchQueries} 
            disabled={isLoading}
            icon="refresh"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Queries'}
          </Button>
          
          <Button 
            className={`wp-dev-toolkit-button ${config.query_monitoring ? 'wp-dev-toolkit-button-secondary' : 'wp-dev-toolkit-button-primary'}`}
            onClick={toggleQueryMonitoring}
            icon={config.query_monitoring ? 'no-alt' : 'yes-alt'}
          >
            {config.query_monitoring ? 'Disable Query Monitor' : 'Enable Query Monitor'}
          </Button>
          
          <div className="wdt-ml-auto wdt-flex wdt-items-center wdt-gap-2">
            <ToggleControl
              label="Show optimization tips"
              checked={showOptimizationTips}
              onChange={() => setShowOptimizationTips(!showOptimizationTips)}
            />
          </div>
        </div>
      </div>

      <div className="wp-dev-toolkit-dashboard-stats wdt-mb-6">
        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon blue">
            <Dashicon icon="database" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Total Queries</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">{totalQueries}</div>
            <div className="wdt-mt-2 wdt-text-sm wdt-text-gray-500">
              This page load
            </div>
          </div>
        </div>

        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon amber">
            <Dashicon icon="clock" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Total Execution Time</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">{formatTime(totalTime)}</div>
            <div className="wdt-mt-2 wdt-flex wdt-gap-2">
              <span className="wdt-inline-flex wdt-items-center wdt-gap-1 wdt-px-2 wdt-py-0.5 wdt-rounded-full wdt-text-xs wdt-font-medium wdt-bg-green-100 wdt-text-green-800">
                Fast <span className="wdt-bg-white wdt-px-1.5 wdt-py-0.5 wdt-rounded-full">{stats.fast}</span>
              </span>
              <span className="wdt-inline-flex wdt-items-center wdt-gap-1 wdt-px-2 wdt-py-0.5 wdt-rounded-full wdt-text-xs wdt-font-medium wdt-bg-yellow-100 wdt-text-yellow-800">
                Medium <span className="wdt-bg-white wdt-px-1.5 wdt-py-0.5 wdt-rounded-full">{stats.medium}</span>
              </span>
              <span className="wdt-inline-flex wdt-items-center wdt-gap-1 wdt-px-2 wdt-py-0.5 wdt-rounded-full wdt-text-xs wdt-font-medium wdt-bg-red-100 wdt-text-red-800">
                Slow <span className="wdt-bg-white wdt-px-1.5 wdt-py-0.5 wdt-rounded-full">{stats.slow}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon green">
            <Dashicon icon="performance" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Average Query Time</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">
              {totalQueries > 0 ? formatTime(totalTime / totalQueries) : '0 ms'}
            </div>
            <div className="wdt-mt-2 wdt-text-sm wdt-text-gray-500">
              {totalQueries > 30 ? 'High query count - consider caching' : 'Query count is acceptable'}
            </div>
          </div>
        </div>
      </div>

      {showOptimizationTips && getOptimizationTips()}

      <div className="wp-dev-toolkit-card wdt-mb-6">
        <div className="wp-dev-toolkit-card-header">
          <div className="wdt-flex wdt-justify-between wdt-items-center">
            <div className="wdt-flex wdt-items-center wdt-gap-2">
              <Dashicon icon="filter" />
              <h2>Query Filters</h2>
            </div>
          </div>
        </div>
        <div className="wp-dev-toolkit-card-body">
          <div className="wdt-grid wdt-grid-cols-1 md:wdt-grid-cols-3 wdt-gap-6">
            <div>
              <TextControl
                label="Search Queries"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search in query or caller..."
              />
            </div>
            <div>
              <SelectControl
                label="Sort By"
                value={queryOptions.order}
                options={[
                  { label: 'Execution Time', value: 'time' },
                  { label: 'Caller', value: 'caller' },
                  { label: 'Query', value: 'query' },
                ]}
                onChange={handleOrderChange}
              />
            </div>
            <div>
              <SelectControl
                label="Direction"
                value={queryOptions.direction}
                options={[
                  { label: 'Descending', value: 'desc' },
                  { label: 'Ascending', value: 'asc' },
                ]}
                onChange={handleDirectionChange}
              />
            </div>
          </div>
          
          {searchTerm && (
            <div className="wdt-bg-blue-50 wdt-p-3 wdt-rounded-md wdt-border wdt-border-blue-100 wdt-mt-4">
              <div className="wdt-flex wdt-items-center wdt-gap-2">
                <Dashicon icon="search" className="wdt-text-blue-500" />
                <span className="wdt-text-blue-700">
                  Found <strong>{filteredQueries.length}</strong> queries matching: <strong>{searchTerm}</strong>
                </span>
                <button 
                  onClick={() => handleSearch('')}
                  className="wdt-ml-auto wdt-text-blue-700 hover:wdt-text-blue-900"
                  aria-label="Clear search"
                >
                  <Dashicon icon="no-alt" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="wdt-flex wdt-justify-center wdt-items-center wdt-p-16 wdt-bg-white wdt-rounded-lg wdt-shadow-sm">
          <Spinner /> <span className="wdt-ml-2">Loading queries...</span>
        </div>
      ) : (
        <>
          {selectedQuery && (
            <div id="query-details" className="wp-dev-toolkit-card wdt-mb-6">
              <div className="wp-dev-toolkit-card-header">
                <div className="wdt-flex wdt-justify-between wdt-items-center">
                  <div className="wdt-flex wdt-items-center wdt-gap-2">
                    <Dashicon icon="database" />
                    <h2>Query Details</h2>
                  </div>
                  <Button 
                    className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
                    onClick={closeDetails}
                    icon="no-alt"
                  >
                    Close Details
                  </Button>
                </div>
              </div>
              <div className="wp-dev-toolkit-card-body">
                <div className="wdt-grid wdt-grid-cols-1 md:wdt-grid-cols-2 wdt-gap-6 wdt-mb-6">
                  <div>
                    <h3 className="wdt-font-medium wdt-mb-2">Execution Time</h3>
                    <div className={`wdt-p-3 wdt-rounded-lg wdt-border wdt-font-medium ${getTimeClass(selectedQuery.time)}`}>
                      {formatTime(selectedQuery.time)}
                    </div>
                  </div>
                  <div>
                    <h3 className="wdt-font-medium wdt-mb-2">Caller</h3>
                    <div className="wdt-bg-gray-50 wdt-p-3 wdt-rounded-lg wdt-border wdt-border-gray-200 wdt-font-mono wdt-text-sm wdt-overflow-x-auto">
                      {selectedQuery.caller}
                    </div>
                  </div>
                </div>

                <div className="wdt-mb-6">
                  <h3 className="wdt-font-medium wdt-mb-2">SQL Query</h3>
                  <pre className="wdt-bg-gray-50 wdt-p-4 wdt-rounded-lg wdt-border wdt-border-gray-200 wdt-overflow-x-auto wdt-text-sm wdt-whitespace-pre-wrap wdt-font-mono">
                    {selectedQuery.query}
                  </pre>
                </div>

                {selectedQuery.backtrace && selectedQuery.backtrace.length > 0 && (
                  <div>
                    <h3 className="wdt-font-medium wdt-mb-2">Stack Trace</h3>
                    <div className="wdt-bg-gray-50 wdt-p-4 wdt-rounded-lg wdt-border wdt-border-gray-200 wdt-overflow-x-auto">
                      <ol className="wdt-list-decimal wdt-list-inside">
                        {selectedQuery.backtrace.map((trace, index) => (
                          <li key={index} className="wdt-text-sm wdt-font-mono wdt-my-1 wdt-break-all">
                            {trace}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="wp-dev-toolkit-card">
            <div className="wp-dev-toolkit-card-header">
              <div className="wdt-flex wdt-justify-between wdt-items-center">
                <div className="wdt-flex wdt-items-center wdt-gap-2">
                  <Dashicon icon="database" />
                  <h2>Database Queries</h2>
                </div>
                <div className="wdt-text-sm wdt-text-gray-500">
                  {filteredQueries.length} queries found
                </div>
              </div>
            </div>
            <div className="wp-dev-toolkit-card-body wdt-p-0">
              <div className="wdt-overflow-x-auto">
                <table className="wdt-w-full">
                  <thead className="wdt-bg-gray-50 wdt-border-b wdt-border-gray-200">
                    <tr>
                      <th className="wdt-py-3 wdt-px-4 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider wdt-w-32">
                        Time
                      </th>
                      <th className="wdt-py-3 wdt-px-4 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider">
                        Query
                      </th>
                      <th className="wdt-py-3 wdt-px-4 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider">
                        Caller
                      </th>
                      <th className="wdt-py-3 wdt-px-4 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider wdt-w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="wdt-bg-white wdt-divide-y wdt-divide-gray-200">
                    {filteredQueries.length > 0 ? (
                      filteredQueries.map((query, index) => (
                        <tr key={index} className="hover:wdt-bg-gray-50 wdt-transition-colors">
                          <td className="wdt-py-3 wdt-px-4 wdt-font-mono wdt-text-sm wdt-whitespace-nowrap">
                            <span className={`wdt-inline-block wdt-px-2 wdt-py-1 wdt-rounded-full wdt-text-xs ${getTimeClass(query.time)}`}>
                              {formatTime(query.time)}
                            </span>
                          </td>
                          <td className="wdt-py-3 wdt-px-4">
                            <div className="wdt-max-w-lg wdt-truncate wdt-font-mono wdt-text-xs">{query.query}</div>
                          </td>
                          <td className="wdt-py-3 wdt-px-4">
                            <div className="wdt-max-w-md wdt-truncate wdt-text-xs">{query.caller}</div>
                          </td>
                          <td className="wdt-py-3 wdt-px-4">
                            <Button 
                              className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
                              onClick={() => viewQueryDetails(query)}
                              isSmall
                              icon="visibility"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="wdt-py-8 wdt-px-4 wdt-text-center wdt-text-gray-500">
                          No queries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QueryMonitor;
