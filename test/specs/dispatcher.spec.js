/*global describe, it */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import { Events as BackboneEvents } from 'backbone';
import _ from 'underscore';

// Pull in the module we want to test.
import dispatcher from '../../index';

describe('Backbone.js dispatcher module', function() {
  describe('Interface', function() {
    it('has default handlers object name and callback name defined', function() {
      expect(dispatcher.handlersHashName).to.be.a.string;
      expect(dispatcher.callbackName).to.be.a.string;
    });

    it('inherits all Backbone.Events object', function() {
      for (var backboneEvent in BackboneEvents){
        expect(dispatcher[backboneEvent]).to.be.a.function;
      }
    });

    it('has dispatcher interface', function() {
      expect(dispatcher.registerStore).to.be.a.function;
      expect(dispatcher.registerCallback).to.be.a.function;
      expect(dispatcher.dispatch).to.be.a.function;
    });
  });

  describe('dispatch', function() {
    it('fails badly if not even an eventName has been passed', function() {
      expect(function() {
        dispatcher.dispatch();
      }).to.throw(TypeError);
    });
    it('fails badly if a non-string eventName has been passed', function() {
      expect(function() {
        dispatcher.dispatch({});
      }).to.throw(TypeError);
    });
    it('fails badly if an empty eventName has been passed', function() {
      expect(function() {
        dispatcher.dispatch('');
      }).to.throw(TypeError);
    });
    it('calls the trigger function', function() {
      let triggerSpy = sinon.spy(dispatcher, 'trigger');

      dispatcher.dispatch('eventName');
      expect(triggerSpy).to.have.been.calledOnce;
      triggerSpy.restore();
    });

    it('forwards the parameters correctly', function() {
      let triggerSpy = sinon.spy(dispatcher, 'trigger');
      let payload = {
        hi: 'yo'
      };

      dispatcher.dispatch('eventName', payload);
      expect(triggerSpy).to.have.been.calledWithExactly('eventName', payload, 'eventName');
      triggerSpy.restore();
    });
  });

  describe('registerCallback', function() {
    let fakeStore = {
      listenTo: sinon.stub()
    };

    it('fails badly if not even an eventName has been passed', function() {
      expect(function() {
        dispatcher.registerCallback();
      }).to.throw(TypeError);
    });
    it('fails badly if a non-string eventName has been passed', function() {
      expect(function() {
        dispatcher.registerCallback({});
      }).to.throw(TypeError);
    });
    it('fails badly if an empty eventName has been passed', function() {
      expect(function() {
        dispatcher.registerCallback('');
      }).to.throw(TypeError);
    });

    it('should throw an error if no store is passed', function() {
      expect(function() {
        dispatcher.registerCallback('eventName');
      }).to.throw(TypeError);
    });
    it('should throw an error an object/class with no listenTo function is passed', function() {
      expect(function() {
        dispatcher.registerCallback('eventName', {});
      }).to.throw(TypeError);
    });

    it('should throw an error if no callback is passed', function() {
      expect(function() {
        dispatcher.registerCallback('eventName', fakeStore);
      }).to.throw(TypeError);
    });
    it('should throw an error if the given callback is not a function', function() {
      expect(function() {
        dispatcher.registerCallback('eventName', fakeStore, {});
      }).to.throw(TypeError);
    });

    it('calls the store\'s listenTo function when called with proper params', function() {
      let cb = function(){};
      dispatcher.registerCallback('eventName', fakeStore, cb);
      expect(fakeStore.listenTo).to.have.been.calledOnce;
      expect(fakeStore.listenTo).to.have.been.calledWithExactly(dispatcher, 'eventName', cb);
    });
  });

/*
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
  */
  describe('registerStore', function() {
    var fakeBaseStore = {
      listenTo: sinon.stub()
    };

    describe('throws errors', function() {
      it('throws an error whenever a store is not passed as param at all', function() {
        expect(function() {
          dispatcher.registerStore();
        }).to.throw(TypeError);
      });
      it('throws an error whenever an invalid store is passed', function() {
        expect(function() {
          dispatcher.registerStore({});
        }).to.throw(TypeError);
      });
    });

    describe('using the unique callback', function() {
      it('doesn\'t call `registerCallback`() if the unique callback is not a function', function() {
        let fakeStore = _.extend({
          [dispatcher.callbackName]: {}
        }, fakeBaseStore);

        expect(function() {
          dispatcher.registerStore(fakeStore);
        }).to.throw(Error);
      });
      it('calls `registerCallback`()', function() {
        let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
        let fakeStore = _.extend({
          [dispatcher.callbackName]: function(){}
        }, fakeBaseStore);

        dispatcher.registerStore(fakeStore);
        expect(registerCallbackStub)
          .to.have.been.calledOnce
          .and
          .to.have.been.calledWithExactly('all', fakeStore, fakeStore[dispatcher.callbackName])
        registerCallbackStub.restore();
      });

      it('still calls `registerCallback`() overriding the default callback name', function() {
        let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
        let newFancyName = 'myFancyCallback';
        let fakeStore = _.extend({
          [newFancyName]: function(){}
        }, fakeBaseStore);

        dispatcher.callbackName = newFancyName;
        dispatcher.registerStore(fakeStore);
        expect(registerCallbackStub)
          .to.have.been.calledOnce
          .and
          .to.have.been.calledWithExactly('all', fakeStore, fakeStore[newFancyName])
        registerCallbackStub.restore();
      });
    });

  });
});
