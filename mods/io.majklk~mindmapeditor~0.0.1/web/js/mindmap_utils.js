if (typeof exports === 'undefined') {
	var exports = window;
}
exports.findNodeByKey = function(root, key) {
	if (root.key === key) {
		return root;
	} else if (root.children) {
		for (var i=0 ; i<root.children.length ; i++) {
			var match = exports.findNodeByKey(root.children[i], key);
			if (match) {
				return match;
			}
		}
	}
}
exports.makeUUID = function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/[xy]/g,function(a,b){return b=Math.random()*16,(a=="y"?b&3|8:b|0).toString(16)})}
