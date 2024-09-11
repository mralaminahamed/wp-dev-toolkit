
// src/components/HookInspector.tsx
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const HookInspector: React.FC = () => {
  const [hooks, setHooks] = useState<string[]>([]);

  const fetchHooks = () => {
    apiFetch({ path: 'wp-dev-toolkit/v1/hooks' }).then((response) => {
      setHooks(response.hooks || []);
    });
  };

  useEffect(() => {
    fetchHooks();
  }, []);

  return (
    <div className="wp-dev-toolkit-hook-inspector">
      <h2>Hook Inspector</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Hook</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hooks.map((hook, index) => (
            <TableRow key={index}>
              <TableCell>{hook}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HookInspector;