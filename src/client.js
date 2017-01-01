
const net = require('net');
const logger = require('@financial-times/n-logger').default;

class Graphite {

	constructor({transmit=true, host, port, onlyLogProductionMetrics=true}={}) {
		this.host = host;
		this.port = port;
		this.onlyLogProductionMetrics = onlyLogProductionMetrics;
		this.isProduction = process.env.NODE_ENV === 'production';
	}

	log(metrics) {

		noNulls = removeNulls(metrics);
		data = formatAsGraphite(noNulls);

		//map data to graphite format
		//chunk in 20

	}

	// Removes null values from a Map()
	removeNulls(metrics) {
		for (let [metric, value] of metrics) {
			if (value == null || value == false) {
				metrics.delete(metric);
			}
		}
		return metrics;
	}

	// Returns
	toGraphiteString(metrics, { date, prefix='', inChunksOf = 1000 }={}) {
		const time = (date || new Date()) / 1000;
		let arr = [];
		for (let [metric, value] of metrics) {
			arr.push(`${prefix}${metric} ${value} ${time}`);
		}
		return arr.join("\n") + "\n";
	}

	send(metrics) {

		if (!this.isProduction && this.onlyLogProductionMetrics) {
			logger.debug({ event: 'GRAPHITE_DISABLED', metrics: metrics, node_env: process.env.NODE_ENV });
			return false;
		}

		logger.debug({ event: 'GRAPHITE_SEND', metrics: metrics, host: this.host, port: this.port });

		const socket = net.createConnection(this.port, this.host, () => {
			socket.write(metrics); // trailing \n to ensure the last metric is registered
			socket.end();
		});

		socket.on('end', function(err) {
			logger.info({ event: 'GRAPHITE_CLIENT_DISCONNECT' });
		});

		socket.on('error', function(err) {
			logger.error({ event: 'GRAPHITE_CLIENT_ERROR', error: err });
		});

		socket.on('timeout', function() {
			logger.error({ event: 'GRAPHITE_CLIENT_TIMEOUT' });
		});

	}

}

module.exports = (opts) => new Graphite(opts);
