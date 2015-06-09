//var istanbul = require('browserify-istanbul');
var babelify = require('babelify');

module.exports = function(karma) {
  karma.set({
    frameworks: ['browserify', 'mocha'],
    files: [
      'test/specs/**/*.js'
    ],
    preprocessors: {
      'test/specs/**/*.js': ['browserify', 'coverage']
    },
    singleRun: false,
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
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      reporters: [
        //{
        //  type: 'html',
        //  dir: 'test/coverage/'
        //},
        {
          type: 'cobertura',
          dir: 'test/coverage-cobertura/'
        }
      ]
    }
  });
};
