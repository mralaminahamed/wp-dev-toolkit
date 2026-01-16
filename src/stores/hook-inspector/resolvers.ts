/**
 * Hook inspector store resolvers.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import { Action } from '../../types/store';

import actions from './actions';

export default {
	/**
	 * Get hook inspector entries.
	 *
	 * @param {Object} params Query parameters.
	 * @return {Function} Async action function.
	 */
	getHooks( params: Record<string, any> = {} ) {
		return async ( { dispatch }: { dispatch: ( action: Action ) => void } ) => {
			const key = 'get-hooks';

			dispatch( actions.setIsResolving( key, true ) );

			try {
				const path = addQueryArgs( '/wp-dev-toolkit/v1/hook-inspector', params );
				const response = await apiFetch( { path } );

				dispatch( actions.setHooks( response ) );
			} catch ( error: any ) {
				const errorMessage = error.message || 'Failed to fetch hook inspector entries';
				dispatch( actions.setError( key, errorMessage ) );
			} finally {
				dispatch( actions.setIsResolving( key, false ) );
			}
		};
	},
};
