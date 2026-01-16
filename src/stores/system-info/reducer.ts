/**
 * System info store reducer.
 *
 * @since 1.0.0
 */

import { SET_ERROR, SET_LOADING, SET_SYSTEM_INFO, UPDATE_SYSTEM_INFO } from './constants';

const initialState = {
	systemInfo: {},
	isResolving: {},
	errors: {},
};

/**
 * System info reducer.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} Updated state.
 */
export default ( state = initialState, action: any ) => {
	switch ( action.type ) {
		case SET_SYSTEM_INFO:
			return {
				...state,
				systemInfo: action.systemInfo,
			};

		case UPDATE_SYSTEM_INFO:
			return {
				...state,
				systemInfo: {
					...state.systemInfo,
					...action.systemInfo,
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
