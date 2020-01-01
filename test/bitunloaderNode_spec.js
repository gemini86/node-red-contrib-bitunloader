var should = require('should'); //eslint-disable-line no-unused-vars
var helper = require('node-red-node-test-helper');
var bitunloaderNode = require('../src/bitunloaderNode');

helper.init(require.resolve('node-red'));

describe('bitunloader Node', function () {

	afterEach(function () {
		helper.unload();
	});

	it('should be loaded', function (done) {
		var flow = [{ id: 'n1', type:'bitunloader', name: 'test name' }];
		helper.load(bitunloaderNode, flow, function () {
			var n1 = helper.getNode('n1');
			n1.should.have.property('name', 'test name');
			done();
		});
	});

	it('should detect if property is undefined', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'undefined' }];
		helper.load(bitunloaderNode, flow, function () {
			var n1 = helper.getNode('n1');
			const testMsg = { payload: { number: 5 } };
			n1.receive(testMsg);
			try {
				helper.log().called.should.be.true();
				var logEvents = helper.log().args.filter(function(evt) {
					return evt[0].type == 'bitunloader';
				});
				logEvents.should.have.length(1);
				var msg = logEvents[0][0];
				msg.should.have.property('level', helper.log().ERROR);
				msg.should.have.property('id', 'n1');
				msg.should.have.property('type', 'bitunloader');
				msg.should.have.property('msg', 'Property undefined is undefined');
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	it('should detect if input is not a parsable number', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number' }];
		helper.load(bitunloaderNode, flow, function () {
			var n1 = helper.getNode('n1');
			const testMsg = { payload: { number: 'String' } };
			n1.receive(testMsg);
			try {
				helper.log().called.should.be.true();
				var logEvents = helper.log().args.filter(function(evt) {
					return evt[0].type == 'bitunloader';
				});
				logEvents.should.have.length(1);
				var msg = logEvents[0][0];
				msg.should.have.property('level', helper.log().ERROR);
				msg.should.have.property('id', 'n1');
				msg.should.have.property('type', 'bitunloader');
				msg.should.have.property('msg', 'Input is not a number or parsable string.');
				done();
			} catch (err) {
				done(err);
			}
		});
	});

	it('should reject arrays', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload', mode: 'string', padding: 'none', wires:[['n2']] }];
		helper.load(bitunloaderNode, flow, function () {
			var n1 = helper.getNode('n1');
			n1.receive({ payload: [6,3] });
			try {
				helper.log().called.should.be.true();
				var logEvents = helper.log().args.filter(function(evt) {
					return evt[0].type == 'bitunloader';
				});
				logEvents.should.have.length(1);
				var msg = logEvents[0][0];
				msg.should.have.property('level', helper.log().ERROR);
				msg.should.have.property('id', 'n1');
				msg.should.have.property('type', 'bitunloader');
				msg.should.have.property('msg', 'Input is not a number or parsable string.');
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it('should output a binary string', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'string', padding: 'none', wires:[['n2']] },
			{ id: 'n2', type: 'helper' }];
		helper.load(bitunloaderNode, flow, function () {
			var n2 = helper.getNode('n2');
			var n1 = helper.getNode('n1');
			try {
				n2.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number', '11');
					done();
				});
			} catch (error) {
				done(error);
			}
			n1.receive({ payload: {number: 3 } });
		});
	});

	it('should output an array of bits', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'arrayBits', padding: 'none', wires:[['n2']] },
			{ id: 'n2', type: 'helper' }];
		helper.load(bitunloaderNode, flow, function () {
			var n2 = helper.getNode('n2');
			var n1 = helper.getNode('n1');
			try {
				n2.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number').which.is.an.Array();
					msg.payload.number.should.have.length(2);
					msg.payload.number[0].should.be.exactly(1);
					msg.payload.number[1].should.be.exactly(1);
					done();
				});
			} catch (error) {
				done(error);
			}
			n1.receive({ payload: {number: 3 } });
		});
	});

	it('should output an array of bool', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'arrayBools', padding: 'none', wires:[['n2']] },
			{ id: 'n2', type: 'helper' }];
		helper.load(bitunloaderNode, flow, function () {
			var n2 = helper.getNode('n2');
			var n1 = helper.getNode('n1');
			try {
				n2.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number').which.is.an.Array();
					msg.payload.number[0].should.equal(false);
					msg.payload.number[1].should.equal(true);
					done();
				});
			} catch (error) {
				done(error);
			}
			n1.receive({ payload: {number: 2 } });
		});
	});

	it('should output an object of bits', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'objectBits', padding: 'none', wires:[['n2']] },
			{ id: 'n2', type: 'helper' }];
		helper.load(bitunloaderNode, flow, function () {
			var n2 = helper.getNode('n2');
			var n1 = helper.getNode('n1');
			try {
				n2.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number').which.is.an.Object();
					msg.payload.number.should.have.ownProperty('b0', 0);
					msg.payload.number.should.have.ownProperty('b1', 1);
					done();
				});
			} catch (error) {
				done(error);
			}
			n1.receive({ payload: {number: 2 } });
		});
	});

	it('should output an object of bools', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'objectBools', padding: 'none', wires:[['n2']] },
			{ id: 'n2', type: 'helper' }];
		helper.load(bitunloaderNode, flow, function () {
			var n2 = helper.getNode('n2');
			var n1 = helper.getNode('n1');
			try {
				n2.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number').which.is.an.Object();
					msg.payload.number.should.have.ownProperty('b0');
					msg.payload.number.should.have.ownProperty('b1');
					msg.payload.number['b0'].should.be.false;
					msg.payload.number['b1'].should.be.true;
					done();
				});
			} catch (error) {
				done(error);
			}
			n1.receive({ payload: {number: 2 } });
		});
	});

	it('should not change other properties', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number[0]', mode: 'objectBools', padding: 'none', wires:[['n2']] },
			{ id: 'n2', type: 'helper' }];
		helper.load(bitunloaderNode, flow, function () {
			var n2 = helper.getNode('n2');
			var n1 = helper.getNode('n1');
			try {
				n2.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.should.have.property('topic', 'unchanged');
					msg.payload.should.have.property('number').which.is.an.Array();
					msg.payload.number[0].should.have.ownProperty('b0');
					msg.payload.number[0].should.have.ownProperty('b1');
					msg.payload.number[0]['b0'].should.be.false;
					msg.payload.number[0]['b1'].should.be.true;
					msg.payload.number[1].should.equal(100);
					done();
				});
			} catch (error) {
				done(error);
			}
			n1.receive({ topic: 'unchanged', payload: {number: [2,100] } });
		});
	});

	it('should pad the result to the requested length', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'arrayBools', padding: '8', wires:[['n2']] },
			{ id: 'n2', type: 'helper' }];
		helper.load(bitunloaderNode, flow, function () {
			var n2 = helper.getNode('n2');
			var n1 = helper.getNode('n1');
			try {
				n2.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number');
					msg.payload.number.should.be.an.Array();
					msg.payload.number.should.have.length(8);
					msg.payload.number[0].should.be.false;
					msg.payload.number[1].should.be.true;
					msg.payload.number[2].should.be.false;
					msg.payload.number[3].should.be.false;
					msg.payload.number[4].should.be.false;
					msg.payload.number[5].should.be.false;
					msg.payload.number[6].should.be.false;
					msg.payload.number[7].should.be.false;
					done();
				});
			} catch (error) {
				done(error);
			}
			n1.receive({ topic: 'unchanged', payload: {number: 2 } });
		});
	});
});
