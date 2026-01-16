/**
 * Hook inspector store reducer.
 *
 * @since 1.0.0
 */

import { CLEAR_HOOKS, SET_ERROR, SET_FILTERS, SET_HOOKS, SET_LOADING } from './constants';

const initialState = {
  hooks: [],
  filters: {},
  isResolving: {},
  errors: {},
};

/**
 * Hook inspector reducer.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} Updated state.
 */
export default (state = initialState, action: any) => {
  switch (action.type) {
    case SET_HOOKS:
      return {
        ...state,
        hooks: action.hooks,
      };

    case CLEAR_HOOKS:
      return {
        ...state,
        hooks: [],
      };

    case SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.filters,
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
