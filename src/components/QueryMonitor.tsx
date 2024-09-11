
// src/components/QueryMonitor.tsx
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const QueryMonitor: React.FC = () => {
  const [queries, setQueries] = useState<string[]>([]);

  const fetchQueries = () => {
    apiFetch({ path: 'wp-dev-toolkit/v1/queries' }).then((response) => {
      setQueries(response.queries || []);
    });
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  return (
    <div className="wp-dev-toolkit-query-monitor">
      <h2>Query Monitor</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Query</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queries.map((query, index) => (
            <TableRow key={index}>
              <TableCell>{query}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QueryMonitor;