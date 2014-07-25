var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');
eb.onopen = function() {
	var renderListItem = function(mindMap) {
		var li = $('<li class="span4">');
		var openMindMap = function() {
			new MindMapEditor(mindMap, eb);
			$('.save-as-png').show();
			$('#mindmap-name').html("<h2>" + mindMap.name + "</h2>");
			return false;
		};
		var deleteMindMap = function() {
			eb.send('mindMaps.delete', {id: mindMap._id}, function() {
				li.remove();
			});
			return false;
		};
		var saveAsPNG = function() {
			var svg = $('.editor').html();
			var stylesheet = document.styleSheets[0];
			var css = '';
			for (var i = 0 ; i < stylesheet.cssRules.length ; i++) {
				css += stylesheet.cssRules[i].cssText;
				css += "\n";
			}
			console.log(css);
			console.log(svg);
			eb.send('mindMaps.exporter.svg2png', {svg: svg, css: css}, function(result) {
				if (result.data) {
				window.location.href = 'data:image/png;base64,'+result.data;
				}
			});
			return false;
		};
		$('<a>').text(mindMap.name).attr('href', '#').on('click',openMindMap).appendTo(li);
		$('<button>').text('Smazat').addClass("btn btn-danger pull-right").on('click',deleteMindMap).appendTo(li);
		$('<button>').addClass("save-as-png btn btn-primary pull-right").text('Uložit').on('click',saveAsPNG).appendTo(li);
		li.appendTo('.mind-maps');
	};
	$('.create-form').submit(function() {
		var nameInput = $('[name=name]', this);
		eb.send('mindMaps.save', {name: nameInput.val()}, function(result) {
			renderListItem(result);
			nameInput.val('');
		});
		return false;
	});
	eb.send('mindMaps.list', {}, function(res) {
		$.each(res.mindMaps, function() {
			renderListItem(this);
		})
	})
};
