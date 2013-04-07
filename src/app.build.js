// App.build.js
// Put this in the build package of Sublime Text 2
/*
{
	"cmd": ["node", "${file_path:${folder}}/app.build.js", "$file_path"],
	"working_dir" : "${file_path:${folder}}"
}
*/


// The build script creates an index.html file and embeds style and script references inside the code.
// Require IO operations
var fs = require('fs');

// Uglify-JS for compressing Javascript
var UglifyJS = require("uglify-js");

// Clean-CSS, exactly that
var cleanCSS = require("clean-css");

var root = "../../";

//
// Build index files
fs.readdirSync('./').forEach(function(name){
	var buffer;

	if(!name.match(/\.html$/)){
		return;
	}

	buffer = fs.readFileSync( name, 'utf8');

	// Replace asset paths
	buffer = buffer.replace(/<script\s*src\s*=\s*(["'])(\.?\/.*?)(\1)\s*><\/script>/g, function(r,quote,m){

		var path = m;
		if(path[0]==='/'){
			path = root + path;
		}

		var buffer = UglifyJS.minify(path); // Minify

		return '<script>'+buffer.code+'</script>';
	});

	buffer = buffer.replace(/<link\s*href\s*=\s*(["'])(\.?\/.*?)(\1)\s+rel\s*=\s*(["'])stylesheet(\3)\/>/g, function(r,quote,m){
		var path = m;
		if(path[0]==='/'){
			path = root + path;
		}
		var buffer = fs.readFileSync(path);
		buffer = cleanCSS.process(buffer.toString());

		// Rewrite url() locations
		buffer = buffer.replace(/url\((['"']?)(.*?)(\1)\)/g, function(m,quote,asset){

			asset = asset.replace(/[\?\#].*$/,'');

			var remotepath = path.replace(/[^\/]+$/,'') + asset,
				newpath = "assets/"+asset.replace(/^[.\/]+/,'');
			
			fs.readFile( remotepath, function(err, buffer){
				fs.writeFile("../"+newpath, buffer, function(err) {
					console.log(err?err:"Created "+newpath);
				});
			});

			return "url("+newpath+")";
		});
		return '<style>'+buffer+'</style>';
	});

	// Minify html
	/*
	buffer = buffer.replace(/<!--([\s\S]*?)-->/g, function(m,c){
		// Lets be careful of Knockout comments
		return c.match(/^\s*\/?ko/) ? m : '';
	});
	buffer = buffer.replace(/[\s\t\n]+/g, ' ').replace(/> </g,'><');
	*/

	fs.writeFile("../"+name, buffer, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log(name + " created!");
		}
	});

});