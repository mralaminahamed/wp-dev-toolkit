/**
 * Query monitor store selectors.
 *
 * @since 1.0.0
 */

export default {
	/**
	 * Get query monitor entries.
	 *
	 * @param {Object} state Store state.
	 * @return {Array} Query entries.
	 */
	getQueries( state: any ) {
		if ( ! state ) {
			return [];
		}
		return state.queries || [];
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
	 * Get queries count.
	 *
	 * @param {Object} state Store state.
	 * @return {number} Number of queries.
	 */
	getQueriesCount( state: any ) {
		if ( ! state ) {
			return 0;
		}
		return ( state.queries || [] ).length;
	},

	/**
	 * Get slow queries.
	 *
	 * @param {Object} state     Store state.
	 * @param {number} threshold Time threshold in seconds.
	 * @return {Array} Slow queries.
	 */
	getSlowQueries( state: any, threshold: number = 1.0 ) {
		if ( ! state ) {
			return [];
		}
		return ( state.queries || [] ).filter( ( query: any ) => query.execution_time && parseFloat( query.execution_time ) > threshold );
	},
};
