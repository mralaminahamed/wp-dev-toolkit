import { useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { useState, useCallback } from 'react';
import { DevModeState, HookInspectorOptions, HookDetails, TerminalCommand, TerminalResponse, ToolSettings } from '../types';

export const useWPDevToolkit = () => {
  const config = useSelect(select => select('wp-dev-toolkit').getConfig(), []);
  const { setConfig, toggleTool } = useDispatch('wp-dev-toolkit');

  const isToolEnabled = (toolName: string) => {
    return useSelect(select => select('wp-dev-toolkit').isToolEnabled(toolName), []);
  };

  // Additional API hooks for each controller
  const [isLoading, setIsLoading] = useState(false);

  // Dev Mode API
  const getDevMode = useCallback(async (): Promise<DevModeState> => {
    setIsLoading(true);
    try {
      const response = await apiFetch({ path: 'wp-dev-toolkit/v1/dev-mode' });
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching dev mode:', error);
      throw error;
    }
  }, []);

  const updateDevMode = useCallback(async (enabled: boolean): Promise<DevModeState> => {
    setIsLoading(true);
    try {
      const response = await apiFetch({
        path: 'wp-dev-toolkit/v1/dev-mode',
        method: 'POST',
        data: { enabled },
      });
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      console.error('Error updating dev mode:', error);
      throw error;
    }
  }, []);

  // Hook Inspector API
  const getHooks = useCallback(async (options?: HookInspectorOptions): Promise<HookDetails[]> => {
    setIsLoading(true);
    try {
      const queryString = options ? `?type=${options.type}${options.search ? `&search=${options.search}` : ''}` : '';
      const response = await apiFetch({ path: `wp-dev-toolkit/v1/hook-inspector${queryString}` });
      setIsLoading(false);
      return response.hooks;
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching hooks:', error);
      throw error;
    }
  }, []);

  // Terminal API
  const executeCommand = useCallback(async (command: string): Promise<TerminalResponse> => {
    setIsLoading(true);
    try {
      const response = await apiFetch({
        path: 'wp-dev-toolkit/v1/terminal/execute',
        method: 'POST',
        data: { command },
      });
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      console.error('Error executing command:', error);
      throw error;
    }
  }, []);

  const getCommandHistory = useCallback(async (limit = 20): Promise<TerminalCommand[]> => {
    setIsLoading(true);
    try {
      const response = await apiFetch({ path: `wp-dev-toolkit/v1/terminal/history?limit=${limit}` });
      setIsLoading(false);
      return response.history;
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching command history:', error);
      throw error;
    }
  }, []);

  // Settings API
  const getToolSettings = useCallback(async (toolName: string): Promise<ToolSettings> => {
    setIsLoading(true);
    try {
      const response = await apiFetch({ path: `wp-dev-toolkit/v1/${toolName}/settings` });
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      console.error(`Error fetching ${toolName} settings:`, error);
      throw error;
    }
  }, []);

  const updateToolSettings = useCallback(async (toolName: string, settings: ToolSettings): Promise<ToolSettings> => {
    setIsLoading(true);
    try {
      const response = await apiFetch({
        path: `wp-dev-toolkit/v1/${toolName}/settings`,
        method: 'POST',
        data: settings,
      });
      setIsLoading(false);
      return response.data;
    } catch (error) {
      setIsLoading(false);
      console.error(`Error updating ${toolName} settings:`, error);
      throw error;
    }
  }, []);

  // Error Log API
  const getErrorLog = useCallback(async (): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await apiFetch({ path: 'wp-dev-toolkit/v1/error-log' });
      setIsLoading(false);
      return response.log_content || '';
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching error log:', error);
      throw error;
    }
  }, []);

  const clearErrorLog = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiFetch({
        path: 'wp-dev-toolkit/v1/error-log',
        method: 'DELETE',
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error clearing error log:', error);
      throw error;
    }
  }, []);

  return {
    config,
    setConfig,
    toggleTool,
    isToolEnabled,
    isLoading,
    devMode: {
      get: getDevMode,
      update: updateDevMode,
    },
    hooks: {
      get: getHooks,
    },
    terminal: {
      execute: executeCommand,
      getHistory: getCommandHistory,
    },
    toolSettings: {
      get: getToolSettings,
      update: updateToolSettings,
    },
    errorLog: {
      get: getErrorLog,
      clear: clearErrorLog,
    },
  };
};
