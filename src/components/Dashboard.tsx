import apiFetch from '@wordpress/api-fetch';
import { ToggleControl, Button, Spinner, Dashicon } from '@wordpress/components';
import React, { useEffect, useState } from 'react';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { DevModeState, ErrorLogResponse, QueryResponse, HookResponse } from '@/types/index';

interface Stats {
  errorCount: number;
  queryCount: number;
  hookCount: number;
}

const Dashboard: React.FC = () => {
  const { config, setConfig, toggleTool, devMode } = useWPDevToolkit();
  const [devModeState, setDevModeState] = useState<DevModeState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<Stats>({ errorCount: 0, queryCount: 0, hookCount: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    fetchDevMode();
    fetchStats();
  }, []);

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

      // Fetch hook stats
      const hooks = await apiFetch<HookResponse>({ 
        path: 'wp-dev-toolkit/v1/hooks' 
      });
      
      const hookCount = hooks?.summary?.total_hooks || 0;

      setStats({
        errorCount,
        queryCount,
        hookCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setIsLoadingStats(false);
  };

  return (
    <div className="wp-dev-toolkit-dashboard">
      <div className="wp-dev-toolkit-page-header">
        <h1>Dashboard</h1>
        <p>Overview of your WordPress development environment</p>
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
          </div>
        </div>

        <div className="wp-dev-toolkit-dashboard-stat">
          <div className="wp-dev-toolkit-dashboard-stat-icon blue">
            <Dashicon icon="database" />
          </div>
          <div className="wp-dev-toolkit-dashboard-stat-content">
            <div className="wp-dev-toolkit-dashboard-stat-title">Queries Monitored</div>
            <div className="wp-dev-toolkit-dashboard-stat-value">
              {isLoadingStats ? <Spinner /> : stats.queryCount}
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
          </div>
        </div>
      </div>

      <div className="wp-dev-toolkit-dashboard-widgets">
        {/* Tools configuration */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <h2>Tool Configuration</h2>
          </div>
          <div className="wp-dev-toolkit-card-body">
            <div className="space-y-4">
              <ToggleControl 
                label="Development Mode" 
                help="Enable/disable development mode"
                checked={config.dev_mode} 
                onChange={() => toggleTool('dev_mode')} 
              />
              <ToggleControl 
                label="Error Logging" 
                help="Log PHP errors and warnings"
                checked={config.error_logging} 
                onChange={() => toggleTool('error_logging')} 
              />
              <ToggleControl 
                label="Query Monitoring" 
                help="Track database queries"
                checked={config.query_monitoring} 
                onChange={() => toggleTool('query_monitoring')} 
              />
              <ToggleControl 
                label="Hook Inspection" 
                help="Monitor WordPress hooks"
                checked={config.hook_inspection} 
                onChange={() => toggleTool('hook_inspection')} 
              />
            </div>
          </div>
        </div>

        {/* WP Debug Info */}
        <div className="wp-dev-toolkit-card">
          <div className="wp-dev-toolkit-card-header">
            <h2>WordPress Debug Status</h2>
          </div>
          <div className="wp-dev-toolkit-card-body">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className={`rounded-full w-3 h-3 ${devModeState?.wp_debug ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="font-medium">WP_DEBUG</div>
              </div>
              <div className={devModeState?.wp_debug ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {devModeState?.wp_debug ? 'Enabled' : 'Disabled'}
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`rounded-full w-3 h-3 ${devModeState?.wp_debug_log ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="font-medium">WP_DEBUG_LOG</div>
              </div>
              <div className={devModeState?.wp_debug_log ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {devModeState?.wp_debug_log ? 'Enabled' : 'Disabled'}
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`rounded-full w-3 h-3 ${devModeState?.wp_debug_display ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="font-medium">WP_DEBUG_DISPLAY</div>
              </div>
              <div className={devModeState?.wp_debug_display ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {devModeState?.wp_debug_display ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                className="wp-dev-toolkit-button wp-dev-toolkit-button-primary"
                onClick={fetchConfig} 
                disabled={isSaving}
                icon="refresh"
              >
                {isSaving ? 'Refreshing...' : 'Refresh Configuration'}
              </Button>
              <Button 
                className="wp-dev-toolkit-button wp-dev-toolkit-button-secondary"
                onClick={fetchStats} 
                disabled={isLoadingStats}
                icon="chart-bar"
              >
                {isLoadingStats ? 'Refreshing...' : 'Refresh Stats'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
