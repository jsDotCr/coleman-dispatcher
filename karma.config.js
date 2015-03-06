module.exports = function(karma) {
  karma.set({
    // include browserify first in used frameworks
    frameworks: ['browserify', 'mocha'],
    files: [
      'test/specs/**/*.js'
    ],
    preprocessors: {
      'test/specs/**/*.js': ['browserify'],
      'lib/*.js': ['browserify', 'coverage']
    },
    logLevel: 'LOG_DEBUG',
    autoWatch: true,
    colors: true,
    browserify: {
      debug: true,
      transform: ['istanbulify'],
      bundleDelay: 1000
    },
    // @TODO karma-coverage is locked at version 0.2.6 because of https://github.com/karma-runner/karma-coverage/issues/123
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      reporters: [
        {
          type: 'html',
          dir: 'test/coverage/'
        },
        {
          type: 'cobertura',
          dir: 'test/coverage-cobertura/'
        }
      ]
    }
  });
};
