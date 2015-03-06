/*global describe, it */
'use strict';

var chai = require('chai');
var expect = chai.expect;

// Pull in the module we want to test.
var dispatcher = require('../../index');

describe('Backbone.js dispatcher module', function() {
  describe('Interface', function() {
    it('has default handlers object name and callback name defined', function() {
      expect(dispatcher).to.contain.keys('handlersHashName', 'callbackName');
    });
    it('has dispatcher interface', function() {
      expect(dispatcher).to.contain.keys('dispatch', 'registerStore', 'registerCallback');
    });
    it('inherits from Backbone.Events object', function() {
      expect(dispatcher).to.contain.keys('listenTo', 'listenToOnce', 'trigger');
    });
  });
});
