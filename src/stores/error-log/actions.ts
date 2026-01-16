/**
 * Error log store actions.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';

import { Action } from '../../types/store';

import { CLEAR_ENTRIES, SET_ENTRIES, SET_ERROR, SET_LOADING, STORE_NAME, UPDATE_SETTINGS } from './constants';

const actions = {
  /**
   * Set resolving state for an operation.
   *
   * @param {string}  key         Operation key.
   * @param {boolean} isResolving Whether the operation is resolving.
   * @return {Action} Action object.
   */
  setIsResolving(key: string, isResolving: boolean): Action {
    return {
      type: SET_LOADING,
      key,
      isResolving,
    };
  },

  /**
   * Set error for an operation.
   *
   * @param {string} key   Operation key.
   * @param {string} error Error message or object.
   * @return {Action} Action object.
   */
  setError(key: string, error: string): Action {
    return {
      type: SET_ERROR,
      key,
      error,
    };
  },

  /**
   * Set entries.
   *
   * @param {any} entries Error log entries.
   * @return {Action} Action object.
   */
  setEntries(entries: any): Action {
    return {
      type: SET_ENTRIES,
      entries,
    };
  },

  /**
   * Clear entries.
   *
   * @return {Action} Action object.
   */
  clearEntries(): Action {
    return {
      type: CLEAR_ENTRIES,
    };
  },

  /**
   * Update settings.
   *
   * @param {any} settings Settings object.
   * @return {Action} Action object.
   */
  updateSettings(settings: any): Action {
    return {
      type: UPDATE_SETTINGS,
      settings,
    };
  },

  /**
   * Fetch error log entries.
   *
   * @param {Object} params Query parameters.
   * @return {Function} Async action function.
   */
  fetchEntries(params: Record<string, any> = {}) {
    return async ({ dispatch }: { dispatch: (action: Action) => void }) => {
      const key = 'fetch-entries';

      dispatch(actions.setIsResolving(key, true));

      try {
        const entries = await apiFetch({
          path: '/wp-dev-toolkit/v1/error-log',
          method: 'GET',
          data: params,
        });

        dispatch(actions.setEntries(entries));
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch error log';
        dispatch(actions.setError(key, errorMessage));
      } finally {
        dispatch(actions.setIsResolving(key, false));
      }
    };
  },

  /**
   * Clear error log.
   *
   * @return {Function} Async action function.
   */
  clearLog() {
    return async ({ dispatch }: { dispatch: (action: Action) => void }) => {
      const key = 'clear-log';

      dispatch(actions.setIsResolving(key, true));

      try {
        await apiFetch({
          path: '/wp-dev-toolkit/v1/error-log',
          method: 'DELETE',
        });

        dispatch(actions.clearEntries());
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to clear error log';
        dispatch(actions.setError(key, errorMessage));
      } finally {
        dispatch(actions.setIsResolving(key, false));
      }
    };
  },
};

export default actions;
