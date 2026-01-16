/**
 * Terminal store reducer.
 *
 * @since 1.0.0
 */

import { ADD_COMMAND, CLEAR_COMMANDS, SET_COMMANDS, SET_CURRENT_COMMAND, SET_ERROR, SET_LOADING } from './constants';

const initialState = {
	commands: [],
	currentCommand: '',
	isResolving: {},
	errors: {},
};

/**
 * Terminal reducer.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} Updated state.
 */
export default ( state = initialState, action: any ) => {
	switch ( action.type ) {
		case SET_COMMANDS:
			return {
				...state,
				commands: action.commands,
			};

		case ADD_COMMAND:
			return {
				...state,
				commands: [ ...state.commands, action.command ],
			};

		case CLEAR_COMMANDS:
			return {
				...state,
				commands: [],
			};

		case SET_CURRENT_COMMAND:
			return {
				...state,
				currentCommand: action.command,
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
