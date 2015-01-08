	MindMapEditor.width = 1280;
	MindMapEditor.height = 800;
	MindMapEditor.levelWidth = 150;
	MindMapEditor.treeLayout = d3.layout.tree().size
	([MindMapEditor.height, MindMapEditor.width]);
	MindMapEditor.diagonalGenerator = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

	MindMapEditor.prototype.renderVisualization = function() {
		var self = this;

		var nodes = MindMapEditor.treeLayout.nodes(this.mindMap).reverse();
		nodes.forEach(function(d) { d.y = d.depth *	MindMapEditor.levelWidth; });
		var node = this.vis.selectAll("g.node").data(nodes, function(d) { return d.key; });
		var nodeEnter = node.enter().append("svg:g")
		.attr("class", "node editable editable-click")
		.attr("data-type", "text")
		.attr("opacity", "0")
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
		nodeEnter.append("svg:circle").attr("r", 10)
		.style("fill", "lightsteelblue")
		.style("fill", function(d) { return d.children ? "lightsteelblue" : "#fff"; })
		.on("click", function(c) { 
			self.addNode(c);
		    $(function(){
		       	$("#" + c.key).editable({
		       		container: 'body',
		       		mode: 'popup',
				    title: 'Enter new name',
			        success: function(response, newValue) {
			           self.renameNode(c, newValue);
 					   console.log("success saving: " + newValue);
 					   $(".editable-container").css("display", "none");
					},
				});
		    });
		});
		nodeEnter.append("svg:text").attr("x", 15)
		.attr("dy", ".35em").text(function(d) { return d.name; })
		.attr("id", function(d) { return d.key; })
		.on("click", function(d) {
		    $(function(){
		       	$("#" + d.key).editable({
		       		container: 'body',
		       		mode: 'popup',
				    title: 'Enter new name',
			        success: function(response, newValue) {
			           self.renameNode(d, newValue);
 					   console.log("success saving: " + newValue);
 					   $(".editable-container").css("display", "none");
					},
				});
		    });

		});
		node.transition()
		.attr("opacity", "1")
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
		.select("text")
		.text(function(d) { return d.name; });
		node.exit().remove();
		var link = this.vis.selectAll("path.link").data(MindMapEditor.treeLayout.links(nodes), function(d) {
			return d.target.key; });
		link.enter().insert("svg:path", "g")
		.attr("class", "link")
		.attr("opacity", "0")
		.attr("d", MindMapEditor.diagonalGenerator)
		.on('click', function(l) {
			self.deleteNode(l.source, l.target);
		});
		link.transition()
		.attr("d", MindMapEditor.diagonalGenerator)
		.attr("opacity", "1");
		link.exit().remove();
	}

	MindMapEditor.prototype.addNode = function(parentNode) {
		this.eventBus.send('mindMaps.editor.addNode', { mindMapId: this.mindMap._id, parentKey: parentNode.key });
	}
	
	MindMapEditor.prototype.renameNode = function(node, newName) {
		this.eventBus.send('mindMaps.editor.renameNode', {mindMapId: this.mindMap._id,key: node.key,newName: newName});
	}
	
	MindMapEditor.prototype.deleteNode = function(parentNode, childNode) {
		this.eventBus.send('mindMaps.editor.deleteNode', { mindMapId: this.mindMap._id,	parentKey: parentNode.key, key: childNode.key });
	}

	MindMapEditor.prototype.registerEventHandlers = function() {
		var self = this;
		this.eventBus.registerHandler('mindMaps.events.'+self.mindMap._id, function(event) {
			switch (event.event) {
				case 'nodeAdded':self.onNodeAdded(event); break;
				case 'nodeRenamed': self.onNodeRenamed(event); break;
				case 'nodeDeleted': self.onNodeDeleted(event); break;
			}
			self.renderVisualization();
		});
	}

	MindMapEditor.prototype.onNodeAdded = function(event) {
		var parent = findNodeByKey(this.mindMap, event.parentKey);
		if (parent) {
			if (!parent.children) {
				parent.children = [];
			}
			parent.children.push(event.node);
		}
	}
	MindMapEditor.prototype.onNodeRenamed = function(event) {
		var node = findNodeByKey(this.mindMap, event.key);
		if (node) {
			node.name = event.newName;
		}
	}
	MindMapEditor.prototype.onNodeDeleted = function(event) {
		var parent = findNodeByKey(this.mindMap, event.parentKey);
		if (parent) {
			for (var i=0 ; i<parent.children.length ; i++) {
				if (parent.children[i].key === event.key) {
					parent.children.splice(i, 1);
					return;
				}
			}
		}
	}

	MindMapEditor.prototype.initVisualization = function() {
		//.attr("width", MindMapEditor.width)
		//.attr("height", MindMapEditor.height)
		this.vis = d3.select(".editor").html('').append("svg:svg")
		.append("svg:g")
		.attr("transform", "translate(20,0)");
		console.log("constructed");
	}


function MindMapEditor(mindMap, eventBus,successFn) {
	this.mindMap = mindMap;
	this.eventBus = eventBus;
	this.registerEventHandlers();
	this.initVisualization();
	this.renderVisualization();
	if(typeof successFn === 'function'){
		successFn();
	}
	//alert("Editor constructed");

}
