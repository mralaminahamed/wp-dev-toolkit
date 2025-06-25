import { Button, SelectControl, Spinner, Dashicon } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import React from 'react';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';

interface Query {
  query: string;
  time: number;
  caller: string;
  backtrace?: string[];
}

interface QueryOptions {
  order: 'time' | 'caller' | 'query';
  direction: 'asc' | 'desc';
  limit: number;
}

const QueryMonitor: React.FC = () => {
  const { } = useWPDevToolkit();
  const [queries, setQueries] = useState<Query[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [totalQueries, setTotalQueries] = useState<number>(0);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [queryOptions, setQueryOptions] = useState<QueryOptions>({
    order: 'time',
    direction: 'desc',
    limit: 100,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchQueries();
  }, [queryOptions]);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${window.wpDevToolkit.apiUrl}/query-monitor?limit=${queryOptions.limit}&order=${queryOptions.order}&direction=${queryOptions.direction}`, {
        headers: {
          'X-WP-Nonce': window.wpDevToolkit.nonce,
        },
      });
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

  const viewQueryDetails = (query: Query) => {
    setSelectedQuery(query);
  };

  const closeDetails = () => {
    setSelectedQuery(null);
  };

  const formatTime = (time: number): string => {
    return `${(time * 1000).toFixed(2)} ms`;
  };

  return (
    <div className="wp-dev-toolkit-query-monitor">
      <div className="wp-dev-toolkit-page-header">
        <h1>Query Monitor</h1>
        <p>Track and analyze database queries</p>
      </div>

      <div className="wp-dev-toolkit-dashboard-stats mb-6">
        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon blue">
            <Dashicon icon="database" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Total Queries</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">{totalQueries}</div>
          </div>
        </div>

        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon amber">
            <Dashicon icon="clock" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Total Execution Time</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">{formatTime(totalTime)}</div>
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
          </div>
        </div>
      </div>

      <div className="wp-dev-toolkit-card mb-6">
        <div className="wp-dev-toolkit-card-header">
          <div className="flex justify-between items-center">
            <h2>Query Settings</h2>
            <Button
              className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
              onClick={fetchQueries}
              disabled={isLoading}
              icon="refresh"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Queries'}
            </Button>
          </div>
        </div>
        <div className="wp-dev-toolkit-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-16 bg-white rounded-lg shadow-sm">
          <Spinner /> <span className="ml-2">Loading queries...</span>
        </div>
      ) : (
        <>
          {selectedQuery && (
            <div className="wp-dev-toolkit-card mb-6">
              <div className="wp-dev-toolkit-card-header">
                <div className="flex justify-between items-center">
                  <h2>Query Details</h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium mb-2">Execution Time</h3>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 font-medium text-blue-800">
                      {formatTime(selectedQuery.time)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Caller</h3>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-sm overflow-x-auto">
                      {selectedQuery.caller}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">SQL Query</h3>
                  <pre className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                    {selectedQuery.query}
                  </pre>
                </div>

                {selectedQuery.backtrace && selectedQuery.backtrace.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Stack Trace</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
                      <ol className="list-decimal list-inside">
                        {selectedQuery.backtrace.map((trace, index) => (
                          <li key={index} className="text-sm font-mono my-1 break-all">
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
              <h2>Database Queries</h2>
            </div>
            <div className="wp-dev-toolkit-card-body p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Time
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Query
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Caller
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queries.length > 0 ? (
                      queries.map((query, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-sm whitespace-nowrap">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              query.time > 0.1 ? 'bg-red-100 text-red-800' : 
                              query.time > 0.05 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {formatTime(query.time)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-lg truncate font-mono text-xs">{query.query}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-md truncate text-xs">{query.caller}</div>
                          </td>
                          <td className="py-3 px-4">
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
                        <td colSpan={4} className="py-8 px-4 text-center text-gray-500">
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
