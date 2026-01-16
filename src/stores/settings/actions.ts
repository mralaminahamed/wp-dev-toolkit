/**
 * Settings store actions.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';

import { Action } from '../../types/store';

import { SET_CONFIG, SET_ERROR, SET_LOADING, UPDATE_CONFIG } from './constants';

const actions = {
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
	 * Set configuration.
	 *
	 * @param {Record<string, any>} config Configuration object.
	 * @return {Action} Action object.
	 */
	setConfig( config: Record<string, any> ): Action {
		return {
			type: SET_CONFIG,
			config,
		};
	},

	/**
	 * Update configuration.
	 *
	 * @param {Record<string, any>} config Partial configuration update.
	 * @return {Action} Action object.
	 */
	updateConfig( config: Record<string, any> ): Action {
		return {
			type: UPDATE_CONFIG,
			config,
		};
	},

	/**
	 * Fetch configuration from API.
	 *
	 * @return {Function} Async action function.
	 */
	fetchConfig() {
		return async ( { dispatch }: { dispatch: ( action: Action ) => void } ) => {
			const key = 'fetch-config';

			dispatch( actions.setIsResolving( key, true ) );

			try {
				const config = await apiFetch( {
					path: '/wp-dev-toolkit/v1/config',
					method: 'GET',
				} );

				dispatch( actions.setConfig( config ) );
			} catch ( error: any ) {
				const errorMessage = error.message || 'Failed to fetch configuration';
				dispatch( actions.setError( key, errorMessage ) );
			} finally {
				dispatch( actions.setIsResolving( key, false ) );
			}
		};
	},

	/**
	 * Update configuration via API.
	 *
	 * @param {any} config Configuration to update.
	 * @return {Function} Async action function.
	 */
	updateConfigAsync( config: any ) {
		return async ( { dispatch }: { dispatch: ( action: Action ) => void } ) => {
			const key = 'update-config';

			dispatch( actions.setIsResolving( key, true ) );

			try {
				const updatedConfig = await apiFetch( {
					path: '/wp-dev-toolkit/v1/config',
					method: 'POST',
					data: config,
				} );

				dispatch( actions.setConfig( updatedConfig ) );
			} catch ( error: any ) {
				const errorMessage = error.message || 'Failed to update configuration';
				dispatch( actions.setError( key, errorMessage ) );
			} finally {
				dispatch( actions.setIsResolving( key, false ) );
			}
		};
	},

	/**
	 * Toggle a tool on/off.
	 *
	 * @param {string} toolName Tool name to toggle.
	 * @return {Function} Async action function.
	 */
	toggleTool( toolName: string ) {
		return async ( { dispatch }: { dispatch: ( action: Action ) => void } ) => {
			// Get current config from API to ensure we have the latest state
			const key = `toggle-${ toolName }`;

			dispatch( actions.setIsResolving( key, true ) );

			try {
				const currentConfig = await apiFetch( {
					path: '/wp-dev-toolkit/v1/config',
					method: 'GET',
				} );

				const updatedConfig = {
					...currentConfig,
					[ toolName ]: ! ( currentConfig as any )[ toolName ],
				};

				const result = await apiFetch( {
					path: '/wp-dev-toolkit/v1/config',
					method: 'POST',
					data: updatedConfig,
				} );

				dispatch( actions.setConfig( result ) );
			} catch ( error: any ) {
				const errorMessage = error.message || `Failed to toggle ${ toolName }`;
				dispatch( actions.setError( key, errorMessage ) );
			} finally {
				dispatch( actions.setIsResolving( key, false ) );
			}
		};
	},
};

export default actions;
