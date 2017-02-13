/** =i4poS2go
-------------------------------------------------------------- 
	A dynamic web-application
	(c) 2010 V.V. Vertriebs-Vereinigung GmbH & Co. KG, Berlin
	Created by Caspar Huebinger (Design) & Michael Schmitz (programming)
	
	Built upon the jQuery javascript library @http://jquery.com
 
-------------------------------------------------------------- 
	
	Custom application javascript
	@requires jquery-1.7 (latest version)
	
*/


/** =Console function for other browsers than Safari
-------------------------------------------------------------- */
/*
console = {
    error:function(){},
    warn:function(){},
    log:function(){}
};

*/
/** =Navigation
-------------------------------------------------------------- 
 
	Modifies the behavior of links and menu items.
	
	@requires .slideleft.in, .slideleft.out
	@requires .slideright.in, .slideright.out
	@requires .fade.in, .fade.out, .current
 
*/

// global variables

var old_link = "#start"; 	// global Navigation
var hasKustImg = '';		// global image control
var form_val;			// global custom-forms control
var form_val_blanks;		// global blank container for new custom_form values
var name_street_search_str;	// name / street search string
var customer_data;		// xml Conatiner for all datas

// Helfer-Funktion für die Navigation?

function goTo(pageID){
	
	
	console.log ('goTo ' + old_link + ' to ' + pageID);
//
//	
//
//	if (pageID == "#content") {
//	     mode_load () ;
//	    $('#hgroup').show();
//	}
//	
//	if (old_link == "#content")  {
//	    // unload_mode();
//	    
//	    var currentPage = $('.primary ul li a.active').attr('href');
//	    console.log ("goTo Back, current Class " + currentPage);
//	    $(currentPage).removeClass('current');
//	    $(currentPage).removeClass('active');
//	    $('.primary').removeClass('current');
//		
//    	    $('#content').hide();
//	    $('#hgroup').hide();
//	}	
//	 
//	if (old_link != "") {
//	    $(old_link).removeClass("current");
//	}
	
	var currentLink = "#" + $(".current").attr("id");
	    
	$(".window").removeClass("slideleft slideright current");
//	$(".window").removeClass("slideright");
//$(".window").removeClass("current");
	$(pageID).addClass("slideleft");
	
	
	
//    $('.window').addClass("transparent");
//	    $('.window').addClass("slideleft");
//	$(pageID).removeClass("transparent"); 
//	$(pageID).removeClass("slideright");
//	$(pageID).removeClass("slideleft");
	
	
	
	 
	old_link = pageID;
	
	setTimeout(function(){
            $(pageID).addClass("current");
	
	
	
            $('.window').addClass("transparent");
	  
            $(pageID).removeClass("transparent"); 
            $(pageID).removeClass("slideright");
            $(pageID).removeClass("slideleft");
            
            
    },200); 
        
	
	
//	setTimeout(function(){
//		console.log(pageID);
//		//	$(pageID).css("margin-left", "0%");
//		$(pageID).addClass("current")},0); 
}

    // general link function
    
var general_link = function () {

    var link = $(this).attr('href')
     
    goTo(link);
    return false;

}

/* 2010-12-16 Aenderungen Micha : click-events in Funktionen gekapselt, diese mit /bind / unbind an jeweiligen Orientation - modus gebunden
  
*/

var portraitMenuClickEvents  = function () {
    
    	    $('.primary ul li a').removeClass('active');
	    $(this).addClass('active');
	    
	    // primary
	    $('.primary').removeClass('slideright in');   
	    $('.primary').removeClass('current');   
   
	    //secondary
	    var currentPage = $(this).attr('href');
	    $(currentPage).addClass('slideleft in');
	    $(currentPage).addClass('current');
	    
	    return false;
}


var landscapeMenuClickEvents  = function () {
	
	// menu link behavior
	
	// primary
	// add class .active for styling
	var oldPage = $('.primary ul li a.active').attr('href');
	
	$('.primary ul li a').removeClass('active');
	$(this).addClass('active');
	
	// secondary
	$(oldPage).removeClass('current');

	var targetPage = $(this).attr('href');
	$(targetPage).addClass('current');

        return false;

}


var portraitBackClickEvents = function () {
    
    var currentPage = $('.primary ul li a.active').attr('href');
    
    if( $(currentPage).hasClass('current')) {
	//secondary ist oben - alle Klassen entfernen
	$(currentPage).removeClass('slideleft in');
	$(currentPage).removeClass('current');

	$('.primary').addClass('slideright in');
	$('.primary').addClass('current');
    }
    else {
	// primary ist oben
	$('#hgroup .back').unbind('click');
	$('#hgroup .back').bind('click', general_link);
	$('#hgroup .back').click();
    }
    return false;
}


var landscapeBackClickEvents = function () {
 
    //unload secondary current 
    var currentPage = $('.primary ul li a.active').attr('href');
    $(currentPage).removeClass('current');
    $('#content').hide();
    
    return true;	
}

/** =Set orientation mode
-------------------------------------------------------------- 
 
	Gets the device's current orientation and sets classes 
	accordingly.
	
	@requires portraitMode()
	@requires landscapeMode()
 
*/


function setCurrentOrientationMode() {
	
    var currentOrientation = window.orientation;
    if( currentOrientation == 0 || currentOrientation == 180 ) {

	// import portrait function
	portraitMode();
    } else {
    	
	// import landscape function
	landscapeMode();
    }
}

function mode_load () {
    
    if( $('#i4p').hasClass('portrait') ) {

	// make the menu .current...
	$('.primary').addClass('current');
			    	
	// ... and remove .active from menu links
	$('.primary ul li a').removeClass('active');
	$('#hgroup .back').unbind('click');
	$('#hgroup .back').bind('click', portraitBackClickEvents);
    }

    // if in landscape mode...
    if( $('#i4p').hasClass('landscape') ) {

	// make the first page .current...
	$('.secondary:first').addClass('current');
			    	
	// ...make first menu-link .active
	$('.primary ul li a').removeClass('active');
	$('.primary ul li a:first').addClass('active');
				    
	// ...remove sliding animations
	$('.primary, .secondary').removeClass('slideleft slideright out');
	$('#hgroup .back').unbind('click');
	$('#hgroup .back').bind('click', general_link);
    }
}


function getCustomerData (identifier) {
	
	var founded = false;
	var return_value = "";
	    
	    $(customer_data).find('application').each(function(){
	    if (identifier == $(this).find('name').text()) {
		return_value = $(this).find('content').text();
		founded = true;
		//return false;

	    }
	    });
	    
	    $(customer_data).find('status').each(function(){
			$(this).find(identifier).each (function(){
		    return_value = $(this).text();
		    founded = true;
		});   
	});
				   
	return return_value;
	
}

/* This function makes a div scrollable with android and iphone */

function isTouchDevice(){
	/* Added Android 3.0 honeycomb detection because touchscroll.js breaks
		the built in div scrolling of android 3.0 mobile safari browser */
	if((navigator.userAgent.match(/android 3/i)) ||
		(navigator.userAgent.match(/honeycomb/i)))
		return false;
	try{
		document.createEvent("TouchEvent");
		return true;
	}catch(e){
		return false;
	}
}

function touchScroll(id){
    		var elem = $("#" + id);
	if(isTouchDevice()){ //if touch events exist...
		var el=document.getElementById(id);
		var scrollStartPosY=0;
		var scrollStartPosX=0;

		document.getElementById(id).addEventListener("touchstart", function(event) {
			scrollStartPosY=this.scrollTop+event.touches[0].pageY;
			scrollStartPosX=this.scrollLeft+event.touches[0].pageX;
			//event.preventDefault(); // Keep this remarked so you can click on buttons and links in the div
		},false);

/*		document.getElementById(id).addEventListener("touchmove", function(event) {
			// These if statements allow the full page to scroll (not just the div) if they are
			// at the top of the div scroll or the bottom of the div scroll
			// The -5 and +5 below are in case they are trying to scroll the page sideways
			// but their finger moves a few pixels down or up.  The event.preventDefault() function
			// will not be called in that case so that the whole page can scroll.
			if ((this.scrollTop < this.scrollHeight-this.offsetHeight &&
				this.scrollTop+event.touches[0].pageY < scrollStartPosY-5) ||
				(this.scrollTop != 0 && this.scrollTop+event.touches[0].pageY > scrollStartPosY+5))
					event.preventDefault();	
			if ((this.scrollLeft < this.scrollWidth-this.offsetWidth &&
				this.scrollLeft+event.touches[0].pageX < scrollStartPosX-5) ||
				(this.scrollLeft != 0 && this.scrollLeft+event.touches[0].pageX > scrollStartPosX+5))
					event.preventDefault();	
			this.scrollTop=scrollStartPosY-event.touches[0].pageY;
			this.scrollLeft=scrollStartPosX-event.touches[0].pageX;
		},false);
*/		
		
		document.getElementById(id).addEventListener("touchmove", function(event) {
			// These if statements allow the full page to scroll (not just the div) if they are
			// at the top of the div scroll or the bottom of the div scroll
			// The -5 and +5 below are in case they are trying to scroll the page sideways
			// but their finger moves a few pixels down or up.  The event.preventDefault() function
			// will not be called in that case so that the whole page can scroll.
		/*	if ((this.scrollTop < this.scrollHeight-this.offsetHeight &&
				this.scrollTop+event.touches[0].pageY < scrollStartPosY-5) ||
				(this.scrollTop != 0 && this.scrollTop+event.touches[0].pageY > scrollStartPosY+5))
					event.preventDefault();	
			if ((this.scrollLeft < this.scrollWidth-this.offsetWidth &&
				this.scrollLeft+event.touches[0].pageX < scrollStartPosX-5) ||
				(this.scrollLeft != 0 && this.scrollLeft+event.touches[0].pageX > scrollStartPosX+5))
					event.preventDefault();
	*/
			this.scrollTop=scrollStartPosY-event.touches[0].pageY;
			this.scrollLeft=scrollStartPosX-event.touches[0].pageX;
			event.preventDefault();
		},false);
		
	/*	document.getElementById(id).addEventListener("touchend", function(event) {
			$(this).scrollTop($(this).scrollTop() +50);
			//this.scrollTop=scrollStartPosY-event.touches[0].pageY+50;
			//this.scrollLeft=scrollStartPosX-event.touches[0].pageX+50;
			console.log ("scrollend" + scrollStartPosY + "X " + scrollStartPosX);
			event.preventDefault();
		},false);
		*/

	}
}

// load custom forms

	
function form_load (loadParam) {
    
    // loadParam; 0 = forms and values; 1 only values
    
    var data_string = 'customId=' + $('#kust_keyvalue').val() + '&loadParam=' + loadParam + '&userId=' + getCustomerData('userId') + '&login=' + getCustomerData('login');
	console.log("form_load" + data_string);
    	$.ajax({
	    type: 'POST',
	    dataType: 'xml',
	    url: 'php/form_load.php',
	    data: data_string,
				
	    success: function(forms_xml){
		
		if (loadParam == 0) {
		    
		    
    		    // before form loads remove form entries in menu list
		    $('#menu li[id*="custom_menu"]').remove();
		    $('form[id*="custom_form_"]').die('submit');
		    $('div[id*="custom_div_"]').remove();
		    
		    // create Menu for Forms
			
		    $(forms_xml).find('forms').each(function(){
			var form_id = $(this).find('form_id').text();
			var menu_id = $(this).find('menu_id').text();
			var div_id = $(this).find('div_id').text();
			var list_id = $(this).find('list_id').text();
			var form_name = $(this).find('Name').text();
			var abs_form_id = $(this).find('FormId').text();
			var guest_form = $(this).find('Test').text();
			
			// user = guest; only test form
			

			$('#menu').append('<li class=arrow id="' + menu_id +'"> <a href="#' + div_id +'">' + form_name + '</a></li>');
			
			//create divs
			var div_content = '<div class="secondary transparent" id="' + div_id + '">';
			// ul -list for stored forms; first hidden;
			div_content = div_content + '<ul id="' + list_id + '" style="display:none"></ul>';
			div_content = div_content + $(this).find('Content').text() + '</div>';
			$('#content').append(div_content);
			
			// create blank formvalues for new entries
			
			//append internal values into form
			$('#' + div_id + ' form').attr('id', form_id);
			$('#' + div_id + ' form').append('<input type="hidden" name="formId" value="' + abs_form_id + '">');
			$('#' + div_id + ' form').append('<input type="hidden" name="customId" value="' + getCustomerData('var_CustomId') + '">');
			$('#' + div_id + ' form').append('<input type="hidden" name="formvalId" value="NEW">');

			var userId = getCustomerData('userId');
			$('#' + div_id + ' form').append('<input type="hidden" name="userId" value="' + userId + '">');

			//append ajax function in custom form
			
			$('#' + form_id).live('submit', function () {
	
			    var validate_ok = true;

			    $(this).find('.validate').each (function () {

				if ( $(this).val() == "") {
				    $(this).css("background-color","red");
				    validate_ok = false
				}
				else {
					$(this).css("background-color","transparent");
				}
				
			    });
			    
			    if (validate_ok == true) {
					// disable Button
					var form_btn = $('#' + form_id + ' :submit');
					$(form_btn).attr('disabled', true);
						
					$.ajax({
					type: 'POST',
					url: 'php/form_store.php',
					data: $(this).serialize(),
					
					success: function(html) {
						$(form_btn).attr('disabled', false);
						$(window).scrollTop(0);
						
	
						if (html != "") {
							alert(html);
						  
						}  
						else {
							alert ("Daten wurden gespeichert");
						}
	
						form_load (1);
						
					},
					
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						$(form_btn).attr('disabled', false);
						alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
						$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
					} 
					}); // end ajax
			    }
			    else {
				alert ("Mindestens ein Pflichtwert wurde nicht erfasst. Bitte die rot markierten Felder ausfüllen.");
			    			
			    }
			    return false;
			}); // end live.submit

		    }); // find.forms

/*		    $('.txtDate').mask("39.19.99");
		    var now = new Date();
		    var day = "";
		    var month = "";
		    var year = "";
		    day = now.getDate();
		    if (day < 10 ) {
			day = "0" + day;
		    }
   		    month = now.getMonth()+1;
		    
		    if (month < 10 ) {
			month = "0" + month;
		    }
		    year = String(now.getFullYear());
		    year = year.substr(2,2);
 		        
		    console.log(day+"."+month+"."+year);

		    //now.format("m/dd/yy");
		    console.log ("date " + now);
		 //   $('.txtDateNow').val(day+"."+month+"."+year);
		    
*/		    
		} // if
		
		// create list with stored forms into divs
		
		// clear lists
		$('#[id*="custom_list_"] li').remove();
		
		$(forms_xml).find('formvalues').each(function(){
		    
		    var list_id = $(this).find('list_id').text();
		    //var list_id = $(this + " 'list' 'list_id'").text();
		    console.log("list id " + list_id);
		    // clear list
		   
		    var list_item_id = $(this).find('list_item_id').text();
		    $('#' + list_id).append('<li class="arrow" id="' + list_item_id + '"><a href="#">' + $(this).find('listTitle').text() + '</a></li>');
		    if ($('#' + list_id + ' a').length >1)  {
			$('#' + list_id).show();
		    }
		    console.log (" list-id " + list_id);
		    var formValId = $(this).find('FormvalId').text();
		    
		    if (formValId == "NEW") {
			// new entry, store defults in xml, so that can be read later
			
			// add content element
//			var xml = "<rss version='2.0'><channel><title>RSS Title</title></channel></rss>",
 /*   xmlDoc = $.parseXML( xml ),
    $xml = $( xmlDoc ),
    $title = $xml.find( "title" );

/* append "RSS Title" to #someElement */
//$( "#someElement" ).append( $title.text() );

/* change the title to "XML Title" */
//$title.text( "XML Title" );

/* append "XML Title" to #anotherElement */
//$( "#anotherElement" ).append( $title.text() );


			
			
			
		/*	form_val.append('content');
			var x = form_val.find('content')
			//var x = newContent.add('E_DATUM');
			x.text('01.01.01');
			console.log("newCont " + x.text());
	*/
		    }
		    
		
		
		}); // find.formvalues
		form_val = $(forms_xml);
		
		//form_val.find('formvalues').each (function() {
		//    $(this).append("<bla>blabla<bla/>");
		//});  ;

				if ($(form_val).find('formvalues').length > 0 ) {
					$('#menu li[class="unclickable"]').show();
				}
		//console.log($(forms_xml).find('formvalues').html());
		console.log ("formfound");
		
			form_val.find('formvalues').each(function (){
			    var arr = $(this).get(0);
			    
			    console.log ("name " + arr);
			    console.log ("text " + $(this).text());
			    
			});
		//form_val = xml;
		//form_val = $(forms_xml);  
	    }, // end succes
			
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
		alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
		$('#frmSuche_submit').attr('disabled', false);
		console.log ("end frm_Suche");
	    } 
 	}); // end ajax

}	


function openBirthDate() {
	var now = new Date();
	var days = { };
	var years = { };
	var months = { 1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec' };
	
	for( var i = 1; i < 32; i += 1 ) {
		days[i] = i;
	}

	for( i = now.getFullYear()-100; i < now.getFullYear()+1; i += 1 ) {
		years[i] = i;
	}
	
	SpinningWheel.addSlot(days, 'right', 12);
	SpinningWheel.addSlot(months, '', 4);
	SpinningWheel.addSlot(years, 'right', 2011);	
	
	SpinningWheel.setCancelAction(cancel);
	SpinningWheel.setDoneAction(done);
	
	SpinningWheel.open('result');
}

function done() {
	var results = SpinningWheel.getSelectedValues();
	document.getElementById('result').innerHTML = 'values: ' + results.values.join(' ') + '<br />keys: ' + results.keys.join(', ');
}

function cancel() {
	document.getElementById('result').innerHTML = 'cancelled!';
}

			function iframe_loaded() {
				src = document.getElementById("dociframe").src
				if (src == "")
					alert("iframe was loaded with no content");
				else
					
					$('#dociframe').show();
			}
function iframeload() {
    $('.popupdocs .innerdocs .toolbar h1').text("ready");
    $('#overlaydocs').show()
    //$('.popupdocs .innerdocs iframe').show();
 } 

$(document).ready(function() {
 

    
	// load params
	
	$.ajax({
	    type: 'POST',
	    dataType: 'xml',
	    url: 'php/param_load.php',
	    data: 'filter=#app_params',
	    success: function(xml) {
			console.log(xml);
			$(xml).find('params').each (function (){
				var paramName = $(this).find('paramName').text();
				var paramValue = $(this).find('paramValue').text();
				paramName = "param_" + paramName;
				$('*[name="' + paramName + '"]').append(paramValue);
			});
					
	    },
				
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
			alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
	    } 
	}); // end load params ajax
	
    
    // load var_template
    $.ajax({
	    type: 'GET',
	    dataType: 'html',
	    url: 'pages/template.xml',
	    				
	    success: function(xml) {
		
		$(xml).find('template').each(function(){
		    
		    var template_name = $(this).attr('name');
		    var template_content = $(this).children();
		    $('*[name="' + template_name + '"]').replaceWith(template_content);
		}); // find.formvalues
	    },
				
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
		alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
	    } 
	}); // end ajax
    
		       		

//    var buttons = "input[type=submit], .button, .whiteButton, .grayButton, .back, .cancel";
//    
//    $(buttons).bind("mousedown touchstart MozTouchDown", function(e) {
//	
//	if(e.originalEvent.touches && e.originalEvent.touches.length) {
//	    e = e.originalEvent.touches[0];
//	}
//	else
//	if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
//	    e = e.originalEvent.changedTouches[0];
//	}
//    });
    
    // set orientation appropriatly
    
    //TEST!!!!!!!
    setCurrentOrientationMode();
	

				
	
	
	
    // portraitMode();
    // Clear form fields on focus
       
    $('input[type="text"],input[type="password"],textarea').focus(function(){
        $(this).attr('value','');
    });
    
    //$('a[href*="#"]').not('#btnpopupdocs_back').bind('click', general_link);
    $('#customer ul li a').unbind('click', general_link);
    $('#hgroup .back').unbind('click', general_link);
   
	
    //2010-12-17-ch
    // #content must be hidden while we're in .generic
    $('#content').hide();
	
    //2010-12-17-ch
    // hide #content when we click a button in #goodbye to go back to #find
    $('#goodbye .whiteButton, #goodbye .grayButton').click(function(){
	$('#content').hide();
    });
	
 // global mask definations for masked input - areas
 

$.mask.definitions['1']='[01]';
$.mask.definitions['2']='[0-2]';
$.mask.definitions['3']='[0-3]';
$.mask.definitions['4']='[0-4]';
$.mask.definitions['5']='[0-5]';
$.mask.definitions['A']='[ A-Z]';
$.mask.definitions['m']='[0-12]';




if ($('#map_entries_div').length > 0) {
  touchScroll ('map_entries_div');
}




 
/* -------------------------------------------------------------- */

    // popup image
    $('.userimg').mousedown(function(){
	// drop tapped image in a var
	var tapped_userimg = $(this).html();
		
	// TO DO: get image dimensions, resize .popupimg accordingly
		
	// append tapped image to popup container
	$('.popupimg .inner').html(tapped_userimg);
	// show it
	var doc_h = $(document).height();
	var doc_w = $(document).width();
	$('#overlay').fadeIn(100).height(doc_h).width(doc_w);
    });
	
    // fade out zoomed image on tap
    $('.popupimg').click(function(){	
	// fade out overlay
	$('#overlay').fadeOut(100);
	// remove image from popup container, so it won't get duplicated next time
	$(this).delay(500).queue(function(){
	    $(this).children('.inner').empty();
	});
    });
    
     // init Ul-Menus
    // set first Entry active
    $('ul li a:first').addClass('active');   
    
    $('#ul_mainmenu li a').click(function () {
	$('#ul_mainmenu li a').removeClass("active");
	
	$(this).addClass("active");
	
	////workaround for forms
	//if ($(this).attr('href') == '#forms') {
	//	//$('#menu li ').hide();
	//	goTo('#content');
	//}
	//
	
    });

/**
 * FORMS
 */
	
/** =Login form #loginform
-------------------------------------------------------------- */
    $('#loginform').submit (function() {
		
	var login_status = 0;
	var data_string = 'username=' + $('#username').val() + '&password=' + $('#password').val() + '&logged_in=0';
			
	$.ajax({
	    type: 'POST',
	    dataType: 'xml',
	    url: 'start.php',
	    data: data_string,
				
	    success: function(xml) {
					
		var return_status = $(xml).find('status');
		var login_status = return_status.children('logged_in').text();
					
		if (login_status == 0) {
		    // login failed
		    alert (return_status.children('msg').text());
		}
					
		else {
		    $('*[name="param_username"]').empty();
		    $('*[name="param_username"]').append(return_status.children('username').text());
			
			if ($('#username').val() == 'gast') {
				//guest user - do'nt show titelprofil o mainmenu
				$('#ul_mainmenu li').hide();
				$('#ul_mainmenu li:first').show();
			}
			else {
				$('#ul_mainmenu li').show();
			}
	
		    //workaround for iphone / ipad version
			if ($('#mainmenu').length > 0) {
		      goTo('#mainmenu');
			}
			else {
				goTo('#find');
			}
		}
					
	    },
				
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
		alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
	    } 
	}); // end ajax

	return false;
    }); // end loginform
	

/** =Logout form #logoutform
-------------------------------------------------------------- */
    $('#logoutform').submit (function() {
		
	var data_string = 'logged_out=0';
			
	$.ajax({
	    type: 'POST',
	    dataType: 'xml',
	    url: 'start.php',
	    data: data_string,
				
	    success: function(xml) {
	        goTo('#loggedout');
	    }
	}); // end ajax

	return false;
    }); // end Logoutform

	
	
/** =Search form #frmSuche
-------------------------------------------------------------- */
    $('#frmSuche').submit(function () {

	var data_string = 'kust_keyvalue=' + $('#kust_keyvalue').val();
	
	// remove toggle-search button
	$('#toggle-search').remove();
	
	//disable button while xml is loading    
	$('#frmSuche_submit').attr('disabled', true);
	$('#search_list').hide();
   

	$.ajax({
	    type: 'POST',
	    dataType: 'xml',
	    url: 'start.php',
	    data: data_string,
				
	    success: function(xml){
										
		var return_status = $(xml).find('status');
		var logged_in = return_status.children('logged_in').text();
					
		    if (logged_in == 1) {
					
		        var kdnr_found = return_status.children('kdnr_found').text();
			
			if(kdnr_found == 0) {
			    // wrong kundennumer
			    alert(return_status.children('msg').text());
			}
			
		        if(kdnr_found == 1) {
			    
			    // reset vars
			    $('*[name*="var_"]').empty();
			    // hide captions
			    $('*[class*="caption_var_"]').hide();
			    // reset iframes
			    $('iframe').attr('src',"");
			    // store xml in global container;
			    customer_data = xml;
				
				// hide mainmenus entries
				$('#menu li').hide();
				console.log(xml);
				$(xml).find('application').each(function(){
						
			        // insert the name in the DOM Object and the value 
			        var app_name = $(this).find('name').text();
			        var app_content = $(this).find('content').text();

			        $('*[name="' + app_name + '"]').append(app_content);
				//show caption
				$('*[class="caption_' + app_name + '"]').show();
					
					// show used menues
					var app_parent = $('*[name="' + app_name + '"]').parents(".maincontent");
					var menu_entry = $(app_parent).attr('id');
					console.log(menu_entry);
					$('#menu li[name="' + menu_entry + '"]').show();
					
				
			    }); //find('return')

				var userId = getCustomerData('userId');
				
				// no more needed
			    //if ((userId == 4) || (userId == 6) || (userId == 16) || (userId == 3) || (userId == 15)) {
				    console.log ("formload");
					form_load(0);
					
			    //}			    
			    $('.userimg').hide();
			    
			    $('.landscape .userimg').has('img').show();

			    // store image status in a var
			    if( $('.userimg').is('span:has(img)') ) {
				hasKustImg = true;
			    } else {
				hasKustImg = false;
			    }
			    
			    // hide / show values in customer-key-div 
			    $('.customer-key-data a').each (function() {
			 
				if ($(this).text() != "") {
				    $(this).show();
				} else {
				    $(this).hide();
				}
			    });

			  $('input[name="cb_toggle_row"]').click();
			  $('input[name="cb_toggle_row"]').attr('checked', false);
			  
				 // reset map
			  $('#map_canvas').empty();
			  // $('map_entries').remove
			  
			  // hide map - entry - list
			  $('#map_entries_div').hide();
				console.log("Ttile");
				console.log($('a[class*="email"]').attr("title"));
				$('a[class*="email"]').attr("title", "E-Mail: ");
				$('a[class*="phone"]').each (function() {
					var title =  $(this).attr("title") + " ";
					$(this).attr("title", title);
				});
				
				// Start main Application
			    goTo('#mainapp');
			    
			} // if kdnr_found
			
			if(kdnr_found == 2) {
			    // clear List 
			    $('#search_list li').remove();
			    $(xml).find('application').each(function(){
				$('#search_list').append($(this).find('search').text());
				// store serch_str for restore on click at toggle_search
				name_street_search_str = $('#kust_keyvalue').val();
			    }); //find('return')
				
				 $('#search_list').show();
				setTimeout(function () {
					search_listScroll.refresh();
				}, 0);	
				
			}

		    } // if logged in

		    else {
		        // loggged out
		        alert(return_status.children('msg').text());
		        goTo('#loggedout');
		    }
		    //enable submit-button
		    $('#frmSuche_submit').attr('disabled', false);
		}, // end succes
			
		error: function (XMLHttpRequest, textStatus, errorThrown) {
		    alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		    $('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
		    $('#frmSuche_submit').attr('disabled', false);
		} 
 	    }); // end ajax
	    return false;
	    
	    
	}); // end frmSucheche
	

/** =Kundenstammerfassung form #frmlogoutform
-------------------------------------------------------------- */
	$('#frmKustErfassung').submit (function() {
		
	    var data_string = '';
			
	    $.ajax({
	        type: 'POST',
		url: 'add_data.php',
		data: data_string,
				
		success: function() {
		//     jQT.goTo('#loggedout');
		},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
		    alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		    $('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
		    $('#frmSuche_submit').attr('disabled', false);
		} 
	    }); // end ajax

	    return false;
	}); // end loginform	
	

/** =Besuchsauftrag form #frmBesAuftrag
-------------------------------------------------------------- */
	$('#frmBesAuftrag').submit (function() {
		
	    var data_string = '';
			
	    $.ajax({
	        type: 'POST',
		url: 'add_data.php',
		data: data_string,
				
		success: function() {
		//     jQT.goTo('#loggedout');
		}
	    }); // end ajax

	    return false;
	}); // end loginform	
	
	$('#btnpopupdocs_back').click (function() {
	    $('#overlaydocs').hide();
	    $('#title .toolbar .back').show();
	    return false;
	});

/** = TSearch
-------------------------------------------------------------- */


	$('#frmTSearch').submit (function() {
		
	    var data_string = 'titleId=' + $('#txtTSearch').val();
	    
		var showTProfil = function  (tName, tProfil) {
		    $('#txtTSearch').val(tName);
		    $('*[name="var_tprofil"]').empty();
		   // $('*[name="var_tprofil"]').text(tProfil);
		    $('.popupdocs .innerdocs .toolbar h1').text(tName);
		    $('#title .toolbar .back').hide();
		   
		    // $('.popupdocs .innerdocs iframe').hide();
		    $('.popupdocs .innerdocs iframe').attr('src','http://docs.google.com/viewer?url=' + tProfil);
		    $('#overlaydocs').show();
		}
		
		console.log ("click tprofil");
		var wheelsearch = new Array ();
		var tprofil = new Array ();
		
		$('#div_tprofil').hide();
		$('#div_tprofil iframe').attr('src',"");
		$.ajax({
	        type: 'POST',
		dataType: 'xml',
		url: 'php/title_search.php',
		data: data_string,
				
		success: function(xml) {
		    
		    var wrongTitle = true; // Title not found
		    // found one entry 
		    $(xml).find('found').each(function(){
			// found a title, set document
			showTProfil($(this).attr('tname'),$(this).attr('tprofil'));
			wrongTitle = false;

		    });
		    //create search list
		    $(xml).find('search').each(function(){
			var tsearch = $(this).find('tsearch').text();
			var titleId = $(this).find('titleId').text();
			// found a title, set document
			console.log (" tsearch " + $(this).text());
			//$('#title_search_list').append('<li id = "' + titleId +'"><a name="' + tsearch+ '"href="#">' + tsearch + '</a></li>');
			wheelsearch.push(tsearch);
			tprofil.push($(this).find('tprofil').text());
			wrongTitle = false;
		
		    });
		    

		    
		    // if numeric - set the span text, show titelprofi anzeeigen button
		    // if test open search list
		    if (wheelsearch.length > 0 ) {
			
			// create spinnwheel
			SpinningWheel.addSlot(wheelsearch, 'left', 1);
			SpinningWheel.setDoneAction(function () {
			    var results = SpinningWheel.getSelectedValues();
			    console.log ("spWheel res" + results.values.join(' '));
			    console.log ("spWheel reskey " + results.keys[0]);
			    console.log ("spWheel tprofil " + tprofil[results.keys[0]]);
			    //$('#txtTSearch').val(results.values[0]);
			    //$('*[name="var_tprofil"]').text(tprofil[results.keys[0]]);
			    showTProfil(results.values[0],tprofil[results.keys[0]]);
			    });
			SpinningWheel.open('txtTSearch');
			
		    }
		    
		    if (wrongTitle == true) {
			// no title found, alert
			alert ("der Titel " + $('#txtTSearch').val() + " konnte nicht gefunden werden");
			
		    }
		
		},
						error: function (XMLHttpRequest, textStatus, errorThrown) {
		    alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		    $('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
		    $('#frmSuche_submit').attr('disabled', false);
		} 
	    }); // end ajax
	    
	//$('#title_search_list').show();
	    return false;
	}); // end loginform	
	



/** =Buttons
-------------------------------------------------------------- */

	// test 
	$('#btnModus').bind('click',function() {
		if($(this).is(':checked')) {
		console.log ("click btnModus");    
		portraitMode();
			
			
		} else {
		landscapeMode();
		
		}
		
    var doc_h = $(document).height();
    var doc_w = $(document).width();
    $('#overlaydocs').height(doc_h).width(doc_w);
	});
	
	//2010-12-17-ch
	// toggle-button
	
	//old function!!!
		function load_iframe (iframe_name) {
	    var span_name = "var_" + iframe_name;
	    var iframe_url = $('*[name="' + span_name +'"]').text();

	    if (iframe_url != "") {
		//only overwrite, when iframe name is the same
		console.log (iframe_url);
		$('*[name="iframe_var_' + iframe_name +'"]').attr('src', iframe_url);
	    }
	}
	//old function!!!
	$('#btnNlfg').live ('click', function() {
	    var link = "http://www.pressehandel-berlin.de/silence_login.php?K=";
	   link = link + getCustomerData("var_CustomId");
	   $('span[name="var_nachlieferung"]').text(link);
	    load_iframe("nachlieferung");
	    return false;
	});
	// end old functions
	// function - load Documents in iframe
	
	$('*[name="btn_load_document"]').live("click",  function() {
	    
	    var iframe_url = $(this).attr('href');
	    var parent = $(this).parents('div [name="div_load_document"]');
	    iframe_url = iframe_url.replace(/{url}/, parent.find('span').text());
	    //parent.find('iframe').attr('src', iframe_url);
	    
		
		$('.popupdocs .innerdocs iframe').attr('src',iframe_url);
		$('#overlaydocs').show();	
		
		return false;

	});
	
	// function - show / hide rows in tables
	
	$('input[name="cb_toggle_row"]').live("click",  function() {
	    
    
	    var checked = $(this).is(':checked');
	    console.log("checked" + checked);
	    var checked_val = $(this).val();
	    var to_toggled_rows = checked_val.split(",");

	    var parent = $(this).parents('div [name="div_toggle_row"]');
	    console.log("bind cb_toggle");
	    
	    parent.find('table').each (function(){
		
		for (var l = 0; l < to_toggled_rows.length; l++) {
		    if (!to_toggled_rows[l].isNan) {

			toggle_head = $(this).find('th:nth-child(' + to_toggled_rows[l] + ')');
			toggle_row = $(this).find('td:nth-child(' + to_toggled_rows[l] + ')');
		    
			if (checked == true) {
			    toggle_head.show();
			    toggle_row.show();

			}
			else {
			    toggle_head.hide();
			    toggle_row.hide();
			}
		    }
		}
	    });
	    

	});

	
    $('#kust_keyvalue').keyup (function() {

	    var search_str = $(this).val();
	    search_str = search_str.toUpperCase() + '.';
	    var compare_str  = "";
	    var erg = 0;
	    var show_list = false;
	    
	    // fill the li-list
		
	    $('#search_list li').each(function() {
		
		compare_str = $(this).text();
		compare_str = compare_str.toUpperCase();
		erg = compare_str.search(search_str);
		    if (erg >=0) {  // (search_str == compare_str) {
		        $(this).show();
			show_list = true;
		    }
		    else {
		        $(this).hide();
		}
		
	    });
	    
	    if(show_list == true) {
		$('#search_list').show();
		
	    }
	    else {
		$('#search_list').hide();
	    }
	  
    });
	
	    
	$('#search_list li a').live("click",  function() {
	    var parent = $(this).parent();
	    $('#kust_keyvalue').val(parent.attr("name"));
	    if ( $(this).hasClass("active")) {
			
			$('#frmSuche').submit();
			return false;
	    }
	    
	    $('#search_list li a').removeClass("active");

// 2011-05-12-ch Begin of edit.

// Once you pick a list-item from the search results,
// fade out all other results and make that item .active
	    $('#search_list li').addClass('fade out').hide();
	    $(this).parent('#search_list li').removeClass('fade out');
	    $(this).parent('#search_list li').addClass('first-child last-child').show(function(){
// Also generate a link for toggling the rest of the search list back into view
	    	$('#search_list + p').prepend('<a id="toggle-search" href="#">Alle anzeigen</a>');
	    });
	    $(this).addClass("active");
	});

// 2011-05-12-ch
// The toggle link function 	
	$('#toggle-search').live("click", function() {
		$(this).remove();
		$('.active').parent('#search_list li').removeClass('first-child last-child');
		$('#search_list li.fade.out').removeClass('out').addClass('in').show();
		$('#kust_keyvalue').val(name_street_search_str);
	});
	
	
	$('ul [id*="custom_list_"]').live("click", function() {

	   
           var list_id = $(this).attr('id');
	   var item_form_val = form_val.find('[list_item_id|="' + list_id + '"]');
	   var form_id = item_form_val.find('FormId').text();
	   var form_content = item_form_val.find('content');
	   
	   
	 
		// fill fields only if no new entry  
	   
	   	    $('#' + form_id + ' input, select, textarea').each(function(){
			//compare input element Name
	
			var element_name = $(this).attr('name');
			var element_value = form_content.find(element_name).text();
			var element_type = $(this).attr('type');
			console.log ("formval " + $(form_content));

			switch (element_type) {
			    //text areas 
			    case "text":
				$(this).val(element_value);
				break;
			    
			    case "textarea":
				$(this).val(element_value);
				break;
			    
			    case "select-one":
				$(this).val(element_value);
				break;
				
				case "checkbox":
				$(this).removeAttr('checked');
				
				if (element_value != "") {
				$(this).attr('checked', 'checked');				}
			
				break;
 
			    case "radio":
				if ($(this).val() == element_value) {
				    $(this).attr('checked', true);
				}
				else $(this).removeAttr('checked');
				break;
 			}
			console.log("name " + element_name);
			console.log("type " + element_type);
			console.log("val " + element_value);	
			
		    });
	
	    var formval_id = item_form_val.find('FormvalId').text();
	    $('#' + form_id + ' input[name="formvalId"]').val(formval_id);
	    console.log("formid "+  formval_id);
	    // if exported, hide the submit button
	    item_form_val.find('status').each ( function() {
		var exported = $(this).find('exported').text();
		var submit_btn = $('#' + form_id + ' [type="submit"]');
		console.log ("expor " + exported);
		if (exported == true) {
		    submit_btn.removeClass('whiteButton');
		    submit_btn.hide();
		}
		else {
		    
		    submit_btn.addClass('whiteButton');
		    submit_btn.show();
		    
		}
	    });
	    
	    // reset red validate entriees
	    
	    $('#' + form_id).find('.validate').each (function() {
		console.log ('BKColor' + $(this).attr('name'));
		$(this).css("background-color","transparent");				     
	    });
	
	    
	    // set action menu

	    parent_list = item_form_val.find('list_id').text();
	    $('#' + parent_list + ' a').removeClass("active");
	    $('#' + list_id + ' a').addClass("active");
	    
	    return false;
    
	});
	
	$('#btn_map').click ( function() {
	    
	    var initialLocation;
	    var map;
	    var initLat;
	    var initLng;
	    var initStart;
	    
	    var imagePoint = 'appimg/point.png';
	    var imageMarker = 'appimg/nail.png';
	    var oldmarker;
			    
	    $('#map_entries li').remove();

	    function setMapPositions(queryStr) {
				
				console.log ("geo " + queryStr);

		$.ajax({
		    type: 'POST',
		    dataType: 'xml',
		    url: 'php/geo_search.php',
		    data: queryStr,
				
		    success: function(xml) {
			$(xml).find('geodata').each(function(){


			    var counter = 0;	
			    $(this).find('markers').each(function () {
				
			    initLat = $(this).attr('lat');
			    initLng = $(this).attr('lng');
			    
				
				initialLocation = new google.maps.LatLng(initLat, initLng);
				
				var address = jQuery.trim($(this).find('address').text());
				var uniqueName = address + initLat;
				var customId = $(this).find('customId').text();

				var marker = new google.maps.Marker({
				    position: initialLocation, 
				    map: map,
				    icon: imageMarker,
				    title : address
				});
				
				google.maps.event.addListener(marker, "click", function() {
				    oldmarker.setIcon(imageMarker);
				    oldmarker = marker;
				    var containFilter = jQuery.trim(marker.getTitle()) + marker.getPosition().lat();
				  
				    var listParent;
				    var listPosition;
				   // var offset;
				    var maxScroll;
				    var scrollPos;
				 
				    marker.setIcon(imagePoint);
				    map.panTo(marker.getPosition());
				    $('#map_entries li a').removeClass("active");
				    $('#map_entries li a[name="' + containFilter + '"]').addClass("active");
				    listParent = $('#map_entries li a[name="' + containFilter + '"]').parent();
				 
				    listPosition = listParent.index() * (listParent.height() + 20);
				    listPosition = listParent.index() * 39;

				    scrollPos = $('#map_entries_div').scrollTop();
				    maxScroll = $('#map_entries_div').height() -39;
				    if ( (listPosition > (scrollPos + maxScroll))) {
					$('#map_entries_div').animate({scrollTop : listPosition},500); // scrollTop(listPosition);
				    }
				    if (listPosition < scrollPos) {
					$('#map_entries_div').animate({scrollTop : listPosition},500); //.scrollTop(listPosition);
				    }
				});
				
				//$('#map_entries').append('<li id = "list_'+ uniqueName +'"><a name="' + uniqueName + '"href="#">' + $(this).find('address').text() + '</a></li>');
				$('#map_entries').append('<li id = "' + customId +'"><a name="' + uniqueName + '"href="#">' + $(this).find('address').text() + '</a></li>');
				$('#map_entries li a[name="' + uniqueName + '"]').bind ("click",  function () {
				    if ( $(this).hasClass("active")) {
					$('#kust_keyvalue').val(customId);
					 goTo ('#find');
				        $('#frmSuche').submit();
				    }
				    //trigger marker event
				    google.maps.event.trigger(marker, 'click');

					
 				});
	
				if (counter == 0) {
				    map.setCenter(initialLocation);
				    oldmarker = marker;
				    counter = 1;
				    $('#map_entries li a[name="' + uniqueName + '"]').click();
				}
			    });
			});
		    },
		
		    error: function (XMLHttpRequest, textStatus, errorThrown) {
		        alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		        $('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
		        $('#frmSuche_submit').attr('disabled', false);
		    }
		}); // end ajax
		
	    } // end function setMapPositions
	    
	    

				    

	    function initialize(centerType) {

		var myOptions = {
		    zoom: 15,
		    mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		var customerId;

		map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		
		customerId = getCustomerData('var_CustomId');
		if (centerType == "0") {
		    // set map Customer to map center
		    setMapPositions ('customId=' + customerId + '&lat=' +getCustomerData('var_geo_lat')+ '&lng=' + getCustomerData('var_geo_lng'));
		}
		
	/*	if (centerType == "1") {
		    
		    // try to find gps - position, set positon at WC3 method
		    
		    if(navigator.geolocation) {
			console.log ("navigator start" );
			browserSupportFlag = true;
			navigator.geolocation.getCurrentPosition(geosuccess, geoerror, {timeout:5000});
								 
								 
			function geosuccess (position) {
			    initLat = position.coords.latitude;
			    initLng = position.coords.longitude;
			    setMapPositions ('customId=' + customerId + '&lat=' + initLat + '&lng=' + initLng);
			}
		    
			function geoerror (msg) {
			    // no positions found, set positon to customer

			    console.log(typeof msg == 'string' ? msg : "error");
			    console.log ("msg" + msg.message );
			    console.log ("msgcode" + msg.code );
			    console.log ("navigator error" );
			    alert ("Der Standort konnte nicht bestimmt werden, die Karte wird auf den Standort des Kunden positioniert");
			    initialize ("0");
			}
		    }
		}
		*/
	    }
    
	    
	    
	    //initialize($('input[name=select_map]:checked').val());
	    // solange bis gps funktioniert
	    initialize("0");
	    $('#map_entries_div').show();
	    return false;
	});
	

	

/** =The end of all things $(document).ready
-------------------------------------------------------------- */
});

function portraitMode() {
	console.log ("change to portraitMode");
	// over-all class .portrait
	$('#i4p').removeClass('landscape').addClass('portrait');
	
	// stay on top
	window.scrollTo(0,0);

	// import link behavior
	// portraitMenuClickEvents();
	// portraitBackClickEvents();
	
	//unbind
	//neu micha - forms
	 $('#customer ul li a').die('click');
	// $('.landscape .primary ul li a').unbind('click', landscapeMenuClickEvents);
	$('#hgroup .back').unbind('click');
	

	
	// bind
	
	//$('#customer ul li a').bind('click', portraitMenuClickEvents);
	//neu micha - forms
	$('#customer ul li a').live('click', portraitMenuClickEvents);
	// $('.portrait .primary ul li a').bind('click', portraitMenuClickEvents);
	$('#hgroup .back').bind('click', portraitBackClickEvents);
	
	// --2011-02-17-caspar--
	// .userimg ausfaden
	$('.userimg').hide();
	
	// set map divs
	$('#map_canvas').height(680);
	$('#map_entries_div').height(680);
	    var doc_h = $(window).height();
    var doc_w = $(window).width();
    $('#overlaydocs').height(doc_h).width(doc_w);
		//unset customer-key-data_left
	$('.userimg_divleft').hide();
	console.log("csut len " + $('.userimg_divleft').width());
	

}


/** =Landscape mode
-------------------------------------------------------------- 
 
	Sets the default behaviors for landscape orientation.

*/
function landscapeMode() {
	console.log ("change to landscapeMode");
	// over-all class .landscape
	$('#i4p').removeClass('portrait').addClass('landscape');
	
	// stay on top
	window.scrollTo(0,0);
	//ab hier test
	$('.primary').removeClass('current');
	
	// if no current page is set, make first page current
	if( !$('.primary ul li a').hasClass('active') ) {
	
		$('.primary ul li a:first').addClass('active');
		$('.secondary:first').addClass('current');
	
	} else {
	
	// if we had a current page in portrait, make it current here, too
		
		var currentPage = $('.primary ul li a.active').attr('href');
		$(currentPage).addClass('current');
		
	}
	
	$('.secondary').removeClass('slideleft in');
	$('.primary').removeClass('slideright in');
	
	
	// unbind
	//neu micha - forms
	// $('#customer ul li a').unbind('click');
	$('#customer ul li a').die('click');
	 $('#hgroup .back').unbind('click');

	//bind
	
	//$('#customer ul li a').bind('click', landscapeMenuClickEvents);
	//neu micha - forms
	$('#customer ul li a').live('click', landscapeMenuClickEvents);
	$('#hgroup .back').bind('click', general_link);
	
	// show/hide images if loaded
	if(hasKustImg==true) {
		$('.userimg').show();
	} else {
		$('.userimg').hide();
	}
	
	// set map divs
	$('#map_canvas').height(420);
	$('#map_entries_div').height(420);
	
	    var doc_h = $(window).height();
    var doc_w = $(window).width();
    $('#overlaydocs').height(doc_h).width(doc_w);
		$('.userimg_divleft').show();
    	
}


/** =Orientation
-------------------------------------------------------------- */

function updateOrientation() {
    
    switch(window.orientation) {
        
        case 0: // Portrait
			        
			portraitMode();
	
        break;
        
        case 180: // Portrait (upside-down portrait)
            
			portraitMode();
            
        break;
        
        case -90: // Landscape (right, screen turned clockwise)
            
			landscapeMode();
             
        break;
        
        case 90: // Landscape (left, screen turned counterclockwise)
            
			landscapeMode();
            
        break;
        
    }

    

}

