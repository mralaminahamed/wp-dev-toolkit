import { createReduxStore, register } from '@wordpress/data';

// Action types
const SET_CONFIG = 'SET_CONFIG';
const TOGGLE_TOOL = 'TOGGLE_TOOL';

// Actions
export const setConfig = (config: Record<string, any>) => ({
  type: SET_CONFIG,
  payload: config,
});

export const toggleTool = (toolName: string) => ({
  type: TOGGLE_TOOL,
  payload: toolName,
});

// Selectors
export const selectors = {
  getConfig: (state: State) => state.config,
  isToolEnabled: (state: State, toolName: string) => state.config[toolName] || false,
};

// Reducer
interface State {
  config: Record<string, any>;
}

const DEFAULT_STATE: State = {
  config: {},
};

const reducer = (state = DEFAULT_STATE, action: any): State => {
  switch (action.type) {
    case SET_CONFIG:
      return {
        ...state,
        config: action.payload,
      };
    case TOGGLE_TOOL:
      return {
        ...state,
        config: {
          ...state.config,
          [action.payload]: !state.config[action.payload],
        },
      };
    default:
      return state;
  }
};

// Create and register the store
const store = createReduxStore('wp-dev-toolkit', {
  reducer,
  actions: {
    setConfig,
    toggleTool,
  },
  selectors,
});

register(store);

export default store;
