var babelify = require('babelify');

var saucelabsBrowsers = require('./test/saucelabs-browsers').browsers;
var browsers = ['PhantomJS', 'Firefox'];

// run the tests only on the saucelabs browsers
if (process.env.SAUCELABS) {
  for (var browser in saucelabsBrowsers) {
    if (saucelabsBrowsers[browser].group != process.env.GROUP) {
      delete saucelabsBrowsers[browser];
    }
  }
  browsers = Object.keys(saucelabsBrowsers);
}

module.exports = function(karma) {
  karma.set({
    frameworks: ['browserify', 'mocha'],
    files: [
      'test/specs/**/*.js',
      'lib/**/*.js'
    ],
    sauceLabs: {
      testName: 'coleman-dispatcher',
      startConnect: true,
      recordScreenshots: true
    },
    preprocessors: {
      'test/specs/**/*.js': ['browserify'],
      'lib/**/*.js': ['browserify']
    },
    customLaunchers: saucelabsBrowsers,
    browsers: browsers,
    singleRun: true,
    logLevel: 'LOG_DEBUG',
    colors: true,
    browserify: {
      ignore: 'jquery',
      debug: true,
      bundleDelay: 1000,
      transform: [
        ['babelify', { sourceMaps: 'both' }]
      ],
      configure: function(bundle) {
        bundle.ignore('jquery');
      }
    },
    reporters: ['progress', 'saucelabs']
  });
};
