/**
 * WP Dev Toolkit stores.
 *
 * Registers all individual stores with WordPress data registry.
 *
 * @since 1.0.0
 */

// Import and register individual stores
import './settings';
import './error-log';
import './query-monitor';
import './hook-inspector';
import './system-info';
import './terminal';
import './dev-mode';

// Re-export store names and stores for external use
export { STORE_NAME as SETTINGS_STORE_NAME } from './settings';
export { STORE_NAME as ERROR_LOG_STORE_NAME } from './error-log';
export { STORE_NAME as QUERY_MONITOR_STORE_NAME } from './query-monitor';
export { STORE_NAME as HOOK_INSPECTOR_STORE_NAME } from './hook-inspector';
export { STORE_NAME as SYSTEM_INFO_STORE_NAME } from './system-info';
export { STORE_NAME as TERMINAL_STORE_NAME } from './terminal';
export { STORE_NAME as DEV_MODE_STORE_NAME } from './dev-mode';
