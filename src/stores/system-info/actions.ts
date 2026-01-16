/**
 * System info store actions.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';

import { Action } from '../../types/store';

import { SET_ERROR, SET_LOADING, SET_SYSTEM_INFO, STORE_NAME, UPDATE_SYSTEM_INFO } from './constants';

const actions = {
  /**
   * Set system info.
   *
   * @param {Record<string, any>} systemInfo System information.
   * @return {Action} Action object.
   */
  setSystemInfo(systemInfo: Record<string, any>): Action {
    return {
      type: SET_SYSTEM_INFO,
      systemInfo,
    };
  },

  /**
   * Update system info.
   *
   * @param {Record<string, any>} systemInfo System information updates.
   * @return {Action} Action object.
   */
  updateSystemInfo(systemInfo: Record<string, any>): Action {
    return {
      type: UPDATE_SYSTEM_INFO,
      systemInfo,
    };
  },

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
   * Fetch system information.
   *
   * @param {Object} params Query parameters.
   * @return {Function} Async action function.
   */
  fetchSystemInfo(params: Record<string, any> = {}) {
    return async ({ dispatch }: { dispatch: (action: Action) => void }) => {
      const key = 'fetch-system-info';

      dispatch(actions.setIsResolving(key, true));

      try {
        const systemInfo = await apiFetch({
          path: '/wp-dev-toolkit/v1/system-info',
          method: 'GET',
          data: params,
        });

        dispatch(actions.setSystemInfo(systemInfo));
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch system info';
        dispatch(actions.setError(key, errorMessage));
      } finally {
        dispatch(actions.setIsResolving(key, false));
      }
    };
  },
};

export default actions;
