/*global describe, it */
/*eslint func-names: 0*/
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import { Events as BackboneEvents } from 'backbone';
import _ from 'underscore';
import SingleCallbackStore from '../helpers/SingleCallbackStore';
import MultiCallbackStore from '../helpers/MultiCallbackStore';

// Pull in the module we want to test.
import dispatcher from '../../index';

describe('Backbone.js dispatcher module', function() {
  describe('Interface', function() {
    it('has default handlers object name and callback name defined', function() {
      expect(dispatcher.handlersHashName).to.be.a.string;
      expect(dispatcher.callbackName).to.be.a.string;
    });

    it('inherits all Backbone.Events object', function() {
      for (let backboneEvent in BackboneEvents) {
        if (BackboneEvents.hasOwnProperty(backboneEvent)) {
          expect(dispatcher[backboneEvent]).to.be.a.function;
        }
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
      expect(triggerSpy).to.have.been.calledWith('eventName', payload, 'eventName');
      triggerSpy.restore();
    });
  });

  describe('registerCallback', function() {
    let fakeStore = {
      listenTo: sinon.stub(),
      handlers: function() {}
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
      let cb = function() {};
      dispatcher.registerCallback('eventName', fakeStore, cb);
      expect(fakeStore.listenTo).to.have.been.calledOnce;
      expect(fakeStore.listenTo).to.have.been.calledWithExactly(dispatcher, 'eventName', cb);
    });
  });

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

      it('calls `registerCallback`() - using an object as a store', function() {
        let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
        let fakeStore = _.extend({
          [dispatcher.callbackName]: function() {}
        }, fakeBaseStore);

        dispatcher.registerStore(fakeStore);
        expect(registerCallbackStub)
          .to.have.been.calledOnce
          .and
          .to.have.been.calledWithExactly('all', fakeStore, fakeStore[dispatcher.callbackName]);
        registerCallbackStub.restore();
      });

      it('calls `registerCallback`() - using an ES6 class as a store', function() {
        let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
        let fakeStore = new SingleCallbackStore();

        dispatcher.registerStore(fakeStore);
        expect(registerCallbackStub)
          .to.have.been.calledOnce
          .and
          .to.have.been.calledWithExactly('all', fakeStore, fakeStore[dispatcher.callbackName]);
        registerCallbackStub.restore();
      });

      it('still calls `registerCallback`() overriding the default callback name', function() {
        let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
        let newFancyName = 'myFancyCallback';
        let fakeStore = _.extend({
          [newFancyName]: function() {}
        }, fakeBaseStore);

        dispatcher.callbackName = newFancyName;
        dispatcher.registerStore(fakeStore);
        expect(registerCallbackStub)
          .to.have.been.calledOnce
          .and
          .to.have.been.calledWithExactly('all', fakeStore, fakeStore[newFancyName]);
        registerCallbackStub.restore();
      });
    });

    describe('using multiple callbacks for the same store', function() {
      it('doesn\'t execute any `registerCallback`() on empty cb hash', function() {
        let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
        let multiCB = new MultiCallbackStore();
        multiCB.handlers = {};

        dispatcher.registerStore(multiCB);
        expect(registerCallbackStub).to.not.have.been.called;
        registerCallbackStub.restore();
      });

      describe('handler defined as { `actionName`: `callbackFunctionName`|callbackFn()}', function() {
        it('doesn\'t call `registerCallback` with `store[handler]` not being a function', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.handlers = {
            whatevs: 'notExistingFunctionInTheStore'
          };

          expect(function() {
            dispatcher.registerStore(multiCB);
          }).to.throw(TypeError);
          registerCallbackStub.restore();
        });

        it('doesn\'t call `registerCallback` if `handler` is not a string nor a function', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.handlers = {
            whatevs: []
          };

          expect(function() {
            dispatcher.registerStore(multiCB);
          }).to.throw(TypeError);
          registerCallbackStub.restore();
        });

        it('calls `registerCallback` if `store[handler]` is a function', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.existingFunctionInTheStore = function() {};
          multiCB.anotherFunction = function() {};
          multiCB.handlers = {
            whatevs: 'existingFunctionInTheStore',
            yo: 'anotherFunction'
          };

          dispatcher.registerStore(multiCB);
          expect(registerCallbackStub).to.have.been.calledTwice;
          registerCallbackStub.restore();
        });

        it('calls `registerCallback` if `handler()` is a function', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.handlers = {
            whatevs: function() {},
            yo: function() {}
          };

          dispatcher.registerStore(multiCB);
          expect(registerCallbackStub).to.have.been.calledTwice;
          registerCallbackStub.restore();
        });
      });

      describe('handler defined as { action: \'actionName\', callback: \'callbackFunctionName|callbackFn()\'}', function() {
        it('doesn\'t call `registerCallback` if the `handler.action` is not a proper string', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.existingFunctionInTheStore = function() {};
          multiCB.handlers = [
            {
              action: function() {
                return 'maybeAGoodActionNameButStillInsideAFunction';
              },
              callback: 'existingFunctionInTheStore'
            }
          ];

          expect(function() {
            dispatcher.registerStore(multiCB);
          }).to.throw(TypeError);
          registerCallbackStub.restore();
        });

        it('doesn\'t call `registerCallback` with `store[handler.callback]` not being a function', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.handlers = [
            {
              action: 'fancyActionNameHere',
              callback: 'notAnExistingFunctionInTheStore'
            }
          ];

          expect(function() {
            dispatcher.registerStore(multiCB);
          }).to.throw(TypeError);
          registerCallbackStub.restore();
        });

        it('doesn\'t call `registerCallback` if `handler.callback` is not a string nor a function', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.handlers = [
            {
              action: 'fancyActionNameHere',
              callback: []
            }
          ];

          expect(function() {
            dispatcher.registerStore(multiCB);
          }).to.throw(TypeError);
          registerCallbackStub.restore();
        });

        it('calls `registerCallback` if `store[handler.callback]` is a function', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.existingFunctionInTheStore = function() {};
          multiCB.anotherFunction = function() {};
          multiCB.handlers = [
            {
              action: 'fancyActionNameHere',
              callback: 'existingFunctionInTheStore'
            },
            {
              action: 'whateverAction',
              callback: 'anotherFunction'
            }
          ];

          dispatcher.registerStore(multiCB);
          expect(registerCallbackStub).to.have.been.calledTwice;
          registerCallbackStub.restore();
        });

        it('calls `registerCallback` if `store[handler.callback]` is a function', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          multiCB.handlers = [
            {
              action: 'fancyActionNameHere',
              callback: function() {}
            },
            {
              action: 'whateverAction',
              callback: function() {}
            }
          ];

          dispatcher.registerStore(multiCB);
          expect(registerCallbackStub).to.have.been.calledTwice;
          registerCallbackStub.restore();
        });
      });

      describe('handler() returns an handlers hash like { `actionName`: `callbackFunctionName`|callbackFn()}', function() {
        it('calls `registerCallback`, even if the handler function returns a mix of anything valid before', function() {
          let registerCallbackStub = sinon.stub(dispatcher, 'registerCallback');
          let multiCB = new MultiCallbackStore();
          /*
          Note. MultiCallbackStore is defined as
            ```
            handlers() {
              return {
                [actionNames.EVENT](payload) {
                  return payload;
                },
                [actionNames.PLAY_SKA](payload) {
                  return {
                    band: 'Original High Fives',
                    album: 'Good Enough',
                    url: 'https://open.spotify.com/album/2WfZYtLuN42khPTjWwVhdG'
                  };
                },
                [actionNames.PLAY_SKAPUNK]: 'gimmeSkaPunk'
              };
            }

            gimmeSkaPunk(payload) {
              return {
                band: 'Mad Caddies',
                album: 'Dirty Rice',
                url: 'https://open.spotify.com/album/1QNr1V1F2w2VXdBmAF79Vq'
              };
            }
            ```
          */

          dispatcher.registerStore(multiCB);
          expect(registerCallbackStub).to.have.been.calledThrice;
          registerCallbackStub.restore();
        });
      });
    });
  });
});
