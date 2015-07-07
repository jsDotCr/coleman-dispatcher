module.exports = {
  browsers: {
    'SL_safari': {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.10',
      group: 0
    },
    'SL_IE9': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9',
      group: 1
    },
    'SL_IE10': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10',
      group: 1
    },
    'SL_IE11': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11',
      group: 1
    },
    'SL_android5': {
      base: 'SauceLabs',
      browserName: 'android',
      version: '5.1',
      group: 2
    },
    'SL_chrome': {
      base: 'SauceLabs',
      browserName: 'chrome',
      group: 2
    },
    'SL_firefox': {
      base: 'SauceLabs',
      browserName: 'firefox',
      group: 2
    },
    'SL_android4': {
      base: 'SauceLabs',
      browserName: 'android',
      version: '4.0',
      group: 3
    }
  }
};
