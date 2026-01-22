/**
 * Store types for WP Dev Toolkit.
 *
 * @since 1.0.0
 */

export interface Action {
	type: string;
	[key: string]: any;
}

export interface ThunkAction {
	(): Generator<Action, void, unknown>;
}

export type ActionOrThunk = Action | ThunkAction;
