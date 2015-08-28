//
// App
// This is the node file for processing this webapp and making it cacheable with ApplicationCache
// 
var fs = require('fs');
var path = require('path');
var port=process.env.PORT || 5000;
var http =require('http');

var walk = function(dir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err) 
			return done(err);
		var pending = list.length;
		if (!pending) 
			return done(null, results);

		list.forEach(function(file) {
			if(file.charAt(0)==='.'){!--pending;return; }
			
			file = dir + '/' + file;
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function(err, res) {
						results = results.concat(res);
						if (!--pending) done(null, results);
					});
				} else {
					results.push(file);
					if (!--pending) done(null, results);
				}
			});
		});
	});
};

walk(__dirname, function(a,files){
	files.forEach(function(o,i){
		files[i] = o.replace(__dirname + '/', '');
	});
	console.log(files);
});

var app = http.createServer(function(req,res){

	var filePath = '.' + req.url,
		manifest = false;


	var contentType = {
		js : 'text/javascript',
		css : 'text/css',
		png : 'image/png',
		manifest : 'text/cache-manifest'
	}[(path.extname(filePath)||'').replace('.', '')] || 'text/html';


	if (filePath == './'){
		filePath = './index.html';
		manifest = 'app.manifest';
	}
	else if(filePath === './app.manifest'){
		res.writeHead(200, { 'Content-Type': contentType });
		var content = 'CACHE MANIFEST\r\n';

		res.end(content, 'utf-8');
	}

	console.log('request starting: ' + filePath);


	path.exists(filePath, function(exists) {

		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					res.writeHead(500);
					res.end();
					return;
				}

				res.writeHead(200, { 'Content-Type': contentType });

				// If the manifest link has been provided then lets alter the HTML
				if(manifest){
					content = content.replace('<html>', '<html manifest="'+ manifest +'">');
				}

				res.end(content, 'utf-8');
			});
		}
		else {
			res.writeHead(404);
			res.end();
			return;
		}
	});

	//res.end();

}).listen(port);