import apiFetch from '@wordpress/api-fetch';
import { ToggleControl, Button, Spinner, Dashicon } from '@wordpress/components';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { 
  DevModeState, 
  ErrorLogResponse, 
  QueryResponse, 
  HookResponse,
  SystemInfoResponse,
  ApiResponse
} from '@/types/index';

interface Stats {
  errorCount: number;
  queryCount: number;
  hookCount: number;
  slowQueries: number;
  avgQueryTime: number;
}

interface SystemInfo {
  wpVersion: string;
  phpVersion: string;
  serverSoftware: string;
  memoryLimit: string;
  maxExecutionTime: string;
}

const Dashboard: React.FC = () => {
  const { config, setConfig, toggleTool, devMode } = useWPDevToolkit();
  const [devModeState, setDevModeState] = useState<DevModeState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<Stats>({
    errorCount: 0,
    queryCount: 0,
    hookCount: 0,
    slowQueries: 0,
    avgQueryTime: 0
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    wpVersion: '',
    phpVersion: '',
    serverSoftware: '',
    memoryLimit: '',
    maxExecutionTime: ''
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);

  useEffect(() => {
    fetchDevMode();
    fetchStats();
    fetchSystemInfo();
    checkActiveTools();
  }, []);

  useEffect(() => {
    checkActiveTools();
  }, [config]);

  const checkActiveTools = () => {
    const active: string[] = [];
    if (config.dev_mode) active.push('dev_mode');
    if (config.error_logging) active.push('error_logging');
    if (config.query_monitoring) active.push('query_monitoring');
    if (config.hook_inspection) active.push('hook_inspection');
    setActiveTools(active);
  };

  const fetchDevMode = async () => {
    try {
      const state = await devMode.get();
      setDevModeState(state);
    } catch (error) {
      console.error('Error fetching dev mode state:', error);
    }
  };

  const updateDevMode = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const state = await devMode.update(enabled);
      setDevModeState(state);
      // Also update the global config
      setConfig({ ...config, dev_mode: enabled });
    } catch (error) {
      console.error('Error updating dev mode:', error);
    }
    setIsSaving(false);
  };

  const fetchConfig = async () => {
    setIsSaving(true);
    try {
      const updatedConfig = await apiFetch({
        path: 'wp-dev-toolkit/v1/config',
      });
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
    setIsSaving(false);
  };

  const fetchSystemInfo = async () => {
    setIsLoadingSystem(true);
    try {
      const response = await apiFetch<ApiResponse<SystemInfoResponse>>({
        path: 'wp-dev-toolkit/v1/system-info',
      });

      if (response && response.data) {
        setSystemInfo({
          wpVersion: response.data.wordpress?.version || '',
          phpVersion: response.data.server?.php_version || '',
          serverSoftware: response.data.server?.web_server || '',
          memoryLimit: response.data.server?.php_memory_limit || '',
          maxExecutionTime: response.data.server?.php_max_execution_time || ''
        });
      }
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
    setIsLoadingSystem(false);
  };

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      // Fetch error log stats
      const errorLog = await apiFetch<ErrorLogResponse>({ 
        path: 'wp-dev-toolkit/v1/error-log' 
      });
      
      const errorCount = errorLog?.log_content ? 
        (errorLog.log_content.match(/\[ERROR\]/g) || []).length : 0;

      // Fetch query stats
      const queries = await apiFetch<QueryResponse>({ 
        path: 'wp-dev-toolkit/v1/queries' 
      });
      
      const queryCount = queries?.summary?.total_queries || 0;
      const totalQueryTime = queries?.summary?.total_time || 0;
      const avgQueryTime = queryCount > 0 ? (totalQueryTime / queryCount) : 0;
      
      // Count slow queries (> 0.1 seconds)
      const slowQueries = queries?.queries?.filter(q => q.time > 0.1).length || 0;

      // Fetch hook stats
      const hooks = await apiFetch<HookResponse>({ 
        path: 'wp-dev-toolkit/v1/hooks' 
      });
      
      const hookCount = hooks?.summary?.total_hooks || 0;

      setStats({
        errorCount,
        queryCount,
        hookCount,
        slowQueries,
        avgQueryTime
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setIsLoadingStats(false);
  };

  const getToolStatus = (toolName: string): JSX.Element => {
    const isActive = activeTools.includes(toolName);
    return (
      <span className={`wdt-px-2 wdt-py-1 wdt-rounded-full wdt-text-xs wdt-font-medium ${
        isActive ? 'wdt-bg-green-100 wdt-text-green-800' : 'wdt-bg-gray-100 wdt-text-gray-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="wp-dev-toolkit-dashboard">
      <div className="wp-dev-toolkit-page-header">
        <h1>Dashboard</h1>
        <p>Overview of your WordPress development environment</p>
      </div>

      {/* Quick Actions */}
      <div className="wdt-mb-8 wdt-bg-white wdt-rounded-lg wdt-shadow-sm wdt-p-4">
        <div className="wdt-flex wdt-flex-wrap wdt-gap-3">
          <Button 
            className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
            icon="update"
            onClick={() => {
              fetchConfig();
              fetchStats();
              fetchDevMode();
              fetchSystemInfo();
            }}
          >
            Refresh All Data
          </Button>

          <Button 
            className={`wp-dev-toolkit-button ${config.dev_mode ? 'wp-dev-toolkit-button-secondary' : 'wp-dev-toolkit-button-primary'}`}
            icon={config.dev_mode ? 'no-alt' : 'yes-alt'}
            onClick={() => toggleTool('dev_mode')}
          >
            {config.dev_mode ? 'Disable Development Mode' : 'Enable Development Mode'}
          </Button>

          <Link to="/settings" className="wdt-no-underline">
            <Button 
              className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
              icon="admin-settings"
            >
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats section */}
      <div className="wp-dev-toolkit-dashboard-stats">
        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon amber">
            <Dashicon icon="warning" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Errors Logged</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">
              {isLoadingStats ? <Spinner /> : stats.errorCount}
            </div>
            <div className="wdt-mt-2">
              <Link to="/error-log" className="wdt-text-blue-600 wdt-text-sm wdt-flex wdt-items-center wdt-gap-1">
                <span>View error log</span>
                <Dashicon icon="arrow-right-alt2" size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon blue">
            <Dashicon icon="database" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Database Queries</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">
              {isLoadingStats ? <Spinner /> : stats.queryCount}
            </div>
            <div className="wdt-mt-2">
              <Link to="/query-monitor" className="wdt-text-blue-600 wdt-text-sm wdt-flex wdt-items-center wdt-gap-1">
                <span>Monitor queries</span>
                <Dashicon icon="arrow-right-alt2" size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon green">
            <Dashicon icon="admin-plugins" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Hooks Tracked</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">
              {isLoadingStats ? <Spinner /> : stats.hookCount}
            </div>
            <div className="wdt-mt-2">
              <Link to="/hook-inspector" className="wdt-text-blue-600 wdt-text-sm wdt-flex wdt-items-center wdt-gap-1">
                <span>Inspect hooks</span>
                <Dashicon icon="arrow-right-alt2" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="wp-dev-toolkit-dashboard-widgets">
        {/* Tools configuration */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <div className="wdt-flex wdt-items-center wdt-gap-2">
              <Dashicon icon="admin-tools" />
              <h2>Development Tools</h2>
            </div>
          </div>
          <div className="wp-dev-toolkit-card-body wdt-p-0">
            <table className="wdt-w-full">
              <thead className="wdt-bg-gray-50">
                <tr>
                  <th className="wdt-px-4 wdt-py-3 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider">Tool</th>
                  <th className="wdt-px-4 wdt-py-3 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider">Status</th>
                  <th className="wdt-px-4 wdt-py-3 wdt-text-left wdt-text-xs wdt-font-medium wdt-text-gray-500 wdt-uppercase wdt-tracking-wider wdt-w-32">Toggle</th>
                </tr>
              </thead>
              <tbody className="wdt-bg-white wdt-divide-y wdt-divide-gray-200">
                <tr>
                  <td className="wdt-px-4 wdt-py-3">
                    <div className="wdt-flex wdt-items-center">
                      <Dashicon icon="admin-tools" className="wdt-text-blue-500 wdt-mr-2" />
                      <div>
                        <div className="wdt-font-medium wdt-text-gray-900">Development Mode</div>
                        <div className="wdt-text-sm wdt-text-gray-500">Enable all debugging features</div>
                      </div>
                    </div>
                  </td>
                  <td className="wdt-px-4 wdt-py-3">
                    {getToolStatus('dev_mode')}
                  </td>
                  <td className="wdt-px-4 wdt-py-3">
                    <ToggleControl 
                      checked={config.dev_mode} 
                      onChange={() => toggleTool('dev_mode')} 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="wdt-px-4 wdt-py-3">
                    <div className="wdt-flex wdt-items-center">
                      <Dashicon icon="warning" className="wdt-text-amber-500 wdt-mr-2" />
                      <div>
                        <div className="wdt-font-medium wdt-text-gray-900">Error Logging</div>
                        <div className="wdt-text-sm wdt-text-gray-500">Track PHP errors and warnings</div>
                      </div>
                    </div>
                  </td>
                  <td className="wdt-px-4 wdt-py-3">
                    {getToolStatus('error_logging')}
                  </td>
                  <td className="wdt-px-4 wdt-py-3">
                    <ToggleControl 
                      checked={config.error_logging} 
                      onChange={() => toggleTool('error_logging')} 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="wdt-px-4 wdt-py-3">
                    <div className="wdt-flex wdt-items-center">
                      <Dashicon icon="database" className="wdt-text-blue-500 wdt-mr-2" />
                      <div>
                        <div className="wdt-font-medium wdt-text-gray-900">Query Monitoring</div>
                        <div className="wdt-text-sm wdt-text-gray-500">Track database queries</div>
                      </div>
                    </div>
                  </td>
                  <td className="wdt-px-4 wdt-py-3">
                    {getToolStatus('query_monitoring')}
                  </td>
                  <td className="wdt-px-4 wdt-py-3">
                    <ToggleControl 
                      checked={config.query_monitoring} 
                      onChange={() => toggleTool('query_monitoring')} 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="wdt-px-4 wdt-py-3">
                    <div className="wdt-flex wdt-items-center">
                      <Dashicon icon="admin-plugins" className="wdt-text-green-500 wdt-mr-2" />
                      <div>
                        <div className="wdt-font-medium wdt-text-gray-900">Hook Inspection</div>
                        <div className="wdt-text-sm wdt-text-gray-500">Monitor WordPress hooks</div>
                      </div>
                    </div>
                  </td>
                  <td className="wdt-px-4 wdt-py-3">
                    {getToolStatus('hook_inspection')}
                  </td>
                  <td className="wdt-px-4 wdt-py-3">
                    <ToggleControl 
                      checked={config.hook_inspection} 
                      onChange={() => toggleTool('hook_inspection')} 
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <div className="wdt-flex wdt-items-center wdt-gap-2">
              <Dashicon icon="performance" />
              <h2>Performance Metrics</h2>
            </div>
          </div>
          <div className="wp-dev-toolkit-card-body">
            {isLoadingStats ? (
              <div className="wdt-flex wdt-justify-center wdt-items-center wdt-h-40">
                <Spinner />
                <span className="wdt-ml-2">Loading performance data...</span>
              </div>
            ) : (
              <>
                <div className="wdt-grid wdt-grid-cols-2 wdt-gap-4 wdt-mb-6">
                  <div className="wdt-bg-gray-50 wdt-p-4 wdt-rounded-lg wdt-border wdt-border-gray-200">
                    <div className="wdt-text-sm wdt-text-gray-500 wdt-mb-1">Slow Queries</div>
                    <div className="wdt-text-2xl wdt-font-bold wdt-flex wdt-items-center wdt-gap-2">
                      {stats.slowQueries}
                      {stats.slowQueries > 0 && (
                        <span className="wdt-text-xs wdt-px-2 wdt-py-1 wdt-rounded-full wdt-bg-amber-100 wdt-text-amber-800">
                          Requires Optimization
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="wdt-bg-gray-50 wdt-p-4 wdt-rounded-lg wdt-border wdt-border-gray-200">
                    <div className="wdt-text-sm wdt-text-gray-500 wdt-mb-1">Average Query Time</div>
                    <div className="wdt-text-2xl wdt-font-bold">
                      {stats.avgQueryTime.toFixed(4)} sec
                    </div>
                  </div>
                </div>

                <div className="wdt-bg-gray-50 wdt-p-4 wdt-rounded-lg wdt-border wdt-border-gray-200 wdt-mb-6">
                  <div className="wdt-text-sm wdt-font-medium wdt-mb-2">Performance Tips</div>
                  <ul className="wdt-text-sm wdt-space-y-2 wdt-text-gray-700">
                    <li className="wdt-flex wdt-items-center wdt-gap-2">
                      <Dashicon icon="yes-alt" className="wdt-text-green-500" size={16} />
                      Use object caching to reduce database queries
                    </li>
                    <li className="wdt-flex wdt-items-center wdt-gap-2">
                      <Dashicon icon="yes-alt" className="wdt-text-green-500" size={16} />
                      Enable transient caching for API responses
                    </li>
                    <li className="wdt-flex wdt-items-center wdt-gap-2">
                      <Dashicon icon="yes-alt" className="wdt-text-green-500" size={16} />
                      Use the Query Monitor to identify slow queries
                    </li>
                  </ul>
                </div>

                <Link to="/query-monitor" className="wdt-no-underline">
                  <Button 
                    className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
                    icon="chart-bar"
                  >
                    View Query Monitor
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="wp-dev-toolkit-dashboard-widgets wdt-mt-6">
        {/* WP Debug Info */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <div className="wdt-flex wdt-items-center wdt-gap-2">
              <Dashicon icon="wordpress" />
              <h2>WordPress Debug Status</h2>
            </div>
          </div>
          <div className="wp-dev-toolkit-card-body">
            <div className="wdt-grid wdt-grid-cols-2 wdt-gap-4 wdt-mb-6">
              <div className="wdt-flex wdt-items-center wdt-gap-2">
                <div className={`wdt-rounded-full wdt-w-3 wdt-h-3 ${devModeState?.wp_debug ? 'wdt-bg-green-500' : 'wdt-bg-red-500'}`}></div>
                <div className="wdt-font-medium">WP_DEBUG</div>
              </div>
              <div className={devModeState?.wp_debug ? 'wdt-text-green-600 wdt-font-medium' : 'wdt-text-red-600 wdt-font-medium'}>
                {devModeState?.wp_debug ? 'Enabled' : 'Disabled'}
              </div>
              
              <div className="wdt-flex wdt-items-center wdt-gap-2">
                <div className={`wdt-rounded-full wdt-w-3 wdt-h-3 ${devModeState?.wp_debug_log ? 'wdt-bg-green-500' : 'wdt-bg-red-500'}`}></div>
                <div className="wdt-font-medium">WP_DEBUG_LOG</div>
              </div>
              <div className={devModeState?.wp_debug_log ? 'wdt-text-green-600 wdt-font-medium' : 'wdt-text-red-600 wdt-font-medium'}>
                {devModeState?.wp_debug_log ? 'Enabled' : 'Disabled'}
              </div>
              
              <div className="wdt-flex wdt-items-center wdt-gap-2">
                <div className={`wdt-rounded-full wdt-w-3 wdt-h-3 ${devModeState?.wp_debug_display ? 'wdt-bg-green-500' : 'wdt-bg-red-500'}`}></div>
                <div className="wdt-font-medium">WP_DEBUG_DISPLAY</div>
              </div>
              <div className={devModeState?.wp_debug_display ? 'wdt-text-green-600 wdt-font-medium' : 'wdt-text-red-600 wdt-font-medium'}>
                {devModeState?.wp_debug_display ? 'Enabled' : 'Disabled'}
              </div>

              <div className="wdt-flex wdt-items-center wdt-gap-2">
                <div className={`wdt-rounded-full wdt-w-3 wdt-h-3 ${devModeState?.script_debug ? 'wdt-bg-green-500' : 'wdt-bg-red-500'}`}></div>
                <div className="wdt-font-medium">SCRIPT_DEBUG</div>
              </div>
              <div className={devModeState?.script_debug ? 'wdt-text-green-600 wdt-font-medium' : 'wdt-text-red-600 wdt-font-medium'}>
                {devModeState?.script_debug ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            <div className="wdt-bg-blue-50 wdt-p-4 wdt-rounded-lg wdt-border wdt-border-blue-100 wdt-mb-6">
              <div className="wdt-flex wdt-items-start wdt-gap-3">
                <Dashicon icon="info-outline" className="wdt-text-blue-500 wdt-mt-0.5" />
                <div>
                  <div className="wdt-font-medium wdt-text-blue-800 wdt-mb-1">Debug Configuration</div>
                  <p className="wdt-text-sm wdt-text-blue-700">
                    These settings are configured in your wp-config.php file. For optimal development, 
                    it's recommended to enable WP_DEBUG and WP_DEBUG_LOG, but disable WP_DEBUG_DISPLAY 
                    in production environments.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
              onClick={fetchDevMode} 
              disabled={isSaving}
              icon="update"
            >
              {isSaving ? 'Refreshing...' : 'Refresh Debug Status'}
            </Button>
          </div>
        </div>

        {/* Environment Info */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <div className="wdt-flex wdt-items-center wdt-gap-2">
              <Dashicon icon="desktop" />
              <h2>Environment Information</h2>
            </div>
          </div>
          <div className="wp-dev-toolkit-card-body">
            {isLoadingSystem ? (
              <div className="wdt-flex wdt-justify-center wdt-items-center wdt-h-40">
                <Spinner />
                <span className="wdt-ml-2">Loading system information...</span>
              </div>
            ) : (
              <>
                <div className="wdt-grid wdt-grid-cols-2 wdt-gap-y-4 wdt-gap-x-6 wdt-mb-6">
                  <div>
                    <div className="wdt-text-sm wdt-text-gray-500 wdt-mb-1">WordPress Version</div>
                    <div className="wdt-font-medium">{systemInfo.wpVersion}</div>
                  </div>
                  <div>
                    <div className="wdt-text-sm wdt-text-gray-500 wdt-mb-1">PHP Version</div>
                    <div className="wdt-font-medium">{systemInfo.phpVersion}</div>
                  </div>
                  <div>
                    <div className="wdt-text-sm wdt-text-gray-500 wdt-mb-1">Web Server</div>
                    <div className="wdt-font-medium">{systemInfo.serverSoftware}</div>
                  </div>
                  <div>
                    <div className="wdt-text-sm wdt-text-gray-500 wdt-mb-1">PHP Memory Limit</div>
                    <div className="wdt-font-medium">{systemInfo.memoryLimit}</div>
                  </div>
                  <div>
                    <div className="wdt-text-sm wdt-text-gray-500 wdt-mb-1">Max Execution Time</div>
                    <div className="wdt-font-medium">{systemInfo.maxExecutionTime} seconds</div>
                  </div>
                  <div>
                    <div className="wdt-text-sm wdt-text-gray-500 wdt-mb-1">Plugin Version</div>
                    <div className="wdt-font-medium">{window.wpDevToolkit?.version || 'Unknown'}</div>
                  </div>
                </div>

                <div className="wdt-flex wdt-space-x-3">
                  <Button 
                    className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
                    onClick={fetchSystemInfo} 
                    disabled={isLoadingSystem}
                    icon="update"
                  >
                    Refresh System Info
                  </Button>
                  <Link to="/system-info">
                    <Button 
                      className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
                      icon="admin-generic"
                    >
                      View Full System Info
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
