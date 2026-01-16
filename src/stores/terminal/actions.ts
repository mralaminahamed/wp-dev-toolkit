/**
 * Terminal store actions.
 *
 * @since 1.0.0
 */

import apiFetch from '@wordpress/api-fetch';

import { Action } from '../../types/store';

import { ADD_COMMAND, CLEAR_COMMANDS, SET_COMMANDS, SET_CURRENT_COMMAND, SET_ERROR, SET_LOADING, STORE_NAME } from './constants';

const actions = {
  /**
   * Set commands history.
   *
   * @param {Array} commands Command history.
   * @return {Action} Action object.
   */
  setCommands(commands: any[]): Action {
    return {
      type: SET_COMMANDS,
      commands,
    };
  },

  /**
   * Add command to history.
   *
   * @param {Object} command Command object.
   * @return {Action} Action object.
   */
  addCommand(command: any): Action {
    return {
      type: ADD_COMMAND,
      command,
    };
  },

  /**
   * Clear command history.
   *
   * @return {Action} Action object.
   */
  clearCommands(): Action {
    return {
      type: CLEAR_COMMANDS,
    };
  },

  /**
   * Set resolving state for an operation.
   *
   * @param {string}  key         Operation key.
   * @param {boolean} isResolving Whether the operation is resolving.
   * @return {Action} Action object.
   */
  setIsResolving(key: string, isResolving: boolean): Action {
    return {
      type: SET_LOADING,
      key,
      isResolving,
    };
  },

  /**
   * Set error for an operation.
   *
   * @param {string} key   Operation key.
   * @param {string} error Error message or object.
   * @return {Action} Action object.
   */
  setError(key: string, error: string): Action {
    return {
      type: SET_ERROR,
      key,
      error,
    };
  },

  /**
   * Set current command.
   *
   * @param {string} command Current command.
   * @return {Action} Action object.
   */
  setCurrentCommand(command: string): Action {
    return {
      type: SET_CURRENT_COMMAND,
      command,
    };
  },

  /**
   * Execute command.
   *
   * @param {string} command Command to execute.
   * @return {Function} Async action function.
   */
  executeCommand(command: string) {
    return async ({ dispatch }: { dispatch: (action: Action) => void }) => {
      const key = 'execute-command';

      dispatch(actions.setIsResolving(key, true));

      try {
        const result = await apiFetch({
          path: '/wp-dev-toolkit/v1/terminal',
          method: 'POST',
          data: { command },
        });

        dispatch(
          actions.addCommand({
            command,
            result,
            timestamp: Date.now(),
          })
        );
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to execute command';
        dispatch(actions.setError(key, errorMessage));
        dispatch(
          actions.addCommand({
            command,
            error: errorMessage,
            timestamp: Date.now(),
          })
        );
      } finally {
        dispatch(actions.setIsResolving(key, false));
      }
    };
  },
};

export default actions;
