var container = require('vertx/container');
var console = require('vertx/console');

var config = container.config;

//container.deployModule("io.vertx~mod-mailer~2.0.0-beta1", config);
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
if("webserver" in config) {
	container.deployModule('io.vertx~mod-web-server~2.0.0-final', config.webserver, 1, function(err, ID){
		if (err) {
			console.log(err)
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
	container.deployVerticle('editor.js', config.mindmap, 1, function(err, ID){
		if (err) {
			console.error(err)
		}
	});

	container.deployVerticle('database_utils.js', config.mindmap, 1, function(err, ID){
		if (err) {
			console.error(err)
		}
	});
}
