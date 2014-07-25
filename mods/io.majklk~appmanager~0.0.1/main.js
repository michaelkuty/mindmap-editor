var container = require('vertx/container');
var console = require('vertx/console');

var config = container.config;

if("mongodb" in config) {
	container.deployModule('io.vertx~mod-mongo-persistor~2.1.0', config.mongodb, 1, function(err, ID){
		if (!err) {
	    	load('utils/static_data.js');
	    	console.log("static data loaded")
		} else {
	    	err.printStackTrace();
	  	}
	});
}
if("shell" in config){
	container.deployModule('org.crashub~vertx.shell~2.0.4', config.shell, 1, function(err, ID){
		if (err) {
			console.error(err)
		}
	});
}
if("editor" in config){

	container.deployModule('io.majklk~mindmapeditor~0.0.1', config.editor, config.editor.workers, function(err, ID){
		if (err) {
			console.log(err)
		}
	});
}
if("exporter" in config){
	
	container.deployModule('io.majklk~imgexporter~0.0.1', config.exporter, config.exporter.workers, function(err, ID){
		if (err) {
			console.log(err)
		}
	});

}