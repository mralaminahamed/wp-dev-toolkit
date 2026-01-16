/**
 * Terminal store initialization.
 *
 * @since 1.0.0
 */

import { createReduxStore, register } from '@wordpress/data';

import actions from './actions';
import { STORE_NAME } from './constants';
import reducer from './reducer';
import resolvers from './resolvers';
import selectors from './selectors';

const store = createReduxStore(STORE_NAME, {
  reducer,
  actions,
  selectors,
  resolvers,
});

// Register the store with WordPress data registry
register(store);

export { store, STORE_NAME };

export default store;
