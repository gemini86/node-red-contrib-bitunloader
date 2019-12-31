const dot = require('dot-object');

module.exports = function (RED) {
	function BitUnloaderNode(config) {
		RED.nodes.createNode(this, config);
		this.padding = config.padding == 'none' ? 0 : Number(config.padding);
		this.mode = config.mode;
		this.prop = config.prop;
		var node = this;
		this.on('input', function (msg, send, done) {
			send = send || function () {
				node.send.apply(node, arguments);
			};
			const errorHandler = (e, msg) => {
				if (done) {
					done(e);
				} else {
					node.error({error: e, msg: msg});
				}
			};
			var p = dot.pick(this.prop, msg);
			if (p == undefined) {
				errorHandler(`Property ${this.prop} is undefined`, msg);
			} else {
				p = Math.abs(parseInt(p));
				if (isNaN(p)) {
					errorHandler('Input is not a number or parsable string.', msg);
				} else {
					if (this.mode === 'string') {
						p = p.toString(2).padStart(this.padding, '0');
					} else if (this.mode === 'arrayBits') {
						p = p.toString(2).padStart(this.padding, '0').split('').reverse();
						for (var i in p) {
							p[i] = Number(p[i]);
						}
					} else if (this.mode === 'arrayBools') {
						p = p.toString(2).padStart(this.padding, '0').split('').reverse();
						for (let i in p) {
							p[i] = p[i] == '1' ? true : false;
						}
					} else if (this.mode === 'objectBits') {
						p = p.toString(2).padStart(this.padding, '0').split('').reverse();
						let obj = {};
						for (let i in p) {
							obj[i] = Number(p[i]);
						}
						p = obj;
					} else if (this.mode === 'objectBools') {
						p = p.toString(2).padStart(this.padding, '0').split('').reverse();
						let obj = {};
						for (let i in p) {
							obj[i] = p[i] == '1' ? true : false;
						}
						p = obj;
					}
					dot.str(this.prop, p, msg);
					send(msg);
					if (done) {
						done();
					}
				}
			}
		});
	}
	RED.nodes.registerType('bitunloader', BitUnloaderNode);
};
