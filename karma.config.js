//var istanbul = require('browserify-istanbul');
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
      'test/specs/**/*.js'
    ],
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      testName: 'coleman-dispatcher',
      startConnect: true,
      recordVideo: true,
      recordScreenshots: true
    },
    preprocessors: {
      'test/specs/**/*.js': ['browserify', 'coverage']
    },
    customLaunchers: saucelabsBrowsers,
    browsers: browsers,
    singleRun: true,
    logLevel: 'LOG_DEBUG',
    autoWatch: true,
    colors: true,
    browserify: {
      ignore: 'jquery',
      debug: true,
      bundleDelay: 1000,
      transform: [
        ['babelify', { sourceMaps: 'both' }]//,
        //[istanbul({
        //  instrumenter: isparta,
        //  ignore: ['test/specs/**/*.js', 'node_modules/**'],
        //  defaultIgnore: true
        //})]
      ],
      configure: function(bundle) {
        bundle.ignore('jquery');
      }
    },
    reporters: ['progress', 'coverage', 'saucelabs'],
    coverageReporter: {
      reporters: [
        //{
        //  type: 'html',
        //  dir: 'test/coverage/'
        //},
        {
          type: 'cobertura',
          dir: 'test/coverage-cobertura/'
        },
        {
          type: 'lcov',
          dir: 'test/coverage/',
          subdir: 'report-lcov'
        }
      ]
    }
  });
};
