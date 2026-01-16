/**
 * Hook inspector store selectors.
 *
 * @since 1.0.0
 */

export default {
  /**
   * Get hook inspector entries.
   *
   * @param {Object} state Store state.
   * @return {Array} Hook entries.
   */
  getHooks(state: any) {
    if (!state) {
      return [];
    }
    return state.hooks || [];
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
   * Get filters.
   *
   * @param {Object} state Store state.
   * @return {Object} Filter settings.
   */
  getFilters(state: any) {
    if (!state) {
      return {};
    }
    return state.filters || {};
  },

  /**
   * Get hooks count.
   *
   * @param {Object} state Store state.
   * @return {number} Number of hooks.
   */
  getHooksCount(state: any) {
    if (!state) {
      return 0;
    }
    return (state.hooks || []).length;
  },

  /**
   * Get filtered hooks.
   *
   * @param {Object} state Store state.
   * @return {Array} Filtered hooks.
   */
  getFilteredHooks(state: any) {
    if (!state) {
      return [];
    }

    const { hooks, filters } = state;

    if (!filters || Object.keys(filters).length === 0) {
      return hooks || [];
    }

    return (hooks || []).filter((hook: any) => {
      // Apply filters
      if (filters['hook_type'] && hook['hook_type'] !== filters['hook_type']) {
        return false;
      }
      if (filters['priority'] && hook['priority'] !== filters['priority']) {
        return false;
      }
      return true;
    });
  },
};
