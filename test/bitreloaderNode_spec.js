var should = require('should'); //eslint-disable-line no-unused-vars
var helper = require('node-red-node-test-helper');
var bitunloaderNode = require('../src/bitunloaderNode');
var bitreloaderNode = require('../src/bitreloaderNode');

helper.init(require.resolve('node-red'));

describe('bitreloader Node', function () {

	afterEach(function () {
		helper.unload();
	});

	it('should be loaded', function (done) {
		var flow = [{ id: 'n1', type:'bitreloader', name: 'reloader' }];
		helper.load(bitreloaderNode, flow, function () {
			var n1 = helper.getNode('n1');
			n1.should.have.property('name', 'reloader');
			done();
		});
	});

	it('should not change messages which are not from a bitunloader node', function (done) {
		var flow = [{ id: 'n1', type: 'bitreloader', name: 'test name', wires:[['n2']] },
			{ id: 'n2', type: 'helper'}
		];
		helper.load([bitunloaderNode, bitreloaderNode], flow, function () {
			var n2 = helper.getNode('n2');
			var n1 = helper.getNode('n1');
			try {
				n2.on('input', function (msg) {
					msg.should.not.have.property('_mode');
					msg.should.not.have.property('_prop');
					msg.should.have.property('payload');
					msg.should.have.property('topic', 'unchanged');
					msg.payload.should.have.property('number').which.is.an.Array();
					msg.payload.number[0].should.have.ownProperty('b0');
					msg.payload.number[0].should.have.ownProperty('b1');
					msg.payload.number[0]['b0'].should.be.false;
					msg.payload.number[0]['b1'].should.be.true;
					msg.payload.number[1].should.equal(100);
				});
			} catch (err) {
				done(err);
			}
			n1.receive({ topic: 'unchanged', payload: {number: [2,100] } });
			done();
		});
	});

	it('should reload a binary string', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'string', padding: 'none', wires:[['n2', 'n3a']] },
			{ id: 'n2', type: 'bitreloader', wires: [['n3b']] },
			{ id: 'n3a', type: 'helper' },
			{ id: 'n3b', type: 'helper' }
		];
		helper.load([bitunloaderNode, bitreloaderNode], flow, function () {
			var n3a = helper.getNode('n3a');
			var n3b = helper.getNode('n3b');
			var n1 = helper.getNode('n1');
			try {
				n3a.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number', '101010');
					msg.should.have.property('_prop', 'payload.number');
					msg.should.have.property('_mode', 'string');
				});
				n3b.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number', 42);
				});
			} catch (err) {
				done(err);
			}
			n1.receive({ payload: {number: 42 } });
			done();
		});
	});

	it('should reload an array of bits', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'arrayBits', padding: 'none', wires:[['n2', 'n3a']] },
			{ id: 'n2', type: 'bitreloader', wires: [['n3b']] },
			{ id: 'n3a', type: 'helper' },
			{ id: 'n3b', type: 'helper' }
		];
		helper.load([bitunloaderNode, bitreloaderNode], flow, function () {
			var n3b = helper.getNode('n3b');
			var n3a = helper.getNode('n3a');
			var n1 = helper.getNode('n1');
			try {
				n3a.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number', [0,1,0,1,0,1]);
				});
				n3b.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number', 42);
				});
			} catch (err) {
				done(err);
			}
			n1.receive({ payload: {number: 42 } });
			done();
		});
	});

	it('should reload an array of bool', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'arrayBools', padding: 'none', wires:[['n2', 'n3a']] },
			{ id: 'n2', type: 'bitreloader', wires: [['n3b']] },
			{ id: 'n3a', type: 'helper' },
			{ id: 'n3b', type: 'helper' }
		];
		helper.load([bitunloaderNode, bitreloaderNode], flow, function () {
			var n3b = helper.getNode('n3b');
			var n3a = helper.getNode('n3a');
			var n1 = helper.getNode('n1');
			try {
				n3a.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number', [false,true,false,true,false,true]);
				});
				n3b.on('input', function (msg) {
					msg.payload.should.have.property('number', 42);
				});
			} catch (err) {
				done(err);
			}
			n1.receive({ payload: {number: 42 } });
			done();
		});
	});

	it('should reload an object of bits', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'objectBits', padding: 'none', wires:[['n2', 'n3a']] },
			{ id: 'n2', type: 'bitreloader', wires: [['n3b']] },
			{ id: 'n3a', type: 'helper' },
			{ id: 'n3b', type: 'helper' }
		];
		helper.load([bitunloaderNode, bitreloaderNode], flow, function () {
			var n3b = helper.getNode('n3b');
			var n3a = helper.getNode('n3a');
			var n1 = helper.getNode('n1');
			try {
				n3a.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number', {b0:0,b1:1,b2:0,b3:1,b4:0,b5:1});
				});
				n3b.on('input', function (msg) {
					msg.payload.should.have.property('number', 42);
				});
			} catch (err) {
				done(err);
			}
			n1.receive({ payload: {number: 42 } });
			done();
		});
	});
	it('should reload an object of bools', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number', mode: 'objectBools', padding: 'none', wires:[['n2', 'n3a']] },
			{ id: 'n2', type: 'bitreloader', wires: [['n3b']] },
			{ id: 'n3a', type: 'helper' },
			{ id: 'n3b', type: 'helper' }
		];
		helper.load([bitunloaderNode, bitreloaderNode], flow, function () {
			var n3b = helper.getNode('n3b');
			var n3a = helper.getNode('n3a');
			var n1 = helper.getNode('n1');
			try {
				n3a.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.payload.should.have.property('number', {b0:false,b1:true,b2:false,b3:true,b4:false,b5:true});
				});
				n3b.on('input', function (msg) {
					msg.payload.should.have.property('number', 42);
				});
			} catch (err) {
				done(err);
			}
			n1.receive({ payload: {number: 42 } });
			done();
		});
	});

	it('should not change other properties', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'payload.number[0]', mode: 'objectBools', padding: 'none', wires:[['n2']] },
			{ id: 'n2', type: 'bitreloader', wires: [['n3']] },
			{ id: 'n3', type: 'helper'}
		];
		helper.load([bitunloaderNode, bitreloaderNode], flow, function () {
			var n3 = helper.getNode('n3');
			var n1 = helper.getNode('n1');
			try {
				n3.on('input', function (msg) {
					msg.should.have.property('payload');
					msg.should.have.property('topic', 'unchanged');
					msg.payload.should.have.property('number').which.is.an.Array();
					msg.payload.number[0].should.have.ownProperty('b0');
					msg.payload.number[0].should.have.ownProperty('b1');
					msg.payload.number[0]['b0'].should.be.false;
					msg.payload.number[0]['b1'].should.be.true;
					msg.payload.number[1].should.equal(100);
				});
			} catch (err) {
				done(err);
			}
			n1.receive({ topic: 'unchanged', payload: {number: [2,100] } });
			done();
		});
	});
});
