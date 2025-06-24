import apiFetch from '@wordpress/api-fetch';
import { ToggleControl, Button, Card, CardBody, Spinner } from '@wordpress/components';
import React, { useEffect, useState } from 'react';

import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { DevModeState } from '@/types';

interface Config {
  dev_mode: boolean;
  error_logging: boolean;
  query_monitoring: boolean;
  hook_inspection: boolean;
}

const Dashboard: React.FC = () => {
  const { config, setConfig, isLoading, devMode } = useWPDevToolkit();
  const [devModeState, setDevModeState] = useState<DevModeState | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDevMode();
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

  const updateConfig = async (toolName: keyof Config) => {
    setIsSaving(true);
    try {
      const newValue = !config[toolName];
      const updatedConfig = await apiFetch<Config>({
        path: 'wp-dev-toolkit/v1/config',
        method: 'POST',
        data: { [toolName]: newValue },
      });
      toggleTool(toolName);
      setConfig(updatedConfig);
    } catch (error) {
      console.error('Error updating config:', error);
    }
    setIsSaving(false);
  };

  return (
    <div className="wp-dev-toolkit-dashboard">
      <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      <div className="space-y-4">
        <ToggleControl label="Development Mode" checked={config.dev_mode} onChange={() => updateConfig('dev_mode')} />
        <ToggleControl label="Error Logging" checked={config.error_logging} onChange={() => updateConfig('error_logging')} />
        <ToggleControl label="Query Monitoring" checked={config.query_monitoring} onChange={() => updateConfig('query_monitoring')} />
        <ToggleControl label="Hook Inspection" checked={config.hook_inspection} onChange={() => updateConfig('hook_inspection')} />
      </div>
      <div className="mt-6">
        <Button isPrimary onClick={fetchConfig} disabled={isSaving}>
          Refresh Configuration
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
