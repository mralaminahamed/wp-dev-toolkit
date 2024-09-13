import apiFetch from '@wordpress/api-fetch';
import { ToggleControl, Button } from '@wordpress/components';
import React, { useState, useEffect } from 'react';

interface Config {
  dev_mode: boolean;
  error_logging: boolean;
  query_monitoring: boolean;
  hook_inspection: boolean;
}

const Dashboard: React.FC = () => {
  const [config, setConfig] = useState<Config>({
    dev_mode: false,
    error_logging: true,
    query_monitoring: true,
    hook_inspection: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await apiFetch({ path: 'wp-dev-toolkit/v1/config' });
      setConfig(response);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const updateConfig = async (newConfig: Partial<Config>) => {
    setIsSaving(true);
    try {
      const updatedConfig = await apiFetch({
        path: 'wp-dev-toolkit/v1/config',
        method: 'POST',
        data: newConfig,
      });
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
        <ToggleControl label="Development Mode" checked={config.dev_mode} onChange={value => updateConfig({ dev_mode: value })} />
        <ToggleControl label="Error Logging" checked={config.error_logging} onChange={value => updateConfig({ error_logging: value })} />
        <ToggleControl label="Query Monitoring" checked={config.query_monitoring} onChange={value => updateConfig({ query_monitoring: value })} />
        <ToggleControl label="Hook Inspection" checked={config.hook_inspection} onChange={value => updateConfig({ hook_inspection: value })} />
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
