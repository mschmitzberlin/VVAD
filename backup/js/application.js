// global variables


var hasKustImg = '';		// global image control
var form_val;			// global custom-forms control
var form_val_blanks;		// global blank container for new custom_form values
var name_street_search_str;	// name / street search string
var customer_data;		// xml Conatiner for all datas

// Helfer-Funktion für die Navigation?

    function dataload (target, params) {

		varUrl = 'php/frontend.php';
		var data_string = "";
		datastring =  params + "&filter=" + target;
		console.log(datastring);
    	$.ajax({
            
            type: 'POST',
            dataType: 'xml',
            url: varUrl,
            data: datastring,
          
            
            success: function(xml) {
				console.log(xml);
				$("#progress").text("");
                switch (target) {
					
					case "#login":
						
						var loginStatus = $(xml).find('status logged_in').text();
							if (loginStatus == 0) {
							// login failed
							alert ($(xml).find('status msg').text());
						}
						
						else {
							var currentUserName = $(xml).find("status username").text();	
							$("#username").text(currentUserName);
			
						//bearbeiten
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
								switchWindow('#mainapp', "l");
							}
							else {
								switchWindow('#find', "l");
							}
						}
                    break;
				
                }

            },
                    
            error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log (" error " + textStatus);
			console.log (XMLHttpRequest);
			} 
        }); // end ajax
    }



function switchWindow (target, direction){
	console.log(target);
	
	
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
	
	switch (direction) {
		case "l":
			$(target).addClass("slideleft");
			break;
		case "r":
			console.log("r");
			
			$(target).addClass("slideright");
			break;
	}
	//$(target).addClass("slideleft");
	
	
	
//    $('.window').addClass("transparent");
//	    $('.window').addClass("slideleft");
//	$(pageID).removeClass("transparent"); 
//	$(pageID).removeClass("slideright");
//	$(pageID).removeClass("slideleft");
	
	
	
	setTimeout(function(){
            $(target).addClass("current");
            $('.window').addClass("transparent");
	  
            $(target).removeClass("transparent"); 
            $(target).removeClass("slideright");
            $(target).removeClass("slideleft");
            
            
    },200); 
        
	
	
//	setTimeout(function(){
//		console.log(pageID);
//		//	$(pageID).css("margin-left", "0%");
//		$(pageID).addClass("current")},0); 
}

$(document).ready(function() {
 

    
		       		
   
    //TEST!!!!!!!
   // setCurrentOrientationMode();
	
 

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

    $('#loginform').submit (function() {
		
	var login_status = 0;
	
	var userName = $('#username').val();
	var password = $('#password').val();
	var pwmd5 = hex_md5(userName + password);
	var data_string = 'username=' + $('#username').val() + '&password=' + $('#password').val() + '&logged_in=0';
	var data_string = "username=" + userName + "&password=" + pwmd5 + "&logged_in=0";
	console.log(data_string);
	dataload("#login", data_string);
	
	return false;
    }); // end loginform
	
	
	//backbutton
	$('a[class="back"]').click (function() {
		console.log(this);
		switchWindow($(this).attr("href"), "r");
		return false;		
		

		
    });		
		

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
});	
	
