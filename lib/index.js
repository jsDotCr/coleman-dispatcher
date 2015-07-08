import _ from 'underscore';
import { Events } from 'backbone';

let asyncCallbacks = {};

function validateActionName(actionName, throwError = true) {
  if (!actionName || typeof (actionName) !== 'string') {
    if (!throwError) {
      return false;
    }
    throw new TypeError(`The action name <${typeof (actionName)}> ${actionName} doesn't look right.`);
  }
  return actionName;
}

function validateCallback(callback, actionName, throwError = true) {
  if (!callback || typeof (callback) !== 'function') {
    if (!throwError) {
      return false;
    }
    throw new TypeError(`The ${actionName} action's callback <${typeof (callback)}> ${callback} must be a function.`);
  }
  return callback;
}

function validateStore(store, { callbackName, handlersHashName }) {
  if (!store || typeof (store.listenTo) !== 'function' || (!store[callbackName] && !store[handlersHashName])) {
    throw new TypeError(`The given store is not a valid one!`);
  }
  return store;
}

export default class ColemanDispatcher {
  constructor() {
    this.callbackName = 'onEventDispatched';
    this.handlersHashName = 'handlers';

    _.each(Events, function backboneEventsExtend(fn, eventName) {
      this[eventName] = fn;
    }, this);
  }

  registerStore(store) {
    var storeHandlersHash = store[this.handlersHashName];
    var storeCallback = store[this.callbackName];

    validateStore(store, this);
    if (typeof (storeCallback) === 'function') {
      return this.registerCallback('all', store, store[this.callbackName]);
    }
    if (typeof (storeHandlersHash) === 'function') {
      storeHandlersHash = storeHandlersHash();
    }
    if (typeof (storeHandlersHash) === 'object') {
      _.each(storeHandlersHash, function eachStoreHandlerInHash(handler, actionName) {
        let callback;

        actionName = handler.action || actionName;
        callback = handler.callback || handler;
        if (typeof (callback) === 'string') {
          callback = store[callback];
        }
        validateActionName(actionName);
        validateCallback(callback, actionName);
        this.registerCallback(actionName, store, callback);
      }, this);
    } else {
      throw new TypeError('Neither the handlers hash (' + this.handlersHashName + ') NOR the global dispatcher ' +
      'callback (' + this.callbackName + ') have been defined on the store!');
    }
  }

  registerCallback(actionName, store, callback) {
    validateActionName(actionName);
    validateStore(store, this);
    validateCallback(callback, actionName);
    store.listenTo(this, actionName, callback);
  }

  dispatch(actionName, payload, opts = {}) {
    validateActionName(actionName);

    if (validateActionName(opts.waitFor, false)) {
      this['_waitFor' + (opts.async ? 'Async' : '')](actionName, payload, opts);
      return true;
    }
    this.trigger(
      actionName,
      payload,
      actionName,
      () => {
        this._executeAsyncDone(actionName);
      },
      () => {
        this._executeAsyncError(actionName);
      }
    );
  }

  _waitFor(actionName, payload, { waitFor }) {
    let waitForCallback;

    waitForCallback = function(eventName) {
      if (eventName === waitFor) {
        this.stopListening(this, 'all', waitForCallback);
        this.dispatch(actionName, payload);
      }
    };
    this.listenTo(this, 'all', waitForCallback);
  }

  _waitForAsync(actionName, payload, { waitFor, error = function() {} }) {
    asyncCallbacks[waitFor] = _.defaults(asyncCallbacks[waitFor] || {}, {
      done: [],
      error: []
    });

    asyncCallbacks[waitFor].done.push({
      actionName,
      payload
    });
    if (validateCallback(error, null, false)){
      asyncCallbacks[waitFor].error.push(error);
    }
  }

  _executeAsyncDone(actionName) {
    let { done: doneCbs } = asyncCallbacks[actionName];

    if (!doneCbs) {
      return;
    }
    doneCbs.forEach(({ actionName, payload }) => {
      this.dispatch(actionName, payload);
    });

    asyncCallbacks[actionName] = [];
  }

  _executeAsyncError(actionName) {
    let { error: errorCbs } = asyncCallbacks[actionName];

    if (!errorCbs) {
      return;
    }
    errorCbs.forEach(errorCb => {
      errorCb();
    });

    asyncCallbacks[actionName] = [];
  }
}
