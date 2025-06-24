import React, { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableHeader, TableRow, TextControl, SelectControl, Spinner } from '@wordpress/components';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { HookDetails, HookInspectorOptions } from '@/types';

const HookInspector: React.FC = () => {
  const { hooks, isLoading } = useWPDevToolkit();
  const [hookList, setHookList] = useState<HookDetails[]>([]);
  const [selectedHook, setSelectedHook] = useState<HookDetails | null>(null);
  const [filterOptions, setFilterOptions] = useState<HookInspectorOptions>({
    type: 'all',
    search: '',
  });

  useEffect(() => {
    fetchHooks();
  }, [filterOptions]);

  const fetchHooks = async () => {
    try {
      const hookList = await hooks.get(filterOptions);
      setHookList(hookList);
    } catch (error) {
      console.error('Error fetching hooks:', error);
    }
  };

  const handleSearch = (search: string) => {
    setFilterOptions(prev => ({ ...prev, search }));
  };

  const handleTypeChange = (type: 'all' | 'action' | 'filter') => {
    setFilterOptions(prev => ({ ...prev, type }));
  };

  const viewHookDetails = (hook: HookDetails) => {
    setSelectedHook(hook);
  };

  const closeDetails = () => {
    setSelectedHook(null);
  };

  return (
    <div className="wp-dev-toolkit-hook-inspector">
      <h2 className="text-xl font-semibold mb-4">Hook Inspector</h2>

      <div className="flex space-x-4 mb-4">
        <div className="w-1/2">
          <TextControl label="Search Hooks" value={filterOptions.search} onChange={handleSearch} placeholder="Enter hook name..." />
        </div>
        <div className="w-1/2">
          <SelectControl
            label="Hook Type"
            value={filterOptions.type}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Actions', value: 'action' },
              { label: 'Filters', value: 'filter' },
            ]}
            onChange={handleTypeChange as (value: string) => void}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <Spinner />
        </div>
      ) : (
        <>
          {selectedHook ? (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-medium">
                  {selectedHook.name}
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{selectedHook.type}</span>
                </h3>
                <Button isSecondary onClick={closeDetails}>
                  Close Details
                </Button>
              </div>

              <h4 className="font-medium mb-2">Callbacks ({selectedHook.callbacks.length})</h4>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableCell>Priority</TableCell>
                    <TableCell>Function</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Line</TableCell>
                    <TableCell>Args</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedHook.callbacks.map((callback, index) => (
                    <TableRow key={index}>
                      <TableCell>{callback.priority}</TableCell>
                      <TableCell className="font-mono text-sm">{callback.function}</TableCell>
                      <TableCell className="text-xs">{callback.file}</TableCell>
                      <TableCell>{callback.line}</TableCell>
                      <TableCell>{callback.accepted_args}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}

          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableCell>Hook Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Callbacks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hookList.length > 0 ? (
                hookList.map((hook, index) => (
                  <TableRow key={index}>
                    <TableCell>{hook.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${hook.type === 'action' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{hook.type}</span>
                    </TableCell>
                    <TableCell>{hook.callback_count}</TableCell>
                    <TableCell>
                      <Button isSecondary isSmall onClick={() => viewHookDetails(hook)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No hooks found matching your criteria.
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

export default HookInspector;
