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

    if (typeof (storeHandlersHash) === 'object') {
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
    } else if (typeof (storeCallback) === 'function') {
      this.registerCallback('all', store, store[this.callbackName]);
    } else {
      throw new Error('Neither the handlers hash (' + this.handlersHashName + ') NOR the global dispatcher ' +
      'callback (' + this.callbackName + ') have been defined on the store!');
    }
  }

  registerCallback(event, store, callback) {
    'use strict';

    store.listenTo(this, event, callback);
  }

  dispatch(eventName, payload) {
    'use strict';
    this.trigger(eventName, payload, eventName);
  }

}
