var eventBus = require('vertx/event_bus');
var mindMapUtils = require('web/js/mindmap_utils');
var console = require('vertx/console');

var mindMaps = {};

function sendPersistorEvent(command, callback) {
	eventBus.send('vertx.mongopersistor', command, function(reply) {
		if (reply.status === "ok") {
			callback(reply);
		} else {
			console.log(reply.message);
		}
	});
}

eventBus.registerHandler('mindMaps.save', function(mindMap,responder) {
	sendPersistorEvent(	{action: "save", collection: "mindMaps", document: mindMap},function(reply) {
		mindMap._id = reply._id;
		responder(mindMap);
	});
});

eventBus.registerHandler('mindMaps.list', function(args, responder) {
	sendPersistorEvent( {action: "find", collection: "mindMaps", matcher: {}}, function(reply) {
		responder({mindMaps: reply.results});
	});
});

eventBus.registerHandler('mindMaps.find', function(args, responder) {
	sendPersistorEvent({action: "findone", collection: "mindMaps", matcher: {_id: args._id}}, function(reply) {
		responder({mindMap: reply.result});
	});
});

eventBus.registerHandler('mindMaps.delete', function(args, responder) {
	sendPersistorEvent({action: "delete", collection: "mindMaps", matcher: {_id:args.id}}, function(reply) {
		responder({});
	});

});
