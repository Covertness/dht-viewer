var dhtBroker = "dht.psychokinesis.me:8080";
var baseHot = 10;
require.config({
	baseUrl: "lib",
	paths: {
		"heatmap": "heatmap.js-amd/build/heatmap",
		"collections": "collections.min",
		"spin": "spin.js/spin.min",
		"clipboard": "clipboard/dist/clipboard.min",
		"jquery": "jquery/dist/jquery.min"
	},
	waitSeconds: 15
});
require(["heatmap", "collections", "jquery", "spin", "clipboard"], function(heatmap, collections, $, Spinner, Clipboard) {
	var heatmapContainer = document.getElementById('heatmapContainer');
	var h = heatmap.create({
		container: heatmapContainer,
		radius: 20
	});
	var data = new Map({});
	var spinnerOpts = {
		lines: 13 // The number of lines to draw
			,
		length: 0 // The length of each line
			,
		width: 18 // The line thickness
			,
		radius: 35 // The radius of the inner circle
			,
		scale: 0.75 // Scales overall size of the spinner
			,
		corners: 1 // Corner roundness (0..1)
			,
		color: '#000' // #rgb or #rrggbb or array of colors
			,
		opacity: 0.25 // Opacity of the lines
			,
		rotate: 0 // The rotation offset
			,
		direction: 1 // 1: clockwise, -1: counterclockwise
			,
		speed: 1 // Rounds per second
			,
		trail: 60 // Afterglow percentage
			,
		fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
			,
		zIndex: 2e9 // The z-index (defaults to 2000000000)
			,
		className: 'spinner' // The CSS class to assign to the spinner
			,
		top: '50%' // Top position relative to parent
			,
		left: '50%' // Left position relative to parent
			,
		shadow: false // Whether to render a shadow
			,
		hwaccel: false // Whether to use hardware acceleration
			,
		position: 'absolute' // Element positioning
	};

	var spinner = new Spinner(spinnerOpts).spin(heatmapContainer);

	var digestInfo = function(info) {
		var digest = {
				x: 0,
				y: 0
			},
			half = info.length / 2;

		for (var i = 0; i < half; i += 2) {
			digest.x += ((parseInt(info.substr(i, 2), 16) & 1) << ((half - i) / 2 - 1));
		}

		for (var i = half; i < info.length; i += 2) {
			digest.y += ((parseInt(info.substr(i, 2), 16) & 1) << ((2 * half - i) / 2 - 1));
		}
		return digest
	};

	$.get("http://" + dhtBroker + "/infos", {min_ann_nodes: 10}, function(rawData) {
		var points = [];
		var max = 0;

		rawData.infos.forEach(function(info) {
			if (info.infoHash.length !== 40)
				return;

			var digest = digestInfo(info.infoHash);
			var digestStr = (digest.x / 10).toFixed() + '.' + (digest.y / 10).toFixed();
			var item = data.get(digestStr, null);
			if (item === null) {
				item = {
					infoHash: info.infoHash,
					x: digest.x,
					y: digest.y,
					value: info.announceNodesNum
				};
				data.set(digestStr, item);
			} else if (item.value < info.announceNodesNum) {
				item.infoHash = info.infoHash;
				item.x = digest.x;
				item.y = digest.y;
				item.value = info.announceNodesNum;
			}
		});

		data.forEach(function(item) {
			var fixItem = {
				x: item.x,
				y: item.y,
				value: (item.value / baseHot).toFixed()
			};
			points.push(fixItem);
			max = Math.max(max, fixItem.value);
		});

		spinner.stop();
		h.setData({
			max: max,
			data: points
		});
	}, "json");

	var tooltip = document.querySelector('.tooltip');
	var updateTooltip = function updateTooltip(x, y, value) {
		var transform = 'translate(' + (x + 15) + 'px, ' + (y + 15) + 'px)';
		tooltip.style.MozTransform = transform;
		tooltip.style.msTransform = transform;
		tooltip.style.OTransform = transform;
		tooltip.style.WebkitTransform = transform;
		tooltip.style.transform = transform;
		tooltip.innerHTML = value;
	};

	var wrapper = document.querySelector('.wrapper');
	var getTorrentTimer = null,
		currentX = 0,
		currentY = 0,
		currentMagnet = "";
	wrapper.onmousemove = function(ev) {
		var x = currentX = ev.layerX;
		var y = currentY = ev.layerY;

		var item = data.get((x / 10).toFixed() + '.' + (y / 10).toFixed(), null);
		if (item !== null && item.value > 0) {
			var value = 'info hash: ' + item.infoHash + '<br/>hot level: ' + item.value;
			tooltip.style.display = 'block';
			updateTooltip(x, y, value);

			getTorrentTimer && clearTimeout(getTorrentTimer);
			getTorrentTimer = setTimeout(function() {
				if (currentX === x && currentY === y) {
					$.get("http://" + dhtBroker + "/torrent?info=" + item.infoHash, function(rawData) {
						if (currentX === x && currentY === y) {
							var newValue = 'info hash: ' + item.infoHash + '<br/>hot level: ' + item.value + '<br/>magnet link: ' + rawData.magnet;
							if (rawData.name) {
								newValue += '<br/>torrent name: ' + rawData.name;
							}

							currentMagnet = rawData.magnet;
							tooltip.style.display = 'block';
							updateTooltip(x, y, newValue);
						}
					}, "json");
				}
			}, 1000);
		} else {
			tooltip.style.display = 'none';
		}
	};
	wrapper.onmouseout = function() {
		tooltip.style.display = 'none';
	};
	wrapper.onclick = function() {
		if (tooltip.style.display === 'block') {
			var clipboard = new Clipboard('.wrapper', {
				text: function(trigger) {
					return currentMagnet;
				}
			});

			clipboard.on('success', function(e) {
				alert('copied');

				currentMagnet = "";
				clipboard.destroy();
			});

			clipboard.on('error', function(e) {
				currentMagnet = "";
				clipboard.destroy();
			});
		}
	};
});