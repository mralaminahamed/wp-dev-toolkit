import { Dispatch, SetStateAction } from 'react';

export interface Query {
  sql: string;
  time: number;
  stackTrace?: string;
}

export interface Hook {
  name: string;
  callback: string;
  priority: number;
}

export interface ErrorLogEntry {
  timestamp: string;
  message: string;
  type: string;
  file?: string;
  line?: number;
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
  data: T;
  status: number;
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
