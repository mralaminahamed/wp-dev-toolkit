/**
 * Hook inspector store actions.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';

import { Action } from '../../types/store';

import { CLEAR_HOOKS, SET_ERROR, SET_FILTERS, SET_HOOKS, SET_LOADING, STORE_NAME } from './constants';

const actions = {
	/**
	 * Set hooks.
	 *
	 * @param {Array} hooks Hook entries.
	 * @return {Action} Action object.
	 */
	setHooks( hooks: any[] ): Action {
		return {
			type: SET_HOOKS,
			hooks,
		};
	},

	/**
	 * Clear hooks.
	 *
	 * @return {Action} Action object.
	 */
	clearHooks(): Action {
		return {
			type: CLEAR_HOOKS,
		};
	},

	/**
	 * Set resolving state for an operation.
	 *
	 * @param {string}  key         Operation key.
	 * @param {boolean} isResolving Whether the operation is resolving.
	 * @return {Action} Action object.
	 */
	setIsResolving( key: string, isResolving: boolean ): Action {
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
	setError( key: string, error: string ): Action {
		return {
			type: SET_ERROR,
			key,
			error,
		};
	},

	/**
	 * Set filters.
	 *
	 * @param {Record<string, any>} filters Filter settings.
	 * @return {Action} Action object.
	 */
	setFilters( filters: Record<string, any> ): Action {
		return {
			type: SET_FILTERS,
			filters,
		};
	},

	/**
	 * Fetch hook inspector entries.
	 *
	 * @param {Object} params Query parameters.
	 * @return {Function} Async action function.
	 */
	fetchHooks( params: Record<string, any> = {} ) {
		return async ( { dispatch }: { dispatch: ( action: Action ) => void } ) => {
			const key = 'fetch-hooks';

			dispatch( actions.setIsResolving( key, true ) );

			try {
				const hooks = await apiFetch( {
					path: '/wp-dev-toolkit/v1/hook-inspector',
					method: 'GET',
					data: params,
				} );

				dispatch( actions.setHooks( hooks ) );
			} catch ( error: any ) {
				const errorMessage = error.message || 'Failed to fetch hooks';
				dispatch( actions.setError( key, errorMessage ) );
			} finally {
				dispatch( actions.setIsResolving( key, false ) );
			}
		};
	},

	/**
	 * Clear hook log.
	 *
	 * @return {Function} Async action function.
	 */
	clearLog() {
		return async ( { dispatch }: { dispatch: ( action: Action ) => void } ) => {
			const key = 'clear-log';

			dispatch( actions.setIsResolving( key, true ) );

			try {
				await apiFetch( {
					path: '/wp-dev-toolkit/v1/hook-inspector',
					method: 'DELETE',
				} );

				dispatch( actions.clearHooks() );
			} catch ( error: any ) {
				const errorMessage = error.message || 'Failed to clear hook log';
				dispatch( actions.setError( key, errorMessage ) );
			} finally {
				dispatch( actions.setIsResolving( key, false ) );
			}
		};
	},
};

export default actions;
