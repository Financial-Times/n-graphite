include n.Makefile

unit-test:
	mocha tests/**/*.test.js --recursive

test: unit-test verify
