import React, { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableHeader, TableRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

interface Hook {
  name: string;
  type: 'action' | 'filter';
  callbacks: number;
}

const HookInspector: React.FC = () => {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchHooks();
  }, []);

  const fetchHooks = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch({ path: 'wp-dev-toolkit/v1/hooks' });
      setHooks(response.hooks || []);
    } catch (error) {
      console.error('Error fetching hooks:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="wp-dev-toolkit-hook-inspector">
      <h2 className="text-xl font-semibold mb-4">Hook Inspector</h2>
      <div className="mb-4">
        <Button isPrimary onClick={fetchHooks} disabled={isLoading}>
          Refresh Hooks
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Callbacks</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hooks.map((hook, index) => (
            <TableRow key={index}>
              <TableCell>{hook.name}</TableCell>
              <TableCell>{hook.type}</TableCell>
              <TableCell>{hook.callbacks}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HookInspector;
