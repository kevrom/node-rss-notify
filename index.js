'use strict';

var request = require('request');
var fs = require('fs');
var Notification = require('node-notifier');
var Parser = require('feedparser');

var feeds = [
	'http://ezrss.it/search/index.php?simple&show_name=arrow&mode=rss'
];

function done(err) {
	if (err) {
		console.log(err, err.stack);
		return process.exit(1);
	}
	process.exit();
}

function fetch(feed) {
	// Define our streams
	var req = request(feed, {timeout: 10000, pool: false});
	req.setMaxListeners(50);

	// Some feeds do not respond without user-agent and accept headers.
	req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36')
		.setHeader('accept', 'text/html,application/xhtml+xml');

	var feedparser = new Parser();

	// Define our handlers
	req.on('error', done);
	req.on('response', function(res) {
		if (res.statusCode !== 200) {
			return this.emit('error', new Error('Bad status code'));
		}
		res.pipe(feedparser);
	});

	feedparser.on('error', done);
	feedparser.on('end', done);
	feedparser.on('readable', function() {
		var post;
		while (post = this.read()) {
			console.log(post);
			fs.appendFileSync('eztv.json', JSON.stringify(post, null, 4));
		}
	});
}


fetch(feeds[0]);
