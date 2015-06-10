import FakeStore from './FakeStore';

class SingleCallbackStore extends FakeStore {
  constructor() {
    super();
  }

  onEventDispatched() {
    console.log('called?');
    return true;
  }
}

export default SingleCallbackStore;
