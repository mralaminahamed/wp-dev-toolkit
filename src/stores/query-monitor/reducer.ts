/**
 * Query monitor store reducer.
 *
 * @since 1.0.0
 */

import { CLEAR_QUERIES, SET_ERROR, SET_LOADING, SET_QUERIES } from './constants';

const initialState = {
	queries: [],
	isResolving: {},
	errors: {},
};

/**
 * Query monitor reducer.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} Updated state.
 */
export default ( state = initialState, action: any ) => {
	switch ( action.type ) {
		case SET_QUERIES:
			return {
				...state,
				queries: action.queries,
			};

		case CLEAR_QUERIES:
			return {
				...state,
				queries: [],
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
