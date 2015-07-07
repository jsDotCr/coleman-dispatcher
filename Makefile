# Command line paths
KARMA = ./node_modules/karma/bin/karma
ISTANBUL = ./node_modules/karma-coverage/node_modules/.bin/istanbul
ESLINT = ./node_modules/eslint/bin/eslint.js
MOCHA = ./node_modules/mocha/bin/_mocha
COVERALLS = ./node_modules/coveralls/bin/coveralls.js

# folders
DIST = "dist/"

test: eslint test-karma

eslint:
	# check code style
	@ $(ESLINT) -c ./.eslintrc lib test

test-karma:
	@ $(KARMA) start karma.config.js

test-coveralls:
	@ cat ./test/coverage/report-lcov/lcov.info | $(COVERALLS)

test-sauce:
	# run the saucelabs in separate chunks
	@ for group in 0 1 2 3; do GROUP=$$group make test-karma; done
