import FakeStore from './FakeStore';

const actionNames = {
  EVENT: 'EVENT',
  PLAY_SKA: 'PLAY_SKA',
  PLAY_SKAPUNK: 'PLAY_SKAPUNK'
};

class MultiCallbackStore extends FakeStore {
  constructor() {
    super();
  }

  handlers() {
    return {
      [actionNames.EVENT](payload) {
        return payload;
      },
      [actionNames.PLAY_SKA]() {
        return {
          band: 'Original High Fives',
          album: 'Good Enough',
          url: 'https://open.spotify.com/album/2WfZYtLuN42khPTjWwVhdG'
        };
      },
      [actionNames.PLAY_SKAPUNK]: 'gimmeSkaPunk'
    };
  }

  gimmeSkaPunk() {
    return {
      band: 'Mad Caddies',
      album: 'Dirty Rice',
      url: 'https://open.spotify.com/album/1QNr1V1F2w2VXdBmAF79Vq'
    };
  }
}

export default MultiCallbackStore;
