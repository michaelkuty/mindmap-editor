var eventBus = require('vertx/event_bus');
var mindMapUtils = require('web/js/mindmap_utils');
var console = require('vertx/console');

function publishMindMapEvent(mindMap, event) {
	eventBus.publish('mindMaps.events.'+mindMap._id, event);
}


function makeUUID(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/[xy]/g,function(a,b){return b=Math.random()*16,(a=="y"?b&3|8:b|0).toString(16)})}


eventBus.registerHandler('mindMaps.editor.addNode',
	function(args) {
		eventBus.send('mindMaps.find', {_id: args.mindMapId},
			function(res) {
				if (res.mindMap) {
					var mindMap = res.mindMap;
					var parent = mindMapUtils.findNodeByKey(res.mindMap, args.parentKey);
					var newNode = {key: makeUUID()};
				if (args.name) {
					newNode.name = args.name;
				} else {
					newNode.name = 'Editovat';
				}
				if (!parent.children) {
					parent.children = [];
				}
				parent.children.push(newNode);
				eventBus.send('mindMaps.save', mindMap, function() {
					publishMindMapEvent(mindMap, {event: 'nodeAdded', parentKey: args.parentKey, node: newNode});
				});
			}
	});
});

eventBus.registerHandler('mindMaps.editor.renameNode', function(args) {
	eventBus.send('mindMaps.find', {_id: args.mindMapId}, function(res) {
		if (res.mindMap) {
			var mindMap = res.mindMap;
			var node = mindMapUtils.findNodeByKey(mindMap, args.key);
			if (node) {
				node.name = args.newName;
				eventBus.send('mindMaps.save', mindMap, function(reply) {
					publishMindMapEvent(mindMap, {event: 'nodeRenamed', key: args.key, newName: args.newName});
				});
			}
		}
	});
});

eventBus.registerHandler('mindMaps.editor.deleteNode', function(args) {
	eventBus.send('mindMaps.find', {_id: args.mindMapId}, function(res) {
		if (res.mindMap) {
			var mindMap = res.mindMap;
			var parent = mindMapUtils.findNodeByKey(mindMap, args.parentKey);
			parent.children.forEach(function(child, index) {
				if (child.key === args.key) {
					parent.children.splice(index, 1);
					eventBus.send('mindMaps.save', mindMap,	function(reply) {
						publishMindMapEvent(mindMap, {event: 'nodeDeleted',parentKey: args.parentKey, key: args.key});
					});
				}
			});
		}
	});
});
