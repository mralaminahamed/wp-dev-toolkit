import { useSelect, useDispatch } from '@wordpress/data';

import { STORE_NAME as SETTINGS_STORE_NAME } from '@/stores/settings';
import selectors from '@/stores/settings/selectors';
import settingsActions from '@/stores/settings/actions';

export const useWPDevToolkit = () => {
  const config = useSelect(select => selectors.getConfig(select), []);
  const { setConfig } = useDispatch(SETTINGS_STORE_NAME);

  const isToolEnabled = (toolName: string) => {
    return useSelect(select => selectors.isToolEnabled(select, toolName), []);
  };

  const toggleTool = (toolName: string) => {
    const currentValue = isToolEnabled(toolName);
    setConfig({ [toolName]: !currentValue });
  };

  return {
    config,
    setConfig,
    toggleTool,
    isToolEnabled,
    isLoading: false, // Temporary
  };
};
