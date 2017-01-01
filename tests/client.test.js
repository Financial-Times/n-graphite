'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const mitm = require('mitm');

const Graphite = require('../src/client');

describe('Client', function () {

	const now = new Date('2016-12-06T08:05:00');

	beforeEach(function () {
		this.mitm = mitm();
		this.mitm.on("connect", function(socket, opts) {
			console.log(123, opts);
			if (opts.host !== "test.host.com") {
				socket.bypass();
			}
		});
	});

	afterEach(function () {
		this.mitm.disable();
	});

	it('Remove falsy values from the metrics', () => {
		const m = Graphite().removeNulls(new Map([['a', 1], ['b', null], ['c', 0]]));
		expect(Array.from(m)).to.deep.equal([['a', 1]]);
	})

	it('Serialise the metrics as Graphite API-friendly string', () => {
		const m = Graphite().toGraphiteString(new Map([['a', 1], ['b', 2]]), { date: now });
		expect(m).to.deep.equal('a 1 1481011500\nb 2 1481011500\n');
	})

	it('Prefix the metrics with a given string', () => {
		const m = Graphite().toGraphiteString(new Map([['a', 1], ['b', 2]]), { date: now, prefix: 'foo.' });
		expect(m).to.deep.equal('foo.a 1 1481011500\nfoo.b 2 1481011500\n');
	})

	it('Send metrics to graphite', function (done) {
		this.mitm.on("connection", function(socket) {
			socket.on('data', function (d) {
				expect(d.toString('utf-8')).to.equal("k.p.a 1 1434399121\n");
				done();
			})
		});
		Graphite({ host: 'test.host.com', port: 1000 }).send('k.p.a 1 1434399121\n')
	})

});
