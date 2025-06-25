import { Dispatch, SetStateAction } from 'react';

export interface Query {
  id: string;
  sql: string;
  time: number;
  caller?: string;
  backtrace?: string[];
}

export interface QueryResponse {
  queries: Query[];
  summary: {
    total_queries: number;
    total_time: number;
    avg_time: number;
  };
}

export interface Hook {
  name: string;
  type: 'action' | 'filter' | 'unknown';
  count: number;
  total_time: number;
  first_call: number;
  backtrace?: string[];
}

export interface HookResponse {
  hooks: Hook[];
  grouped_hooks: {
    action: Hook[];
    filter: Hook[];
    unknown: Hook[];
  };
  summary: {
    total_hooks: number;
    total_executions: number;
    total_time: number;
  };
}

export interface ErrorLogEntry {
  timestamp: string;
  message: string;
  type: string;
  file?: string;
  line?: number;
}

export interface ErrorLogResponse {
  log_content: string;
  log_file: string;
  file_size: number;
}

export interface SystemInfoResponse {
  wordpress: {
    version: string;
    site_url: string;
    home_url: string;
    is_multisite: boolean;
    debug_mode: boolean;
    memory_limit: string;
    table_prefix: string;
    active_theme: string;
    theme_version: string;
  };
  server: {
    php_version: string;
    mysql_version: string;
    server_software: string;
    os: string;
    max_execution_time: string;
    memory_limit: string;
    upload_max_filesize: string;
    post_max_size: string;
  };
  plugin: {
    name: string;
    version: string;
    author: string;
    plugin_uri: string;
    text_domain: string;
    domain_path: string;
  };
}

export interface PluginInfo {
  version: string;
  wp_version: string;
  php_version: string;
  debug_mode: boolean;
  debug_log: boolean;
  debug_display: boolean;
}

export interface DevModeState {
  enabled: boolean;
  wp_debug: boolean;
  wp_debug_log: boolean;
  wp_debug_display: boolean;
  config_updated?: boolean;
}

export interface HookInspectorOptions {
  type: 'all' | 'action' | 'filter';
  search: string;
}

export interface HookCallback {
  priority: number;
  function: string;
  file: string;
  line: number;
  accepted_args: number;
}

export interface HookDetails {
  name: string;
  type: 'action' | 'filter';
  callbacks: HookCallback[];
  callback_count: number;
}

export interface TerminalCommand {
  command: string;
  timestamp: number;
  executed_at: string;
}

export interface TerminalResponse {
  command: string;
  output: string;
  exit_code: number;
  executed_at: string;
}

export interface ToolSettings {
  enabled: boolean;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Config {
  dev_mode: boolean;
  error_logging: boolean;
  query_monitoring: boolean;
  hook_inspection: boolean;
  debug_bar_integration?: boolean;
  log_retention_days?: number;
  allowed_ip_addresses?: string[];
  excluded_hooks?: string[];
  excluded_queries?: string[];
  [key: string]: any;
}

export type SetState<T> = Dispatch<SetStateAction<T>>;

export interface DashboardProps {
  // Add any props specific to the Dashboard component
}

export interface ErrorLogProps {
  // Add any props specific to the ErrorLog component
}

export interface QueryMonitorProps {
  // Add any props specific to the QueryMonitor component
}

export interface HookInspectorProps {
  // Add any props specific to the HookInspector component
}

export interface SystemInfoProps {
  // Add any props specific to the SystemInfo component
}

export interface TerminalProps {
  // Add any props specific to the Terminal component
}

export interface SettingsProps {
  // Add any props specific to the Settings component
}
