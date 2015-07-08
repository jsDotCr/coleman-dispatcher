import _ from 'underscore';
import { Events } from 'backbone';

export function validateActionName(actionName) {
  if (!actionName || typeof (actionName) !== 'string') {
    throw new TypeError(`The action name <${typeof (actionName)}> ${actionName} doesn't look right.`);
  }
  return actionName;
}

export function validateCallback(callback, actionName) {
  if (!callback || typeof (callback) !== 'function') {
    throw new TypeError(`The ${actionName} action's callback <${typeof (callback)}> ${callback} must be a function.`);
  }
  return callback;
}

export function validateStore(store, { callbackName, handlersHashName }) {
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

  dispatch(actionName, payload) {
    validateActionName(actionName);
    this.trigger(actionName, payload, actionName);
  }

}
