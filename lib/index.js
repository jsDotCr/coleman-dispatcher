var _ = require('underscore');
var Backbone = require('backbone');

var dispatcher = _.extend({
  callbackName: 'onEventDispatched',
  handlersHashName: 'handlers',

  registerStore: function registerStore(store) {
    'use strict';

    var storeHandlersHash = store[dispatcher.handlersHashName];
    var storeCallback = store[dispatcher.callbackName];

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
          throw new Error('An `' + dispatcher.handlersHashName + '` hash is defined, but either there is an ' +
          'invalid callback or the event name (`' + eventName + '`) is not defined (wrong property name maybe?)');
        }
        dispatcher.registerCallback(eventName, store, callback);
      });
    } else if (typeof (storeCallback) === 'function') {
      dispatcher.registerCallback('all', store, store[dispatcher.callbackName]);
    } else {
      throw new Error('Neither the handlers hash (' + dispatcher.handlersHashName + ') NOR the global dispatcher ' +
      'callback (' + dispatcher.callbackName + ') have been defined on the store!');
    }
  },

  registerCallback: function registerCallback(event, store, callback) {
    'use strict';

    store.listenTo(dispatcher, event, callback);
  },

  dispatch: function eventDispatch(eventName, payload) {
    'use strict';
    dispatcher.trigger(eventName, payload, eventName);
  }

}, Backbone.Events);

module.exports = dispatcher;
