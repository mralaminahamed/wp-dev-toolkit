import React, { useState, useEffect, useMemo } from 'react';
import { 
  Button,
  TextControl, 
  SelectControl, 
  Spinner,
  ToggleControl,
  Dashicon
} from '@wordpress/components';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { HookDetails, HookInspectorOptions, HookResponse } from '@/types/index';

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
      const response = await hooks.get(filterOptions) as unknown as HookResponse;
      if (response) {
        setHookData(response);
      }
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
    return sortConfig.direction === 'ascending' ? <Dashicon icon="arrow-up-alt2" size={14} /> : <Dashicon icon="arrow-down-alt2" size={14} />;
  };

  const getHookTypeClass = (type: string) => {
    return type === 'action' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="wp-dev-toolkit-hook-inspector">
      <div className="wp-dev-toolkit-page-header">
        <h1>Hook Inspector</h1>
        <p>Inspect WordPress actions and filters</p>
      </div>

      {/* Filter Controls */}
      <div className="wp-dev-toolkit-card mb-6">
        <div className="wp-dev-toolkit-card-header">
          <h2>Filter Hooks</h2>
        </div>
        <div className="wp-dev-toolkit-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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
          <div className="flex justify-between items-center">
            <ToggleControl
              label="Show Stack Traces"
              checked={showStackTrace}
              onChange={() => setShowStackTrace(!showStackTrace)}
            />
            <Button 
              className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
              onClick={fetchHooks} 
              disabled={isLoading}
              icon="refresh"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Hooks'}
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      {hookData?.summary && (
        <div className="wp-dev-toolkit-dashboard-stats mb-6">
          <div className="wp-dev-toolkit-dashboard-stat">
            <div className="wp-dev-toolkit-dashboard-stat-icon blue">
              <Dashicon icon="admin-plugins" />
            </div>
            <div className="wp-dev-toolkit-dashboard-stat-content">
              <div className="wp-dev-toolkit-dashboard-stat-title">Total Hooks</div>
              <div className="wp-dev-toolkit-dashboard-stat-value">
                {hookData.summary.total_hooks}
              </div>
            </div>
          </div>
          <div className="wp-dev-toolkit-dashboard-stat">
            <div className="wp-dev-toolkit-dashboard-stat-icon green">
              <Dashicon icon="performance" />
            </div>
            <div className="wp-dev-toolkit-dashboard-stat-content">
              <div className="wp-dev-toolkit-dashboard-stat-title">Total Executions</div>
              <div className="wp-dev-toolkit-dashboard-stat-value">
                {hookData.summary.total_executions}
              </div>
            </div>
          </div>
          <div className="wp-dev-toolkit-dashboard-stat">
            <div className="wp-dev-toolkit-dashboard-stat-icon amber">
              <Dashicon icon="clock" />
            </div>
            <div className="wp-dev-toolkit-dashboard-stat-content">
              <div className="wp-dev-toolkit-dashboard-stat-title">Total Time (ms)</div>
              <div className="wp-dev-toolkit-dashboard-stat-value">
                {hookData.summary.total_time.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-16 bg-white rounded-lg shadow-sm">
          <Spinner /> <span className="ml-2">Loading hooks...</span>
        </div>
      ) : (
        <>
          {/* Hook Details View */}
          {selectedHook && (
            <div className="wp-dev-toolkit-card mb-6">
              <div className="wp-dev-toolkit-card-header">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <h2>{selectedHook.name}</h2>
                    <span className={`ml-2 px-3 py-1 text-xs rounded-full font-medium ${getHookTypeClass(selectedHook.type)}`}>
                      {selectedHook.type}
                    </span>
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
                <h3 className="font-medium text-lg mb-3">Callbacks ({selectedHook.callbacks.length})</h3>
                <div className="overflow-x-auto">
                  <table className="wp-dev-toolkit-system-info-table">
                    <thead>
                      <tr>
                        <th>Priority</th>
                        <th>Function</th>
                        <th>Location</th>
                        <th>Args</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHook.callbacks.map((callback, index) => (
                        <tr key={index}>
                          <td>{callback.priority}</td>
                          <td className="font-mono text-sm">{callback.function}</td>
                          <td className="text-xs">
                            {callback.file}:{callback.line}
                          </td>
                          <td>{callback.accepted_args}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Hooks List */}
          <div className="wp-dev-toolkit-card">
            <div className="wp-dev-toolkit-card-header">
              <div className="flex justify-between items-center">
                <h2>Hooks</h2>
                <div className="text-sm text-gray-500">
                  {sortedHooks.length} hooks found
                </div>
              </div>
            </div>
            <div className="wp-dev-toolkit-card-body p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th 
                        className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          <span>Hook Name</span>
                          <span className="ml-1">{sortIndicator('name')}</span>
                        </div>
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center">
                          <span>Type</span>
                          <span className="ml-1">{sortIndicator('type')}</span>
                        </div>
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('count')}
                      >
                        <div className="flex items-center">
                          <span>Count</span>
                          <span className="ml-1">{sortIndicator('count')}</span>
                        </div>
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('total_time')}
                      >
                        <div className="flex items-center">
                          <span>Time (ms)</span>
                          <span className="ml-1">{sortIndicator('total_time')}</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedHooks.length > 0 ? (
                      sortedHooks.map((hook, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium">{hook.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${getHookTypeClass(hook.type)}`}>
                              {hook.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">{hook.count}</td>
                          <td className="py-3 px-4">{hook.total_time.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <Button 
                              className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
                              onClick={() => viewHookDetails(hook)}
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
                        <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                          No hooks found matching your criteria.
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

export default HookInspector;
