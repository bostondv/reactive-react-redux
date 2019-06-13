"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReduxProvider = exports.defaultContext = void 0;

var _react = require("react");

var _utils = require("./utils");

// context
var warningObject = {
  get dispatch() {
    throw new Error('Please use <ReduxProvider store={store}>');
  },

  get getState() {
    throw new Error('Please use <ReduxProvider store={store}>');
  }

};

var calculateChangedBits = function calculateChangedBits(a, b) {
  return a.dispatch !== b.dispatch || a.subscribe !== b.subscribe ? 1 : 0;
};

var defaultContext = (0, _react.createContext)(warningObject, calculateChangedBits);
exports.defaultContext = defaultContext;

var ReduxProvider = function ReduxProvider(_ref) {
  var store = _ref.store,
      _ref$customContext = _ref.customContext,
      customContext = _ref$customContext === void 0 ? defaultContext : _ref$customContext,
      children = _ref.children;
  var forceUpdate = (0, _utils.useForceUpdate)();
  var state = store.getState();
  var listeners = (0, _react.useRef)([]);
  (0, _utils.useIsomorphicLayoutEffect)(function () {
    listeners.current.forEach(function (listener) {
      return listener(state);
    });
  }, [state]);
  var subscribe = (0, _react.useCallback)(function (listener) {
    listeners.current.push(listener);

    var unsubscribe = function unsubscribe() {
      var index = listeners.current.indexOf(listener);
      listeners.current.splice(index, 1);
    }; // run once in case the state is already changed


    listener(store.getState());
    return unsubscribe;
  }, [store]);
  (0, _react.useEffect)(function () {
    var unsubscribe = store.subscribe(function () {
      forceUpdate();
    });
    return unsubscribe;
  }, [store, forceUpdate]);
  return (0, _react.createElement)(customContext.Provider, {
    value: {
      state: state,
      dispatch: store.dispatch,
      subscribe: subscribe
    }
  }, children);
};

exports.ReduxProvider = ReduxProvider;