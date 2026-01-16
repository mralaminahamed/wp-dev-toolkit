/**
 * Error log store reducer.
 *
 * @since 1.0.0
 */

import { CLEAR_ENTRIES, SET_ENTRIES, SET_ERROR, SET_LOADING, UPDATE_SETTINGS } from './constants';

const initialState = {
  entries: [],
  settings: {},
  isResolving: {},
  errors: {},
};

/**
 * Error log reducer.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} Updated state.
 */
export default (state = initialState, action: any) => {
  switch (action.type) {
    case SET_ENTRIES:
      return {
        ...state,
        entries: action.entries,
      };

    case CLEAR_ENTRIES:
      return {
        ...state,
        entries: [],
      };

    case UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings,
        },
      };

    case SET_LOADING:
      return {
        ...state,
        isResolving: {
          ...state.isResolving,
          [action.key]: action.isResolving,
        },
      };

    case SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.key]: action.error,
        },
      };

    default:
      return state;
  }
};
