var should = require('should');
var helper = require('node-red-node-test-helper');
var bitunloaderNode = require('./bitunloader.js');

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
			n1.receive({ payload: { number: 5 } });
			n1.on('call:error', call => {
				call.should.be.calledWithExactly('Property undefined is undefined');
				done();
			});
		});
	});

	it('should detect if input is a parsable number', function (done) {
		var flow = [{ id: 'n1', type: 'bitunloader', name: 'test name', prop: 'undefined' }];
		helper.load(bitunloaderNode, flow, function () {
			var n1 = helper.getNode('n1');
			n1.receive({ payload: { number: 5 } });
			n1.on('call:error', call => {
				call.should.be.calledWithExactly('Input is not a number or parsable string.');
				done();
			});
		});
	});
});
