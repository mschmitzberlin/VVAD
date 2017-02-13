var formXml;
var formvalXml;
var appXml;
var statusXml;
var origForm;
var kustObj;

// Steuerung geladener Elemenete

var wmLoaded = false;  // Werbemitte
var kdProfilLoaded = false; // Kundenprofil
var analyseLoaded = false;

var editVals = {
		newValcounter : 0,
        currentKey : "",
		create : function (key, oldvalue, longname, fixedvalue, candelete) {
			
			oldvalue = (typeof oldvalue !== 'undefined') ?  oldvalue : "";
			fixedvalue = (typeof fixedvalue !== 'undefined') ?  fixedvalue : "";
			candelete = (typeof candelete !== 'undefined') ?  candelete : true;

			this[key] = {
				newvalue : "",
				oldvalue : oldvalue,
				longname : longname,
				fixedvalue : fixedvalue,
				candelete : candelete
			};
			
			this.setKey(key);
		},
		
		getCount: function () {
			return this.newValcounter;
		},
		getKey : function () {
			return this.currentKey;
		},
		
		setKey : function (key) {
			if (this[key] !== undefined) {
				this.currentKey = key;
			}
			else {
				this.currentKey = "";
			}
		},
		
		getNewVal : function () {
			return this[this.currentKey].newvalue;
		},
		
		getOldVal : function () {
			return this[this.currentKey].oldvalue;
		},
		
		setNewVal : function (newvalue) {
			var key = this.currentKey;
			if (key !== "") {
				var currentValue = this[key].newvalue;

				if ( this[key].oldvalue === newvalue) {
					// kein Speichern, wenn Werte nicht geändert! 
					newvalue = "";
				}
				
				this[key].newvalue = newvalue;
				if (currentValue === "") {
					this.newValcounter++;
				}
				if (newvalue === "") {
					this.newValcounter--;
				}
			}
					
			if (this.newValcounter !== 0) {
				$(".page-header .badge").show();
				$(".page-header .badge").text(this.newValcounter);
				
			}
			else {
				$(".page-header .badge").hide();
			}
		},

		del : function () {
			this.setNewVal("");
			delete this[this.currentKey];
			this.currentKey = "";
		},

		reset : function () {
			for (var key in editVals) {
				if (typeof this[key] == "object") {
					if (this[key].candelete === false) {
						this[key].newvalue ="";
						this[key].oldvalue ="";
					}
					else {
						delete this[key];
					}
				}
			}
			
			this.newValcounter = 0;
			this.currentKey = "";
			$(".page-header .badge").hide();
			$("#erfdatentable").children().remove();
		}
	
	};  // Container für geänderte Values


document.addEventListener('touchmove', function(e) {
	e.preventDefault();
}, false);
document.addEventListener('DOMContentLoaded', loaded, false);

function dataload(target, params) {

	varUrl = 'php/frontend.php';
	datastring = params + "&filter=" + target;
console.log(datastring);	
	$('#waitModal').show();
	$.ajax({

		type: 'POST',
		dataType: 'xml',
		url: varUrl,
		data: datastring,


		success: function(xml) {
			$("#progress").text("");
			$('#waitModal').hide();
			console.log(xml);
			var error = $(xml).find('error').attr("msg");
			
			if (error !== undefined) {
				alert(error);
				return false;
			}
			
			var loginStatus = $(xml).find('status logged_in').text();
			if (loginStatus == "-1") {
				// session end
				alert($(xml).find('status msg').text());
				$('#waitModal').hide();
				showWindow("#windowlogin");
				showMenu("#loginmenu", "l");
				return false;
			}
			var $xml = $(xml);
			switch (target) {


				case "#login":

					var loginStatus = $(xml).find('status logged_in').text();
					//loginStatus = 1;
					if (loginStatus === 0) {
						// login failed
						alert($(xml).find('status msg').text());
					} else {
						var currentUserName = $(xml).find("status username").text();
						$("#username").text(currentUserName);

						//bearbeiten
						if ($('#username').val() == 'gast') {
							//guest user - do'nt show titelprofil o mainmenu
							$('#ul_mainmenu li').hide();
							$('#ul_mainmenu li:first').show();
						} else {
							$('#ul_mainmenu li').show();
						}

						$("#sidebar").show();
						$("#searchcontainer").hide();
						showMenu("#searchmenu", "l");

						showWindow("#windowsuche");
					}

					break;
				case "#searchcustom":

					formXml = $(xml).find("forms");
					appXml = $(xml).find("appdatas");
					var $xml = $(xml);
					var $fieldDefXml = $(xml).find("fielddefs");
					statusXml = $(xml).find("status");
					$("#searchul li").remove();
					
					// reset Values
					$('*[name*="kust_"]').empty();
					$('*[name*="var_"]').empty();
					
					if ($(appXml).length > 0) {

						console.log(editVals);
						editVals.reset();
						$(appXml).find("datas").each(function() {
								
								var dataName =  $(this).attr("name");
								var appName = "var_" + dataName;
								var appDatas = $(this).text();
								var innerHtml = appDatas;
								var $fieldDef = $fieldDefXml.find('[appvalname="' + dataName + '"]');
								if ($fieldDef.length > 0) {
									if ($fieldDef.attr("edit") == "J") {
										// create editVals
										console.log(editVals);
										editVals.create(dataName, appDatas, $fieldDef.find("longname").text(),$fieldDef.find("fixedvalue").text(), false);
										console.log(editVals[dataName]);
										innerHtml = '<a class="value_edit" id="' + dataName +
										'" href=""><span class= "value_edit_text">' + appDatas + '</span><span class="glyphicon glyphicon-pencil"></span></a>';
									}
								
								}
								$('span[name="' + appName + '"]').html(innerHtml);

							});
						//Workaround table header 
						var thElem = $('span[name="var_f_remi_komplett"] thead th')[4];
						$(thElem).text("Verkauf");
						thElem = $('span[name="var_f_remi_avk"] thead th')[4];
						$(thElem).text("Verkauf");
						//bootstrap table design
						$("span").find("table").addClass("table");

						$("#formsul a").remove();
						$(formXml).find("formdatas").each(function() {
							var formId = $(this).attr("formid");
							var formName = $(this).find("name").text();
							$("#formsul").append('<a class="list-group-item" id="' + formId + '" href="#windowsforms">' + formName + '</a>');

						});

						//// Vkst-Bilder
						//$(".userimg").children().remove();
						//var fileIn = $(appXml).find("images in").attr("file");
						//if (fileIn != "") {
						//	$("#usrimgin").html('<img  class="img-responsive img-thumbnail" src="' + fileIn + '">');
						//}
						//
						//var fileOut = $(appXml).find("images out").attr("file");
						//if (fileOut !== "") {
						//	$("#usrimgout").html('<img class="img-responsive img-thumbnail" src="' + fileOut + '">');
						//}

						showWindow("#windowkundenuebersicht");
						showMenu("#mainmenu");
						
						// Auswahl Hauptmenue einblenden
						$('#scrollsearchmenu a[href="#mainmenu"]').show();
						
						// Kennzeeichen für bereits geladene Seiten zurücksetzen
						wmLoaded = false;
						kdProfilLoaded = false;
						analyseLoaded = false;

					}
					// Hier Sucheteil
					// container neu  aufbauen



					var searchXml = $(xml).find("searches");

					if ($(searchXml).length > 0) {
						$(searchXml).find("search").each(function() {
							var customId = $(this).attr("customid");
							var result = $(this).attr("result");
							$("#searchul").append('<a class="list-group-item" id="' + customId + '" href="#">' + result + '</a>');
						})

						//$("#scrollsuche").attr("data-calculated", "false");
						$("#searchcontainer").show();
						//refreshSrollList();                            

						//setTimeout(function () {	
						//	scrollsuche.refresh();
						//}, 0);
						$("#suchecont").show();
						setTimeout(function() {
							scrollsuche.refresh();
						}, 0);

					}

					// Logout Pressehandel wg Kd-Wechsel
					$('.iframe-holder').children().remove();

					setTimeout(function() {
						$('.iframe-holder').append('<iframe id ="nlfFrame" src="http://www.pressehandel-berlin.de/index.php?mode=logout"></iframe>');
						setTimeout(function() {
							$('.iframe-holder').children().remove();
							$('.iframe-holder').append('<iframe id ="nlfFrame" src="http://www.pressehandel-berlin.de"></iframe>');
						}, 200);
					}, 200);

					//keine Daten, kein Suchergebnis

					if ((appXml.length == 0) && (searchXml.length == 0)) {
						openModalDlg("", "Suche", "Zum Suchbegriff konnten keine Einträge gefunden werden.");
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
					$(xml).find('geodata markers').each(function() {

						var initLat = $(this).attr('lat');
						var initLng = $(this).attr('lng');
						var initialLocation = new google.maps.LatLng(initLat, initLng);

						var address = jQuery.trim($(this).find('address').text());
						var customId = $(this).find('customId').text();

						var marker = new google.maps.Marker({
							position: initialLocation,
							map: map,
							icon: imageMarker,
							title: address,
							id: customId
						});

						google.maps.event.addListener(marker, "click", function() {
							oldmarker.setIcon(imageMarker);
							oldmarker = marker;
							var id = marker.id;

							marker.setIcon(imagePoint);
							map.panTo(marker.getPosition());

							var currentMenu = $("#umfeldul a.active");

							if ($(currentMenu).attr("id") != id) {
								//marker wurde im Google div gesetzt; Menü neu positionieren
								var nextMenu = $('#umfeldul a[id="' + id + '"]');
								var lstIndex = nextMenu.parent().index();
								scrollumfeldanalysemenu.scrollToElement('li:nth-child(' + lstIndex + ')', 200)
								$(currentMenu).removeClass("active");
								$(nextMenu).addClass("active");
							}

						});
						$("#umfeldul").append('<a class="list-group-item" id="' + customId + '" href="#windowumfeldanalyse">' + $(this).find('address').text() + '</a>');
						$('#umfeldul a[id="' + customId + '"]').bind("click", function() {
							$("#umfeldul a.active").removeClass("active");
							$(this).addClass("active");
							google.maps.event.trigger(marker, 'click');
							return false;
						});

						if (counter == 0) {
							map.setCenter(initialLocation);
							oldmarker = marker;
							counter = 1;
							$('#umfeldul a[id="' + customId + '"]').click();
						}

					});
					//});

					setTimeout(function() {
						//scrollumfeldanalysemenu.refresh();
						showMenu("#umfeldanalysemenu", "l");
					}, 0);
					break;

				case "#formsval":
					$("#formsvalul a").remove();
					// neuer Eintrag
					$("#formsvalul").append('<a class="list-group-item" id="NEW" href="#">Neuer Eintrag</a>');

					$('#formscontainer form input[name="customid"]').val(getCustomerData("kdnr"));
					$('#formscontainer form input[name="formvalid"]').val("NEW");


					$(xml).find("formvaldatas").each(function() {
						var formValId = $(this).attr("formvalid");
						var listText = $(this).attr("listtext");
						$("#formsvalul").append('<a  class="list-group-item" id="' + formValId + '" href="#">' + listText + '</a>');

					});

					formvalXml = $(xml).find("formvals");
					console.log(formvalXml);

					var lastId = 0;

					if ($(formvalXml).length > 0) {
						lastId = $(formvalXml).attr("lastid");
					}

					if (lastId == "0") {
						// Menu erstmalig geladen
						lastId = "NEW";

						showWindow("#windowsforms");
						showMenu("#formvalsmenu", "l");
					}

					$('#formsvalul a[id="' + lastId + '"]').click();


					//setTimeout(function () {	
					//	scrollformvalsmenu.refresh();
					//}, 0);							

					break;
				//case "#getdatas":

					
					
			} // switch traget
			
			// get Datas
			var $responseXml = $xml.find("dataresponse");
			var globalErrorMsg = $responseXml.find("msg").text(); // hier noch Fehlerbehandlung msg
			if (globalErrorMsg === "") {
				var singelErrorMsg = "";
				$responseXml.find('response').each(function() {
					var $this = $(this);
					var funcName = $this.attr("function");
					var content = $this.find("content").text();
					var resultError = $this.find("resulterror").text();
					
					if (resultError !== "") {
						singelErrorMsg = singelErrorMsg + resultError + "\n";
						return true;
					}
					
					switch (funcName) {
						case "getkustresult":
							kustObj = JSON.parse(content);
							console.log(kustObj);
							
							for (var objKey in kustObj) {
								$('*[name="kust_' + objKey +'"]').text(kustObj[objKey]);
							}
							
							// Mail / Phone-link setzen
							var $mailLink = $("#mail_link");
							$mailLink.attr("href", "");
							$mailLink.text("");
							if (kustObj.email !== "") {
								$mailLink.attr("href", "mailto:" + kustObj.email);
								$mailLink.text(kustObj.email);
							}
							var $tel1link = $("#tel1_link");
							$tel1link.text("");
							if (kustObj.telefon !== "") {
								$tel1link.attr("href", "tel:" + kustObj.telefon);
								$tel1link.text(kustObj.telefon);
							}
	
							var $tel2link = $("#tel2_link");
							$tel2link.text("");
							if (kustObj.telefon2 !== "") {
								$tel2link.attr("href", "tel:" + kustObj.telefon2);
								$tel2link.text(kustObj.telefon2);
							}
							$("#cbEpaNummer").prop("checked", true);
							$("#cbEpaNummer").click();								
						
						break;
						case "getkndalzresult":
							var $kndalzTable = $("#kndalzTable");
							$kndalzTable.children().remove();
							$kndalzTable.append(csvToTable(content));							
							
						break;							
						case "getkdprofilresult":							
							var embed = "";
							var linkArray = content.split(";");
							for (l=0; l<linkArray.length; l++) {
								embed = embed + '<div class="pdfimage"><img src="' + linkArray[l] + '"></div>';
							}
							$("#pdfcontainer").html(embed);
							kdProfilLoaded = true;
							setTimeout(function() {
								scrollkdprofil.refresh();
							}, 1000);
						break;
					
						case "getkdpicturesresult":
							$("#pictin").attr("src","img/noimg.png");
							$("#pictout").attr("src","img/noimg.png");
							
							var fileArray =  content.split(";");
							
							if (fileArray.length > 1) {
								$("#pictin").attr("src", fileArray[0]);
								$("#pictout").attr("src", fileArray[1]);
							}
							
						break;					
					
						case "getnlfgresult":
							$("#nlf_aktuell").append(csvToTable(content));
						break;
						case "getbezugresult":
							var $bezugTable = $("#bezugTable");
							$bezugTable.children().remove();
							//$bezugTable.append(csvToTable($responseXml.find("content").text()));
							$bezugTable.append(csvToTable(content));

							var $bezugDlg = $("#bezugDlg");
							$bezugDlg.find("#bezugNewValue").val("");
							$bezugDlg.find('div[class~="warning-value"]').hide();
							$bezugDlg.modal();								
						break;
						case "getwmbestandresult":
							var wmObj = {};
							if (content !== "") {
								
								wmObj = JSON.parse(content);
								var colNumber = 1;
								var $cloneWm =  $("#cloneWm").children().clone();
								for (var wmObjKey in wmObj) {
									for (var singleKey in wmObj[wmObjKey]) {
										var $currentCol = $cloneWm.find('div[data-colnumber="' + colNumber +'"]');
										var wmText = wmObj[wmObjKey][singleKey];
										if (singleKey === "BILD1") {
											$currentCol.find("img").attr("src", wmText);
										}
										else {
											$currentCol.find('*[name="' + singleKey + '"]').text(wmText);
										}
									}
									colNumber++;
									if (colNumber > 2) {
										$("#contentWm").append($cloneWm);
										$cloneWm =  $("#cloneWm").children().clone();
										colNumber = 1;
									}

								}
								setTimeout(function() {
									scrollwerbemittel.refresh();
								}, 1500);									
							}
							wmLoaded = true;
						break;
					
						case "gettopsellerztgresult":
						case "gettopsellerztschrresult":
						case "getsortanaztgresult":
						case "getsortanaztschrresult":
							var tableHtml =  csvToTable(content);
							var $tableDom = $("#" + funcName);
							$tableDom.children().remove();
							$tableDom.append(tableHtml);
							$tableDom.find("tr").each(function() {
								var $tDatas = $(this).find("td");
								if ($tDatas.length > 0) {
									$tDatas.eq(1).html('<a class= "title-link" href= "#" data-tnr="' + $tDatas.eq(0).text() + '">' + $tDatas.eq(1).text() +'</a>');
								}
							});
							analyseLoaded = true;
							$('input[name="hideUmsAbs"]').prop("checked", true);
							$('input[name="hideUmsAbs"]').click();							
							
							setTimeout(function() {
								scrolltopztg.refresh();
								scrolltopztschr.refresh();
								scrollsortztg.refresh();
								scrollsortztschr.refresh();
							}, 1000);
						break;					
					}
				});
				if (singelErrorMsg !== "") {
					openModalDlg("", "Fehler beim Laden der Daten", singelErrorMsg);
				}
				

			
			}
			else {
				openModalDlg("", "Fehler beim Laden der Daten", globalErrorMsg);
			}
			$('#waitModal').hide();
		},

		error: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(" error " + textStatus);
			console.log(XMLHttpRequest);
			$('#overlay_wait').hide();
		}
	}); // end ajax
}


function datastore(target, params) {

	$('#waitModal').show();

	//build data string
	var datastring = "";
	varUrl = 'php/frontend.php';
	if (params === undefined) {
		params="";
	}
	//params =  encodeURIComponent(params);
	datastring = "filter=" + target + "&" + params;
	console.log(datastring);
	//switch (target) {
	//		case "#btnSend":
	//			//params =  encodeURIComponent(params);
	//			datastring = "filter=#btnSend&" + params;
	//			console.log(datastring);
	//		break;
	//		
	//		case "#check":
	//			datastring = "filter=#check&" + params;
	//			
	//		break;
	//	
	//	}


	$.ajax({
		type: 'POST',
		url: varUrl,
		data: datastring,

		success: function(xml) {
			var $xml = $(xml);
			console.log($xml);
			switch (target) {
				case "#btnSend":
					var $check = $xml.find("check");
					var validate = $check.attr("validate");
					openModalDlg("", "Daten speichern", $check.find("msg").text());
					if (validate == "1") {
						var paramStr = "formid=" + $check.attr("formid") + "&customid=" + getCustomerData("kdnr") + "&userid=" + getCustomerData("userid");
						paramStr = paramStr + "&lastid=" + $check.attr("formvalid");
						dataload("#formsval", paramStr);
					} 
					break;
				case "#btnDel":
					var $check = $xml.find("check");
					console.log($check);
					var status = $check.attr("status");
					if (status == "0") {
						// Daten gelöscht
						var formvalId =$check.attr("formvalid");
						$('#formsvalul a[id="' + formvalId +'"]').remove();
						$('#formsvalul a[id="NEW"]').click();
					}
					openModalDlg("", "Daten löschen", $check.find("msg").text());
					break;				
				case "#editvals":
					console.log($xml);
					var editValsStatus = $xml.find("editvals status").text();
					var dlgTitle = "Erfasste Daten senden";
					var dlgText = "Daten erfolgreich gesendet";
					if (editValsStatus !== "1") {
						dlgTitle = "Fehler beim Senden";
						dlgText = $xml.find("editvals msg").text();
						
					}
					else {
						// alles ok, aufräumen
						editVals.reset();
						//$("#erfdatentable").children().remove();
					}
					openModalDlg("", dlgTitle, dlgText);
					break;				
			}
			
			

			$('#waitModal').hide();
		},

		error: function(XMLHttpRequest, textStatus, errorThrown) {
			$('#waitModal').hide();
			console.log(" error " + textStatus);
			console.log(XMLHttpRequest);
			$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
		}
	}); // end ajax


}


function loaded() {


}

//refresh scroller
function refreshPageScroll(mseconds) {
	var timedelay = mseconds ? mseconds : 0;
	setTimeout(function() {
		pageScroll.refresh();
	}, timedelay);
}

function csvToTable (csv) {
	var tableStr = "";
	var rows = csv.split("\r\n");

	if (rows.length > 0) {
		rows[0] = rows[0].replace(/"/g,'');
		var head = rows[0].split(";");
		tableStr = "<tr><th>" + head.join("</th><th>") + "</th></tr>";
		
		rows.shift();

		for (l = 0; l < rows.length; l++) {
			rows[l] = rows[l].replace(/"/g,'');
			var fields = rows[l].split(";");
			tableStr = tableStr + "<tr><td>" + fields.join("</td><td>") + "</td></tr>";
		}
	}
	
	return tableStr;
}


function getCustomerData(identifier) {

	var founded = false;
	var returnValue = "";
	var subSet = $(appXml).find('datas[name="' + identifier + '"]');

	if ($(subSet).length !== 0) {
		founded = true;
		returnValue = $(subSet).text();

	}
	var status = $(statusXml).find(identifier);
	if ($(status).length > 0) {
		returnValue = $(status).text();
		founded = true;


	}
	return returnValue;

}


function showWindow(target) {
	$(".window.active").removeClass("active");
	$(target).addClass("active");

	// var containerId = $this.attr("id");
	console.log(target);
	switch (target) {
		case "#scrollsuche":
			setTimeout(function() {
				scrollsuche.refresh();
			}, 0);
			break;
		case "#windowkundenuebersicht":
			setTimeout(function() {
				scrollkduebersicht.refresh();
			}, 0);
			setTimeout(function() {
				scrollkdinfos.refresh();
			}, 0);

			break;
		case "#windowkundenprofil":
			setTimeout(function() {
				scrollkdprofil.refresh();
			}, 0);
			break;
		case "#windowshopdetails":
			setTimeout(function() {
				scrollshopdetails.refresh();
			}, 0);
			break;
		case "#windowvkwm":
			setTimeout(function() {
				scrollvkwm.refresh();
			}, 0);
			break;
		case "#windowregale":
			setTimeout(function() {
				scrollregale.refresh();
			}, 0);
			break;
		case "#windowfruehremi":
			setTimeout(function() {
				scrollfruehremi.refresh();
			}, 0);
			break;
		case "#windowtopztg":
			setTimeout(function() {
				scrolltopztg.refresh();
			}, 0);
			break;
		case "#windowtopztschr":
			setTimeout(function() {
				scrolltopztschr.refresh();
			}, 0);
			break;
		case "#windowsortztg":
			setTimeout(function() {
				scrollsortztg.refresh();
			}, 0);
			break;
		case "#windowsortztschr":
			setTimeout(function() {
				scrollsortztschr.refresh();
			}, 0);
			break;
		case "#windowwerbemittel":
			setTimeout(function() {
				scrollwerbemittel.refresh();
			}, 0);
			break;		

	}

}

function showMenu(target, direction) {
	var $activeMenu = $(".menu.active");
	var $target = $(target);
	if ($activeMenu.attr("id") == $target.attr("id")) {
		// kein sliden, wenn aktuelles und Target Menu gleich
		return false;
	}
	
	var slidebarWidth = $('#navbar').width();

	if (direction === undefined) {
		direction = "l";
	}

	switch (direction) {
		case "l":

			$target.addClass("active");
			$activeMenu.animate({
				marginLeft: slidebarWidth * -1}, 600, function() {
				$activeMenu.removeClass("active");
				$(target).css("margin-left", 0);
				setTimeout(function() {
				scrollmainmenu.refresh();
				scrollsearchmenu.refresh();
				scrollumfeldanalysemenu.refresh();
			}, 0);
				
			});
			break;
		case "r":
			$(target).css("margin-left", slidebarWidth * -1);
			$(target).addClass("active");

			$target.animate({
				marginLeft: 0
			}, 600, function() {
				$activeMenu.removeClass("active");
				setTimeout(function() {
					scrollmainmenu.refresh();
					scrollsearchmenu.refresh();
					scrollumfeldanalysemenu.refresh();
				}, 0);
			});
			break;
	}

}

//
//function refreshSrollList() {
//
//	setTimeout(function() {
//		//	customListScroll.refresh();
//		var $activeWindow = $(document).find("[class='window active']");
//		console.log($activeWindow);
//		var windowHeight = $(window).height();
//		var $containerBox = $activeWindow.find("[class*='scrollable']").not("[data-calculated='true']");
//		if ($containerBox.length > 0) {
//
//			var offset = $containerBox.first().offset();
//			windowHeight = windowHeight - offset.top;
//			console.log($containerBox);
//			$containerBox.each(function() {
//
//				var $this = $(this);
//
//				var scrollHeight = $this.attr("data-height");
//				if (scrollHeight != undefined) {
//
//					var oldHeight = $this.height();
//					var newHeight = (windowHeight * scrollHeight / 100) - 40;
//
//					$this.height(newHeight);
//					var faktor = 100 * newHeight / oldHeight;
//
//					var childrenHeight = 0;
//					$this.children().not("[class*='scrollable']").each(function() {
//						childrenHeight = $(this).height() + childrenHeight;
//						childrenHeight = $(this).css("margin-top") + childrenHeight;
//						childrenHeight = $(this).css("margin-bottom") + childrenHeight;
//
//					});
//
//					//		$this.find("[class*='scrollable']").height(newHeight - childrenHeight);
//
//					var containerId = $this.attr("id");
//
//					switch (containerId) {
//						case "scrollsuche":
//							setTimeout(function() {
//								scrollsuche.refresh();
//							}, 0);
//							break;
//						case "scrollkdprofil":
//							setTimeout(function() {
//								scrollkdprofil.refresh();
//							}, 0);
//							break;
//						case "scrollshopdetails":
//							setTimeout(function() {
//								scrollshopdetails.refresh();
//							}, 0);
//							break;
//						case "scrollvkwm":
//							setTimeout(function() {
//								scrollvkwm.refresh();
//							}, 0);
//							break;
//						case "scrollregale":
//							setTimeout(function() {
//								scrollregale.refresh();
//							}, 0);
//							break;
//						case "scrollfruehremi":
//							setTimeout(function() {
//								scrollfruehremi.refresh();
//							}, 0);
//							break;
//
//
//					}
//				}
//
//			});
//		}
//
//	}, 200);
//
//
//}

function setOrientation() {

	switch (window.orientation) {
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
	$("#scrollwindowumfeldanalyse .container").height(mapWindow - 20);

}

function setPortrait() {

	$(".landscapeheader").hide();
	$(".portaitheader").css("display", "block");
	$("#content .windowsection").css("left", "0px");
	var windowWith = $(window).width();
	$("#content header").width(windowWith - 300);
	$("#content .windowsection").width(windowWith);

	$(".window header span").css("margin-left", "-300px");
	$(".iframe-holder").css("left", "10px");
}

function setLandscape() {
	$(".landscapeheader").show();
	$("#sidebar header span").show();
	$(".portaitheader").hide();
	$("#content .windowsection").css("left", "300px");
	var windowWith = $(window).width();
	$("#content header").width(windowWith - 300);
	$("#content .windowsection").width(windowWith - 300);

	$(".windowsection").css("clip", "auto");
	$("#sidebar header").css("border-right", "1px solid white");

	//$("#pdfcontainer").css("left", "310px");
	$(".window header span").css("margin-left", "0px");
	$(".iframe-holder").css("left", "300px");
	//$(".iframe-holder")width(windowWith-300);


}

function dateToStr(date, format) {
	var returnStr = "";
	if (!(date instanceof Date)) {
		return "";
	}

	if (format === undefined) {
		format = "g";
	}

	switch (format) {
		case "g":
			returnStr = ('0' + date.getDate()).substr(-2, 2) + '.';
			returnStr = returnStr + ('0' + (date.getMonth() + 1)).substr(-2, 2) + '.';
			returnStr = returnStr + ('' + date.getFullYear() - 2000);
			break;

		case "e":
			returnStr = ('' + date.getFullYear()) + '-';
			returnStr = returnStr + ('0' + (date.getMonth() + 1)).substr(-2, 2) + '-';
			returnStr = returnStr + ('0' + date.getDate()).substr(-2, 2);
			break;
	}
	console.log(returnStr);
	return returnStr;
}

function openModalDlg (dlgId, mtitle, mtext, funcName) {
		if (dlgId === "") {
			dlgId = "#alertModal";
		}
		

		
		$modalDlg  = $(dlgId);
		if (mtitle !== undefined) {
			$modalDlg.find(".modal-title").text(mtitle);
			
		}

		if (mtext !== undefined) {
			$modalDlg.find(".modal-text").html(mtext);
			
		}
		
		if (dlgId === "#confirmModal") {
			$('#btnConfirmOk').attr("onclick", funcName +"Ok()");
			$('#btnConfirmCancel').attr("onclick", funcName +"Cancel()");
		}		

		$modalDlg.modal();
		
	}	

	// confirmDiaolog - button Steuerung
	
	function editSendOk() {
		// erfasste Daten senden
		// senden editVals
		var customerId =  getCustomerData("kdnr");
		var customerName =  getCustomerData("nachname");
		datastore("#editvals", "customerid=" + customerId + "&customername=" + customerName +"&params=" + JSON.stringify(editVals));
	}

	function editSendCancel() {
		return;
	}
	
	function erfDelOk() {
		
		editVals.setNewVal("");
		$("#erfdatentable").find('tr[data-editvalid="' + editVals.getKey() + '"]').remove();	
		$("#" +  editVals.getKey() + " span[class='value_edit_text']").text(editVals.getOldVal());
		editVals.setKey("");
	}

	function erfDelCancel() {
		editVals.setKey("");
	}
	
	function formDelOk() {
		var formId = $('#formscontainer form input[name="formid"]').val(); 
		var formvalId = $('#formscontainer form input[name="formvalid"]').val(); 
		datastore("#btnDel",  "formid=" + formId + "&formvalid=" + formvalId);
	}

	function formDelCancel() {
		return false;
	}	

$(document).ready(function() {
	
	$("div[data-height]").each(function() {
		var $this = $(this);

		var height = $this.attr("data-height");
		$this.innerHeight(height);
	});

        $('#scrollsearchmenu a[href="#mainmenu"]').hide();
	//
	//        
	//        var scrollsearchmenu, scrollmainmenu, scrollkundendatenmenu, scrollumfeldanalysemenu, scrollformsmenu, scrollformvalsmenu
	//        var scrollwindowsuche, scrollwindowkundenuebersicht, scrollwindowkundenprofil, scrollwindowshopdetails, scrollwindowwindowvkwm;
	//        var scrollwindowtopztg, scrollwindowtopztschr, scrollwindowsortztg, scrollwindowsortztschr;
	//        var scrollwindowfruehremi, scrollwindowforms, scrollwindowumfeldanalyse, scrollwindownlferfassen, pdfcontainer;
	//        
	//
	scrolllogin = new iScroll('scrolllogin');
	scrollkduebersicht = new iScroll('scrollkduebersicht');
	scrollkdinfos = new iScroll('scrollkdinfos');

	scrollkdprofil = new iScroll('scrollkdprofil');

	// scrollsearchmenu = new iScroll('scrollsearchmenu');
	scrollmainmenu = new iScroll('scrollmainmenu');
	// scrollkundendatenmenu = new iScroll('scrollkundendatenmenu');   
	// scrollumfeldanalysemenu = new iScroll('scrollumfeldanalysemenu');
	// scrollformsmenu = new iScroll('scrollformsmenu');
	// scrollformvalsmenu = new iScroll('scrollformvalsmenu');
	// 
	scrollsuche = new iScroll('scrollsuche');

	scrollshopdetails = new iScroll('scrollshopdetails');
	scrollvkwm = new iScroll('scrollvkwm');
	scrollregale = new iScroll('scrollregale');
	scrollfruehremi = new iScroll('scrollfruehremi');
	scrolltopztg = new iScroll('scrolltopztg');
	scrolltopztschr = new iScroll('scrolltopztschr');
	scrollsortztg = new iScroll('scrollsortztg');
	scrollsortztschr = new iScroll('scrollsortztschr');
	scrollforms = new iScroll('scrollforms');
	scrollsearchmenu = new iScroll('scrollsearchmenu');
	scrollumfeldanalysemenu = new iScroll('scrollumfeldanalysemenu');
	scrollwerbemittel = new iScroll('scrollwerbemittel');
	// scrollwindowkundenuebersicht = new iScroll('scrollwindowkundenuebersicht');
	// // PDF Kundenprofil erts mal scrollen
	// scrollwindowkundenprofil  = new iScroll('scrollwindowkundenprofil');
	// scrollwindowshopdetails = new iScroll('scrollwindowshopdetails');
	// scrollwindowwindowvkwm = new iScroll('scrollwindowwindowvkwm');
	// 
	// scrollwindowtopztg = new iScroll('scrollwindowtopztg');
	// scrollwindowtopztschr = new iScroll('scrollwindowtopztschr');
	// scrollwindowsortztg = new iScroll('scrollwindowsortztg');
	// scrollwindowsortztschr = new iScroll('scrollwindowsortztschr');
	// scrollwindowfruehremi = new iScroll('scrollwindowfruehremi');
	// 
	// scrollwindowforms = new iScroll('scrollwindowforms');
	//
	//
	// scrollmainmenu.options.onBeforeScrollStart = function(e) {                
	//     var target = e.target;
	//     while (target.nodeType != 1) target = target.parentNode;
	//     if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
	//         e.preventDefault();
	//     }
	//}
	//

	scrolllogin.options.onBeforeScrollStart = function(e) {
			var target = e.target;
			while (target.nodeType != 1) target = target.parentNode;
			if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
				e.preventDefault();
			}
		}
			
	scrollsuche.options.onBeforeScrollStart = function(e) {
			var target = e.target;
			while (target.nodeType != 1) target = target.parentNode;
			if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
				e.preventDefault();
			}
		}
		
	scrollforms.options.onBeforeScrollStart = function(e) {
			var target = e.target;
			while (target.nodeType != 1) target = target.parentNode;
			if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
				e.preventDefault();
			}
		}		
		
							setTimeout(function() {
								scrolllogin.refresh();
							}, 0);		
		//
		// scrollwindowforms.options.onBeforeScrollStart = function(e) {                
		//     var target = e.target;
		//     while (target.nodeType != 1) target = target.parentNode;
		//     if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
		//         e.preventDefault();
		//     }
		// }
		//
		//        scrollsearchmenu = new iScroll('scrollsearchmenu');
		//        scrollmainmenu = new iScroll('scrollmainmenu');
		//        scrollkundendatenmenu = new iScroll('scrollkundendatenmenu');   
		//        scrollumfeldanalysemenu = new iScroll('scrollumfeldanalysemenu');
		//        scrollformsmenu = new iScroll('scrollformsmenu');
		//        scrollformvalsmenu = new iScroll('scrollformvalsmenu');
		//        scrollwindowsuche = new iScroll('scrollwindowsuche');
		//        scrollwindowkundenuebersicht = new iScroll('scrollwindowkundenuebersicht');
		//        scrollwindowkundenprofil  = new iScroll('scrollwindowkundenprofil');
		//        scrollwindowshopdetails = new iScroll('scrollwindowshopdetails');
		//        scrollwindowwindowvkwm = new iScroll('scrollwindowwindowvkwm');
		//        scrollwindowtopztg = new iScroll('scrollwindowtopztg');
		//        scrollwindowtopztschr = new iScroll('scrollwindowtopztschr');
		//        scrollwindowsortztg = new iScroll('scrollwindowsortztg');
		//        scrollwindowsortztschr = new iScroll('scrollwindowsortztschr');
		//        scrollwindowfruehremi = new iScroll('scrollwindowfruehremi');
		//        scrollwindowforms = new iScroll('scrollwindowforms');
		//
		//       	 scrollmainmenu.options.onBeforeScrollStart = function(e) {                
		//            var target = e.target;
		//            while (target.nodeType != 1) target = target.parentNode;
		//            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
		//                e.preventDefault();
		//            }
		//       }
		//
		//        scrollwindowsuche.options.onBeforeScrollStart = function(e) {                
		//            var target = e.target;
		//            while (target.nodeType != 1) target = target.parentNode;
		//            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
		//                e.preventDefault();
		//            }
		//        } 
		//
		//        scrollwindowforms.options.onBeforeScrollStart = function(e) {                
		//            var target = e.target;
		//            while (target.nodeType != 1) target = target.parentNode;
		//            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){
		//                e.preventDefault();
		//            }
		//        }
		//
		// 
		//        //refresh scroller
		//        function refreshPageScroll(mseconds) {
		//            var timedelay = mseconds ? mseconds : 0;  
		//            setTimeout(function () {
		//                pageScroll.refresh();
		//            }, timedelay);
		//        }
		//           
		//
		//function loaded() {
		// 
		//
		//	
		//}
		//
		////document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		//
		//document.addEventListener('DOMContentLoaded', loaded, false);    
//	$(".modal-dialog").css("margin-top", Math.max(0, ($(window).height() - 111) / 2));
//	$("#waitModal .modal-dialog").css("margin-top", Math.max(0, ($(window).height() - 50) / 2));		
	window.addEventListener("orientationchange", function() {

		setOrientation();
	}, false);

	setOrientation();

 $.jMaskGlobals = {
    maskElements: 'input,td,span,div',
    dataMaskAttr: '*[data-mask]',
    dataMask: true,
    watchInterval: 300,
    watchInputs: true,
    watchDataMask: false,
    byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91],
    translation: {
        '0': {pattern: /\d/},
        '9': {pattern: /\d/, optional: true},
        '#': {pattern: /\d/, recursive: true},
        'A': {pattern: /[A-Z]/},
		'E': {pattern: /[AKTS]/, optional: true},
        'S': {pattern: /[a-zA-Z]/}
    }
  };

	$("#suchecont").hide();


	$(document).on("click", 'a[class~="back"]', function(e) {
		// Ausnahme für Suche
		var target = $(this).attr("href");
		if (target == "#searchmenu") {
			if (editVals.getCount() > 0) {
				openModalDlg("", "Daten senden", "Bitte die erfassten Daten erst versenden");
				$('#scrollmainmenu a[href="#windowerfdaten"]').click();
				return false;
			}			
			
			showWindow("#windowsuche");
		}
		
		
		showMenu($(this).attr("href"), "r", e);
		return false;
	});


	$(document).on("click", ".sidebarsection a", function(e) {

		$('#sidebar a,active').removeClass("active");
		var target = $(this).attr("href");

		$(this).addClass("active");
		if ($(this).hasClass("submenu")) {
			showMenu(target, "l", e);

		} else {
			showWindow(target);
		}

		return false;

	});

	// ----------------  Window functions ---------------------
	// ######## Login


	$('#btnLogin').click(function() {
		// var params = $('#frmLogin').serialize();
		var userName = $("#username").val();
		var password = $("#password").val();
		var userNameMd5 = userName;
		var pwmd5 = hex_md5(userNameMd5 + password);
		//reset userId
		//$.jStorage.set('currentUser', '')

		var params = "username=" + userName + "&password=" + pwmd5 + "&logged_in=0";
		console.log(params);
		dataload("#login", params);

	});

	// ######### Search Window
	
	$(document).on("click", "#btnSearchCustomer", function() {		
		$('#txtsearchCustomer').blur();
		var searchStr = $('#txtsearchCustomer').val();
		if (searchStr != "") {
			dataString = "search=" + $('#txtsearchCustomer').val();
            dataString = dataString + "&searchoption=" + $('input[name=rdSearch]:checked').val();			
			dataload("#searchcustom", dataString);
		} else {
			openModalDlg("", "Suche", "Bitte einen Suchbegriff eingeben.");
		}
		return false;

	});

	// Clear form fields on focus

	$("#txtsearchCustomer").focus(function() {
		$(this).val("");
	});

	$(document).on("click", "#searchul  a", function() {
		$("#searchul a.active").removeClass("active");
		$(this).addClass("active");
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

		//var screenHeight = $(window).height();
		//var margin = (screenHeight - imgHeight) / 2; + "px";
		//$(".popupimg").css("margin-top", margin);

		//			setTimeout(function () {
		//console.log($(".popupimg").height());
		//	}, 0);
		//

		return false;
	});


	$(document).on("click", "#btnCloseImg", function() {
		var imgHeight = $(".popupimg img").height();
		$(".overlay_img").removeClass("visible");
		$(".overlay_img").addClass("hidden");
	});




	//formmenu 

	$(document).on("click", "#formsul a", function() {
		var formId = $(this).attr("id");
		var currentForm = $(formXml).find('formdatas[formid="' + formId + '"]');


		$("#formscontainer").html($(currentForm).find("content").text());
		$("#formscontainer form").append('<input type="hidden" name="formid" value="' + formId + '">');
		$("#formscontainer form").append('<input type="hidden" name="customid" value="">');
		$("#formscontainer form").append('<input type="hidden" name="formvalid" value="">');
		$("#formscontainer form").append('<input type="hidden" name="userid" value="">');


		origForm = $("#formscontainer").html();
		var selection = $(currentForm).find("selection").text();
		var paramStr = "formid=" + $(this).attr("id") + "&customid=" + getCustomerData("kdnr") + "&userid=" + getCustomerData("userid");
		paramStr = paramStr + "&selection=" + selection;
		dataload("#formsval", paramStr);
		$("#windowsforms .page-header").find("span").first().text($(this).text() + " (" + getCustomerData("kdnr") + ")");

		setTimeout(function() {
			scrollforms.refresh();
		}, 200);

		//return false;		

	});

	// formvals

	$(document).on("click", "#formsvalul a", function() {

		function createFromVals(formvalId) {

			// reset formval
			var $formContainer = $("#formscontainer");
			$formContainer.html(origForm);

			var currentFormval = $(formvalXml).find('formvaldatas[formvalid="' + formvalId + '"]');

			$(formvalXml).find('formvaldatas[formvalid="' + formvalId + '"] formvalues').each(function() {
				var elemName = $(this).attr("name");
				var elemValue = $(this).attr("value");
				var formElem = $('#formscontainer form *[name="' + elemName + '"]');
				var elemType = $(formElem).attr('type');

				if ($(formElem).length > 0) {
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
						} else {
							$(formElem).prop("checked", false);
						}

						break;

					case "radio":
						if ($(formElem).val() == elemValue) {
							$(formElem).prop("checked", true);
						} else $(formElem).prop("checked", false);
						break;
				}

			});
			var customId = getCustomerData("kdnr");
			var exported = 0;

			if ($(currentFormval).length > 0) {
				customId = $(currentFormval).attr("customid");
				exported = $(currentFormval).attr("exported");
			}

			$formContainer.find('input[name="customid"]').val(customId);
			$formContainer.find('input[name="userid"]').val(getCustomerData("userid"));
			$formContainer.find('input[name="formvalid"]').val(formvalId);

		//	$formContainer.append('<div class="row"><div class="col-md-1 col-sm-1 col-xs-1"></div><div class="col-md-2 col-sm-3 col-xs-3" data-button="send"></div><div class="col-md-2 col-sm-3 col-xs-3" data-button="cancel"></div></div>');
			//var sendBtn = '<a href="#" name="formSend" class="btn btn-success btn-block">Speichern</a>';
			//var delBtn = '<a href="#" name="formDel" class="btn btn-danger btn-block">Löschen</a>';

			//if (exported == "0") {
			//	$formContainer.find('div[data-button="send"]').html(sendBtn);
			//	if (formvalId !== "NEW") {
			//		$formContainer.find('div[data-button="cancel"]').html(delBtn);
			//	}
			//}

			// Vorbelegung B_DATUM und E_DATUM
			if (formvalId == "NEW") {
				var date = new Date();
				currentDate = dateToStr(date, "g");
				$('#formscontainer form input[name="B_DATUM"]').val(currentDate);
				$('#formscontainer form input[name="E_DATUM"]').val(currentDate);
			}

		}

		
		var formvalId = $(this).attr("id");
		$("#formsvalul a.active").removeClass("active");
		$(this).addClass("active");
		setTimeout(function() {
			createFromVals(formvalId);
			
		}, 0);
		setTimeout(function() {

			scrollforms.refresh();
		}, 200);		

	});

	// formvals senden


	$(document).on("click", '#formscontainer a[name="formSend"]', function() {
		var validateOk = true;
		
		var $parentForm = $("#formscontainer form");
		 $parentForm.find('*[class~="validate"]').each(function() {
			var $this = $(this);
			if ($this.val() === "") {
				$this.css("background-color", "red");
				validateOk = false;
			} else {
				$this.css("background-color", "transparent");
			}

		});

		if (validateOk === true) {
			data = $parentForm.serialize();
			datastore("#btnSend", data);
		} else {
			openModalDlg("", "Fehler beim Erfassen", "Mindestens ein Pflichtwert wurde nicht erfasst. Bitte die rot markierten Felder ausfüllen.");
			$('#waitModal').hide();
		}		

		return false;

	});
	
	$(document).on("click", '#formscontainer a[name="formDel"]', function() {
		openModalDlg ("#confirmModal", "Erfasste Daten löschen", "Sollen die erfassten Daten wirklich gelöscht werden?", "formDel");
		return false;

	});	


// ##########  menu steuerung
	
	$(document).on("click", '#scrollmainmenu a[href="#windowumfeldanalyse"]', function() {
		setTimeout(function() {
			dataload("#map", 'customId=' + getCustomerData('kdnr') + '&lat=' + getCustomerData('geo_lat') + '&lng=' + getCustomerData('geo_lng'));
		}, 100);
		return false;
	});

	$(document).on("click", '#nlfmenu a[href="#windownlfaktuell"]', function() {
		$("#nlf_aktuell").children().remove();
		dataload("#getdatas", 'function=GetNlfg&Kdnr=' + getCustomerData('kdnr'));
	});

	$(document).on("click", '#scrollmainmenu a[href="#windowwerbemittel"]', function() {
		if (wmLoaded === false) {
			$("#contentWm").children().remove();
			dataload("#getdatas", 'function=GetWmBestand&Kdnr=' + getCustomerData('kdnr'));
		}
	});
	
	$(document).on("click", '#scrollkundendatenmenu a[href="#windowkundenprofil"]', function() {
		if (kdProfilLoaded === false) {
			$("#pdfcontainer").children().remove();
			dataload("#getdatas", 'function=GetKDProfil&kdnr=' + getCustomerData('kdnr'));
		}
	});

	$(document).on("click", '#topsellermenu a, #sortimentmenu a', function() {
		if (analyseLoaded === false) {
			$("#gettopsellerztgresult").children().remove();
			$("#gettopsellerztschrresult").children().remove();
			$("#getsortanaztgresult").children().remove();
			$("#getsortanaztschrresult").children().remove();			
			dataload("#getdatas", 'function=GetAnalyse&kdnr=' + getCustomerData('kdnr'));
		}
	});		
				
	
	$(document).on("click", '#scrollmainmenu a[href="#windowerfdaten"]', function() {
		var tableStr = "";
		console.log($("#erfdatentable"));
		$("#erfdatentable").children().remove();
		console.log($("#erfdatentable"));
		for (var key in editVals) {
			
			if ((typeof editVals[key] == "object") && (editVals[key].newvalue !== "")) {
				var btnStr = '<button class="btn btn-sm btn-danger editvaldel" data-editvalid = "' + key + '">' +
				'<span class="glyphicon glyphicon-remove"></span></button>';
				tableStr = tableStr + '<tr data-editvalid="' + key +'"><td>' + editVals[key].longname + '</td><td>' + editVals[key].oldvalue +
				'</td><td>' + editVals[key].newvalue + '</td><td>' + btnStr + '</td></tr>';
			}
			
		}
		
		if (tableStr !== "") {
			tableStr = "<tr><th></th><th>Alter Wert</th><th>Neuer Wert</th><th></th></tr>" + tableStr;

		}
		else {
			tableStr="<tr><td>Keine erfassten Daten vorhanden</td></tr>";
		}
		
		$("#erfdatentable").append(tableStr);	
		return false;
	});
	

	$(document).on("click", 'input[name="hideUmsAbs"]', function() {
		var $this = $(this);
		var checked = $this.prop("checked");
		var tableId = $(this).attr("data-table");
		var $table = $(tableId);
		$table.find('tr').each(function() {
			if (checked === true) {
				$(this).find("th, td").eq(-1).show();
				$(this).find("th, td").eq(-2).show();
			}
			else {
				$(this).find("th, td").eq(-1).hide();
				$(this).find("th, td").eq(-2).hide();
			}
		});	
	});	

	$(document).on("click", '#cbEpaNummer', function() {
		
		var checked = $(this).prop("checked");
		var $spanEpaNr = $('span[name="kust_epa_nr"]');
		if (checked === true) {
			$spanEpaNr.show();
		}
		else {
			$spanEpaNr.hide();
		}
	});	
	// ###### Menu Umfeldanalyse

	$('#btnMap').bind('click', function() {
		dataload("#map", 'customId=' + getCustomerData('kdnr') + '&lat=' + getCustomerData('geo_lat') + '&lng=' + getCustomerData('geo_lng'));
		return false;
	});

	$('#btnLogout').bind('click', function() {
		dataload("#logout", "logged_out=1");
		showWindow("#windowlogin");
		showMenu("#loginmenu", "l");

		return false;
	}); // end loginform
	
	
	// editable values
	$(document).on("click", 'a[class="value_edit"]', function() {
		var $this = $(this);
		var currentKey = $this.attr("id");
		editVals.setKey($this.attr("id"));
		var $editDlg = $("#editDlg");
		$editDlg.find("#editLongName").text(editVals[currentKey].longname);
	
		var fixedValue = editVals[currentKey].fixedvalue;
		if (fixedValue === "") {
			$("#editNewValue").show();
			$("#editNewValue").val("");
			$("#selectNewValue").hide();
		}
		else {
			$("#editNewValue").hide();
			var $selcetedValue = $("#selectNewValue");
			$selcetedValue.show();
			var fixArray = fixedValue.split(";");
			var optStr = "";
			var optSelIdx = -1;
			for(var l = 0; l< fixArray.length; l=l+2) {
				optStr = optStr + '<option value="' + fixArray[l] + '">' + fixArray[l+1] + '</option>';
				if (fixArray[l+1] == $this.text()) {
					optSelIdx = fixArray[l]; 
					
				}
			}
			$selcetedValue.children().remove();
			$selcetedValue.append(optStr);
			$selcetedValue.val(optSelIdx);
			console.log($selcetedValue);
		}
		$editDlg.find('div[class~="alert"]').hide();
		$editDlg.modal();
		return false;
	});



	
	// values speicher ok
	
	$('#btnEditDlgOk').click (function () {
		var $modalDlg = $(this).parents("#editDlg");
		var newValue = $modalDlg.find("#editNewValue").val();
		
		if (newValue === "") {
			$modalDlg.find('div[class~="alert"]').show();
			return false;
		}
		
		editVals.setNewVal(newValue);
		$("#" + editVals.getKey() + " span[class='value_edit_text']").text(newValue);

	});

	$('#btnEditDlgCancel').click (function () {
		//editValsIdx = "";
		//getEditVals();
	});

	$('#selectNewValue').change (function () {
		$('#editNewValue').val($('#selectNewValue option:selected').text());
	});
	
	$('#btnEditSend').click(function() {

		if (editVals.getCount() > 0) {
				openModalDlg("#confirmModal", "Daten senden", "Sollen die erfassten Daten gesendet werden?", "editSend");
		}
		else {
				openModalDlg("#alertModal", "Daten senden", "Keine erfassten Daten vorhanden!");
		}
	});	


	

	$(document).on("click", 'button[class~="editvaldel"]', function() {
		var $this = $(this);
		editVals.setKey($this.attr("data-editvalid"));
		var dlgText = "Soll die Eingabe '" + editVals.getNewVal() + "' wirklich gelöscht werden?";
		openModalDlg ("#confirmModal", "Erfasste Daten löschen", dlgText,"erfDel");
		return false;
	});
	
	// Title Link
	
	// editable values
	$(document).on("click", 'a[class="title-link"]', function() {
		
		var $this = $(this);
		var tnr = $this.attr("data-tnr");
		var kdnr = getCustomerData("kdnr");
		$("#bezugTnrName").text($this.text());
		$("#bezugTable").attr("data-tnr", tnr);
		dataload("#getdatas", "function=GetBezug&kdnr=" + kdnr + "&tnr=" + tnr);
		
		return false;
	});	
	
	$('#btnBezugDlgOk').click (function () {
		var $modalDlg = $("#bezugDlg");
		var newValue = $modalDlg.find("#bezugNewValue").val();
		
		if (newValue === "") {
			$modalDlg.find('div[class~="warning-value"]').show();
			return false;
		}
		
		var key = $("#bezugTable").attr("data-tnr");
		key = "bezug_" + key;
		editVals.setKey(key);
		editVals.del();
		editVals.create(key, "", $modalDlg.find("#bezugTnrName").text());
		editVals.setNewVal(newValue);

	});	


	

});