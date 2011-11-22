/**
 * Script
 * Adds controls to the form
 */

/**
 * EXTRA STUFF to enable rich forms
 * WYSIWYG editor
 * Additional navigation to create dynamic forms
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
 * Get information about the selected text.
 * @param the scope/window object
 & @return selected element
 */
$.fn.selectedText = function(){

	var r;

	this.each(function(){

		var obj = null,
			text = null,
			sel = null;

		win = this;
	
		// Get parent element to determine the formatting applied to the selected text
		if(win.getSelection){
			obj	= win.getSelection().anchorNode;
			text= win.getSelection().toString();
			sel	= win.getSelection();
	
			log(sel);
	
			// Mozilla seems to be selecting the wrong Node, the one that comes before the selected node.
			// I'm not sure if there's a configuration to solve this,
			if(!sel.isCollapsed&&$.browser.mozilla){
				// If we've selected an element, (note: only works on Anchors, only checked bold and spans)
				// we can use the anchorOffset to find the childNode that has been selected
				if(sel.focusNode.nodeName !== '#text'){
					// Is selection spanning more than one node, then select the parent
					if((sel.focusOffset - sel.anchorOffset)>1){
						log("Selected spanning more than one",obj = sel.anchorNode);
					}else if ( sel.anchorNode.childNodes[sel.anchorOffset].nodeName !== '#text' ){
						log("Selected non-text",obj = sel.anchorNode.childNodes[sel.anchorOffset]);
					}else{
						log("Selected whole element",obj = sel.anchorNode);
					}
				}
				// if we have selected text which does not touch the boundaries of an element
				// the anchorNode and the anchorFocus will be identical
				else if( sel.anchorNode.data === sel.focusNode.data ){
					log("Selected non bounding text",obj = sel.anchorNode.parentNode);
				}
				// This is the first element, the element defined by anchorNode is non-text.
				// Therefore it is the anchorNode that we want
				else if( sel.anchorOffset === 0 && !sel.anchorNode.data ){
					log("Selected whole element at start of paragraph (whereby selected element has not text e.g. &lt;script&gt;",obj = sel.anchorNode);
				}
				// If the element is the first child of another (no text appears before it)
				else if( ( typeof sel.anchorNode.data !== 'undefined' ) && ( sel.anchorOffset === 0 ) && ( sel.anchorOffset < sel.anchorNode.data.length ) ){
					log("Selected whole element at start of paragraph",obj = sel.anchorNode.parentNode);
				}
				// If we select text preceeding an element. Then the focusNode becomes that element
				// The difference between selecting the preceeding word is that the anchorOffset is less that the anchorNode.length
				// Thus
				else if( typeof sel.anchorNode.data !== 'undefined' && sel.anchorOffset < sel.anchorNode.data.length ){
					log("Selected preceeding element text",obj = sel.anchorNode.parentNode);
				}
				// Selected text which fills an element, i.e. ,.. <b>some text</b> ...
				// The focusNode becomes the suceeding node
				// The previous element length and the anchorOffset will be identical
				// And the focus Offset is greater than zero
				// So basically we are at the end of the preceeding element and have selected 0 of the current.
				else if( typeof sel.anchorNode.data !== 'undefined' && sel.anchorOffset === sel.anchorNode.data.length && sel.focusOffset === 0 ){
					log("Selected whole element text", obj = (sel.anchorNode.nextSibling || sel.focusNode.previousSibling));
				}
				// if the suceeding text, i.e. it bounds an element on the left
				// the anchorNode will be the preceeding element
				// the focusNode will belong to the selected text
				else if( sel.focusOffset > 0 ){
					log("Selected suceeding element text", obj = sel.focusNode.parentNode);
				}
			}
			else if(sel.isCollapsed && obj){
				obj = obj.parentNode;
			}
			
		}
		else if(win.document.selection){
			sel = win.document.selection.createRange();
			obj = sel;
	
			if(sel.parentElement){
				obj = sel.parentElement();
			}else {
				obj = sel.item(0);
			}
			text = sel.text || sel;
		
			if(text.toString){
				text = text.toString();
			}
		}
		else {
			throw 'Error';
		}
		// webkit
		if(obj.nodeName==='#text'){
			obj = obj.parentNode;
		}
	
		// if the selected object has no tagName then return false.
		if(typeof obj.tagName === 'undefined'){
			return false;
		}
		r = {'obj':obj,'text':text};
	});
	
	return r;
}

/**
 * Insert cmd
 */
function insert(cmd,value){
	/**
	 * Get the selected Text if there is any. 
	 * This function returns {obj:element,text:string}
	 */
	log(sel,value,cmd);
	var sel = $(window).selectedText();
	

	/**
	 * If this is the createLink or insert image
	 * Get the href|src value of the selected element
	 * set this as the value
	 */
	if( (cmd==='insertimage'||cmd==='createlink') ){
		if(sel.obj.tagName==='A'){
			tool.promptValue = sel.obj.href;
		}
		if(sel.obj.tagName==='IMG'){
			tool.promptValue = sel.obj.src;
		}
	}

	/**
	 * User prompted to put in a value
	 */
	if(cmd==='createlink'){
		/**
		 * Is text selected?
		 * Is selected text a URL? Then prepopulate the content of the prompt
		 */
		value = prompt('URL of a Link?', (sel.text.match('^https?://')?sel.text:'http://'));

		//If the command is for a Link there must be text
		//Otherwise we need to insertHTML instead
		if(!sel.text.length){
			// Get the text
			if(!(sel.text = prompt("Text")))
				sel.text = value;
				
			if(sel.text===null)
				return false;
			// We are going to insert the element manually
			// Using pasteHTML IE and execCommand insertHTML if the browser supports it.
			value = "<a href='"+value+"'>"+sel.text+"</a>";
			cmd = 'inserthtml';
		}
	}
	

	/**
	 * IE requires format block tags (e.g. h1, p, pre) to be wrapped with <> syntax
	 */
	if(cmd=='formatblock'&&$.browser.msie)
		value = '<'+value+'>';

	
	// Send the action to the frame
	// update the text area with this new value

	try{
		log([window, cmd, value]);
		document.execCommand(cmd, false, value);
	}
	catch(e){
		//IE WAY to insert at the current point
		if(document.selection){
			var s = document.selection.createRange();
			if(s.pasteHTML){
				s.pasteHTML(value);
				return false;
			}
		}
		log("Could not execute "+cmd);
	}
	return false;
}




/****************
 * ADDING EVENTS
 ****************/
 
 
$("body > header > nav.editor > button").click(function(){
	// make sure this is not going to insert outside the contentEditable iframe
	if($.browser.msie){
		try{
		//$('#iframe_'+$(this).parents("div.toolbar")[0].id.match('[0-9]+')[0])
		var win = $('body > article').get(0);
		win.focus();
		var doc = win.document;
		// have we lost cursor positions?
		// excpetions occur selecting images
		var s = doc.selection.createRange().duplicate().getBoundingClientRect();
		if(!(s.left>=0&&s.top>=0)){
			// restore the cursor position
			doc.body.createTextRange().moveToPoint( win.posx, win.posy).select();
		}}
		catch(err){}
	}

	var cmd = $(this).attr("data-cmd");

	if(cmd==='insertimage'){

		// Reuse an exiting one if not already available
		$fileType = $(this).siblings("input[type=file]").filter(function(){return $(this).val()===""});

		// Add a new one
		if($fileType.length === 0){
			$fileType = $("<input type='file' style='opacity:0;position:absolute;left:-1000px' multiple='true'/>")
				.change(function(){insertimage(this);})
				.insertAfter(this);
		}

		// Trigger focus and click events
		$fileType
			.trigger('focus')
			.trigger('click');

		return false;
	}
	else if(!cmd){
		return false;
	}
	
	log(cmd);

	
	/**
	 * Toggle Class
	 */
	$(this).toggleClass('selected');

	/**
	 * Trigger edit command
	 */
	try{
		insert(cmd, null);
	}
	catch(e){
		log("Uncaught error applying insert",e);	
	}
	return false;

});

$("body > header > nav select").change(function(e){
	// Make sure the focus is on the window
	if($.browser.msie){
		var win = window,
			doc = win.document;
		doc.focus();
		cursorPos = doc.body.createTextRange();
		cursorPos.moveToPoint( win.posx, win.posy);
		cursorPos.select();
	}

	log(e);

	/**
	 * Add insert event
	 */
	insert($(this).attr('data-cmd'), this.options[this.selectedIndex].value);
});



/**
 * Add Tools
 */
var attr = {
	bold 		: {css:{'fontWeight':'bold'}, tag:'B|STRONG'},
	italic		: {css:{'fontStyle':'italic'},tag:'I|EM'},
	underline	: {css:{'textDecoration':'underline'},tag:'U'},
	strikethrough : {css:{'textDecoration':'line-through'},tag:'STRIKE'},
	justifyright : {css:{'textAlign':'right'},attr:{'align':'right'}},
	justifycenter : {css:{'textAlign':'center'}},attr:{'align':'center'},
	justifyfull : {css:{'textAlign':'justify'}},
	justifyleft : {css:{'textAlign':'left'},attr:{'align':'left'}},
	insertorderedlist : {tag:'OL'},
	createlink : {tag:'A'},
	insertimage : {tag:'IMG'},
	insertunorderedlist : {tag:'UL'},
	fontname	: {css:{'fontFamily':null}, attr:{'face':null}},// null: accepts a variety of values
	formatblock : {tag:'ADDRESS|P|PRE|H[0-9]|BLOCKQUOTE'}
};



$("article").bind('click keyup blur', function(e){

	if(e.type==='blur')
		return;

	var obj;

	if(!(obj = $(window).selectedText().obj))
		return;



	// loop through each parent of the currently selected
	// Capture styles and tagNames to imply formatting
	// Formatting of some tags, i.e b,i,u, can be overridden by styles
	// And can also be inferred by tagNames.

	var c = {}; // commands, these are 
	var getattr = function(){
		if(!this.tagName)
			return;
		var t = this.tagName.toUpperCase(),
			x,y,m;
	

		if(t==='BODY'||t==='HTML')
			return;

		for(x in attr){
			if(c[x]) continue;
			for( y in attr[x].css ){
				if( this.style[y] 
					&& ( this.style[y].match( attr[x].css[y], 'i' ) 
						|| ( attr[x].css[y] === null && this.style[y].length > 0 ) ) ){
					c[x] = this.style[y];
					continue;
				}
			}
			if($.browser.msie)
				for( y in attr[x].attr ){
					if( this.getAttribute 
						&& ( this.getAttribute(y) === attr[x].attr[y] 
							|| ( attr[x].attr[y] === null && this.getAttribute(y).length > 0 ) ) ){
						c[x] = this.getAttribute(y);
						continue;
					}
				}
			if(c[x]) continue;
			if((m=t.match( '^('+attr[x].tag+')$' ))!==null){
				c[x] = m[0].toLowerCase();
			}
		}
	};

	$(obj).each(getattr).parents().each(getattr);

	//log(["selected",obj,c,$(this).siblings('body header nav').find(':input[cmd]')]);

	$('body header nav.editor :input[data-cmd]').each(function(){
		var cmd = $(this).attr('data-cmd');
		var bool = !(typeof c[cmd] === 'undefined');
		
		if(this.tagName === 'BUTTON'){
			if(bool)
				$(this).addClass('selected');
			else
				$(this).removeClass('selected');
		};
		if(this.tagName === 'SELECT'){
			if(bool)
				this.value = c[cmd];
			else 
				this.selectedIndex = -1;
		};
	});

	//console.log(c,obj,$(obj).parents());
		
	// Record the last selected position in the Iframe
	try{
		var s = document.selection.createRange().duplicate().getBoundingClientRect();
		window.posx = s.left; 
		window.posy = s.top; 
	}
	catch(e){}
});


$(window).scroll(function(e){
	$("body>header")[(document.body.scrollTop>1?'add':'remove')+'Class']("float");
});

$("body > article").bind('dragover',function(){return false;}).bind('drop', function(e){
	log(e);
	var holder= this;
	e = (e&&e.originalEvent?e.originalEvent:window.event) || e;
	
	if(e.preventDefault){
		e.preventDefault();
	}
	insertimage(e.files?e:e.dataTransfer);
	return false;
});


// window.addEventListener('paste', ... or
document.onpaste = function(event){
	insertimage(event.clipboardData);
}

/**
 * Insert images if they are passed as a dataTransfer array.
 * This is used for body[ondrop]() and input[type=file][onchange]() as well as document[onpaste]
 * Images are reduced to a smaller size
 */
function insertimage(e){

	if(!("FileReader" in window)){
		return;
	};
	log(JSON.stringify(e));

	if(e.files&&e.files.length){
		for(var i=0;e.files.length;i++){
			file(e.files[i]);
		}
	}
	else if(e.items&&e.items.length){
		// pasted image
		for(var i=0;i<e.items.length;i++){
			if( e.items[i].kind==='file' && e.items[i].type.match(/^image/) ){
				file(e.items[i].getAsFile());
			}
		}
	}
	
	function file(file){
		var reader = new FileReader();
	
		reader.onload = function(){

		    var img = new Image(),
		    	canvas = document.createElement("canvas"),
		    	ctx = canvas.getContext("2d"),
		    	maxWidth = maxHeight = 700;
	
			
		    img.onload = function()
		    {
				var ratio = 1;
				
				if(img.width > maxWidth){
					ratio = maxWidth / img.width;
				}
				if(img.height > maxHeight){
					ratio = Math.min(maxHeight / img.height, ratio);
				}
				
				canvas.width = img.width * ratio;
				canvas.height = img.height * ratio;
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				
				// insert this into the current document as an image 
				var canvasDataURL = canvas.toDataURL();
				log("CANVAS LENGTH" + canvas.toDataURL().length );
				insert("insertimage", canvasDataURL.length < reader.result.length? canvasDataURL : reader.result );
	
		        
		    };
		
		    img.src = reader.result;
		    log("IMG LENGTH "+reader.result.length);
		    
		};
		reader.readAsDataURL(file);
	}

}