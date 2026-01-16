import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Wrench,
  BarChart3,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { useSelect, useDispatch } from "@wordpress/data";

import { Button } from "@/components/ui/button";
import { STORE_NAME as SETTINGS_STORE } from "@/stores/settings/constants";

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
  const { config, isResolving } = useSelect(
    (select: any) => ({
      config: select(SETTINGS_STORE).getConfig(),
      isResolving: (key: string) => select(SETTINGS_STORE).isResolving(key),
    }),
    [],
  );

  const { toggleTool } = useDispatch(SETTINGS_STORE);
  const [settings, setSettings] = useState<Settings>({
    dev_mode: false,
    error_logger: true,
    query_monitor: true,
    hook_inspector: true,
    log_level: "all",
    max_queries: 100,
    slow_query_threshold: 1.0,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${window.wpDevToolkit.apiUrl}/settings`, {
        headers: {
          "X-WP-Nonce": window.wpDevToolkit.nonce,
        },
      });
      const data = await response.json();

      if (data.success && data.data.settings) {
        setSettings(data.data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings");
    }
    setIsLoading(false);
  };

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    setSettings((prev) => ({
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": window.wpDevToolkit.nonce,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.data.message || "Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
    }

    setIsSaving(false);
  };

  const resetSettings = async () => {
    if (
      !confirm("Are you sure you want to reset all settings to default values?")
    ) {
      return;
    }

    setIsSaving(true);
    setSaved(false);
    setError(null);

    try {
      const response = await fetch(
        `${window.wpDevToolkit.apiUrl}/settings/reset`,
        {
          method: "POST",
          headers: {
            "X-WP-Nonce": window.wpDevToolkit.nonce,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setSettings(data.data.settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.data.message || "Failed to reset settings");
      }
    } catch (err) {
      console.error("Error resetting settings:", err);
      setError("Failed to reset settings");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="wdt:space-y-6 wdt:p-6">
        <div className="wdt:space-y-2">
          <h1 className="wdt:text-3xl wdt:font-bold">Settings</h1>
          <p className="wdt:text-muted-foreground">
            Configure the WordPress Development Toolkit
          </p>
        </div>
        <div className="wdt:flex wdt:justify-center wdt:items-center wdt:p-16 wdt:bg-white wdt:rounded-lg wdt:shadow-sm">
          <Spinner /> <span className="wdt:ml-2">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="wdt:space-y-6 wdt:p-6">
      <div className="wdt:space-y-2">
        <h1 className="wdt:text-3xl wdt:font-bold">Settings</h1>
        <p className="wdt:text-muted-foreground">
          Configure the WordPress Development Toolkit
        </p>
      </div>

      {saved && (
        <div className="wdt:bg-green-50 wdt:border wdt:border-green-200 wdt:text-green-800 wdt:rounded-lg wdt:p-4 wdt:mb-6 wdt:flex wdt:items-start">
          <CheckCircle className="wdt:text-green-500 wdt:mr-3 wdt:mt-0.5" />
          <div>
            <h3 className="wdt:font-medium">Success</h3>
            <p>Settings saved successfully!</p>
          </div>
        </div>
      )}

      {error && (
        <div className="wdt:bg-red-50 wdt:border wdt:border-red-200 wdt:text-red-800 wdt:rounded-lg wdt:p-4 wdt:mb-6 wdt:flex wdt:items-start">
          <AlertTriangle className="wdt:text-red-500 wdt:mr-3 wdt:mt-0.5" />
          <div>
            <h3 className="wdt:font-medium">Error</h3>
            <p>{error}</p>
            <Button
              className="wdt:mt-2 wdt:text-red-700 wdt:underline wdt:text-sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm wdt:mb-6">
        <div className="wdt:@container/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[.border-b]:pb-6">
          <div className="wdt:flex wdt:items-center">
            <SettingsIcon className="wdt:mr-2" />
            <h2 className="wdt:text-lg wdt:font-semibold">General Settings</h2>
          </div>
        </div>
        <div className="wdt:px-6">
          <div className="wdt:space-y-6">
            <h2>General Settings</h2>
          </div>
        </div>
        <div className="wdt:px-6">
          <div className="wdt:space-y-6">
            <div className="wdt:space-y-2">
              <ToggleControl
                label="Development Mode"
                checked={settings.dev_mode}
                onChange={(value) => updateSetting("dev_mode", value)}
                help="Enable development mode features across all tools"
              />
            </div>

            <div className="wdt:space-y-2">
              <SelectControl
                label="Log Level"
                value={settings.log_level}
                options={[
                  { label: "All", value: "all" },
                  { label: "Errors Only", value: "error" },
                  { label: "Warnings & Errors", value: "warning" },
                  { label: "Notices & Above", value: "notice" },
                  { label: "Info & Above", value: "info" },
                ]}
                onChange={(value) => updateSetting("log_level", value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm wdt:mb-6">
        <div className="wdt:@container/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[.border-b]:pb-6">
          <div className="wdt:flex wdt:items-center">
            <Wrench className="wdt:mr-2" />
            <h2 className="wdt:text-lg wdt:font-semibold">Tool Settings</h2>
          </div>
        </div>
        <div className="wdt:px-6">
          <div className="wdt:space-y-6">
            <div className="wdt:space-y-2">
              <ToggleControl
                label="Error Logger"
                checked={settings.error_logger}
                onChange={(value) => updateSetting("error_logger", value)}
                help="Enable error logging functionality"
              />
            </div>

            <div className="wdt:space-y-2">
              <ToggleControl
                label="Query Monitor"
                checked={settings.query_monitor}
                onChange={(value) => updateSetting("query_monitor", value)}
                help="Enable database query monitoring"
              />
            </div>

            <div className="wdt:space-y-2">
              <ToggleControl
                label="Hook Inspector"
                checked={settings.hook_inspector}
                onChange={(value) => updateSetting("hook_inspector", value)}
                help="Enable WordPress hook inspection"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="wdt:bg-card wdt:text-card-foreground wdt:flex wdt:flex-col wdt:gap-6 wdt:rounded-xl wdt:border wdt:py-6 wdt:shadow-sm wdt:mb-6">
        <div className="wdt:@container/card-header wdt:grid wdt:auto-rows-min wdt:grid-rows-[auto_auto] wdt:items-start wdt:gap-2 wdt:px-6 wdt:has-data-[slot=card-action]:grid-cols-[1fr_auto] wdt:[.border-b]:pb-6">
          <div className="wdt:flex wdt:items-center">
            <BarChart3 className="wdt:mr-2" />
            <h2 className="wdt:text-lg wdt:font-semibold">
              Performance Settings
            </h2>
          </div>
        </div>
        <div className="wdt:px-6">
          <div className="wdt:space-y-6">
            <div className="wdt:space-y-2">
              <RangeControl
                label="Maximum Queries to Log"
                value={settings.max_queries}
                onChange={(value) => updateSetting("max_queries", value || 100)}
                min={10}
                max={1000}
                step={10}
                help="Number of database queries to keep in memory"
              />
            </div>

            <div className="wdt:space-y-2">
              <RangeControl
                label="Slow Query Threshold (seconds)"
                value={settings.slow_query_threshold}
                onChange={(value) =>
                  updateSetting("slow_query_threshold", value || 1.0)
                }
                min={0.1}
                max={10.0}
                step={0.1}
                help="Queries taking longer than this will be highlighted"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="wdt:flex wdt:space-x-4">
        <Button onClick={saveSettings} disabled={isSaving} icon="yes">
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
        <Button onClick={resetSettings} disabled={isSaving} icon="update">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default Settings;
