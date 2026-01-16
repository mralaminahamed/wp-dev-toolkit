/**
 * Settings store reducer.
 *
 * @since 1.0.0
 */

import { SET_CONFIG, SET_ERROR, SET_LOADING, UPDATE_CONFIG } from './constants';

const initialState = {
  config: {},
  isResolving: {},
  errors: {},
};

/**
 * Settings reducer.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} Updated state.
 */
export default (state = initialState, action: any) => {
  switch (action.type) {
    case SET_CONFIG:
      return {
        ...state,
        config: action.config,
      };

    case UPDATE_CONFIG:
      return {
        ...state,
        config: {
          ...state.config,
          ...action.config,
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
