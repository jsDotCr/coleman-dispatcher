# coleman-dispatcher

Yet another [Flux](http://facebook.github.io/react/docs/flux-overview.html) dispatcher for Javascript-based apps. This 
a wannabe-clean mix of the [Backbone.Events](http://backbonejs.org/#Events) module, based on Yahoo's [Dispatchr](https://github.com/yahoo/dispatchr)
interface, and inspired by [backbone-dispatcher](https://github.com/talyssonoc/backbone-dispatcher).

## Install

Install it using the command `npm install coleman-dispatcher`.

Run the tests using `npm test`

## Why this name

Why coleman-dispatcher? Because I had to find a name for it and all of the c00ler/most appropriate names are already used. So I ended up on Wikipedia looking for something related, more or less, and I've found the tragic but amazing story of [Vince Coleman](http://en.wikipedia.org/wiki/Vince_Coleman_%28train_dispatcher%29), a train dispatcher who spent his last moments on a morse code machine requiring to stop all the trains going to Halifax since a huge explosion was expected nearby, caused by collision between a munitions ship and a vassel.
A fucking awesome train/morse/dispatcher hero.

## Usage

Just like Backbone.Events, coleman-dispatcher is a static set of methods as well (yeah, it's just an hash with some functions defined as properties, you're right).
It's in a very early stage, there are quite a few things missing I'd like to add, such as:

* waitFor()
* **Tons** more of unit tests
* Caching stores and/or callbacks
* Provide a way to (automatically) clean up the callbacks

Feel free to ask if you have any trouble using this, if you think I've fucked up something, or you'd just like to say hi and/or get a free hug :)

## Public interface

### registerStore(`store`)
Your Collection/store file, let's say `TrainStore.js`, might look like this:

```js
var Backbone = require('backbone');
var Dispatcher = require('coleman-dispatcher');

var TrainStore = Backbone.Collection.extend({
  url: '/api/trains',
  model: Train,
  initialize: function initialize() {
    'use strict';

    Dispatcher.registerStore(this);
  }
});
```

When this collection gets initialized, it'll call the `registerStore` function which is in charge of setting up the
proper events callbacks, based on the store class, using `store` itself as a context (Yeah Backbone.Events autobind!).

### registerCallback(`eventName`, `store`, `callbackFn`)
Under the hood, registerStore will call `registerCallback` with a proper set of arguments. Even if it's a low-level function, I've left this publicly exposed as it may be helpful in some cases.
Please note none of the three arguments here have a default, you have to explicitly provide them.

### handlersHashName = '`handlers`';
The value of this property is used to retrieve the event callbacks' hash on the registered store so the proper bindings
can be done. By default, its value is `handlers`.
Extending the example above, we'd have:

```js
var Backbone = require('backbone');
var Dispatcher = require('coleman-dispatcher');
var TrainActions = require('actions/TrainActions');
var ActionTypes = TrainActions.ActionTypes;

var TrainStore = Backbone.Collection.extend({
  url: '/api/trains',
  model: Train,
  handlers: [
    {
      action: ActionTypes.TRAIN_FETCH,
      callback: function handleFetchTrain() {
        'use strict';

        this.fetch();
      }
    },
    {
      action: ActionTypes.TRAIN_STOP,
      callback: function handleStopTrain(payload) {
        'use strict';

        var trainToStop = this.findWhere({
          trainId: payload.id
        });
        if (trainToRun){
          myTrain.set({
            isRunning: false
          });
        }
      }
    }
  ],
  initialize: function initialize() {
    'use strict';

    Dispatcher.registerStore(this);
  }
});
```

Since we used the default `handlersHashName` value, the code above would attach `handleFetchTrain` callback function to 
the `ActionTypes.TRAIN_FETCH` event, and `handlerStopTrain` would be triggers when the `ActionTypes.TRAIN_STOP` event 
is fired instead.
Please notice the `this` inside the callback functions always refers to the Store/Collection/Model in which the callback
is defined.

### callbackName = '`onEventDispatched`';
If no object with `handlersHashName`'s value as a key is found, coleman-dispatcher will fallback to a single default 
callback, defined by `callbackName`'s value. You may want to use this rather than `handlersHashName` to have the 
widely used switch block based on the events name in a single callback function.
By default, its value is `onEventDispatched`.

This code would work exactly as the code above:

```js
var Backbone = require('backbone');
var Dispatcher = require('coleman-dispatcher');
var TrainConstants = require('constants/TrainConstants');
var ActionTypes = TrainConstants.ActionTypes;

var TrainStore = Backbone.Collection.extend({
  url: '/api/trains',
  model: Train,
  onEventDispatched: function onEventDispatched(payload, eventName){
    switch(eventName){
      case ActionTypes.TRAIN_FETCH:
        this.fetch();
      break;
      case ActionTypes.TRAIN_STOP:
        var trainToStop = this.findWhere({
          trainId: payload.id
        });
        if (trainToRun){
          myTrain.set({
            isRunning: false
          });
        }
      break;
    }
  },
  initialize: function initialize() {
    'use strict';

    Dispatcher.registerStore(this);
  }
});
```

Again: no need to bind the store to the callback, it's already taken care of. I'm basically a good guy. I love you all.

### dispatch(`eventName`[, `payload`[, `someOtherPayload`...]])

To trigger an event, the `dispatch` function must be called. Any payload is optional.

```js
var Backbone = require('backbone');
var Dispatcher = require('coleman-dispatcher');
var TrainConstants = require('actions/TrainConstants');

var ActionTypes = TrainConstants.ActionTypes;

module.exports = {
  fetchTrains: function fetchTrains() {
    'use strict';

    Dispatcher.dispatch(ActionTypes.TRAIN_FETCH);
  },
  stopTrain: function stopTrain(id) {
    'use strict';

    Dispatcher.dispatch(ActionTypes.TRAIN_STOP);
  }
};
```
