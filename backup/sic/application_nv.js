
    function dataload (target, params) {

		varUrl = 'php/frontend.php';
		var data_string = "";
		datastring =  params + "&filter=" + target;
		console.log(datastring);
		$('.overlay_wait').show();
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
						loginStatus = 1;
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

						//    //workaround for iphone / ipad version
						//	if ($('#mainmenu').length > 0) {
						//		switchMenu('#mainapp', "l");
						//	}
						//	else {
						//		switchMenu('#find', "l");
						//	}
							$("#sidebar").show();
							switchWindow("#windowsuche");
						}

                    break;
					case "#searchcustom":
						if ($(xml).find("appdatas").length > 0){
							
							$(xml).find("appdatas datas").each( function () {
								var appName = "var_" + $(this).attr("name");
								var appDatas = $(this).text();
								console.log(appName);
								console.log(appDatas);
								$('span[name="' + appName + '"]').html(appDatas); 
								
							})
														switchWindow ("#windowkundenuebersicht");
							setTimeout(function () {	
							kundenuebersichtScroller.refresh();
								}, 1000);
							switchWindow ("#windowkundenuebersicht");
							switchMenu ("#mainmenu", "l");
						 
						}
					break;				
				
                }
		    $('.overlay_wait').hide();
            },
                    
            error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log (" error " + textStatus);
			console.log (XMLHttpRequest);
			$('#overlay_wait').hide();
			} 
        }); // end ajax
    }



	function switchMenu (target, direction){
		var currentMenu = $(".menu.current");
		var targetMenu = $(target);
		switch (direction) {
			case "l":
				$(targetMenu).addClass("current"); 
				$(targetMenu).addClass("leftoutright")
				
				setTimeout(function(){
			 
					$(currentMenu).addClass("slideleftout");
					$(currentMenu).addClass("leftoutleft");
			  
					$(targetMenu).addClass("slideleftin");
					$(targetMenu).addClass("leftnull");
			 
					setTimeout(function(){
				
						$(currentMenu).removeClass("slideleftout");
						$(currentMenu).removeClass("leftoutleft");
						$(currentMenu).removeClass("current");
						$(currentMenu).addClass("transparent");
			 
						$(targetMenu).removeClass("slideleftin");
						$(targetMenu).removeClass("leftnull");
						$(targetMenu).removeClass("leftoutright");
						$(targetMenu).removeClass("transparent"); 
					},500); 
				},0);			

				break;
			case "r":
				$(targetMenu).addClass("current"); 
				$(targetMenu).addClass("leftoutleft"); 
				$(targetMenu).addClass("width300"); 
				
				setTimeout(function(){
					$(currentMenu).addClass("slideleftin");
					$(currentMenu).addClass("leftoutright");
			 
					$(targetMenu).addClass("slideleftout");
					$(targetMenu).addClass("leftnull");
	
			//   
					setTimeout(function(){
						
						$(currentMenu).addClass("transparent");
						$(currentMenu).removeClass("current");
						$(targetMenu).removeClass("transparent");
						$(currentMenu).removeClass("slideleftin");
						$(currentMenu).removeClass("leftoutright");
						$(targetMenu).removeClass("slideleftout");
						$(targetMenu).removeClass("leftnull");
	 
						$(targetMenu).removeClass("leftoutleft"); 
						$(targetMenu).removeClass("width300");
						$(targetMenu).addClass("current");
				
					},500); 
				
				},0);			
			break;
		}
	}


	function switchWindow (target){
		console.log(target);
	
	
		$(".window").removeClass("current");
		$('.window').addClass("transparent");
		$(target).addClass("current");
		$(target).removeClass("transparent"); 
	}


	function switchPage (target){
		console.log(target);
	
	
		$(".page").removeClass("current");
		$('.page').addClass("transparent");
		$(target).addClass("current");
		$(target).removeClass("transparent"); 
	}
	
	function setOrientation() {
	
		switch(window.orientation) {
			case 0: // Portrait
				setPortrait();
			break;
			case 180: // Portrait (upside-down portrait)
				setPortrait();
			break;
			case -90: // Landscape (right, screen turned clockwise)
				setLandscape();
			break;
			case 90: // Landscape (left, screen turned counterclockwise)
				setLandscape();
			break;
		}
	}
	
	function setPortrait() {
		$("#sidebar").addClass("portrait");
		$("#content").addClass("portrait");
		$(".landscapeheader").hide();
		$(".portaitheader").fadeIn();
		
	
	}
	
	function setLandscape() {
		$(".landscapeheader").show();
		$(".portaitheader").hide();
		$("#sidebar").removeClass("portrait");
		$("#sidebar").removeClass("portraitslideleft");
		$("#content").removeClass("portrait");
			
	}


$(document).ready(function() {
 

	window.addEventListener("orientationchange", function() {
		setOrientation();
	}, false);    
	
	setOrientation();
	// Login hide sidebar
	$("#sidebar").hide();
	


$.mask.definitions['1']='[01]';
$.mask.definitions['2']='[0-2]';
$.mask.definitions['3']='[0-3]';
$.mask.definitions['4']='[0-4]';
$.mask.definitions['5']='[0-5]';
$.mask.definitions['A']='[ A-Z]';
$.mask.definitions['m']='[0-12]';


	//Search Window
	$('#btnSearchCustomer').click (function() {
		dataString = "search=" + $('#txtsearchCustomer').val();
		console.log(dataString);
		dataload("#searchcustom", dataString);	

    });
	

    $('#btnLogin').click (function() {
		

	
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
		switchMenu($(this).attr("href"), "r");
		return false;		
		

		
    });
	$('a[class="portaitheader"]').click (function() {
		console.log($(".menu.current"));
		$("#sidebar").addClass("portraitslideleft");
		$(".landscapeheader").show();
		$(".portaitheader").hide();		
		return false;		
    });
	
	
	
	$('#content').click (function() {
		if ($(this).hasClass("portrait")) {
			if ($("#sidebar").hasClass("portrait")) {
				$("#sidebar").removeClass("portraitslideleft");
				$(".landscapeheader").hide();
				$(".portaitheader").fadeIn();
			}
		}
		return false;		
    });	
	
	
	//sidebar clicks
	
	$('#sidebar li a').bind("click", function() {
		
		
		$('#sidebar li a,current').removeClass("current");
		var target = $(this).attr("href");
		

		$(this).addClass("current");
		if ($(this).hasClass("submenu")) {
			switchMenu(target, "l");
		}
		else {
			switchWindow (target);
		}
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






});	
	
