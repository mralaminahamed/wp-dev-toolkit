/**
 * Dev mode store selectors.
 *
 * @since 1.0.0
 */

export default {
	/**
	 * Check if dev mode is enabled.
	 *
	 * @param {Object} state Store state.
	 * @return {boolean} Whether dev mode is enabled.
	 */
	isDevModeEnabled( state: any ) {
		if ( ! state ) {
			return false;
		}
		return Boolean( state.enabled );
	},

	/**
	 * Get dev settings.
	 *
	 * @param {Object} state Store state.
	 * @return {Object} Dev settings.
	 */
	getDevSettings( state: any ) {
		if ( ! state ) {
			return {};
		}
		return state.settings || {};
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
	 * Get dev setting value.
	 *
	 * @param {Object} state    Store state.
	 * @param {string} key      Setting key.
	 * @param {any}    fallback Default value.
	 * @return {any} Setting value.
	 */
	getDevSetting( state: any, key: string, fallback = null ) {
		if ( ! state ) {
			return fallback;
		}
		return ( state.settings || {} )[ key ] ?? fallback;
	},
};
