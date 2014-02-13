'use strict';

/* Controllers */

angular.module('mindmap-editor.controllers', []).
  controller('MindMapCtrl',['$scope',function($scope){
  		
  		$scope.showMindMap=function(){
  			$scope.initMindMap({name:$scope.mapName});
  		}

  		$scope.initMindMap=function(matcher){
  			 matcher= matcher||{};
  			 var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus'),
				m = [0, 100, 20, 220],
				w = 1460 - m[1] - m[3],
				h = 800 - m[0] - m[2],
				i = 0,
				root,
				tree = d3.layout.tree().size([h, w]),
				diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; }),
				vis = d3.select("#body").append("svg:svg")
					.attr("width", w + m[1] + m[3])
					.attr("height", h + m[0] + m[2])
					.append("svg:g")
					.attr("transform", "translate(" + m[3] + "," + m[0] + ")"),
				update=function (source) {
					var duration = d3.event && d3.event.altKey ? 5000 : 500;

					// Compute the new tree layout.
					var nodes = tree.nodes(root).reverse();

					// Normalize for fixed-depth.
					nodes.forEach(function(d) { d.y = d.depth * 280; });

					// Update the nodes
					var node = vis.selectAll("g.node")
					.data(nodes, function(d) { return d.id || (d.id = ++i); });

					// Enter any new nodes at the parents previous position.
					var nodeEnter = node.enter().append("svg:g")
					.attr("class", "node")
					.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
					.on("click", function(d) { toggle(d); update(d); })
					.on("mouseover", function(d) {
					    $('svg circle').tipsy({
					      gravity: 's', 
					      html: true,
					      title: function() {
					        return '<button>'+ d.name +'</button><span style="color:' + "TEST" + '">' + "TEST" + '</span>'; 
					      }
					    });
					});

					nodeEnter.append("svg:circle")
					.attr("r", 1e-6)
					.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

					nodeEnter.append("svg:text")
					.attr("x", function(d) { return d.children || d._children ? -10 : 10; })
					.attr("dy", ".35em")
					.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
					.text(function(d) { return d.name; })
					.style("fill-opacity", 1e-6);

					// Transition nodes to their new position.
					var nodeUpdate = node.transition()
					.duration(duration)
					.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

					nodeUpdate.select("circle")
					.attr("r", 4.5)
					.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

					nodeUpdate.select("text")
					.style("fill-opacity", 1);

					// Transition exiting nodes to the parents new position.
					var nodeExit = node.exit().transition()
					.duration(duration)
					.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
					.remove();

					nodeExit.select("circle")
					.attr("r", 1e-6);

					nodeExit.select("text")
					.style("fill-opacity", 1e-6);

					// Update the links
					var link = vis.selectAll("path.link")
					.data(tree.links(nodes), function(d) { return d.target.id; });

					// Enter any new links at the parents previous position.
					link.enter().insert("svg:path", "g")
					.attr("class", "link")
					.attr("d", function(d) {
					var o = {x: source.x0, y: source.y0};
					return diagonal({source: o, target: o});
					})
					.transition()
					.duration(duration)
					.attr("d", diagonal);

					// Transition links to their new position.
					link.transition()
					.duration(duration)
					.attr("d", diagonal);

					// Transition exiting nodes to the parents new position.
					link.exit().transition()
					.duration(duration)
					.attr("d", function(d) {
					var o = {x: source.x, y: source.y};
					return diagonal({source: o, target: o});
					})
					.remove();

					// Stash the old positions for transition.
					nodes.forEach(function(d) {
						d.x0 = d.x;
						d.y0 = d.y;
					});
				},
				toggle = function (d) {
					// Toggle children.
					if (d.children) {
					d._children = d.children;
					d.children = null;
					} else {
					d.children = d._children;
					d._children = null;
					}
				};
  				/* load static data from mongodb */
				eb.onopen = function() {

					eb.send("vertx.mongopersistor", {action: 'find', collection: 'mindmap', matcher: matcher}, function(reply) {
					if (reply.status == "ok") {
					console.log(reply.results[0]);
					root=(reply.results[0])
					root.x0 = h / 2;
					root.y0 = 0;

					var toggleAll = function(d) {
						if (d.children) {
						d.children.forEach(toggleAll);
						toggle(d);
						}
					}

					// Initialize the display to show a few nodes.
					root.children.forEach(toggleAll);
					//toggle(root.children[1]);
					//toggle(root.children[1].children[2]);
					//toggle(root.children[9]);
					//toggle(root.children[9].children[0]);

					update(root);
					//});
					}
					});

				};
      };

  }]);
  