/**
 * Terminal store selectors.
 *
 * @since 1.0.0
 */

export default {
	/**
	 * Get command history.
	 *
	 * @param {Object} state Store state.
	 * @return {Array} Command history.
	 */
	getCommands( state: any ) {
		if ( ! state ) {
			return [];
		}
		return state.commands || [];
	},

	/**
	 * Get current command.
	 *
	 * @param {Object} state Store state.
	 * @return {string} Current command.
	 */
	getCurrentCommand( state: any ) {
		if ( ! state ) {
			return '';
		}
		return state.currentCommand || '';
	},

	/**
	 * Check if an operation is resolving.
	 *
	 * @param {Object} state Store state.
	 * @param {string} key   Operation key.
	 * @return {boolean} True if resolving, false otherwise.
	 */
	isResolving( state: any, key: string ) {
		if ( ! state ) {
			return false;
		}
		return ( state.isResolving || {} )[ key ] || false;
	},

	/**
	 * Get error for an operation.
	 *
	 * @param {Object} state Store state.
	 * @param {string} key   Operation key.
	 * @return {string|null} Error message or null.
	 */
	getError( state: any, key: string ) {
		if ( ! state ) {
			return null;
		}
		return ( state.errors || {} )[ key ] || null;
	},

	/**
	 * Get commands count.
	 *
	 * @param {Object} state Store state.
	 * @return {number} Number of commands.
	 */
	getCommandsCount( state: any ) {
		if ( ! state ) {
			return 0;
		}
		return ( state.commands || [] ).length;
	},

	/**
	 * Get last command.
	 *
	 * @param {Object} state Store state.
	 * @return {Object|null} Last command or null.
	 */
	getLastCommand( state: any ) {
		if ( ! state ) {
			return null;
		}
		const commands = state.commands || [];
		return commands[ commands.length - 1 ] || null;
	},
};
