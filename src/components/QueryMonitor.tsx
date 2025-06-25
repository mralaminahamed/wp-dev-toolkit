import { Button, Table, TableBody, TableCell, TableHeader, TableRow, Spinner, SelectControl } from '@wordpress/components';
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

  const handleOrderChange = (order: 'time' | 'caller' | 'query') => {
    setQueryOptions(prev => ({ ...prev, order }));
  };

  const handleDirectionChange = (direction: 'asc' | 'desc') => {
    setQueryOptions(prev => ({ ...prev, direction }));
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
      <h2 className="text-xl font-semibold mb-4">Query Monitor</h2>

      <div className="bg-blue-50 p-4 rounded mb-4">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">
              Total Queries: <span className="font-bold">{totalQueries}</span>
            </p>
            <p className="font-medium">
              Total Time: <span className="font-bold">{formatTime(totalTime)}</span>
            </p>
          </div>
          <div>
            <Button isPrimary onClick={fetchQueries} disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Refresh Queries'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <SelectControl
            label="Sort By"
            value={queryOptions.order}
            options={[
              { label: 'Execution Time', value: 'time' },
              { label: 'Caller', value: 'caller' },
              { label: 'Query', value: 'query' },
            ]}
            onChange={handleOrderChange as (value: string) => void}
          />
        </div>
        <div className="w-1/2">
          <SelectControl
            label="Direction"
            value={queryOptions.direction}
            options={[
              { label: 'Descending', value: 'desc' },
              { label: 'Ascending', value: 'asc' },
            ]}
            onChange={handleDirectionChange as (value: string) => void}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <Spinner />
        </div>
      ) : (
        <>
          {selectedQuery ? (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-medium">Query Details</h3>
                <Button isSecondary onClick={closeDetails}>
                  Close Details
                </Button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Execution Time</h4>
                <div className="bg-white p-2 rounded border">{formatTime(selectedQuery.time)}</div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">SQL Query</h4>
                <pre className="bg-white p-2 rounded border overflow-x-auto text-sm whitespace-pre-wrap">{selectedQuery.query}</pre>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Caller</h4>
                <div className="bg-white p-2 rounded border font-mono text-sm">{selectedQuery.caller}</div>
              </div>

              {selectedQuery.backtrace && selectedQuery.backtrace.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Stack Trace</h4>
                  <div className="bg-white p-2 rounded border">
                    <ol className="list-decimal list-inside">
                      {selectedQuery.backtrace.map((trace, index) => (
                        <li key={index} className="text-sm font-mono my-1">
                          {trace}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Query</TableCell>
                <TableCell>Caller</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.length > 0 ? (
                queries.map((query, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{formatTime(query.time)}</TableCell>
                    <TableCell>
                      <div className="max-w-lg truncate font-mono text-xs">{query.query}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate text-xs">{query.caller}</div>
                    </TableCell>
                    <TableCell>
                      <Button isSecondary isSmall onClick={() => viewQueryDetails(query)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No queries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default QueryMonitor;
