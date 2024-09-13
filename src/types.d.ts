declare module '@wordpress/components';

declare module 'wp-dev-toolkit' {
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
}

declare module '@wordpress/api-fetch' {
  interface ApiFetchOptions {
    path: string;
    method?: string;
    data?: never;
  }

  function apiFetch<T = never>(options: ApiFetchOptions): Promise<T>;

  export default apiFetch;
}
