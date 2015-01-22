var eventBus = require('vertx/event_bus');
var mindMapUtils = require('web/js/mindmap_utils');
var console = require('vertx/console');
var container = require('vertx/container');

var config = container.config;

function publishMindMapEvent(mindMap, event) {
	eventBus.publish(config.address + '.events.'+mindMap._id, event);
}

eventBus.registerHandler(config.address + '.editor.addNode',
	function(args) {
		eventBus.send(config.address + '.find', {_id: args.mindMapId},
			function(res) {
				if (res.mindMap) {
					var mindMap = res.mindMap;
					var parent = mindMapUtils.findNodeByKey(res.mindMap, args.parentKey);
					var newNode = {key: mindMapUtils.makeUUID()};
				if (args.name) {
					newNode.name = args.name;
				} else {
					newNode.name = 'no name';
				}
				if (!parent.children) {
					parent.children = [];
				}
				parent.children.push(newNode);
				eventBus.send(config.address + '.save', mindMap, function() {
					publishMindMapEvent(mindMap, {event: 'nodeAdded', actionID:args.actionID ,parentKey: args.parentKey, node: newNode});
				});
			}
	});
});

eventBus.registerHandler(config.address + '.editor.renameNode', function(args) {
	eventBus.send('mindMaps.find', {_id: args.mindMapId}, function(res) {
		if (res.mindMap) {
			var mindMap = res.mindMap;
			var node = mindMapUtils.findNodeByKey(mindMap, args.key);
			if (node) {
				node.name = args.newName;
				eventBus.send(config.address + '.save', mindMap, function(reply) {
					publishMindMapEvent(mindMap, {event: 'nodeRenamed', actionID:args.actionID ,key: args.key, newName: args.newName, firstNode: args.firstNode});
				});
			}
		}
	});
});

eventBus.registerHandler(config.address + '.editor.deleteNode', function(args) {
	eventBus.send('mindMaps.find', {_id: args.mindMapId}, function(res) {
		if (res.mindMap) {
			var mindMap = res.mindMap;
			var parent = mindMapUtils.findNodeByKey(mindMap, args.parentKey);
			parent.children.forEach(function(child, index) {
				if (child.key === args.key) {
					parent.children.splice(index, 1);
					eventBus.send(config.address + '.save', mindMap,	function(reply) {
						publishMindMapEvent(mindMap, {event: 'nodeDeleted', actionID:args.actionID ,parentKey: args.parentKey, key: args.key});
					});
				}
			});
		}
	});
});
