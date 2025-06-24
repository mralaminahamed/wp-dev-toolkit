import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, ToggleControl, SelectControl, RangeControl, Button, Notice, Spinner } from '@wordpress/components';
import { useWPDevToolkit } from '@/hooks/useWPDevToolkit';
import { ToolSettings } from '@/types';

interface Settings {
  dev_mode: boolean;
  error_logger: boolean;
  query_monitor: boolean;
  hook_inspector: boolean;
  log_level: string;
  max_queries: number;
  slow_query_threshold: number;
}

const Settings: React.FC = () => {
  const { toolSettings, isLoading } = useWPDevToolkit();
  const [settings, setSettings] = useState<Settings>({
    dev_mode: false,
    error_logger: true,
    query_monitor: true,
    hook_inspector: true,
    log_level: 'all',
    max_queries: 100,
    slow_query_threshold: 1.0,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${window.wpDevToolkit.apiUrl}/settings`, {
        headers: {
          'X-WP-Nonce': window.wpDevToolkit.nonce
        }
      });
      const data = await response.json();

      if (data.success && data.data.settings) {
        setSettings(data.data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaved(false);
    setError(null);

    try {
      const response = await fetch(`${window.wpDevToolkit.apiUrl}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpDevToolkit.nonce
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    }

    setIsSaving(false);
  };

  const resetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to default values?')) {
      return;
    }

    setIsSaving(true);
    setSaved(false);
    setError(null);

    try {
      const response = await fetch(`${window.wpDevToolkit.apiUrl}/settings/reset`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': window.wpDevToolkit.nonce
        }
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data.settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.data.message || 'Failed to reset settings');
      }
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('Failed to reset settings');
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="wp-dev-toolkit-settings">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      {saved && (
        <Notice status="success" isDismissible={false} className="mb-4">
          Settings saved successfully!
        </Notice>
      )}

      {error && (
        <Notice status="error" onRemove={() => setError(null)} className="mb-4">
          {error}
        </Notice>
      )}

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-lg font-medium">General Settings</h3>
        </CardHeader>
        <CardBody>
          <ToggleControl
            label="Development Mode"
            checked={settings.dev_mode}
            onChange={value => updateSetting('dev_mode', value)}
            help="Enable development mode features across all tools"
          />

          <SelectControl
            label="Log Level"
            value={settings.log_level}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Errors Only', value: 'error' },
              { label: 'Warnings & Errors', value: 'warning' },
              { label: 'Notices & Above', value: 'notice' },
              { label: 'Info & Above', value: 'info' }
            ]}
            onChange={value => updateSetting('log_level', value)}
          />
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-lg font-medium">Tool Settings</h3>
        </CardHeader>
        <CardBody>
          <ToggleControl
            label="Error Logger"
            checked={settings.error_logger}
            onChange={value => updateSetting('error_logger', value)}
            help="Enable error logging functionality"
          />

          <ToggleControl
            label="Query Monitor"
            checked={settings.query_monitor}
            onChange={value => updateSetting('query_monitor', value)}
            help="Enable database query monitoring"
          />

          <ToggleControl
            label="Hook Inspector"
            checked={settings.hook_inspector}
            onChange={value => updateSetting('hook_inspector', value)}
            help="Enable WordPress hook inspection"
          />
        </CardBody>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-lg font-medium">Performance Settings</h3>
        </CardHeader>
        <CardBody>
          <RangeControl
            label="Maximum Queries to Log"
            value={settings.max_queries}
            onChange={value => updateSetting('max_queries', value || 100)}
            min={10}
            max={1000}
            step={10}
            help="Number of database queries to keep in memory"
          />

          <RangeControl
            label="Slow Query Threshold (seconds)"
            value={settings.slow_query_threshold}
            onChange={value => updateSetting('slow_query_threshold', value || 1.0)}
            min={0.1}
            max={10.0}
            step={0.1}
            help="Queries taking longer than this will be highlighted"
          />
        </CardBody>
      </Card>

      <div className="flex space-x-4">
        <Button isPrimary onClick={saveSettings} isBusy={isSaving} disabled={isSaving}>
          Save Settings
        </Button>
        <Button isSecondary onClick={resetSettings} disabled={isSaving}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default Settings;
