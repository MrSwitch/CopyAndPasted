/**
 * Add custom controls
 * @author Andrew Dodson
 * @since Jan 2012
 */

function log(){
	if (typeof(console) === 'undefined'||typeof(console.log) === 'undefined') return;
	if (typeof console.log === 'function') {
		console.log.apply(console, arguments); // FF, CHROME, Webkit
	}
	else{
		console.log(Array.prototype.slice.call(arguments)); // IE
	}
}


/**
 * Overlay the toolbar on scroll
 */
$(window).scroll(function(e){
	$("body>header")[((document.body.scrollTop || document.documentElement.scrollTop ) >1?'add':'remove')+'Class']("float");
});


/**
 * Call the editor
 */
$('article[contenteditable]').editor();
