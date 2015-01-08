var eventBus = require('vertx/event_bus');
var mindMapUtils = require('web/js/mindmap_utils');
var console = require('vertx/console');
var container = require('vertx/container');

var config = container.config;

var mindMaps = {};

function sendPersistorEvent(command, callback) {
	eventBus.send(config.persistor_address, command, function(reply) {
		if (reply.status === "ok") {
			callback(reply);
		} else {
			console.log(reply.message);
		}
	});
}

eventBus.registerHandler(config.address + '.save', function(mindMap,responder) {
	sendPersistorEvent(	{action: "save", collection: config.collection, document: mindMap},function(reply) {
		mindMap._id = reply._id;
		responder(mindMap);
	});
});

eventBus.registerHandler(config.address + '.list', function(args, responder) {
	sendPersistorEvent( {action: "find", collection: config.collection, matcher: {}}, function(reply) {
		responder({mindMaps: reply.results});
	});
});

eventBus.registerHandler(config.address + '.find', function(args, responder) {
	sendPersistorEvent({action: "findone", collection: config.collection, matcher: {_id: args._id}}, function(reply) {
		responder({mindMap: reply.result});
	});
});

eventBus.registerHandler(config.address + 'mindMaps.delete', function(args, responder) {
	sendPersistorEvent({action: "delete", collection: config.collection, matcher: {_id:args.id}}, function(reply) {
		responder({});
	});

});
