import {
  useContext,
  useEffect,
  useRef,
} from 'react';

import memoize from 'memoize-state';

import { withKnowUsage } from 'with-known-usage';

import { defaultContext } from './provider';

import { useIsomorphicLayoutEffect, useForceUpdate } from './utils';

const createMap = (keys, create) => {
  // "Map" here means JavaScript Object not JavaScript Map.
  const obj = {};
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    obj[key] = create(key);
  }
  return obj;
};

const memoizedSelectorCache = new WeakMap();

const memoizeSelector = (selector) => {
  if (memoizedSelectorCache.has(selector)) {
    return memoizedSelectorCache.get(selector);
  }
  const memoized = {
    fn: memoize(selector),
    results: new WeakMap(),
  };
  memoizedSelectorCache.set(selector, memoized);
  return memoized;
};

const runSelector = (state, selector) => {
  const memoized = memoizeSelector(selector);
  let value;
  if (memoized.results.has(state)) {
    value = memoized.results.get(state);
  } else {
    value = memoized.fn(state);
    memoized.results.set(state, value);
  }
  return { selector, value };
};

export const useReduxSelectors = (selectorMap, opts = {}) => {
  const {
    customContext = defaultContext,
  } = opts;
  const forceUpdate = useForceUpdate();
  // redux state
  const { state, subscribe } = useContext(customContext);
  // mapped result
  const keys = Object.keys(selectorMap);
  const mapped = createMap(keys, key => runSelector(state, selectorMap[key]));
  const trapped = withKnowUsage(createMap(keys, key => mapped[key].value));
  // update ref
  const lastTracked = useRef(null);
  useIsomorphicLayoutEffect(() => {
    lastTracked.current = { keys, mapped, trapped };
  });
  // subscription
  useEffect(() => {
    const callback = (nextState) => {
      try {
        let changed = false;
        const nextMapped = createMap(lastTracked.current.keys, (key) => {
          const lastResult = lastTracked.current.mapped[key];
          if (!lastTracked.current.trapped.usage.has(key)) return lastResult;
          const nextResult = runSelector(nextState, lastResult.selector);
          if (nextResult.value !== lastResult.value) {
            changed = true;
          }
          return nextResult;
        });
        if (changed) {
          lastTracked.current.mapped = nextMapped;
          forceUpdate();
        }
      } catch (e) {
        // detect erorr (probably stale props)
        forceUpdate();
      }
    };
    const unsubscribe = subscribe(callback);
    return unsubscribe;
  }, [subscribe, forceUpdate]);
  return trapped.proxy;
};
