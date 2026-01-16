/**
 * Error log store resolvers.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import { Action } from '../../types/store';

import actions from './actions';

export default {
  /**
   * Get error log entries.
   *
   * @param {Object} params Query parameters.
   * @return {Function} Async action function.
   */
  getEntries(params: Record<string, any> = {}) {
    return async ({ dispatch }: { dispatch: (action: Action) => void }) => {
      const key = 'get-entries';

      dispatch(actions.setIsResolving(key, true));

      try {
        const path = addQueryArgs('/wp-dev-toolkit/v1/error-log', params);
        const response = await apiFetch({ path });

        dispatch(actions.setEntries(response));
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch error log entries';
        dispatch(actions.setError(key, errorMessage));
      } finally {
        dispatch(actions.setIsResolving(key, false));
      }
    };
  },
};
