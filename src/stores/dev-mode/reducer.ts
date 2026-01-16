/**
 * Dev mode store reducer.
 *
 * @since 1.0.0
 */

import { SET_DEV_MODE, SET_ERROR, SET_LOADING, UPDATE_DEV_SETTINGS } from './constants';

const initialState = {
	enabled: false,
	settings: {},
	isResolving: {},
	errors: {},
};

/**
 * Dev mode reducer.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} Updated state.
 */
export default ( state = initialState, action: any ) => {
	switch ( action.type ) {
		case SET_DEV_MODE:
			return {
				...state,
				enabled: action.enabled,
			};

		case UPDATE_DEV_SETTINGS:
			return {
				...state,
				settings: {
					...state.settings,
					...action.settings,
				},
			};

		case SET_LOADING:
			return {
				...state,
				isResolving: {
					...state.isResolving,
					[ action.key ]: action.isResolving,
				},
			};

		case SET_ERROR:
			return {
				...state,
				errors: {
					...state.errors,
					[ action.key ]: action.error,
				},
			};

		default:
			return state;
	}
};
