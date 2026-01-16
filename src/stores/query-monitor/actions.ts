/**
 * Query monitor store actions.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';

import { Action } from '../../types/store';

import { CLEAR_QUERIES, SET_ERROR, SET_LOADING, SET_QUERIES, STORE_NAME } from './constants';

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
   * Set queries.
   *
   * @param {any} queries Query entries.
   * @return {Action} Action object.
   */
  setQueries(queries: any): Action {
    return {
      type: SET_QUERIES,
      queries,
    };
  },

  /**
   * Clear queries.
   *
   * @return {Action} Action object.
   */
  clearQueries(): Action {
    return {
      type: CLEAR_QUERIES,
    };
  },

  /**
   * Fetch query monitor entries.
   *
   * @param {Object} params Query parameters.
   * @return {Function} Async action function.
   */
  fetchQueries(params: Record<string, any> = {}) {
    return async ({ dispatch }: { dispatch: (action: Action) => void }) => {
      const key = 'fetch-queries';

      dispatch(actions.setIsResolving(key, true));

      try {
        const queries = await apiFetch({
          path: '/wp-dev-toolkit/v1/query-monitor',
          method: 'GET',
          data: params,
        });

        dispatch(actions.setQueries(queries));
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch queries';
        dispatch(actions.setError(key, errorMessage));
      } finally {
        dispatch(actions.setIsResolving(key, false));
      }
    };
  },

  /**
   * Clear query log.
   *
   * @return {Function} Async action function.
   */
  clearLog() {
    return async ({ dispatch }: { dispatch: (action: Action) => void }) => {
      const key = 'clear-log';

      dispatch(actions.setIsResolving(key, true));

      try {
        await apiFetch({
          path: '/wp-dev-toolkit/v1/query-monitor',
          method: 'DELETE',
        });

        dispatch(actions.clearQueries());
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to clear query log';
        dispatch(actions.setError(key, errorMessage));
      } finally {
        dispatch(actions.setIsResolving(key, false));
      }
    };
  },
};

export default actions;
