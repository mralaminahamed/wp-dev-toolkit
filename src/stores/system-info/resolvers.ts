/**
 * System info store resolvers.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import { Action } from '../../types/store';

import actions from './actions';

export default {
  /**
   * Get system information.
   *
   * @param {Object} params Query parameters.
   * @return {Function} Async action function.
   */
  getSystemInfo(params: Record<string, any> = {}) {
    return async ({ dispatch }: { dispatch: (action: Action) => void }) => {
      const key = 'get-system-info';

      dispatch(actions.setIsResolving(key, true));

      try {
        const path = addQueryArgs('/wp-dev-toolkit/v1/system-info', params);
        const response = await apiFetch({ path });

        dispatch(actions.setSystemInfo(response));
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to fetch system information';
        dispatch(actions.setError(key, errorMessage));
      } finally {
        dispatch(actions.setIsResolving(key, false));
      }
    };
  },
};
