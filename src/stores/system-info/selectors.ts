/**
 * System info store selectors.
 *
 * @since 1.0.0
 */

export default {
  /**
   * Get system information.
   *
   * @param {Object} state Store state.
   * @return {Object} System information.
   */
  getSystemInfo(state: any) {
    if (!state) {
      return {};
    }
    return state.systemInfo || {};
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
   * Get specific system info value.
   *
   * @param {Object} state   Store state.
   * @param {string} key     Info key.
   * @param {any}    fallback Default value.
   * @return {any} Info value.
   */
  getSystemInfoValue(state: any, key: string, fallback = null) {
    if (!state) {
      return fallback;
    }
    return (state.systemInfo || {})[key] ?? fallback;
  },

  /**
   * Get WordPress version.
   *
   * @param {Object} state Store state.
   * @return {string} WordPress version.
   */
  getWordPressVersion(state: any) {
    if (!state) {
      return '';
    }
    return (state.systemInfo || {})['wordpress_version'] || '';
  },

  /**
   * Get PHP version.
   *
   * @param {Object} state Store state.
   * @return {string} PHP version.
   */
  getPHPVersion(state: any) {
    if (!state) {
      return '';
    }
    return (state.systemInfo || {})['php_version'] || '';
  },
};
