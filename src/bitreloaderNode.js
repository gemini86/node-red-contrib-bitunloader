function checkNestedObject (obj, prop) {
	function checkNested(obj, level,  ...rest) {
		if (obj === undefined) return false;
		if (rest.length == 0 && Object.prototype.hasOwnProperty.call(obj, level)) return true;
		return checkNested(obj[level], ...rest);
	}
	prop = prop.split('.');
	if (prop.length == 1){
		return checkNested(obj, prop[0]);
	} else {
		let firstLevel = prop[0];
		return checkNested(obj, firstLevel, ...prop.slice(1));
	}
}

module.exports = function (RED) {
	function BitReloaderNode(config) {
		RED.nodes.createNode(this, config);
		function configAutoMode () {
			if (config.autoMode === 'auto') {
				node.prop = node.mode = '';
				return true;
			} else {
				node.prop = config.prop;
				node.mode = config.mode;
				return false;
			}
		}
		let node = this;
		node.autoMode = configAutoMode();
		node.solution = {
			string: function (input) {
				return parseInt(input, 2);
			},
			arrayBits: function (input) {
				input.forEach((element, index) => {
					input[index] = element.toString();
				});
				return parseInt(input.reduce((acc,val) => acc + val).split('').reverse().join(''), 2);
			},
			arrayBools: function (input) {
				input.forEach((element, index) => {
					input[index] = element ? '1' : '0';
				});
				return parseInt(input.reduce((acc,val) => acc + val).split('').reverse().join(''), 2);
			},
			objectBits: function (input) {
				let result = '';
				Object.getOwnPropertyNames(input).forEach(element => result += input[element].toString());
				return parseInt(result.split('').reverse().join(''), 2);
			},
			objectBools: function (input) {
				let result = '';
				Object.getOwnPropertyNames(input).forEach(element => result += input[element] ? '1' :'0');
				return parseInt(result.split('').reverse().join(''), 2);
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
			if (node.autoMode === false) {
				node.prop = msg._prop;
				node.mode = msg._mode;
			}
			var value;
			if (checkNestedObject(msg, node.prop)){
				value = RED.util.getMessageProperty(msg, node.prop);
				if (Object.prototype.hasOwnProperty.call(node.solution, node.mode)) {
					try {
						value = node.solution[node.mode](value);
						RED.util.setMessageProperty(msg, msg._prop, value, false);
					} catch (err) {
						this.errorHandler(err, msg);
					}
				} else {
					this.errorHandler('Unable to determine bitunloader mode, has msg._mode been altered?', msg);
				}
			} else {
				this.errorHandler('msg._prop points to a message property which does not exist', msg);
			}
			send(msg);
			if (done) {
				done();
			}
		});
	}
	RED.nodes.registerType('bitreloader', BitReloaderNode);
};
