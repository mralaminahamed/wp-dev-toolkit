/**
 * Error log store selectors.
 *
 * @since 1.0.0
 */

export default {
  /**
   * Get error log entries.
   *
   * @param {Object} state Store state.
   * @return {Array} Error log entries.
   */
  getEntries(state: any) {
    if (!state) {
      return [];
    }
    return state.entries || [];
  },

  /**
   * Check if an operation is resolving.
   *
   * @param {Object} state Store state.
   * @param {string} key   Operation key.
   * @return {boolean} True if resolving, false otherwise.
   */
  isResolving(state: any, key: string) {
    if (!state) {
      return false;
    }
    return (state.isResolving || {})[key] || false;
  },

  /**
   * Get error for an operation.
   *
   * @param {Object} state Store state.
   * @param {string} key   Operation key.
   * @return {string|null} Error message or null.
   */
  getError(state: any, key: string) {
    if (!state) {
      return null;
    }
    return (state.errors || {})[key] || null;
  },

  /**
   * Get settings.
   *
   * @param {Object} state Store state.
   * @return {Object} Settings object.
   */
  getSettings(state: any) {
    if (!state) {
      return {};
    }
    return state.settings || {};
  },

  /**
   * Get setting value.
   *
   * @param {Object} state   Store state.
   * @param {string} key     Setting key.
   * @param {any}    fallback Default value.
   * @return {any} Setting value.
   */
  getSetting(state: any, key: string, fallback = null) {
    if (!state) {
      return fallback;
    }
    return (state.settings || {})[key] ?? fallback;
  },

  /**
   * Get entries count.
   *
   * @param {Object} state Store state.
   * @return {number} Number of entries.
   */
  getEntriesCount(state: any) {
    if (!state) {
      return 0;
    }
    return (state.entries || []).length;
  },
};
