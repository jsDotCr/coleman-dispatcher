/*global describe, it */
/*eslint func-names: 0*/
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import MultiCallbackStore from '../helpers/MultiCallbackStore';

// Pull in the module we want to test.
import Dispatcher from '../../lib/index';

describe('waitFor', () => {
  describe('Syncronous', () => {
    beforeEach(function() {
      this.dispatcher = new Dispatcher();
    });

    it('doesn`t get called if no opts.waitFor is specified', function() {
      let waitForSpy = sinon.spy(this.dispatcher, '_waitFor');
      let waitForAsyncSpy = sinon.spy(this.dispatcher, '_waitForAsync');

      this.dispatcher.dispatch('whatever', {}, {});

      expect(waitForSpy).to.have.not.been.called;
      expect(waitForAsyncSpy).to.have.not.been.called;

      waitForSpy.restore();
      waitForAsyncSpy.restore();
    });

    it('doesn`t get called if no valid opts.waitFor is specified', function() {
      let waitForSpy = sinon.spy(this.dispatcher, '_waitFor');
      let waitForAsyncSpy = sinon.spy(this.dispatcher, '_waitForAsync');

      this.dispatcher.dispatch('whatever', {}, {
        waitFor: true
      });

      expect(waitForSpy).to.have.not.been.called;
      expect(waitForAsyncSpy).to.have.not.been.called;

      waitForSpy.restore();
      waitForAsyncSpy.restore();
    });

    it('gets called once opts.waitFor is a valid action name', function() {
      let waitForSpy = sinon.spy(this.dispatcher, '_waitFor');
      let waitForAsyncSpy = sinon.spy(this.dispatcher, '_waitForAsync');

      this.dispatcher.dispatch('whatever', {}, {
        waitFor: 'validACtionName'
      });

      expect(waitForSpy).to.have.been.calledOnce;
      expect(waitForAsyncSpy).to.have.not.been.called;

      waitForSpy.restore();
      waitForAsyncSpy.restore();
    });

    it('calls the `listenTo` function, setting up a catchAll listener', function() {
      let listenToSpy = sinon.spy(this.dispatcher, 'listenTo');

      this.dispatcher.dispatch('whatever', {}, {
        waitFor: 'validActionName'
      });

      expect(listenToSpy).to.have.been.calledOnce
        .and
        .calledWith(this.dispatcher, 'all');

      listenToSpy.restore();
    });

    it('triggers the action after the waitFor one', function() {
      let fakeStore = new MultiCallbackStore();
      let waitForMeSpy = sinon.spy();
      let mainActionSpy = sinon.spy();

      this.dispatcher.registerCallback('waitForMe', fakeStore, waitForMeSpy);
      this.dispatcher.registerCallback('youWill', fakeStore, mainActionSpy);

      this.dispatcher.dispatch('youWill', {}, {
        waitFor: 'waitForMe'
      });
      expect(waitForMeSpy, 'waitForMe action, pre waitFor dispatch').to.have.not.been.called;
      expect(mainActionSpy, 'youWill action, pre waitFor dispatch').to.have.not.been.called;

      this.dispatcher.dispatch('waitForMe');
      expect(waitForMeSpy, 'waitForMe action, after first waitFor dispatch').to.have.been.calledOnce;
      expect(mainActionSpy, 'youWill action, after first waitFor dispatch').to.have.been.calledOnce;
      expect(mainActionSpy, 'youWill action').to.have.been.calledAfter(waitForMeSpy);

      this.dispatcher.dispatch('waitForMe');
      expect(waitForMeSpy, 'waitForMe action, after second waitFor dispatch').to.have.been.calledTwice;
      expect(mainActionSpy, 'youWill action, after second waitFor dispatch').to.have.been.calledOnce;
    });

    afterEach(function() {
      this.dispatcher = null;
    });
  });

  describe('ASYNCronous', () => {
    before(function() {
      this.clock = sinon.useFakeTimers();
    });

    beforeEach(function() {
      this.dispatcher = new Dispatcher();
    });

    it('doesn`t get called if no opts.waitFor is specified', function() {
      let waitForSpy = sinon.spy(this.dispatcher, '_waitFor');
      let waitForAsyncSpy = sinon.spy(this.dispatcher, '_waitForAsync');

      this.dispatcher.dispatch('whatever', {}, {
        async: true
      });

      expect(waitForSpy).to.have.not.been.called;
      expect(waitForAsyncSpy).to.have.not.been.called;

      waitForSpy.restore();
      waitForAsyncSpy.restore();
    });

    it('doesn`t get called if no valid opts.waitFor is specified', function() {
      let waitForSpy = sinon.spy(this.dispatcher, '_waitFor');
      let waitForAsyncSpy = sinon.spy(this.dispatcher, '_waitForAsync');

      this.dispatcher.dispatch('whatever', {}, {
        waitFor: true,
        async: true
      });

      expect(waitForSpy).to.have.not.been.called;
      expect(waitForAsyncSpy).to.have.not.been.called;

      waitForSpy.restore();
      waitForAsyncSpy.restore();
    });

    it('gets called once if opts.waitFor is a valid action name', function() {
      let waitForSpy = sinon.spy(this.dispatcher, '_waitFor');
      let waitForAsyncSpy = sinon.spy(this.dispatcher, '_waitForAsync');

      this.dispatcher.dispatch('whatever', {}, {
        waitFor: 'validActionName',
        async: true
      });

      expect(waitForAsyncSpy).to.have.been.calledOnce;
      expect(waitForSpy).to.have.not.been.called;

      waitForSpy.restore();
      waitForAsyncSpy.restore();
    });

    it('won`t execute if waitFor is defined, but done cb isn`t executed', function() {
      let mainActionSpy = sinon.spy();
      let fakeStore = new MultiCallbackStore();

      this.dispatcher.registerCallback('asyncYouWillNoExec', fakeStore, mainActionSpy);

      this.dispatcher.dispatch('asyncYouWillNoExec', {}, {
        waitFor: 'asyncWaitForMe',
        async: true
      });
      expect(mainActionSpy).to.have.not.been.called;
    });

    it('waits for the done callback to be executed', function() {
      let mainActionSpy = sinon.spy();
      let waitForMeSpy = sinon.spy();
      let fakeStore = new MultiCallbackStore();
      let secondFakeStore = new MultiCallbackStore();

      this.dispatcher.registerCallback('asyncWaitForMe', fakeStore, function(payload, eventName, dispatcherDone) {
        setTimeout(function() {
          waitForMeSpy();
          dispatcherDone();
        }, 500);
      });
      this.dispatcher.registerCallback('asyncYouWill', secondFakeStore, mainActionSpy);

      this.dispatcher.dispatch('asyncYouWill', {}, {
        waitFor: 'asyncWaitForMe',
        async: true
      });
      this.dispatcher.dispatch('asyncWaitForMe');
      expect(mainActionSpy, 'asyncYouWill action, after waitFor dispatch').to.have.not.been.called;

      this.clock.tick(1000);
      expect(waitForMeSpy, 'asyncWaitForMe spy action').to.have.been.calledOnce;
      expect(mainActionSpy, 'asyncYouWill action, after done() cb has been executed').to.have.been.calledOnce;
    });

    it('doesn`t call the main action if the waitFor executes the error callback', function() {
      let mainActionSpy = sinon.spy();
      let waitForMeSpy = sinon.spy();
      let fakeStore = new MultiCallbackStore();
      let secondFakeStore = new MultiCallbackStore();

      this.dispatcher.registerCallback('asyncWaitForMe', fakeStore, function(payload, eventName, doneCB, errorCB) {
        setTimeout(function() {
          waitForMeSpy();
          errorCB();
        }, 500);
      });
      this.dispatcher.registerCallback('asyncYouWill', secondFakeStore, mainActionSpy);

      this.dispatcher.dispatch('asyncYouWill', {}, {
        waitFor: 'asyncWaitForMe',
        async: true
      });
      this.dispatcher.dispatch('asyncWaitForMe');
      expect(mainActionSpy, 'asyncYouWill action, after waitFor dispatch').to.have.not.been.called;

      this.clock.tick(1000);
      expect(waitForMeSpy, 'asyncWaitForMe spy action').to.have.been.calledOnce;
      expect(mainActionSpy, 'asyncYouWill action, after error() cb has been executed').to.have.not.been.called;
    });

    it('calls the error callback in case of errors on the waitFor action', function() {
      let mainActionErrorSpy = sinon.spy();
      let mainActionSpy = sinon.spy();
      let fakeStore = new MultiCallbackStore();
      let secondFakeStore = new MultiCallbackStore();

      this.dispatcher.registerCallback('asyncWaitForMe', fakeStore, function(payload, eventName, doneCB, errorCB) {
        setTimeout(function() {
          errorCB();
        }, 500);
      });
      this.dispatcher.registerCallback('asyncYouWill', secondFakeStore, mainActionSpy);

      this.dispatcher.dispatch('asyncYouWill', {}, {
        waitFor: 'asyncWaitForMe',
        async: true,
        error: mainActionErrorSpy
      });
      this.dispatcher.dispatch('asyncWaitForMe');

      expect(mainActionErrorSpy, 'main action error cb, after waitFor dispatch').to.have.not.been.called;

      this.clock.tick(1000);
      expect(mainActionErrorSpy, 'main action error cb, after tick').to.have.been.calledOnce;
      expect(mainActionSpy, 'main action, after tick').to.have.not.been.called;
    });

    after(function() {
      this.clock.restore();
    });

    afterEach(function() {
      this.dispatcher = null;
    });
  });
});


/*

 dispatch(actionName, payload, opts = {}) {
 validateActionName(actionName);
 if (validateActionName(opts.waitFor, false)) {
 return this['waitFor' + (opts.async ? 'Async' : '')](actionName, payload, opts);
 }

 this.trigger(actionName, payload, actionName);
 }

 waitFor(actionName, payload, { waitFor }) {
 let waitForCallback = function(eventName) {
 if (eventName === waitFor) {
 this.stopListening(this, 'all', waitForCallback);
 this.dispatch(actionName, payload);
 }
 };
 this.listenTo(this, 'all', waitForCallback);
 }

 */
