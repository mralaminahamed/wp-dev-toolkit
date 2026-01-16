/**
 * Settings store selectors.
 *
 * @since 1.0.0
 */

export default {
	/**
	 * Get configuration.
	 *
	 * @param {Object} state Store state.
	 * @return {Object} Configuration object.
	 */
	getConfig( state: any ) {
		if ( ! state ) {
			return {};
		}
		return state.config || {};
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
	 * Check if a tool is enabled.
	 *
	 * @param {Object} state    Store state.
	 * @param {string} toolName Tool name.
	 * @return {boolean} Whether the tool is enabled.
	 */
	isToolEnabled( state: any, toolName: string ) {
		if ( ! state ) {
			return false;
		}
		return Boolean( ( state.config || {} )[ toolName ] );
	},

	/**
	 * Get setting value.
	 *
	 * @param {Object} state    Store state.
	 * @param {string} key      Setting key.
	 * @param {any}    fallback Default value.
	 * @return {any} Setting value.
	 */
	getSetting( state: any, key: string, fallback = null ) {
		if ( ! state ) {
			return fallback;
		}
		return ( state.config || {} )[ key ] ?? fallback;
	},
};
