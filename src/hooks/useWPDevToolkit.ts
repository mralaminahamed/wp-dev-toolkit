import { useSelect, useDispatch } from '@wordpress/data';

export const useWPDevToolkit = () => {
  const config = useSelect(select => select('wp-dev-toolkit').getConfig(), []);
  const { setConfig, toggleTool } = useDispatch('wp-dev-toolkit');

  const isToolEnabled = (toolName: string) => {
    return useSelect(select => select('wp-dev-toolkit').isToolEnabled(toolName), []);
  };

  return {
    config,
    setConfig,
    toggleTool,
    isToolEnabled,
  };
};
