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

if("webserver" in config) {
	container.deployModule('io.vertx~mod-web-server~2.0.0-final', config.webserver, config.webserver.workers, function(err, ID){
		if (err) {
			console.log(err)
		}
	});
}

if("editor" in config) {

	container.deployVerticle('editor.js', {}, config.workers, function(err, ID){
		if (err) {
			console.error(err)
		}
	});

	container.deployVerticle('database_utils.js', {}, config.workers, function(err, ID){
		if (err) {
			console.error(err)
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