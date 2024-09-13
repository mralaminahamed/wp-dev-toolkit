import apiFetch from '@wordpress/api-fetch';
import { Button, Table, TableBody, TableCell, TableHeader, TableRow } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import React from 'react';

interface Query {
  sql: string;
  time: number;
  caller: string;
}

const QueryMonitor: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch({ path: 'wp-dev-toolkit/v1/queries' });
      setQueries(response.queries || []);
    } catch (error) {
      console.error('Error fetching queries:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="wp-dev-toolkit-query-monitor">
      <h2 className="text-xl font-semibold mb-4">Query Monitor</h2>
      <div className="mb-4">
        <Button isPrimary onClick={fetchQueries} disabled={isLoading}>
          Refresh Queries
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>SQL</TableCell>
            <TableCell>Time (ms)</TableCell>
            <TableCell>Caller</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {queries.map((query, index) => (
            <TableRow key={index}>
              <TableCell>{query.sql}</TableCell>
              <TableCell>{query.time.toFixed(4)}</TableCell>
              <TableCell>{query.caller}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QueryMonitor;
