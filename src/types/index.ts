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
