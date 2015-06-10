# coleman-dispatcher
Yet another [Flux](http://facebook.github.io/react/docs/flux-overview.html) dispatcher for Javascript-based apps. This is a wannabe-clean mix of the [Backbone.Events](http://backbonejs.org/#Events) module, based on Yahoo's [Dispatchr](https://github.com/yahoo/dispatchr) interface, and inspired by [backbone-dispatcher](https://github.com/talyssonoc/backbone-dispatcher).

## Install
Install it using the command `npm install coleman-dispatcher`.

In case you're not using ES6 and/or a transipler on your side, the package comes with browserify included (as a dev dependency, I swear!). To translate it as ES5, the right command to run is `npm run generate-es5`.

The tests are run using `npm test` (it will run karma & PhantomJS & Firefox by default), while the lint is available using `npm run lint`.

## Why this name
Why coleman-dispatcher? Because I had to find a name for it and all of the c00ler/most appropriate names are already used. So I ended up on Wikipedia looking for something related, more or less, and I've found the tragic but amazing story of [Vince Coleman](http://en.wikipedia.org/wiki/Vince_Coleman_%28train_dispatcher%29), a train dispatcher who spent his last moments on a morse code machine requiring to stop all the trains going to Halifax since a huge explosion was expected nearby, caused by collision between a munitions ship and a vassel. A fucking awesome train/morse/dispatcher hero.

## What it is
With the last additions, this package evolved from an object with some useful functions, to an ES6 class. It is instantiated in index.js though, so it'll basically (not 100% accurate, I know) remain a collection of useful functions with a nice defined scope.

Still to add, at some point:
- waitFor()
- Caching stores and/or callbacks
- Provide a way to (automatically) clean up the callbacks

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

When this collection gets initialized, it'll call the `registerStore` function which is in charge of setting up the proper events callbacks, based on how the store class and the callbacks are structured, using `store` itself as a context (Yeah Backbone.Events autobind!).

There are two ways to register callbacks: using an hash, or with a single callback.

### handlersHashName = '`handlers`';
The value of this property is used to retrieve the event callbacks' hash on the registered store so the proper bindings can be done. By default, its value is `handlers`.

### callbackName = '`onEventDispatched`';
If no object with the `handlersHashName`'s value as a key is found, coleman-dispatcher will fallback to a single default callback, defined by `callbackName`'s value (by default, that is `onEventDispatched`). You may want to use this rather than the hash solution shown above, especially if you're used to the Facebook way of working with actions and their callbacks.

### registerCallback(`eventName`, `store`, `callbackFn`)
Under the hood, registerStore will call `registerCallback` with a proper set of arguments. Even if it's a low-level function, I've left this publicly exposed as it may be helpful in some cases.

Please note none of the three arguments here have a default, you have to explicitly provide them.

### dispatch(`eventName`[, `payload`[, `someOtherPayload`...]])
To trigger an event, the `dispatch` function must be called. Any payload is optional. More than one payload can be defined: anything from the second argument on will be forwarded to the callbacks.

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

## Extended examples of registering a Store using the hash

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

Since we used the default `handlersHashName` value (that is, `handlers`), the code above would attach `handleFetchTrain` callback function to the `ActionTypes.TRAIN_FETCH` event, and `handlerStopTrain` is triggered when the `ActionTypes.TRAIN_STOP` event is fired instead. Please notice the `this` inside the callback functions _always_ refers to the Store/Collection/Model where the callback is defined.

### Hash using strings as callbacks
If you prefer to have a cleaner hash, you may also define the callback as a string: coleman will call the corresponding store function with such a name. Quick example:

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
      callback: 'handleFetchTrain',
    {
      action: ActionTypes.TRAIN_STOP,
      callback: 'stopThatTrain'
    }
  ],
  initialize: function initialize() {
    'use strict';

    Dispatcher.registerStore(this);
  },
  handleFetchTrain: function handleFetchTrain() {
    'use strict';

    this.fetch();
  },
  stopThatTrain: function stopThatTrain() {
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
});
```

### Strings, strings everywhere
Another way of declaring handlers is:

```js
var Backbone = require('backbone');
var Dispatcher = require('coleman-dispatcher');
var TrainActions = require('actions/TrainActions');
var ActionTypes = TrainActions.ActionTypes;

var TrainStore = Backbone.Collection.extend({
  url: '/api/trains',
  model: Train,
  handlers: {
    'TRAIN_FETCH': 'handleFetchTrain',
    'TRAIN_STOP': 'stopThatTrain'
  },
  initialize: function initialize() {
    'use strict';

    Dispatcher.registerStore(this);
  },
  handleFetchTrain: function handleFetchTrain() {
    'use strict';

    this.fetch();
  },
  stopThatTrain: function stopThatTrain() {
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
});
```

### ES6. ES2015. Whatever... The fancy one
You like **ES2015**? Me too, lately. I've got you covered as well.

```js
import Backbone from 'backbone';
import Dispatcher from 'coleman-dispatcher';
import { ActionTypes } from 'actions/TrainActions';

class TrainStore extends Backbone.Collection {
  constructor() {
    super();
  }

  url() {
    return '/api/trains';
  }

  model() {
    return Train;
  }

  handlers() {
    return {
      [ActionTypes.TRAIN_FETCH]() {
        'use strict';

        this.fetch();
      },
      [ActionTypes.TRAIN_STOP](payload) {
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
    };
  }

  initialize() {
    'use strict';

    Dispatcher.registerStore(this);
  }
}

let trainStore = new TrainStore();
export default trainStore;
```

This basically works exactly as before. But it's a more compact syntax.

## One single callback to rule 'em all
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
