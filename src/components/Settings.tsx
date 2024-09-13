import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, ToggleControl, SelectControl, RangeControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

interface Settings {
  dev_mode: boolean;
  error_logging: boolean;
  query_monitoring: boolean;
  hook_inspection: boolean;
  log_level: string;
  max_queries: number;
  slow_query_threshold: number;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    dev_mode: false,
    error_logging: true,
    query_monitoring: true,
    hook_inspection: true,
    log_level: 'all',
    max_queries: 100,
    slow_query_threshold: 1.0,
  });

  useEffect(() => {
    apiFetch({ path: 'wp-dev-toolkit/v1/settings' }).then((response: any) => {
      setSettings(response.data.settings);
    });
  }, []);

  const updateSetting = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    apiFetch({
      path: 'wp-dev-toolkit/v1/settings',
      method: 'POST',
      data: { settings: { [key]: value } },
    });
  };

  return (
    <Card>
      <CardHeader>
        <h2>WP Dev Toolkit Settings</h2>
      </CardHeader>
      <CardBody>
        <ToggleControl label="Development Mode" checked={settings.dev_mode} onChange={value => updateSetting('dev_mode', value)} />
        <ToggleControl label="Error Logging" checked={settings.error_logging} onChange={value => updateSetting('error_logging', value)} />
        <ToggleControl label="Query Monitoring" checked={settings.query_monitoring} onChange={value => updateSetting('query_monitoring', value)} />
        <ToggleControl label="Hook Inspection" checked={settings.hook_inspection} onChange={value => updateSetting('hook_inspection', value)} />
        <SelectControl
          label="Log Level"
          value={settings.log_level}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Error', value: 'error' },
            { label: 'Warning', value: 'warning' },
            { label: 'Notice', value: 'notice' },
            { label: 'Info', value: 'info' },
          ]}
          onChange={value => updateSetting('log_level', value)}
        />
        <RangeControl label="Max Queries to Display" value={settings.max_queries} onChange={value => updateSetting('max_queries', value)} min={10} max={500} />
        <RangeControl label="Slow Query Threshold (seconds)" value={settings.slow_query_threshold} onChange={value => updateSetting('slow_query_threshold', value)} min={0.1} max={5} step={0.1} />
      </CardBody>
    </Card>
  );
};

export default Settings;
