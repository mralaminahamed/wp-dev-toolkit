/**
 * Settings store resolvers.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

import { Action } from '../../types/store';

import actions from './actions';

export default {
	/**
	 * Get settings configuration.
	 *
	 * @param {string} page Optional page to get config for.
	 * @return {Function} Async action function.
	 */
	getConfig( page?: string ) {
		return async ( { dispatch }: { dispatch: ( action: Action ) => void } ) => {
			const key = page ? `settings-config-${ page }` : 'settings-config';

			dispatch( actions.setIsResolving( key, true ) );

			try {
				const path = page ? addQueryArgs( '/wp-dev-toolkit/v1/config', { page } ) : '/wp-dev-toolkit/v1/config';
				const response = await apiFetch( { path } );

				dispatch( actions.setConfig( response ) );
			} catch ( error: any ) {
				const errorMessage = error.message || 'Failed to fetch settings configuration';
				dispatch( actions.setError( key, errorMessage ) );
			} finally {
				dispatch( actions.setIsResolving( key, false ) );
			}
		};
	},
};
