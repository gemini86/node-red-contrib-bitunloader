const dot = require('dot-object');
const unloader = require('bitunloader');

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
			this.switchMode = {
				string: function (input, pad) {
					return unloader(input, {padding: pad});
				},
				arrayBits: function (input, pad) {
					return unloader(input, {mode: 'array', type: 'bit', padding: pad});
				},
				arrayBools: function (input, pad) {
					return unloader(input, {mode: 'array', type: 'bool', padding: pad});
				},
				objectBits: function (input, pad) {
					return unloader(input, {mode: 'object', type: 'bit', padding: pad});
				},
				objectBools: function (input, pad) {
					return unloader(input, {mode: 'object', type: 'bool', padding: pad});
				}
			};
			var p = dot.pick(this.prop, msg);
			if (p == undefined) {
				errorHandler(`Property ${this.prop} is undefined`, msg);
			} else {
				p = Math.abs(parseInt(p));
				console.log(p);
				if (isNaN(p)) {
					errorHandler('Input is not a number or parsable string.', msg);
				} else {
					try {
						p = this.switchMode[this.mode](p, this.padding);
					} catch (err) {
						errorHandler(err, msg);
					}
				}
				dot.str(this.prop, p, msg);
				send(msg);
				if (done) {
					done();
				}
			}
		});
	}
	RED.nodes.registerType('bitunloader', BitUnloaderNode);
};
