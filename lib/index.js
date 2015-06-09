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

    if (!store || typeof(store.listenTo) !== 'function') {
      throw new TypeError(`The given store is not a valid one!`);
    }

    var storeHandlersHash = store[this.handlersHashName];
    var storeCallback = store[this.callbackName];

    if (typeof (storeCallback) === 'function') {
      this.registerCallback('all', store, store[this.callbackName]);
    } else if (typeof (storeHandlersHash) === 'object') {
      _.each(storeHandlersHash, function eachStoreHandlerInHash(handler, eventName) {
        var callback;

        if (typeof (handler) === 'object') {
          eventName = handler.action;
          callback = handler.callback;
        } else {
          callback = store[handler];
        }
        if (!eventName || !callback) {
          throw new Error('An `' + this.handlersHashName + '` hash is defined, but either there is an ' +
          'invalid callback or the event name (`' + eventName + '`) is not defined (wrong property name maybe?)');
        }
        this.registerCallback(eventName, store, callback);
      });
    } else {
      throw new Error('Neither the handlers hash (' + this.handlersHashName + ') NOR the global dispatcher ' +
      'callback (' + this.callbackName + ') have been defined on the store!');
    }
  }

  registerCallback(eventName, store, callback) {
    'use strict';

    if (!eventName || typeof(eventName) !== 'string') {
      throw new TypeError(`The event name '${eventName}' doesn't look really good. It should be a non empty string.`);
    } else if (!store || typeof(store.listenTo) !== 'function') {
      throw new TypeError(`The given store is not a valid one!`);
    } else if (!callback || typeof(callback) !== 'function') {
      throw new TypeError(`The given callback is not a function!`);
    }
    store.listenTo(this, eventName, callback);
  }

  dispatch(eventName, payload) {
    'use strict';

    if (!eventName || typeof(eventName) !== 'string') {
      throw new TypeError(`The event name '${eventName}' doesn't look really good. It should be a non empty string.`);
    }
    this.trigger(eventName, payload, eventName);
  }

}
