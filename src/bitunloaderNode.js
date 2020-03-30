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
			this.errorHandler = (e, msg) => {
				if (done) {
					done(e);
				} else {
					node.error(e, msg);
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
			var value = RED.util.getMessageProperty(msg, this.prop);
			if (value == undefined) {
				this.errorHandler(`Property ${this.prop} is undefined`, msg);
			} else if (isNaN(value)) {
				this.errorHandler('Input is not a number or parsable string.', msg);
			} else {
				value = Math.abs(value);
				msg._mode = this.mode;
				msg._prop = this.prop;
				try {
					value = this.switchMode[this.mode](value, this.padding);
					RED.util.setMessageProperty(msg, this.prop, value, false);
				} catch (err) {
					this.errorHandler(err, msg);
				}
				send(msg);
				if (done) {
					done();
				}
			}
		});
	}
	RED.nodes.registerType('bitunloader', BitUnloaderNode);
};
