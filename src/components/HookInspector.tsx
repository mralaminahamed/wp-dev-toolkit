import React, { useState, useEffect, useMemo } from 'react';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableBody, 
  TableCell, 
  TableHeader, 
  TableRow, 
  TextControl, 
  SelectControl, 
  Spinner,
  ToggleControl 
} from '@wordpress/components';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { HookDetails, HookInspectorOptions, HookResponse } from '@/types';

const HookInspector: React.FC = () => {
  const { hooks, isLoading } = useWPDevToolkit();
  const [hookData, setHookData] = useState<HookResponse | null>(null);
  const [selectedHook, setSelectedHook] = useState<HookDetails | null>(null);
  const [showStackTrace, setShowStackTrace] = useState(false);
  const [filterOptions, setFilterOptions] = useState<HookInspectorOptions>({
    type: 'all',
    search: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'name',
    direction: 'ascending',
  });

  useEffect(() => {
    fetchHooks();
  }, [filterOptions]);

  const fetchHooks = async () => {
    try {
      const response = await hooks.get(filterOptions) as HookResponse;
      setHookData(response);
    } catch (error) {
      console.error('Error fetching hooks:', error);
    }
  };

  const handleSearch = (search: string) => {
    setFilterOptions(prev => ({ ...prev, search }));
  };

  const handleTypeChange = (type: string) => {
    setFilterOptions(prev => ({ ...prev, type: type as 'all' | 'action' | 'filter' }));
  };

  const viewHookDetails = (hook: HookDetails) => {
    setSelectedHook(hook);
  };

  const closeDetails = () => {
    setSelectedHook(null);
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const sortedHooks = useMemo(() => {
    if (!hookData?.hooks) return [];
    
    const hooks = [...hookData.hooks];
    const { key, direction } = sortConfig;
    
    return hooks.sort((a, b) => {
      if (a[key as keyof typeof a] < b[key as keyof typeof b]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key as keyof typeof a] > b[key as keyof typeof b]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [hookData, sortConfig]);

  const sortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
  };

  return (
    <div className="wp-dev-toolkit-hook-inspector">
      <h2 className="text-xl font-semibold mb-4">Hook Inspector</h2>

      {/* Filter Controls */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-lg font-medium">Filters</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <TextControl 
                label="Search Hooks" 
                value={filterOptions.search} 
                onChange={handleSearch} 
                placeholder="Enter hook name..." 
              />
            </div>
            <div>
              <SelectControl
                label="Hook Type"
                value={filterOptions.type}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Actions', value: 'action' },
                  { label: 'Filters', value: 'filter' },
                ]}
                onChange={handleTypeChange}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <ToggleControl
              label="Show Stack Traces"
              checked={showStackTrace}
              onChange={() => setShowStackTrace(!showStackTrace)}
            />
            <Button 
              isPrimary 
              onClick={fetchHooks} 
              isBusy={isLoading}
              disabled={isLoading}
            >
              Refresh Hooks
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Statistics Summary */}
      {hookData?.summary && (
        <Card className="mb-4">
          <CardHeader>
            <h3 className="text-lg font-medium">Summary</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-500">Total Hooks</div>
                <div className="text-2xl font-bold">{hookData.summary.total_hooks}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-500">Total Executions</div>
                <div className="text-2xl font-bold">{hookData.summary.total_executions}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-500">Total Time (ms)</div>
                <div className="text-2xl font-bold">{hookData.summary.total_time.toFixed(2)}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center my-8">
          <Spinner /> <span className="ml-2">Loading hooks...</span>
        </div>
      ) : (
        <>
          {/* Hook Details View */}
          {selectedHook && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {selectedHook.name}
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      selectedHook.type === 'action' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedHook.type}
                    </span>
                  </h3>
                  <Button isSecondary onClick={closeDetails}>
                    Close Details
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <h4 className="font-medium mb-2">Callbacks ({selectedHook.callbacks.length})</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell>Priority</TableCell>
                        <TableCell>Function</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Args</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedHook.callbacks.map((callback, index) => (
                        <TableRow key={index}>
                          <TableCell>{callback.priority}</TableCell>
                          <TableCell className="font-mono text-sm">{callback.function}</TableCell>
                          <TableCell className="text-xs">
                            {callback.file}:{callback.line}
                          </TableCell>
                          <TableCell>{callback.accepted_args}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Hooks List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Hooks</h3>
                <div className="text-sm text-gray-500">
                  {sortedHooks.length} hooks found
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell 
                        className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleSort('name')}
                      >
                        Hook Name{sortIndicator('name')}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleSort('type')}
                      >
                        Type{sortIndicator('type')}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleSort('count')}
                      >
                        Executions{sortIndicator('count')}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => handleSort('total_time')}
                      >
                        Time (ms){sortIndicator('total_time')}
                      </TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHooks.length > 0 ? (
                      sortedHooks.map((hook, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{hook.name}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              hook.type === 'action' 
                                ? 'bg-green-100 text-green-800' 
                                : hook.type === 'filter'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {hook.type}
                            </span>
                          </TableCell>
                          <TableCell>{hook.count}</TableCell>
                          <TableCell>{hook.total_time.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button 
                              isSecondary 
                              isSmall 
                              onClick={() => viewHookDetails(hook as unknown as HookDetails)}
                            >
                              Details
                            </Button>
                            {showStackTrace && hook.backtrace && (
                              <Button 
                                isSmall 
                                className="ml-2"
                                onClick={() => {
                                  console.log('Stack trace for', hook.name, hook.backtrace);
                                  alert(`Stack trace for ${hook.name} logged to console`);
                                }}
                              >
                                Stack
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No hooks found matching your criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};

export default HookInspector;
