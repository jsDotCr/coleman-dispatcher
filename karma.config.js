module.exports = function(karma) {
  karma.set({
    frameworks: ['mocha'],
    files: [
      'test/specs/**/*.js'
    ],
    preprocessors: {
      'lib/*.js': ['coverage']
    },
    logLevel: 'LOG_DEBUG',
    autoWatch: true,
    colors: true,
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
