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

	function BitReloaderNode() {
		RED.nodes.createNode(this);
		let node = this;
		node.solution = {
			string: function (input) {
				return parseInt(input, 2);
			},
			arrayBits: function (input) {
				input.forEach((element, index) => {
					input[index] = element.toString();
				});
				return parseInt(input.reduce((acc,val) => acc + val), 2);
			},
			arrayBools: function (input) {
				input.forEach((element, index) => {
					input[index] = element ? '1' : '0';
				});
				return parseInt(input.reduce((acc,val) => acc + val), 2);
			},
			objectBits: function (input) {
				let result = '';
				Object.getOwnPropertyNames(input).forEach(element => result += input[element].toString());
				result = result.split('').reverse().join('');
				return parseInt(result, 2);
			},
			objectBools: function (input) {
				let result = '';
				Object.getOwnPropertyNames(input).forEach(element => result += input[element] ? '1' :'0');
				result = result.split('').reverse().join('');
				return parseInt(result, 2);
			}
		};
		node.on('input', function (msg, send, done) {
			this.errorHandler = (e, msg) => {
				if (done) {
					done(e);
				} else {
					node.error(e, msg);
				}
			};
			var value = RED.util.getMessageProperty(msg, msg._prop);
			if (msg._mode) {
				try {
					value = node.solution[this._mode](value);
					RED.util.setMessageProperty(msg, msg._prop, value, false);
				} catch (err) {
					this.errorHandler(err, msg);
				}
			}
			send(msg);
			if (done) {
				done();
			}
		});
	}
	RED.nodes.registerType('bitreloader', BitReloaderNode);
};
