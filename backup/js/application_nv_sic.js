

var formXml;
var appXml;
var statusXml;


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
							console.log(xml);
							
							$(xml).find("appdatas datas").each( function () {
								var appName = "var_" + $(this).attr("name");
								var appDatas = $(this).text();
								$('span[name="' + appName + '"]').html(appDatas); 
								
							})
							
							switchWindow ("#windowkundenuebersicht");
							setTimeout(function () {	
								scrollwindowkundenuebersicht.refresh();
								scrollwindowtopztg.refresh();
								scrollwindowtopztschr.refresh();
								scrollwindowsortztg.refresh();
								scrollwindowsortztschr.refresh();
								scrollwindowfruehremi.refresh();
														
							switchMenu ("#mainmenu", "l");

								}, 0);

						 
						}
						
						formXml = $(xml).find("forms");
						appXml = $(xml).find("appdatas");
						statusXml = $(xml).find("status");
						
						console.log(statusXml);
						
						$("#formsul").remove("li");
						$(formXml).find("formdatas").each( function () {
							var formId = $(this).attr("formid");
							var formName = $(this).find("name").text();
							$("#formsul").append('<li><a id="' + formId + '" href="#windowsforms">' + formName + '</a></li>');
						
						});
						
					break;
					case "#map":
						var myOptions = {
							zoom: 15,
							mapTypeId: google.maps.MapTypeId.ROADMAP
						};
						var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
						var imagePoint = 'img/point.png';
						var imageMarker = 'img/nail.png';
					
						//$(xml).find('geodata').each(function(){
							console.log(xml);
							var oldmarker;
															var counter = 0;
							$(xml).find('geodata markers').each(function () {
	
								console.log(this);
								var initLat = $(this).attr('lat');
								var initLng = $(this).attr('lng');
								var initialLocation = new google.maps.LatLng(initLat, initLng);
								
								var address = jQuery.trim($(this).find('address').text());
								var customId = $(this).find('customId').text();
				
								var marker = new google.maps.Marker({
									position: initialLocation, 
									map: map,
									icon: imageMarker,
									title : address,
									id :customId
								});
								
								google.maps.event.addListener(marker, "click", function() {
									oldmarker.setIcon(imageMarker);
									oldmarker = marker;
									var id = marker.id;
								 
									marker.setIcon(imagePoint);
									map.panTo(marker.getPosition());
									
									var currentMenu = $("#umfeldul li a.current");
									
									if ($(currentMenu).attr("id") != id) {
										//marker wurde im Google div gesetzt; Menü neu positionieren
										var nextMenu  = $('#umfeldul li a[id="' + id + '"]');
										var lstIndex = nextMenu.parent().index();
										scrollumfeldanalysemenu.scrollToElement('li:nth-child(' + lstIndex +')', 200)
										$(currentMenu).removeClass("current");
										$(nextMenu).addClass("current");
									}
									
								});
								$("#umfeldul").append('<li><a id="' + customId + '" href="#windowumfeldanalyse">' + $(this).find('address').text() + '</a></li>');
								$('#umfeldul li a[id="' + customId + '"]').bind ("click",  function () {
									$("#umfeldul li a.current").removeClass("current");
									$(this).addClass("current");
									google.maps.event.trigger(marker, 'click');
									return false;
								});
								
								if (counter == 0) {
									map.setCenter(initialLocation);
									oldmarker = marker;
									counter = 1;
									$('#umfeldul li a[id="' + customId + '"]').click();
								}

							});
						//});
		
						setTimeout(function () {
							scrollumfeldanalysemenu.refresh();
							switchMenu("#umfeldanalysemenu", "l");
						}, 0);
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


	
	function getCustomerData (identifier) {
		
		var founded = false;
		var returnValue = "";
			
			var subSet = $(appXml).find('datas[name="' + identifier + '"]');
			
			if ($(subSet).length != 0) {
				founded = true;
				returnValue = $(subSet).text();
				console.log(returnValue);
			}
			
			
			$(appXml).find('status').each(function(){
				$(this).find(identifier).each (function(){
				returnValue = $(this).text();
				founded = true;
			});   
		});
					   
		return returnValue;
		
	}

	function switchMenu (target, direction){
		var currentMenu = $(".menu.current");
		var targetMenu = $(target);
		console.log(target);
		console.log(targetMenu);
		$(".sidebarsection").css("position","absolute");
		switch (direction) {
			case "l":

			setTimeout(function(){
				$(targetMenu).addClass("rightin")
				$(currentMenu).addClass("leftout");
				$(targetMenu).addClass("current");
				
				setTimeout(function(){
					//
					//$(currentMenu).addClass("slideleftout");
					//$(currentMenu).addClass("leftoutleft");
					$(targetMenu).removeClass("rightin");
					$(targetMenu).addClass("sliding");
					$(targetMenu).addClass("slideend");
					$(currentMenu).addClass("sliding");
					$(currentMenu).addClass("slideend");
					
					setTimeout(function(){
					
						$(currentMenu).removeClass("leftout");
						$(currentMenu).removeClass("sliding");
						$(currentMenu).removeClass("slideend");
						$(currentMenu).removeClass("current");
						$(currentMenu).addClass("transparent");
					
						
						$(targetMenu).removeClass("sliding");
						$(targetMenu).removeClass("slideend");
						$(targetMenu).removeClass("transparent");
						$(".sidebarsection").css("position","fixed");
					},500); 
				},0);			
			},0);				


				
				
			//setTimeout(function(){
			//	$(targetMenu).addClass("current"); 
			//	$(targetMenu).addClass("leftoutright")
			//	
			//	setTimeout(function(){
			//	
			//		$(currentMenu).addClass("slideleftout");
			//		$(currentMenu).addClass("leftoutleft");
			//		
			//		$(targetMenu).addClass("slideleftin");
			//		$(targetMenu).addClass("leftnull");
			//		
			//		setTimeout(function(){
			//		
			//			$(currentMenu).removeClass("slideleftout");
			//			$(currentMenu).removeClass("leftoutleft");
			//			$(currentMenu).removeClass("current");
			//			$(currentMenu).addClass("transparent");
			//		
			//			$(targetMenu).removeClass("slideleftin");
			//			$(targetMenu).removeClass("leftnull");
			//			$(targetMenu).removeClass("leftoutright");
			//			$(targetMenu).removeClass("transparent");
			//			$(".sidebarsection").css("position","fixed");
			//		},500); 
			//	},0);			
			//},0);	
				break;
			case "r":
				



				
			setTimeout(function(){
				
				$(targetMenu).addClass("current"); 
				$(targetMenu).addClass("leftin");
				//$(currentMenu).addClass("rightout");
				
				
				
				//$(currentMenu).addClass("transparent");
				//$(currentMenu).removeClass("current");	
					
				setTimeout(function(){
					$(targetMenu).removeClass("leftin")			
					$(targetMenu).addClass("sliding");
					$(targetMenu).addClass("slideend");
					$(currentMenu).addClass("sliding");
					$(currentMenu).addClass("rightout");
	
			//   
					setTimeout(function(){

		
						$(currentMenu).removeClass("rightout");
						$(currentMenu).removeClass("sliding");
						$(currentMenu).removeClass("slideend");
						$(currentMenu).removeClass("current");
						$(currentMenu).addClass("transparent");
					
						$(targetMenu).removeClass("leftin");						
						$(targetMenu).removeClass("sliding");
						$(targetMenu).removeClass("slideend");
						$(targetMenu).removeClass("transparent");						
						
						$(".sidebarsection").css("position","fixed");
				
					},500); 
				
				},0);
			},0);				
				
			//	$(targetMenu).addClass("current"); 
			//	$(targetMenu).addClass("leftoutleft"); 
			//	$(targetMenu).addClass("width300"); 
			//setTimeout(function(){	
			//	setTimeout(function(){
			//		$(currentMenu).addClass("slideleftin");
			//		$(currentMenu).addClass("leftoutright");
			// 
			//		$(targetMenu).addClass("slideleftout");
			//		$(targetMenu).addClass("leftnull");
			//
			////   
			//		setTimeout(function(){
			//			
			//			$(currentMenu).addClass("transparent");
			//			$(currentMenu).removeClass("current");
			//			$(targetMenu).removeClass("transparent");
			//			$(currentMenu).removeClass("slideleftin");
			//			$(currentMenu).removeClass("leftoutright");
			//			$(targetMenu).removeClass("slideleftout");
			//			$(targetMenu).removeClass("leftnull");
			//
			//			$(targetMenu).removeClass("leftoutleft"); 
			//			$(targetMenu).removeClass("width300");
			//			$(targetMenu).addClass("current");
			//			$(".sidebarsection").css("position","fixed");
			//	
			//		},500); 
			//	
			//	},0);
			//},0);	
			break;
		}
	}


	function switchWindow (target){
		console.log(target);


			if ($("#sidebar").hasClass("portrait")) {
				$("#sidebar").removeClass("portraitslideleft");
				$(".landscapeheader").hide();
				$(".portaitheader").css("display", "block");
				//$(".windowsection").css("clip", "auto");
				$(".windowsection").css("clip", "rect(0px, " + $( window ).width() +"px, " + $( window ).height() +"px, 0px)");
			}
	
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
		default:
			setLandscape();
		

		}
		
		var mapWindow = $("#scrollwindowumfeldanalyse").height();

		var btnMapHeigth = $("#btnMap").height();
		$("#scrollwindowumfeldanalyse .container").height(mapWindow -20);
		$("#map_canvas").height(mapWindow - 60 - btnMapHeigth);
		console.log($("#scrollwindowumfeldanalyse .container").height());
		 

	}
	
	function setPortrait() {
		$("#sidebar").addClass("portrait");
		$("#content").addClass("portrait");
		$(".landscapeheader").hide();
		$(".portaitheader").css("display", "block");
		
		//$("#content header").css("left", "0");
	   $("#content .windowsection").css("left", "0");
	   var windowWith = $( window ).width();
	   $("#content header").width(windowWith-300);
	   $("#content .windowsection").width(windowWith);
	   $(".windowsection").css("clip", "rect(0px, " + $( window ).width() +"px, " + $( window ).height() +"px, 0px)");

	   
	   
	}
	
	function setLandscape() {
		$(".landscapeheader").show();
		$(".portaitheader").hide();
		$("#sidebar").removeClass("portrait");
		$("#sidebar").removeClass("portraitslideleft");
		$("#content").removeClass("portrait");
		

	   $("#content .windowsection").css("left", "300px");
		var windowWith = $( window ).width();
	   $("#content header").width(windowWith-300);
	   $("#content .windowsection").width(windowWith-300);

		 
		$(".windowsection").css("clip", "auto");
	}


$(document).ready(function() {
 

	window.addEventListener("orientationchange", function() {
		setOrientation();
	}, false);    
	
	setOrientation();

	$("#setpr").click (function() {
		setPortrait();
		
   });
	
		$("#setls").click (function() {
			alert("landscape")
		setLandscape();
		
   });

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
	
	//formmenu 
	
	$("#formsul li a").live("click",  function() {
		var formId = $(this).attr("id");
		var currentForm = $(formXml).find('formdatas[formid="' + formId + '"]');
		console.log(currentForm);
		$("#formscontainer").html($(currentForm).find("content").text());
		
									setTimeout(function () {	
							scrollwindowforms.refresh();
								}, 1000);
		
	
	
	 });
	
	//backbutton
	$('a[class~="back"]').click (function() {
		console.log(this);
		switchMenu($(this).attr("href"), "r");
		return false;		
		

		
    });
	
	
	$('a[class="portaitheader"]').click (function() {
		console.log($(".menu.current"));
		//$("#sidebar").addClass("portraitslideleft");
		$(".landscapeheader").show();
		$(".portaitheader").hide();
		$(".windowsection").css("clip", "rect(0px, " + $( window ).width() +"px, " + $( window ).height() +"px, 300px)");
		//$(".menu.current").css("z-index", "100");
		return false;		
    });
	
	
	
//	$('#content').click (function() {
//		if ($(this).hasClass("portrait")) {
//			if ($("#sidebar").hasClass("portrait")) {
//				$("#sidebar").removeClass("portraitslideleft");
//				$(".landscapeheader").hide();
//				$(".portaitheader").fadeIn();
//				//$(".windowsection").css("clip", "auto");
//				$(".windowsection").css("clip", "rect(0px, " + $( window ).width() +"px, " + $( window ).height() +"px, 0px)");
//			}
//		}
//		//return false;		
//    });	
	
	
	//sidebar clicks
	
	$('#sidebar li a').live("click", function() {
		console.log("sidebar");
		
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


// ###### Menu Umfeldanalyse

$('#btnMap').click ( function() {
	    console.log("btnMap Click");
	//    var initialLocation;
	//    var map;
	//    var initLat;
	//    var initLng;
	//    var initStart;
	//    
	//    var imagePoint = 'img/point.png';
	//    var imageMarker = 'img/nail.png';
	//    var oldmarker;
	//		    
	//   	$("#umfeldul").remove("li");
	//
	//    function setMapPositions(queryStr) {
	//		customerId = getCustomerData('kdnr');
	//		queryStr = 'customId=' + customerId + '&lat=' +getCustomerData('geo_lat')+ '&lng=' + getCustomerData('geo_lng');
	//		$.ajax({
	//			type: 'POST',
	//			dataType: 'xml',
	//			url: 'php/geo_search.php',
	//			data: queryStr,
	//				
	//			success: function(xml) {
	//						var myOptions = {
	//	    zoom: 15,
	//	    mapTypeId: google.maps.MapTypeId.ROADMAP
	//	};
	//				var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);	
	//				
	//				$(xml).find('geodata').each(function(){
	//					var counter = 0;	
	//					$(this).find('markers').each(function () {
	//						initLat = $(this).attr('lat');
	//						initLng = $(this).attr('lng');
	//						initialLocation = new google.maps.LatLng(initLat, initLng);
	//						
	//						var address = jQuery.trim($(this).find('address').text());
	//						var customId = $(this).find('customId').text();
	//		
	//						var marker = new google.maps.Marker({
	//							position: initialLocation, 
	//							map: map,
	//							icon: imageMarker,
	//							title : address,
	//							id :customId
	//						});
	//						
	//						google.maps.event.addListener(marker, "click", function() {
	//							oldmarker.setIcon(imageMarker);
	//							oldmarker = marker;
	//							var id = marker.id;
	//						 
	//							marker.setIcon(imagePoint);
	//							map.panTo(marker.getPosition());
	//							
	//							var currentMenu = $("#umfeldul li a.current");
	//							
	//							if ($(currentMenu).attr("id") != id) {
	//								//marker wurde im Google div gesetzt; Menü neu positionieren
	//								var nextMenu  = $('#umfeldul li a[id="' + id + '"]');
	//								var lstIndex = nextMenu.parent().index();
	//								scrollumfeldanalysemenu.scrollToElement('li:nth-child(' + lstIndex +')', 200)
	//								$(currentMenu).removeClass("current");
	//								$(nextMenu).addClass("current");
	//							}
	//							
	//						});
	//						$("#umfeldul").append('<li><a id="' + customId + '" href="#windowumfeldanalyse">' + $(this).find('address').text() + '</a></li>');
	//						$('#umfeldul li a[id="' + customId + '"]').bind ("click",  function () {
	//							$("#umfeldul li a.current").removeClass("current");
	//							$(this).addClass("current");
	//							google.maps.event.trigger(marker, 'click');
	//							return false;
	//						});
	//						
	//						if (counter == 0) {
	//							map.setCenter(initialLocation);
	//							oldmarker = marker;
	//							counter = 1;
	//							$('#umfeldul li a[id="' + customId + '"]').click();
	//						}
	//					});
	//				});
	//
	//				setTimeout(function () {
	//					scrollumfeldanalysemenu.refresh();
	//					switchMenu("#umfeldanalysemenu", "l");
	//				}, 0);
	//				
	//			},
	//		
	//			error: function (XMLHttpRequest, textStatus, errorThrown) {
	//				alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
	//				$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
	//				$('#frmSuche_submit').attr('disabled', false);
	//			}
	//		}); // end ajax
	//	
	//	
	//	
	//    } // end function setMapPositions
	//    
	//    
	//
	//			    
	//
	//    function initialize(centerType) {
	//
	//	//var myOptions = {
	//	//    zoom: 15,
	//	//    mapTypeId: google.maps.MapTypeId.ROADMAP
	//	//};
	//	//var customerId;
	//	//
	//	//map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	//	//
	//	customerId = getCustomerData('kdnr');
	//	if (centerType == "0") {
	//	    // set map Customer to map center
	//	    setMapPositions ('customId=' + customerId + '&lat=' +getCustomerData('geo_lat')+ '&lng=' + getCustomerData('geo_lng'));
	//	}
	//	
	//
	//    }
	//   
	//    
	//    
	//    //initialize($('input[name=select_map]:checked').val());
	//    // solange bis gps funktioniert
	//	setMapPositions ();
	//    initialize("0");
	//    //$('#map_entries_div').show();
	
	dataload ("#map",'customId=' + getCustomerData('kdnr') + '&lat=' +getCustomerData('geo_lat')+ '&lng=' + getCustomerData('geo_lng'));
	    return false;
	});


	

});	
	
