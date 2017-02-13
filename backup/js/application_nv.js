

var formXml;
var formvalXml;
var appXml;
var statusXml;
var phSession = "";


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
				console.log(target);
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
						
							formXml = $(xml).find("forms");
							appXml = $(xml).find("appdatas");
							statusXml = $(xml).find("status");
							$("#suchecont").hide();
							
						if ($(appXml).length > 0){
							console.log(xml);
							
							$(appXml).find("datas").each( function () {
								var appName = "var_" + $(this).attr("name");
								var appDatas = $(this).text();
								$('span[name="' + appName + '"]').html(appDatas); 
								
							})
							//hide Absatz, Umsatz
							$("#toggle2").prop("checked", false);
							showHideRows (false, $("#toggle2").val(),"var_topseller_ztg");
							
							$("#toggle1").prop("checked", false);
							showHideRows (false, $("#toggle1").val(),"var_topseller_ztschr");
							
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
							

							
							console.log(statusXml);
							
							$("#formsul li").remove();
							$(formXml).find("formdatas").each( function () {
								var formId = $(this).attr("formid");
								var formName = $(this).find("name").text();
								$("#formsul").append('<li><a id="' + formId + '" href="#windowsforms">' + formName + '</a></li>');
							
							});
							
							loadPressehandel("", "");
							
							

						}
						$("#searchul li").remove();
						var searchXml = $(xml).find("searches");
						
						if ($(searchXml).length > 0){
							$(searchXml).find("search").each( function () {
								var customId = $(this).attr("customid");
								var result = $(this).attr("result");
								$("#searchul").append('<li><a id="' + customId + '" href="#">' + result + '</a></li>');
							})
							
							setTimeout(function () {	
								scrollwindowsuche.refresh();
							}, 0);
							$("#suchecont").show();
						}
						//keine Daten, kein Suchergebnis
						
						if ((appXml.length == 0) && (searchXml.length ==0)) {
							alert ("Zum Suchbegriff konnten keine Einträge gefunden werden");
						}
						
	
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
					
					case "#formsval":
						$("#formsvalul li").remove();
						// neuer Eintrag
						$("#formsvalul").append('<li><a id="NEW" href="#">Neuer Eintrag</a></li>');

						$('#formscontainer form input[name="customid"]').val(getCustomerData("kdnr"));
						$('#formscontainer form input[name="formvalid"]').val("NEW");


						$(xml).find("formvaldatas").each( function () {
							var formValId = $(this).attr("formvalid");
							var customId = $(this).attr("customid");
							var storeDate  = $(this).attr("storedate");
							$("#formsvalul").append('<li><a id="' + formValId + '" href="#">' + customId + " " + storeDate + '</a></li>');
						
						});

						formvalXml = $(xml).find("formvals");
						
						var lastId = $(formvalXml).attr("lastid");
						
						if (lastId == "0") {
							// Menu erstmalig geladen
							lastId = "NEW";
							scrollwindowforms.refresh();
							switchWindow("#windowsforms");
							switchMenu("#formvalsmenu", "l");
						}
					
					$('#formsvalul li a[id="' + lastId + '"]').click();

							
						setTimeout(function () {	
							scrollformvalsmenu.refresh();
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
	
	
	function datastore (target, params) {
		
		$('.overlay_wait').show();

		//build data string
		var datastring = "";
		var redirect = "";
		varUrl = 'php/frontend.php';
		switch (target) {
			case "#btnSend":
				var datastring = params;
				datastring =  encodeURIComponent(datastring);
				datastring = "filter=#btnSend&" + params;
			break;
			
			case "#check":
				datastring = "filter=#check&" + params;
				
			break;
		
		}
		console.log(datastring);
		$.ajax({
			type: 'POST',
			url: varUrl,
			data: datastring,
			
			success: function(xml) {
				console.log (xml);
				switch (target) {
					case "#btnSend":
						var check =  $(xml).find("check");
						console.log(check);
						var status = $(xml).find("check").attr("status");
						if (status == "1") {
							alert ("Daten wurden gespeichert");
							var paramStr = "formid=" + $(check).attr("formid") + "&customid=" + getCustomerData("kdnr") + "&userid=" + getCustomerData("userid");
							paramStr = paramStr + "&lastid=" + $(check).attr("formvalid");
							dataload("#formsval", paramStr);
						}
						else {
							alert ($(xml).find("check").attr("msg"))
						}
						

					break;
		
				}
				//
				//$(window).scrollTop(0);
				//form_load (1);
				//if (html != "") {
				//	alert(html);
				//  
				//}  
				//else {
				//	alert ("Daten wurden gespeichert");
				//}

				$('.overlay_wait').hide();
			},
				
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				$('.overlay_wait').hide();
				console.log(XMLHttpRequest.responseText);
				alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
				$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
			} 
		}); // end ajax

		
	}
	

	
	function loadPressehandel(query, params) {
		
		varUrl = 'php/pressehandel.php' + query;
    	$.ajax({
			type: 'POST',
            dataType: 'text',
            url: varUrl,
            data: params,
          
            
            success: function(text) {
			//
				
				var lowerText = text.toLowerCase();
					var appletStart = lowerText.indexOf("<applet");

				if (appletStart != -1) {
					var appletEnd = lowerText.indexOf("</applet>") +9;
					var textLen = text.length -1;
					text = text.substr(0, appletStart) + text.substr(appletEnd, textLen);
				}
				
				
				//var scriptStart = lowerText.indexOf("<script");
				//var scriptText = "";
				//
				//if (scriptStart != -1) {
				//	var scriptEnd = lowerText.indexOf("</script>") +9;
				//	var textLen = text.length -1;
				//	scriptText = text.substring(scriptStart, scriptEnd);
				//	//console.log(scriptText);
				//}

				
				//	console.log(text);
				var content = $.parseHTML(text);
				$(content).each (function () {
					var html = $(this).html();
					if (html != undefined) {
						$("#nlfcont").html(html);
						
					}
					
				});
				
//				       var scriptTag = document.createElement( 'script' );
//        scriptTag.type = 'text/javascript';
//        scriptTag.text = scriptText;
//		console.log(scriptTag);
//        $("#nlfcont").append( scriptTag );
				
				
				// remove img
				var origBtn = new Array ("gast", "anmelde", "such_", "warenkorb", "desuch_", "standsu_", "titzur", "newzur", "weiter", "loeschtab", "titelsuche", "zurueck");
				var swapBtn = new Array ("Gast", "Anmelden", "Suchen", "In den Warenkorb", "Detailsuche", "Standardsuche", "Zurück", "Zurück", "Weiter", "Löschen", "Weitere Titel suchen", "Zurück");				
				
				$("#nlfcont img").each(function () {
					var linkParent = $(this).parent("a");
					console.log(linkParent);
					
					if ($(linkParent).length > 0) {
						var imgName = $(this).attr("src");
						
						//if (imgName == undefined) {
						//	imgName = $(this).attr("src");
						//}	
						console.log(imgName);
						
						for (l=0; l<origBtn.length; l++) {
							if (imgName.indexOf(origBtn[l]) >=0) {
								$(linkParent).text(swapBtn[l]);

						//	$(this).val(swapBtn[l]);

							}
											
					
						$(this).remove();							
							
						}

					}
					
				
				});
					
				//$("#nlfcont img").remove();
				
				// input img buttons

				$('#nlfcont input[type="image"]').each(function () {
					console.log(this);
					$(this).attr("type","submit");
					var imgSrc = $(this).attr("src");
					for (l=0; l<origBtn.length; l++) {
						if (imgSrc.indexOf(origBtn[l]) >=0) {
							$(this).val(swapBtn[l]);
							$(this).attr("src", "");
						}
					}
				});
				
				//$('#nlfcont a').each(function () {
				//	console.log(this);
				//	
				//var query = $(this).attr("href");
				//if ((query.indexOf("index.php") >=0) || (query.indexOf("indextst.php") >=0)) {
				//
				//	query = query.substr(query.indexOf("?"));
				//
				//	query = query.replace(/\'\)/g, '');
				//	query = query + "&" + phSession;
				//	console.log(query);
				//	$(this).attr("href", query);
				//
				//}
				//});
				$('#nlfcont a').attr("onmouseout", "return false;");
				$('#nlfcont a').attr("onmouseover", "return false;");
				$('#nlfcont select').attr("onchange", "phUpdateRows()");
				
						setTimeout(function () {
							scrollwindownlferfassen.refresh();
						}, 0);				

			},
                    
            error: function (XMLHttpRequest, textStatus, errorThrown) {
			console.log (" error " + textStatus);
			console.log (XMLHttpRequest);
			} 
        }); // end ajax
	}

function  phUpdateRows(){
	
	var selected = $('#nlfcont select[name="rows"] option:selected').val();
	console.log(selected);
	if (selected != "Anzahl") {
		loadPressehandel("?rows=" + selected + "&" + phSession, "");
		
	}
	
    //
    //if(document.rowform.rows.options[id].value != 'Anzahl')
    //  
    //  self.location.href = 'index.php?rows=' + 
    //  
    //    document.rowform.rows.options[id].value

}
	
	function getCustomerData (identifier) {
		
		var founded = false;
		var returnValue = "";
			console.log(appXml);
			var subSet = $(appXml).find('datas[name="' + identifier + '"]');

			if ($(subSet).length != 0) {
				founded = true;
				returnValue = $(subSet).text();
				
			}
			console.log(returnValue);
			
			var status = $(statusXml).find(identifier);
			console.log(status);
			if ($(status).length > 0 ) {
				returnValue = $(status).text();
				founded = true;
				
				
			}
			console.log(returnValue);
			
		//	.each(function(){
		//		$(this).find(identifier).each (function(){
		//		returnValue = $(this).text();
		//		founded = true;
		//	});   
		//});
					   
		return returnValue;
		
	}
	
	function showHideRows(checked, rows, container) {
		var toggelRowArray = rows.split(",");
	    console.log(toggelRowArray);
		$('span[name="' + container + '"]').find('table').each (function(){
			for (var l = 0; l < toggelRowArray.length; l++) {
				if (!toggelRowArray[l].isNan) {
					toggleHead = $(this).find('th:nth-child(' + toggelRowArray[l] + ')');
					toggleCell = $(this).find('td:nth-child(' + toggelRowArray[l] + ')');
				
					if (checked == true) {
						toggleHead.show();
						toggleCell.show();
	
					}
					else {
						toggleHead.hide();
						toggleCell.hide();
					}
				}
			}
	    })		
	}
		

	function switchMenu (target, direction){
		var currentMenu = $(".menu.current");
		var targetMenu = $(target);
		$(".sidebarsection").css("position","absolute");
		switch (direction) {
			case "l":

				setTimeout(function(){
					$(targetMenu).addClass("rightin");
					$(targetMenu).addClass("current");
					
					setTimeout(function(){
						//
						//$(currentMenu).addClass("slideleftout");
						//$(currentMenu).addClass("leftoutleft");
						$(targetMenu).removeClass("rightin");
						$(targetMenu).addClass("sliding");
						$(targetMenu).addClass("slideend");
						$(currentMenu).addClass("leftout")
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
				break;
			
			case "r":
				
				setTimeout(function(){
					
					$(targetMenu).addClass("current"); 
					$(targetMenu).addClass("leftin");
						
					setTimeout(function(){
						$(targetMenu).removeClass("leftin")			
						$(targetMenu).addClass("sliding");
						$(targetMenu).addClass("slideend");
						$(currentMenu).addClass("sliding");
						$(currentMenu).addClass("rightout");
	
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
			break;
		}
		
		//spezielle Windowssteuerungen
		
		switch (target) {
			case"#searchmenu":
				switchWindow ("#" + "windowsuche");
			break;
		}
	}


	function switchWindow (target){
		console.log(target);


			if ($("#content").hasClass("portrait")) {
				$('#content.portrait').click();
				$(".landscapeheader").hide();
			}
			
		if (target != "#") {
			$(".window").removeClass("current");
			$('.window').addClass("transparent");
			$(target).addClass("current");
			$(target).removeClass("transparent"); 
		}
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

		$(".landscapeheader").hide();
		$(".portaitheader").css("display", "block");
		
		$("#sidebar header").css("border-right", "0px");
	   $("#content .windowsection").css("left", "0px");
	   var windowWith = $( window ).width();
	   $("#content header").width(windowWith-300);
	   $("#content .windowsection").width(windowWith);
	   
	   // hier
	   //$(".windowsection").css("clip", "rect(0px, " + $( window ).width() +"px, " + $( window ).height() +"px, 0px)");
	   $("#pdfcontainer").css("left", "10px");


	   
	}
	
	function setLandscape() {
		$(".landscapeheader").show();
		$("#sidebar header span").show();
		$(".portaitheader").hide();
 	    $("#content .windowsection").css("left", "300px");
		var windowWith = $( window ).width();
	    $("#content header").width(windowWith-300);
	    $("#content .windowsection").width(windowWith-300);

		$(".windowsection").css("clip", "auto");
		$("#sidebar header").css("border-right", "1px solid white");
		
		$("#pdfcontainer").css("left", "310px");
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

	$("#suchecont").hide();



	//backbutton
	$('a[class~="back"]').click (function() {
		switchMenu($(this).attr("href"), "r");
		return false;		
    });
	
	
	// portait menu
	$('a[class="portaitheader"]').click (function() {
		
		$(".landscapeheader").show();
		$("#sidebar header span").show();
		$(".portaitheader").hide();
		
		var windowWith =  $( window ).width();
		var windowHeigth =  $( window ).height();
		var currentWindow = $(".window.current .windowsection");
		$(currentWindow).addClass("slide");
		
		var currentMenu = $(".menu.current");
		$("#sidebar").css("z-index", "1000");
		$(".menu.current .sidebarsection").css("position", "absolute");
		$(currentMenu).addClass("leftin");
		$("#content").addClass("portrait");
			   
		$('#content.portrait').one("click", function() {
			$(".landscapeheader").hide();
			$("#sidebar header span").hide();
			$(".portaitheader").fadeIn();
			$(".portaitheader").css("display", "block");
		
			$(".menu.current .sidebarsection").css("position", "absolute");
			$("#content").removeClass("portrait");
			var currentMenu = $(".menu.current");
			$(currentMenu).addClass("sliding");
				
			setTimeout(function () {
				$(currentMenu).addClass("leftout");
					
				setTimeout(function () {
					$("#sidebar").css("z-index", "1");
					$(currentMenu).removeClass("sliding");
					$(currentMenu).removeClass("leftout")	
					$(".menu.current .sidebarsection").css("position", "fixed");
				}, 500);
			}, 0);
	
			return false;		
		});	
			   
		setTimeout(function () {
			$(currentMenu).addClass("sliding");
			$(currentMenu).removeClass("leftin")			
			setTimeout(function () {
				$(currentMenu).removeClass("sliding");
				$(".menu.current .sidebarsection").css("position", "fixed");
			}, 500);
		}, 0);
		
		return false;		
	});
	
	
	//sidebar clicks
	$(document).on("click", "#sidebar li a", function() {
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

// ----------------  Window functions ---------------------
// ######## Login

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

// ######### Search Window
	$('#btnSearchCustomer').click (function() {
		dataString = "search=" + $('#txtsearchCustomer').val();
		console.log(dataString);
		dataload("#searchcustom", dataString);	

    });

	$(document).on("click", "#searchul li a", function() {
		$("#searchul li a.current").removeClass("current");
		$(this).addClass("current");
		$("#txtsearchCustomer").val($(this).text());
		
		return false;		
		
	 });	
	
// ######### Kundenübersicht

	$(document).on("click", ".userimg img", function() {
		console.log($(this).attr("src"));
		var imgSource = $(this).attr("src");
		$(".overlay_img img").attr("src", imgSource);

		//$(".overlay_img").show();
		$(".overlay_img").removeClass("hidden");
		$(".overlay_img").addClass("visible");
		var imgHeight = $(".popupimg").height();
		var screenHeight = $(window).height();
		var margin = (screenHeight - imgHeight) / 2; + "px";
		$(".popupimg").css("margin-top", margin);
		
		//			setTimeout(function () {
		//console.log($(".popupimg").height());
		//	}, 0);
		//			
		return false;	
	});

	$('.overlay_img').click (function() {
		$(".overlay_img").removeClass("visible");
		$(".overlay_img").addClass("hidden");
		


    });
	
// ######### Nlf erfassen

	$("#nlfcont").on("click", "a", function() {
		
		
		console.log(this);
		var query = $(this).attr("href");
		if ((query.indexOf("index.php") >=0) || (query.indexOf("indextst.php") >=0)) {
		
			query = query.substr(query.indexOf("?"));
			
			query = query.replace(/\'\)/g, '');
			query = query + "&" + phSession;
			console.log(query);
			loadPressehandel(query, "");
			
		}
		
		query = query.substr(query.indexOf("?"));
		//console.log(query);
		//var params = $(this).serialize();
		//console.log(params)
		//loadPressehandel(query, params);
		return false;	
	});


	$("#nlfcont").on("submit", "form", function() {
		
		
		console.log(this);
		
		
		var query = $(this).attr("action");
		query = query.substr(query.indexOf("?"));
		
		console.log(query);
		console.log(query.indexOf("?Session"));
		if (query.indexOf("?Session") >= 0) {
			// session speichern
			phSession = query.substr(1);
			console.log(phSession);
		}
		
		var params = $(this).serialize();
		console.log(params)
		loadPressehandel(query, params);
		return false;	
	});

	$('.overlay_img').click (function() {
		$(".overlay_img").removeClass("visible");
		$(".overlay_img").addClass("hidden");
		


    });
	
	

	
	//formmenu 
	
	$(document).on("click", "#formsul li a", function() {
		var formId = $(this).attr("id");
		var currentForm = $(formXml).find('formdatas[formid="' + formId + '"]');
		
	
		$("#formscontainer").html($(currentForm).find("content").text());
		$("#formscontainer form").append('<input type="hidden" name="formid" value="' + formId + '">');
		$("#formscontainer form").append('<input type="hidden" name="customid" value="">');
		$("#formscontainer form").append('<input type="hidden" name="formvalid" value="">');
		$("#formscontainer form").append('<input type="hidden" name="userid" value="">');
		
		if (formId =="3") {
			var formtmp = $("#formscontainer form");
			$(formtmp).find("div").each (function () {
				$(this).css("float","");
				$(this).css("display","table-cell");
				$(this).addClass("divrow");
		 });				
				
			//$("#formscontainer").html(formtmp);
			//console.log(formtmp);
		}

		var selection = $(currentForm).find("selection").text();
		var paramStr = "formid=" + $(this).attr("id") + "&customid=" + getCustomerData("kdnr") + "&userid=" + getCustomerData("userid");
		paramStr = paramStr + "&selection=" + selection;
		dataload("#formsval", paramStr);
		$("#windowsforms header").text($(this).text());
		setTimeout(function () {	

				scrollwindowforms.refresh();
		}, 0);		
		
		return false;		
		
	});
	
	// formvals
	
	$(document).on("click", "#formsvalul li a", function() {
		var formvalId = $(this).attr("id");
	
		// reset formval bei neuen Eintrag
		//if (formvalId == "NEW") {
			$('#formscontainer form input, select, textarea').not(':input[type=submit], input[type=hidden]').each(function(){
				$(this).val("");
				$(this).prop("checked", false);

			});						
		//}
			
			var currentFormval  = $(formvalXml).find('formvaldatas[formvalid="' + formvalId + '"]');
			
			$(formvalXml).find('formvaldatas[formvalid="' + formvalId + '"] formvalues').each (function(){				
				var elemName = $(this).attr("name");
				var elemValue = $(this).attr("value");
				var formElem =  $('#formscontainer form *[name="' + elemName + '"]');
				var elemType = $(formElem).attr('type');
				
				if ($(formElem).length > 0 ) {
					if ($(formElem).prop("tagName").toLowerCase() == "textarea") {
						elemType = "textarea";
					}
				
					if ($(formElem).prop("tagName").toLowerCase() == "select") {
						elemType = "select";
					}
				}
	
				switch (elemType) {
					//text areas 
					case "text":
					$(formElem).val(elemValue);
					break;
					
					case "textarea":
					$(formElem).val(elemValue);
					break;
					
					case "select":
					$(formElem).val(elemValue);
					break;
					
					case "checkbox":
						
					if (elemValue >= "1") {
						$(formElem).prop("checked", true);
					}
					else {
						$(formElem).prop("checked", false);
					}
			
					break;
	 
					case "radio":
					if ($(formElem).val() == elemValue) {
						$(formElem).prop("checked", true);
					}
					else $(formElem).prop("checked", false);
					break;
				}

		    });
			var customId = getCustomerData("kdnr");
			var exported = 0;
			
			if ($(currentFormval).length >0 ){
				customId = $(currentFormval).attr("customid");
				exported = $(currentFormval).attr("exported");
			}
			
			$('#formscontainer form input[name="customid"]').val(customId);
			$('#formscontainer form input[name="userid"]').val(getCustomerData("userid"));
			$('#formscontainer form input[name="formvalid"]').val(formvalId);
			
			$('#formscontainer form input[type="submit"]').show();
			if (exported == "1") {
				$('#formscontainer form input[type="submit"]').hide();
				
			}
		
		
		
		return false;		
		
	});
	
// formvals senden


	function inputFormSubmit () {
			
		var validateOk = true;
		var parentForm = $("#formscontainer form");
		console.log(parentForm);
		$(parentForm).find('.validate').each (function () {
			if ( $(this).val() == "") {
				$(this).css("background-color","red");
				validateOk = false
			}
			else {
				$(this).css("background-color","transparent");
			}
		
		});
		
		if (validateOk == true) {
			data = $(parentForm).serialize();
			datastore ("#btnSend", data)
		}
		else {
			alert ("Mindestens ein Pflichtwert wurde nicht erfasst. Bitte die rot markierten Felder ausfüllen.");
			$('.overlay_wait').hide();
		}
	}
    


	$(document).on("click", '#formscontainer input[type="submit"]', function() {
		
		$('.overlay_wait').show();
		setTimeout(function(){
			inputFormSubmit()
		},100);
		return false;

	}); 



	


// ######## Kundenprofil

	function changePdfScale (direction) {
		var matrix = $('#pdfKProfil').css("-webkit-transform");
		var currentScale = parseFloat(matrix.split('(')[1].split(')')[0].split(',')[0]);
		console.log(currentScale);
		
		if (direction == "-") {
			currentScale = currentScale - 0.2;
		}
		
		else {
			currentScale = currentScale + 0.2;
		}
		
		$('#pdfKProfil').css({
			'-moz-transform': 'scale(' + currentScale + ')',
			'-webkit-transform': 'scale(' + currentScale + ')',
		});  


		
	}

	$("#btnPdfMinus").click ( function() {
		changePdfScale("-");
	});	
	
	$("#btnPdfPlus").click ( function() {
		changePdfScale("+");
	});	
		
	

	$("#toggle1").click ( function() {
    	showHideRows ($(this).prop("checked"),$(this).val(),"var_topseller_ztg");
	});	
	
	$("#toggle2").click ( function() {
    	showHideRows ($(this).prop("checked"),$(this).val(),"var_topseller_ztschr");
	});	
	


// ###### Menu Umfeldanalyse

	$('#btnMap').click ( function() {
		dataload ("#map",'customId=' + getCustomerData('kdnr') + '&lat=' +getCustomerData('geo_lat')+ '&lng=' + getCustomerData('geo_lng'));
	    return false;
	});


	

});	
	
