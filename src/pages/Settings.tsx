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
import { Input } from "@/components/ui/input";
import { STORE_NAME as SETTINGS_STORE } from "@/stores/settings/constants";

interface Settings {
  dev_mode: boolean;
  log_level: string;
  error_logging: boolean;
  query_monitoring: boolean;
  hook_inspection: boolean;
  max_log_entries: number;
  log_retention_days: number;
}

// Helper component for toggle switches
const ToggleSwitch: React.FC<{
  label: string;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, help, checked, onChange }) => (
  <label className="wdt:flex wdt:items-center wdt:justify-between wdt:p-3 wdt:border wdt:border-gray-200 wdt:rounded-lg wdt:bg-white">
    <div>
      <div className="wdt:font-medium wdt:text-gray-900">{label}</div>
      {help && <div className="wdt:text-sm wdt:text-gray-500">{help}</div>}
    </div>
    <button
      type="button"
      className={`wdt:relative wdt:inline-flex wdt:h-6 wdt:w-11 wdt:items-center wdt:rounded-full wdt:transition-colors wdt:focus:outline-none wdt:focus:ring-2 wdt:focus:ring-blue-500 wdt:focus:ring-offset-2 ${
        checked ? "wdt:bg-blue-600" : "wdt:bg-gray-200"
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`wdt:inline-block wdt:h-4 wdt:w-4 wdt:transform wdt:rounded-full wdt:bg-white wdt:transition-transform ${
          checked ? "wdt:translate-x-6" : "wdt:translate-x-1"
        }`}
      />
    </button>
  </label>
);

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
    error_logging: true,
    query_monitoring: true,
    hook_inspection: true,
    log_level: "all",
    max_log_entries: 100,
    log_retention_days: 30,
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
          <div className="wdt:animate-spin wdt:rounded-full wdt:h-8 wdt:w-8 wdt:border-b-2 wdt:border-blue-600"></div>
          <span className="wdt:ml-2">Loading settings...</span>
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
              <label className="wdt:flex wdt:items-center wdt:justify-between wdt:p-3 wdt:border wdt:border-gray-200 wdt:rounded-lg wdt:bg-white">
                <div>
                  <div className="wdt:font-medium wdt:text-gray-900">
                    Development Mode
                  </div>
                  <div className="wdt:text-sm wdt:text-gray-500">
                    Enable development mode features across all tools
                  </div>
                </div>
                <button
                  type="button"
                  className={`wdt:relative wdt:inline-flex wdt:h-6 wdt:w-11 wdt:items-center wdt:rounded-full wdt:transition-colors wdt:focus:outline-none wdt:focus:ring-2 wdt:focus:ring-blue-500 wdt:focus:ring-offset-2 ${
                    settings.dev_mode ? "wdt:bg-blue-600" : "wdt:bg-gray-200"
                  }`}
                  onClick={() => updateSetting("dev_mode", !settings.dev_mode)}
                >
                  <span
                    className={`wdt:inline-block wdt:h-4 wdt:w-4 wdt:transform wdt:rounded-full wdt:bg-white wdt:transition-transform ${
                      settings.dev_mode
                        ? "wdt:translate-x-6"
                        : "wdt:translate-x-1"
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="wdt:space-y-2">
              <label className="wdt:block">
                <span className="wdt:text-sm wdt:font-medium wdt:text-gray-700">
                  Log Level
                </span>
                <select
                  value={settings.log_level}
                  onChange={(e) => updateSetting("log_level", e.target.value)}
                  className="wdt:mt-1 wdt:block wdt:w-full wdt:px-3 wdt:py-2 wdt:border wdt:border-gray-300 wdt:rounded-md wdt:shadow-sm wdt:focus:outline-none wdt:focus:ring-blue-500 wdt:focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="error">Errors Only</option>
                  <option value="warning">Warnings & Errors</option>
                  <option value="notice">Notices & Above</option>
                  <option value="none">None</option>
                </select>
                <span className="wdt:text-sm wdt:text-gray-500">
                  Control which log messages are displayed
                </span>
              </label>
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
              <ToggleSwitch
                label="Error Logger"
                checked={settings.error_logging}
                onChange={(value) => updateSetting("error_logging", value)}
                help="Enable error logging functionality"
              />
            </div>

            <div className="wdt:space-y-2">
              <ToggleSwitch
                label="Query Monitor"
                checked={settings.query_monitoring}
                onChange={(value) => updateSetting("query_monitoring", value)}
                help="Enable database query monitoring"
              />
            </div>

            <div className="wdt:space-y-2">
              <ToggleSwitch
                label="Hook Inspector"
                checked={settings.hook_inspection}
                onChange={(value) => updateSetting("hook_inspection", value)}
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
              <label className="wdt:block">
                <span className="wdt:text-sm wdt:font-medium wdt:text-gray-700">
                  Maximum Log Entries
                </span>
                <input
                  type="range"
                  min={10}
                  max={1000}
                  step={10}
                  value={settings.max_log_entries}
                  onChange={(e) =>
                    updateSetting("max_log_entries", parseInt(e.target.value))
                  }
                  className="wdt:mt-1 wdt:block wdt:w-full"
                />
                <div className="wdt:flex wdt:justify-between wdt:text-sm wdt:text-gray-500">
                  <span>10</span>
                  <span>{settings.max_log_entries}</span>
                  <span>1000</span>
                </div>
                <span className="wdt:text-sm wdt:text-gray-500">
                  Number of log entries to keep in memory
                </span>
              </label>
            </div>

            <div className="wdt:space-y-2">
              <label className="wdt:block">
                <span className="wdt:text-sm wdt:font-medium wdt:text-gray-700">
                  Log Retention (days)
                </span>
                <input
                  type="range"
                  min={1}
                  max={90}
                  step={1}
                  value={settings.log_retention_days}
                  onChange={(e) =>
                    updateSetting(
                      "log_retention_days",
                      parseInt(e.target.value),
                    )
                  }
                  className="wdt:mt-1 wdt:block wdt:w-full"
                />
                <div className="wdt:flex wdt:justify-between wdt:text-sm wdt:text-gray-500">
                  <span>1</span>
                  <span>{settings.log_retention_days}</span>
                  <span>90</span>
                </div>
                <span className="wdt:text-sm wdt:text-gray-500">
                  Days to retain log files before cleanup
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="wdt:flex wdt:space-x-4">
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
        <Button onClick={resetSettings} disabled={isSaving}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default Settings;
