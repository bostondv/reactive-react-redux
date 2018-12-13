import * as React from 'react';
import { Action, AnyAction, Dispatch, Store } from 'redux';

// tslint:disable-next-line:no-any
export type AnyState = any;

export type ReduxProviderProps<S, A extends Action> = {
  store: Store<S, A>,
  children?: React.ReactNode,
};

export type ReduxProviderType<S = AnyState, A extends Action = AnyAction>
  = React.ComponentType<ReduxProviderProps<S, A>>;

export const ReduxProvider: ReduxProviderType;

export const useReduxDispatch: <A extends Action>() => Dispatch<A>;

export const useReduxState: <S>() => S;
