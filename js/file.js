/**
 * This is the file.js page
 * @author Andrew Dodson
 * @since Nov 2011
 */

$("body header nav.file button.save").click(function(e){
	// get the ID
	var id = document.body.id;

	// if no ID then lets make one
	if(!id){
		id = parseInt(Math.random()*1e6);
	}
	
	// Open and save
	open(id,$("body > article").html());
	
	// return
});

$("body header nav.file button.new").click(function(e){

	// Open and save
	open(parseInt(Math.random()*1e6),"");

	// return
});

$("body header nav.file button.open").click(function(e){

	if(	$("body > header > ul").html().length > 0 ){
		$("body > article").trigger('click');
		return;
	}

	var s = '';

	// open a list
	for( var x in localStorage ){
		if(x.match(/^[0-9]+$/)){
			log(x,document.body.id);
			s += '<li><a href="#'+ x +'" '+(parseInt(x)===parseInt(document.body.id)?' class="active"':'')+'>'+$("<span>"+localStorage.getItem(x)+"</span>").text().substr(0,20) +'</a></li>';
		}
	}

	// return
	$("body > header > ul").append(s).parent().addClass("float");
});

$("body header nav.file button.delete").click(function(e){
	// get the ID
	var id = document.body.id;

	// if no ID then lets make one
	if(id){
		// Remove
		window.localStorage.removeItem(id);
	}
	$("body > article").html("");
});



$("body > header > ul > li > a").live('click', function(e){

	var m = this.href.match(/([0-9]+)$/),
		id = parseInt(m?m[0]:0);
		
	$(this).addClass("active").parent().siblings().find('a').removeClass('active');

	open(id);

	e.preventDefault();
	e.stopPropagation();
});


$("body > article").click(function(){
	$("body > header > ul").html("");
	$(window).trigger('scroll');
});

$(window).bind("hashchange popstate", function(){

	var s = location.hash;

	if(!s || s.length === 0){
		s = location.pathname;
	}
	
	var m = s.match(/([0-9]+)$/), id = !m?0:parseInt(m[1]);
	
	if(!id){
		return;
	}

	$("body > article").html(window.localStorage.getItem(id));

	// Save document ID.
	document.body.id = id;
	//	log(s,m);

});


function open(id,html){
	
	// Append any html
	if(typeof html === 'string'){
		window.localStorage.setItem(id, html);
	}

	/**
	if(!!history.pushState){
		// Is this a change in location?
		history.pushState( {}, "New Document", id );
		// Safari doesn't update our search string
		$(window).trigger('popstate');
		return false;
	}
	*/

	window.location.hash = id;
}