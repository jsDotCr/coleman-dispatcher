import _ from 'underscore';
import { Events } from 'backbone';

export default class ColemanDispatcher {
  constructor() {
    'use strict';

    this.callbackName = 'onEventDispatched';
    this.handlersHashName = 'handlers';

    _.each(Events, function backboneEventsExtend(fn, eventName) {
      this[eventName] = fn;
    }, this);
  }

  registerStore(store) {
    'use strict';

    var storeHandlersHash = store[this.handlersHashName];
    var storeCallback = store[this.callbackName];

    if (!store || typeof (store.listenTo) !== 'function') {
      throw new TypeError(`The given store is not a valid one!`);
    }
    if (typeof (storeCallback) === 'function') {
      return this.registerCallback('all', store, store[this.callbackName]);
    }
    if (typeof (storeHandlersHash) === 'function') {
      storeHandlersHash = storeHandlersHash();
    }
    if (typeof (storeHandlersHash) === 'object') {
      _.each(storeHandlersHash, function eachStoreHandlerInHash(handler, eventName) {
        var callback;

        eventName = handler.action || eventName;
        callback = handler.callback || handler;
        if (typeof (callback) === 'string'){
          callback = store[callback];
        }
        if (!callback || typeof (callback) !== 'function'){
          throw new TypeError(`The callback defined for the event ${eventName} must be a function.`);
        }
        if (!eventName || typeof (eventName) !== 'string') {
          throw new TypeError(`The action name ${eventName} doesn't look like a string.`);
        }
        this.registerCallback(eventName, store, callback);
      }, this);
    } else {
      throw new TypeError('Neither the handlers hash (' + this.handlersHashName + ') NOR the global dispatcher ' +
      'callback (' + this.callbackName + ') have been defined on the store!');
    }
  }

  registerCallback(eventName, store, callback) {
    'use strict';

    if (!eventName || typeof (eventName) !== 'string') {
      throw new TypeError(`The event name '${eventName}' doesn't look really good. It should be a non empty string.`);
    } else if (!store || typeof (store.listenTo) !== 'function') {
      throw new TypeError(`The given store is not a valid one!`);
    } else if (!callback || typeof (callback) !== 'function') {
      throw new TypeError(`The given callback is not a function!`);
    }
    store.listenTo(this, eventName, callback);
  }

  dispatch(eventName, payload) {
    'use strict';

    if (!eventName || typeof (eventName) !== 'string') {
      throw new TypeError(`The event name '${eventName}' doesn't look really good. It should be a non empty string.`);
    }
    this.trigger(eventName, payload, eventName);
  }

}
