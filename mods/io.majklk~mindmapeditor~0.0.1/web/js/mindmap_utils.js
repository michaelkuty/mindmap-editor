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
