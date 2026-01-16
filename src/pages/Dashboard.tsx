import apiFetch from '@wordpress/api-fetch';
import { ToggleControl, Button, Spinner, Dashicon } from '@wordpress/components';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { DevModeState, ErrorLogResponse, QueryResponse, HookResponse, SystemInfoResponse, ApiResponse } from '@/types';

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
    avgQueryTime: 0,
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    wpVersion: '',
    phpVersion: '',
    serverSoftware: '',
    memoryLimit: '',
    maxExecutionTime: '',
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
          maxExecutionTime: response.data.server?.php_max_execution_time || '',
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
        path: 'wp-dev-toolkit/v1/error-log',
      });

      const errorCount = errorLog?.log_content ? (errorLog.log_content.match(/\[ERROR\]/g) || []).length : 0;

      // Fetch query stats
      const queries = await apiFetch<QueryResponse>({
        path: 'wp-dev-toolkit/v1/queries',
      });

      const queryCount = queries?.summary?.total_queries || 0;
      const totalQueryTime = queries?.summary?.total_time || 0;
      const avgQueryTime = queryCount > 0 ? totalQueryTime / queryCount : 0;

      // Count slow queries (> 0.1 seconds)
      const slowQueries = queries?.queries?.filter(q => q.time > 0.1).length || 0;

      // Fetch hook stats
      const hooks = await apiFetch<HookResponse>({
        path: 'wp-dev-toolkit/v1/hooks',
      });

      const hookCount = hooks?.summary?.total_hooks || 0;

      setStats({
        errorCount,
        queryCount,
        hookCount,
        slowQueries,
        avgQueryTime,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setIsLoadingStats(false);
  };

  const getToolStatus = (toolName: string): JSX.Element => {
    const isActive = activeTools.includes(toolName);
    return (
      <span className={`wdtpx-2 wdtpy-1 wdtrounded-full wdttext-xs wdtfont-medium ${isActive ? 'wdtbg-green-100 wdttext-green-800' : 'wdtbg-gray-100 wdttext-gray-800'}`}>
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
      <div className="wdtmb-8 wdtbg-white wdtrounded-lg wdtshadow-sm wdtp-4">
        <div className="wdtflex wdtflex-wrap wdtgap-3">
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

          <Link to="/settings" className="wdtno-underline">
            <Button className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary" icon="admin-settings">
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
            <div className="wp-dev-toolkit-dashboard-stat-value">{isLoadingStats ? <Spinner /> : stats.errorCount}</div>
            <div className="wdtmt-2">
              <Link to="/error-log" className="wdttext-blue-600 wdttext-sm wdtflex wdtitems-center wdtgap-1">
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
            <div className="wp-dev-toolkit-dashboard-stat-value">{isLoadingStats ? <Spinner /> : stats.queryCount}</div>
            <div className="wdtmt-2">
              <Link to="/query-monitor" className="wdttext-blue-600 wdttext-sm wdtflex wdtitems-center wdtgap-1">
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
            <div className="wp-dev-toolkit-dashboard-stat-value">{isLoadingStats ? <Spinner /> : stats.hookCount}</div>
            <div className="wdtmt-2">
              <Link to="/hook-inspector" className="wdttext-blue-600 wdttext-sm wdtflex wdtitems-center wdtgap-1">
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
            <div className="wdtflex wdtitems-center wdtgap-2">
              <Dashicon icon="admin-tools" />
              <h2>Development Tools</h2>
            </div>
          </div>
          <div className="wp-dev-toolkit-card-body wdtp-0">
            <table className="wdtw-full">
              <thead className="wdtbg-gray-50">
                <tr>
                  <th className="wdtpx-4 wdtpy-3 wdttext-left wdttext-xs wdtfont-medium wdttext-gray-500 wdtuppercase wdttracking-wider">Tool</th>
                  <th className="wdtpx-4 wdtpy-3 wdttext-left wdttext-xs wdtfont-medium wdttext-gray-500 wdtuppercase wdttracking-wider">Status</th>
                  <th className="wdtpx-4 wdtpy-3 wdttext-left wdttext-xs wdtfont-medium wdttext-gray-500 wdtuppercase wdttracking-wider wdtw-32">Toggle</th>
                </tr>
              </thead>
              <tbody className="wdtbg-white wdtdivide-y wdtdivide-gray-200">
                <tr>
                  <td className="wdtpx-4 wdtpy-3">
                    <div className="wdtflex wdtitems-center">
                      <Dashicon icon="admin-tools" className="wdttext-blue-500 wdtmr-2" />
                      <div>
                        <div className="wdtfont-medium wdttext-gray-900">Development Mode</div>
                        <div className="wdttext-sm wdttext-gray-500">Enable all debugging features</div>
                      </div>
                    </div>
                  </td>
                  <td className="wdtpx-4 wdtpy-3">{getToolStatus('dev_mode')}</td>
                  <td className="wdtpx-4 wdtpy-3">
                    <ToggleControl checked={config.dev_mode} onChange={() => toggleTool('dev_mode')} />
                  </td>
                </tr>
                <tr>
                  <td className="wdtpx-4 wdtpy-3">
                    <div className="wdtflex wdtitems-center">
                      <Dashicon icon="warning" className="wdttext-amber-500 wdtmr-2" />
                      <div>
                        <div className="wdtfont-medium wdttext-gray-900">Error Logging</div>
                        <div className="wdttext-sm wdttext-gray-500">Track PHP errors and warnings</div>
                      </div>
                    </div>
                  </td>
                  <td className="wdtpx-4 wdtpy-3">{getToolStatus('error_logging')}</td>
                  <td className="wdtpx-4 wdtpy-3">
                    <ToggleControl checked={config.error_logging} onChange={() => toggleTool('error_logging')} />
                  </td>
                </tr>
                <tr>
                  <td className="wdtpx-4 wdtpy-3">
                    <div className="wdtflex wdtitems-center">
                      <Dashicon icon="database" className="wdttext-blue-500 wdtmr-2" />
                      <div>
                        <div className="wdtfont-medium wdttext-gray-900">Query Monitoring</div>
                        <div className="wdttext-sm wdttext-gray-500">Track database queries</div>
                      </div>
                    </div>
                  </td>
                  <td className="wdtpx-4 wdtpy-3">{getToolStatus('query_monitoring')}</td>
                  <td className="wdtpx-4 wdtpy-3">
                    <ToggleControl checked={config.query_monitoring} onChange={() => toggleTool('query_monitoring')} />
                  </td>
                </tr>
                <tr>
                  <td className="wdtpx-4 wdtpy-3">
                    <div className="wdtflex wdtitems-center">
                      <Dashicon icon="admin-plugins" className="wdttext-green-500 wdtmr-2" />
                      <div>
                        <div className="wdtfont-medium wdttext-gray-900">Hook Inspection</div>
                        <div className="wdttext-sm wdttext-gray-500">Monitor WordPress hooks</div>
                      </div>
                    </div>
                  </td>
                  <td className="wdtpx-4 wdtpy-3">{getToolStatus('hook_inspection')}</td>
                  <td className="wdtpx-4 wdtpy-3">
                    <ToggleControl checked={config.hook_inspection} onChange={() => toggleTool('hook_inspection')} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <div className="wdtflex wdtitems-center wdtgap-2">
              <Dashicon icon="performance" />
              <h2>Performance Metrics</h2>
            </div>
          </div>
          <div className="wp-dev-toolkit-card-body">
            {isLoadingStats ? (
              <div className="wdtflex wdtjustify-center wdtitems-center wdth-40">
                <Spinner />
                <span className="wdtml-2">Loading performance data...</span>
              </div>
            ) : (
              <>
                <div className="wdtgrid wdtgrid-cols-2 wdtgap-4 wdtmb-6">
                  <div className="wdtbg-gray-50 wdtp-4 wdtrounded-lg wdtborder wdtborder-gray-200">
                    <div className="wdttext-sm wdttext-gray-500 wdtmb-1">Slow Queries</div>
                    <div className="wdttext-2xl wdtfont-bold wdtflex wdtitems-center wdtgap-2">
                      {stats.slowQueries}
                      {stats.slowQueries > 0 && <span className="wdttext-xs wdtpx-2 wdtpy-1 wdtrounded-full wdtbg-amber-100 wdttext-amber-800">Requires Optimization</span>}
                    </div>
                  </div>
                  <div className="wdtbg-gray-50 wdtp-4 wdtrounded-lg wdtborder wdtborder-gray-200">
                    <div className="wdttext-sm wdttext-gray-500 wdtmb-1">Average Query Time</div>
                    <div className="wdttext-2xl wdtfont-bold">{stats.avgQueryTime.toFixed(4)} sec</div>
                  </div>
                </div>

                <div className="wdtbg-gray-50 wdtp-4 wdtrounded-lg wdtborder wdtborder-gray-200 wdtmb-6">
                  <div className="wdttext-sm wdtfont-medium wdtmb-2">Performance Tips</div>
                  <ul className="wdttext-sm wdtspace-y-2 wdttext-gray-700">
                    <li className="wdtflex wdtitems-center wdtgap-2">
                      <Dashicon icon="yes-alt" className="wdttext-green-500" size={16} />
                      Use object caching to reduce database queries
                    </li>
                    <li className="wdtflex wdtitems-center wdtgap-2">
                      <Dashicon icon="yes-alt" className="wdttext-green-500" size={16} />
                      Enable transient caching for API responses
                    </li>
                    <li className="wdtflex wdtitems-center wdtgap-2">
                      <Dashicon icon="yes-alt" className="wdttext-green-500" size={16} />
                      Use the Query Monitor to identify slow queries
                    </li>
                  </ul>
                </div>

                <Link to="/query-monitor" className="wdtno-underline">
                  <Button className="wp-dev-toolkit-button wp-dev-toolkit-button-primary" icon="chart-bar">
                    View Query Monitor
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="wp-dev-toolkit-dashboard-widgets wdtmt-6">
        {/* WP Debug Info */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <div className="wdtflex wdtitems-center wdtgap-2">
              <Dashicon icon="wordpress" />
              <h2>WordPress Debug Status</h2>
            </div>
          </div>
          <div className="wp-dev-toolkit-card-body">
            <div className="wdtgrid wdtgrid-cols-2 wdtgap-4 wdtmb-6">
              <div className="wdtflex wdtitems-center wdtgap-2">
                <div className={`wdtrounded-full wdtw-3 wdth-3 ${devModeState?.wp_debug ? 'wdtbg-green-500' : 'wdtbg-red-500'}`}></div>
                <div className="wdtfont-medium">WP_DEBUG</div>
              </div>
              <div className={devModeState?.wp_debug ? 'wdttext-green-600 wdtfont-medium' : 'wdttext-red-600 wdtfont-medium'}>{devModeState?.wp_debug ? 'Enabled' : 'Disabled'}</div>

              <div className="wdtflex wdtitems-center wdtgap-2">
                <div className={`wdtrounded-full wdtw-3 wdth-3 ${devModeState?.wp_debug_log ? 'wdtbg-green-500' : 'wdtbg-red-500'}`}></div>
                <div className="wdtfont-medium">WP_DEBUG_LOG</div>
              </div>
              <div className={devModeState?.wp_debug_log ? 'wdttext-green-600 wdtfont-medium' : 'wdttext-red-600 wdtfont-medium'}>{devModeState?.wp_debug_log ? 'Enabled' : 'Disabled'}</div>

              <div className="wdtflex wdtitems-center wdtgap-2">
                <div className={`wdtrounded-full wdtw-3 wdth-3 ${devModeState?.wp_debug_display ? 'wdtbg-green-500' : 'wdtbg-red-500'}`}></div>
                <div className="wdtfont-medium">WP_DEBUG_DISPLAY</div>
              </div>
              <div className={devModeState?.wp_debug_display ? 'wdttext-green-600 wdtfont-medium' : 'wdttext-red-600 wdtfont-medium'}>{devModeState?.wp_debug_display ? 'Enabled' : 'Disabled'}</div>

              <div className="wdtflex wdtitems-center wdtgap-2">
                <div className={`wdtrounded-full wdtw-3 wdth-3 ${devModeState?.script_debug ? 'wdtbg-green-500' : 'wdtbg-red-500'}`}></div>
                <div className="wdtfont-medium">SCRIPT_DEBUG</div>
              </div>
              <div className={devModeState?.script_debug ? 'wdttext-green-600 wdtfont-medium' : 'wdttext-red-600 wdtfont-medium'}>{devModeState?.script_debug ? 'Enabled' : 'Disabled'}</div>
            </div>

            <div className="wdtbg-blue-50 wdtp-4 wdtrounded-lg wdtborder wdtborder-blue-100 wdtmb-6">
              <div className="wdtflex wdtitems-start wdtgap-3">
                <Dashicon icon="info-outline" className="wdttext-blue-500 wdtmt-0.5" />
                <div>
                  <div className="wdtfont-medium wdttext-blue-800 wdtmb-1">Debug Configuration</div>
                  <p className="wdttext-sm wdttext-blue-700">
                    These settings are configured in your wp-config.php file. For optimal development, it's recommended to enable WP_DEBUG and WP_DEBUG_LOG, but disable WP_DEBUG_DISPLAY in production
                    environments.
                  </p>
                </div>
              </div>
            </div>

            <Button className="wp-dev-toolkit-button wp-dev-toolkit-button-primary" onClick={fetchDevMode} disabled={isSaving} icon="update">
              {isSaving ? 'Refreshing...' : 'Refresh Debug Status'}
            </Button>
          </div>
        </div>

        {/* Environment Info */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <div className="wdtflex wdtitems-center wdtgap-2">
              <Dashicon icon="desktop" />
              <h2>Environment Information</h2>
            </div>
          </div>
          <div className="wp-dev-toolkit-card-body">
            {isLoadingSystem ? (
              <div className="wdtflex wdtjustify-center wdtitems-center wdth-40">
                <Spinner />
                <span className="wdtml-2">Loading system information...</span>
              </div>
            ) : (
              <>
                <div className="wdtgrid wdtgrid-cols-2 wdtgap-y-4 wdtgap-x-6 wdtmb-6">
                  <div>
                    <div className="wdttext-sm wdttext-gray-500 wdtmb-1">WordPress Version</div>
                    <div className="wdtfont-medium">{systemInfo.wpVersion}</div>
                  </div>
                  <div>
                    <div className="wdttext-sm wdttext-gray-500 wdtmb-1">PHP Version</div>
                    <div className="wdtfont-medium">{systemInfo.phpVersion}</div>
                  </div>
                  <div>
                    <div className="wdttext-sm wdttext-gray-500 wdtmb-1">Web Server</div>
                    <div className="wdtfont-medium">{systemInfo.serverSoftware}</div>
                  </div>
                  <div>
                    <div className="wdttext-sm wdttext-gray-500 wdtmb-1">PHP Memory Limit</div>
                    <div className="wdtfont-medium">{systemInfo.memoryLimit}</div>
                  </div>
                  <div>
                    <div className="wdttext-sm wdttext-gray-500 wdtmb-1">Max Execution Time</div>
                    <div className="wdtfont-medium">{systemInfo.maxExecutionTime} seconds</div>
                  </div>
                  <div>
                    <div className="wdttext-sm wdttext-gray-500 wdtmb-1">Plugin Version</div>
                    <div className="wdtfont-medium">{window.wpDevToolkit?.version || 'Unknown'}</div>
                  </div>
                </div>

                <div className="wdtflex wdtspace-x-3">
                  <Button className="wp-dev-toolkit-button wp-dev-toolkit-button-primary" onClick={fetchSystemInfo} disabled={isLoadingSystem} icon="update">
                    Refresh System Info
                  </Button>
                  <Link to="/system-info">
                    <Button className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary" icon="admin-generic">
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
