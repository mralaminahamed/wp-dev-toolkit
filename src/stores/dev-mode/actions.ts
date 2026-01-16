/**
 * Dev mode store actions.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';

import { Action } from '../../types/store';

import { SET_DEV_MODE, SET_ERROR, SET_LOADING, STORE_NAME, UPDATE_DEV_SETTINGS } from './constants';

const actions = {
	/**
	 * Set dev mode enabled/disabled.
	 *
	 * @param {boolean} enabled Whether dev mode is enabled.
	 * @return {Action} Action object.
	 */
	setDevMode( enabled: boolean ): Action {
		return {
			type: SET_DEV_MODE,
			enabled,
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
	 * Update dev settings.
	 *
	 * @param {Record<string, any>} settings Dev settings.
	 * @return {Action} Action object.
	 */
	updateDevSettings( settings: Record<string, any> ): Action {
		return {
			type: UPDATE_DEV_SETTINGS,
			settings,
		};
	},

	/**
	 * Toggle dev mode.
	 *
	 * @return {Function} Async action function.
	 */
	toggleDevMode() {
		return async ( { dispatch }: { dispatch: ( action: Action ) => void } ) => {
			const key = 'toggle-dev-mode';

			dispatch( actions.setIsResolving( key, true ) );

			try {
				const result = await apiFetch( {
					path: '/wp-dev-toolkit/v1/dev-mode/toggle',
					method: 'POST',
				} );

				dispatch( actions.setDevMode( result.enabled ) );
				dispatch( actions.updateDevSettings( result.settings ) );
			} catch ( error: any ) {
				const errorMessage = error.message || 'Failed to toggle dev mode';
				dispatch( actions.setError( key, errorMessage ) );
			} finally {
				dispatch( actions.setIsResolving( key, false ) );
			}
		};
	},
};

export default actions;
