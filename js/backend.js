

	var paramxml;
	var userxml;
	var source;
	var exportObject = {};
    // load params
	
	/*
 * --------------------------------------------------------------------
 * jQuery-Plugin - $.download - allows for simple get/post requests for files
 * by Scott Jehl, scott@filamentgroup.com
 * http://www.filamentgroup.com
 * reference article: http://www.filamentgroup.com/lab/jquery_plugin_for_requesting_ajax_like_file_downloads/
 * Copyright (c) 2008 Filament Group, Inc
 * Dual licensed under the MIT (filamentgroup.com/examples/mit-license.txt) and GPL (filamentgroup.com/examples/gpl-license.txt) licenses.
 * --------------------------------------------------------------------
 */

	/*  dataload - main function for loading Datas and parameters;
	   called mainly from mnue click
	*/
	
    function dataload (target) {
		$('#overlay_wait').show();
		var data_string = "";

		data_string = "target="+target+'&action=load';
		switch (target) {
			case "#logout":
				data_string = data_string + "&logged_out=0";
			break;
		}
		console.log(data_string);

    	$.ajax({
	    type: 'POST',
	    dataType: 'xml',
	    url: 'php/backend.php',
	    data: data_string,
	    success: function(xml) {

			paramxml = xml;
			console.log(xml);
			// Users
			switch (target) {
				case "#nutzer":
					$("#formsuser tr").remove();
					$(xml).find('forms').each(function(){
						var formId =  $(this).find("FormId").text();

						tableRow = '<tr><td>'+ $(this).find("Name").text() + '</td>';
						tableRow = tableRow +'<td><input type="checkbox" name="formsuser_' + formId + '"></td></tr>';
						//tableRow = tableRow +'<td><input type="checkbox" name="formsuser_' + formId + '" value="' + 'bla' + '></td></tr>';

						$("#formsuser").append(tableRow);
					});
					
					userxml = $(xml).find("users");
					$('#userlist option').remove();
					$('#userlist').append('<option value="NEW">#Neuer Nutzer</option>');
					$('#frmUser select option[value="1"]').attr("selected", "selected");
					$('#frmUser input[name="Lastname"]').removeAttr('disabled');
					$('#frmUser select[name="Group"]').removeAttr('disabled');
					$('#btnUserDel').removeAttr('disabled');
					$('#changePwd').prop("checked", false);
					$('#frmUser input[name="Password"]').attr("disabled", "disabled");
					$('#frmUser input[name="Password_repeat"]').attr("disabled", "disabled");
					
					$(xml).find('users').each(function(){
		
						$('#userlist').append('<option value="' + $(this).find('userid').text() + '">' + $(this).find('lastname').text() + '</option>');
						$('#frmUser input').val("");
						$('#frmUser input[name="UserId"]').val("NEW");
						$('#frmUser input[name="UserDel"]').val("false");

					}); // find.formvalues
					$('#frmUser input[name="UserIdShow"]').val("NEW");
				break;
				case "#logout":
					$('#content').hide();
					$('#footer').hide();
					$('#overlay').show();
				break;
				case "#formdaten":
					console.log(xml);
					exportObject = {};
					var last_select = $('#formDatenAuswahl option:selected').val();
					$(xml).find('forms').each (function (){
						var formId = $(this).find('formid').text();
						if ($('#formDatenAuswahl option[value="' + formId + '"]').length == 0 ) {
							$('#formDatenAuswahl').append('<option value="' + formId + '">' + $(this).find('name').text() + '</option>');
						}

					$('#formDatenAuswahl').click();
					
					// Create Header
					var formContent = $(this).find('content').text();
					var exportElems = "";
					$(formContent).find('input[type!="submit"], select, textarea').each(function(){
						var element_id = $(this).attr('id');
						
						var element_name = $(this).attr('name');
						var element_type = $(this).attr('type');
						//var element_type = $(this).attr('type');
						var thead_text = element_name;
						
						var element_label = $(formContent).find('label[for="' + element_id + '"]');

						if (element_type == "radio") {
							//create radio - container; change val into 'label for' if possible; select first 'label for' as head
							if (element_label.length > 0) {
								
								$(this).text(element_label.text());
							}
							
							
							element_label = $(formContent).find('label[for="' + element_name + '"]');
								//$('#Form_' + formId).append($(this));
							
						}
					
						if ($.trim(element_label.text()) !="") {
							thead_text = element_label.text();
							thead_text = thead_text.replace(/(\r\n|\n|\r)/gm," ");
					
						}

						//if ($('#formTable' + formId + ' thead tr th[name="' + element_name + '"]').length  == 0 ) {
						//	$('#formTable' + formId + ' thead tr').append('<th name="' + element_name + '">' + thead_text + '</th>');
							//table_row_id = table_row_id + "<th>" + element_name + "</th>";
							exportElems = exportElems + element_name + "=" + encodeURIComponent(thead_text) + ";";
					//	}						
						
						
						
					});
					
					exportObject[formId] = exportElems;
										});
					console.log(exportObject);

					$('#formDatenAuswahl option').each (function () {
						if ($(this).val() == last_select) {
							$(this).attr('selected', 'selected');
							
						}	
					});
					
					
					break;
							
				
			}
			$('#overlay_wait').hide();
	    },
				
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
		alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
		console.log (" error " + textStatus);
		console.log (XMLHttpRequest);
		$('#overlay_wait').hide();
		
	    } 
	}); // end ajax
    }
	
	
		/*  datalstore - main function for saving Datas and parameters;
	   called mainly from btnStore
	*/
	
	function datastore (target) {
				
		//build data string
		var datastring = "";
		validate_ok = true;
		switch (target) {
			case "#allgemein":
				datastring = $('#frmAllgemein').serialize() + '&target=' + target + '&action=store';
				console.log("ds " + datastring);
				break;
			case "#nutzer":
				// validate
				// no validates on Delete
				var userName = $('#frmUser input[name="Username"]').val();
				console.log("username-" + userName +"-");
				var password = $('#frmUser input[name="Password"]').val();
				var pwRepeat = $('#frmUser input[name="Password_repeat"]').val();
				if ($('#frmUser input[name="UserDel"]').val() == "false") {
					if (userName == "") {
						alert ("Bitte Nutzernamen eingeben");
						validate_ok=false;
					}
					if ($('#frmUser input[name="Lastname"]').val() == "") {
						alert ("Bitte Nachnamen eingeben");
						validate_ok=false;
					}
					if ($('#changePwd').prop("checked") == true) { 
						if (password == "") {
							alert ("Bitte Passwort eingeben");
							validate_ok=false;
						}
						if (password != pwRepeat) {
							alert ("Die Passwortwiederholung stimmt nicht");
							validate_ok=false;
						}
					}
				}
				
				if (validate_ok == true) {
					$('#frmUser input[name="Lastname"]').removeAttr('disabled');
					$('#frmUser select[name="Group"]').removeAttr('disabled');
					$('#btnUserDel').removeAttr('disabled')
					if ($('#changePwd').prop("checked") == true) { 
						var pwmd5 = hex_md5(userName + password);
						$('#frmUser input[name="Password"]').val(pwmd5);
						$('#frmUser input[name="Password_repeat"]').val(pwmd5);
					}
					datastring = $('#frmUser').serialize() + '&target=' + target + '&action=store';
					console.log(datastring);
				}
				break;
			
			case "#formneu":
				// validates
				if ($('#formClear').html() == "") {
						alert ("Kein Formular geladen");
						validate_ok=false;
				}
				if ($('#frmParam input[name="formname"]').val() == "") {
						alert ("Bitte Formularnamen eingeben");
						validate_ok=false;
				}
				$('#formClear input[type="submit"]').removeAttr('disabled');
				datastring = $('#frmParam').serialize() + '&Content=' + encodeURIComponent($('#formClear').html()) + '&target=' + target + '&action=store';
				break;
			case "#formdata_del":
				datastring ='formiddel=' + $('#formDatenAuswahl option:selected').val() + '&target=#formdata_del&action=store';
				// set target for dataload
				target = "#formdaten";
			break;
			
			case "#form_del":
				datastring ='form_del_FormId=' + $('#formVerwAuswahl option:selected').val() + '&target=#form_del&action=store';
				// set target for dataload
				target = "#formverw";
				break;
			
			case "#tour_del":
				datastring ='tour_del_TourId=' + $('#formTourAuswahl option:selected').val() + '&target=#tour_del&action=store';
				datastring = datastring + '&tour_del_type=' + $('input[name="tourdelcustom"]:checked').val() 
				// set target for dataload
				target = "#tourdaten";
				break;


		
		}
		
		if (validate_ok == true) {
			$.ajax({
				type: 'POST',
				url: 'php/backend.php',
				data: datastring,
								
				success: function(xml) {
					alert ($(xml).find('data msg').text());
					console.log(xml);
					dataload(target);
				},
						
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
					alert(XMLHttpRequest.responseText);
					console.log (" error " + textStatus);
					console.log (XMLHttpRequest);
				} 
			}); // end ajax
		}
    }
	

	
	/* msgbox show msg as popup - window
	*/
	
	function msgbox (source, content) {
		var doc_h = $(document).height();
		var doc_w = $(document).width();
		$('#overlay').fadeIn(100).height(doc_h).width(doc_w);
		$('#overlay .inner').html(content);
	}
	
	/* msgbox_yes, msgbox_no
	  answer functions for msgbox
	*/
	function msgbox_yes (source) {
		
		if (source == "#nutzer") {
			datastore(source);
		}
		
		if (source == "#formdata_del") {
			datastore (source);
		}
		
		if (source == "#form_del") {
			datastore (source);
		}
		

	}
	function msgbox_no (source) {
		return true
	}
	
	/* ajaxFileUpload
	  load files with forms
	*/

	function ajaxFileUpload() {
		
		//starting setting some animation when the ajax starts and completes
		$("#loading")
		.ajaxStart(function(){
			$(this).show();
		})
		.ajaxComplete(function(){
			$(this).hide();
		});
		
		$.ajaxFileUpload (
			
			{
				url:'php/form_upload.php', 
				secureuri:false,
				fileElementId:'fileToUpload',
				type: 'POST',
				success: function (xml)	{
					var xml_error = $(xml).find('error');
					if ($(xml_error).length > 0) {
						alert ($(xml_error).text());
						$('#formZeigen').hide();
						$('#formdivParam').hide();
					}
					
					var xml_form = $(xml).find('form');
					if ($(xml_form).length > 0) {
						
						$('#formOriginal form').remove();
						$('#formOriginal').append($(xml_form).text());
						$('#formClear form').remove();
						$('#formClear').append('<form></form>');
						var l = 0
						
						//var count = $('#formOriginal').find('input[type!="hidden"], textarea, select, p, h1, h2, h3, h4 , label').length;
						//count = count / 2;
						//console.log ("count: " + count);
						$('#formOriginal').find('input[type!="hidden"], textarea, select, p, h1, h2, h3, h4 , label').each(function(){
	
							$('#formClear form').append($(this));
							
						});
						// remove whtie spaces in id, name and for - attr before and after
						$('#formClear').find('[id], [name], [for]').each(function(){
							if ($(this).attr('id') != "") $(this).attr('id', $.trim( $(this).attr('id')));
							if ($(this).attr('name') != "") $(this).attr('name', $.trim( $(this).attr('name')));
							if ($(this).attr('for') != "") $(this).attr('for', $.trim( $(this).attr('for')));
						});
						
						$('#formClear').find('input[type!="submit"], textarea, select').wrap('<ul><li></ul></li>');
						//checkboxes; radio 
						$('#formClear').find('input[type="checkbox"], input[type="radio"]').each(function(){
							var chkbox_id = $(this).attr('id');
							
							var chkbox_label =  $('#formClear').find('label[for="' + chkbox_id + '"]');
							//$(chkbox_label).wrap('<p></p>');
							
							$(chkbox_label).css('padding-left','10px');
							var chkbox_parent = $('#'+chkbox_id).parent();
							$(chkbox_parent).append(chkbox_label);
							
							// no toggle
							// $(this).wrap('<div  class="toggle" style="float:left;"></div>');
						});
						//submit-button
						
						if ($('#formClear form input[type="submit"]').length == 0){
							// we don't have a submit - Button
							$('#formClear form').append('<input type="submit" name="submit">');
						}

						$('#formClear input[type="submit"]').addClass('whiteButton');
						$('#formClear input[type="submit"]').val("Senden");
						$('#formClear input[type="submit"]').attr('disabled', 'disabled');
						//
						//$('#formClear input').removeAttr('size');


						var checkId = true;
						$('#formClear form [id]').each(function(){
							var ids = $('[id="'+this.id+'"]');
							console.log (this.id);
							if(ids.length>1 && ids[0]==this) {
								alert ("Doppelte ID: " + this.id + ". Bitte korrigieren und Formular erneut laden");
								checkId = false;
							}
						});
						
						if (checkId == true ) {
							$('#formZeigen').show();
							$('#frmParam input').val('');
							alert ("Formular wurde erfolgreich geladen");
						}
						else {
							// $('#formClear form').remove();
						}
					}
				},
				error: function (xml)
				{
					console.log("upload err" );
					alert(xml);
				}
			}
		)
		
		return false;

	}  
	
	
	
	/* ajaxFileUpload
	  load files with customs, bounded on forms
	*/
	function customsFileUpload() {
		console.log("upl start");
		//starting setting some animation when the ajax starts and completes
		//$("#loading")
		//.ajaxStart(function(){
		//	$(this).show();
		//})
		//.ajaxComplete(function(){
		//	$(this).hide();
		//});
		var data_array = new Array ();
		data_array ['FormId'] = $('#formVerwAuswahl option:selected').val();
		data_array ['action'] = "load";
		data_array ['target'] = "#customUpload";
		data_array ['tourname'] = $('#tourformname').val();
		data_array ['touruser'] = $('#customUserAuswahl option:selected').val();
		console.log(data_array);
		$.ajaxFileUpload (
			
			{
				url:'php/backend.php', 
				secureuri:false,
				fileElementId:'customFile',
				type: 'POST',
				data: data_array,
				success: function (xml)	{
					console.log($(xml));
					var xml_error = $(xml).find('error');
					if ($(xml_error).length > 0) {
						alert ($(xml_error).text());
					}
					
					var xml_msg = $(xml).find('msg');
					if ($(xml_msg).length > 0) {
						alert ($(xml_msg).text());
						}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
					alert(XMLHttpRequest.responseText);

				} 
			}
		)
		
		return false;

	}
	
	function customsTourUpload() {
		
		//starting setting some animation when the ajax starts and completes
		$("#loading")
		.ajaxStart(function(){
			$(this).show();
		})
		.ajaxComplete(function(){
			$(this).hide();
		});
		var data_array = new Array ();
		data_array ['tourname'] = $('#inputTourCreate').val();
		data_array ['action'] = "load";
		data_array ['target'] = "#tourUpload";
		$.ajaxFileUpload (
			
			{
				url:'php/backend.php', 
				secureuri:false,
				fileElementId:'customTour',
				type: 'POST',
				data: data_array,
				success: function (xml)	{
					console.log($(xml));
					var xml_error = $(xml).find('error');
					if ($(xml_error).length > 0) {
						alert ($(xml_error).text());
					}
					
					var xml_msg = $(xml).find('msg');
					if ($(xml_msg).length > 0) {
						alert ($(xml_msg).text());
						}
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
					alert(XMLHttpRequest.responseText);

				} 
			}
		)
		
		return false;

	} 
	
	// set Test fields in Form 
	
	function setFormLink() {
		var form_link = "http://www.vvberlin-online.de/TEST/vv/101214/i4PoS2go/index.php?Form=" + $('#formVerwAuswahl option:selected').val();
		$('#txtFormLink').val(form_link);
		$('#frmFormMail [name="formMailSubject"]').val( $('#formVerwAuswahl option:selected').text());
		$('#frmFormMail [name="formMailBody"]').val("Bitte Daten für das Formular :\n" + form_link + "\n erfassen");
		
		
	}

	/* dom loaded!!!!!
	*/

$(document).ready(function() {
	
	/* set first menu entry active	*/
	//$('#menu li a:first').addClass('active');
	
	// create login - dialog
	var loginMsgBox = $('#overlay_login').html();
	msgbox("",loginMsgBox);
	$('.scrollable > div').hide();
	/*
	  menu click fuunction
	*/
	
	$('#menu li a').click (function () {
		$('#menu li a').removeClass('active'); 
		source = $(this).attr('href');
		//dataload(source);
		$(this).addClass('active');
		
		//hack for ie - kotz

		if ($('#browser').text() == "MSIE") {
			$('#primary div').hide();
			$(source).css('min-height', '500px');
			$(source).show();


		}

			
	});

	
	/*
	 msgbox click function
	*/
	
	$('#overlay .inner button').on ('click', function () {
		console.log("btnclick");
		$('#overlay').hide();
	
		if ( $(this).attr('name') == "btnYes" ) {
			msgbox_yes(source);
		}
		
		if ( $(this).attr('name') == "btnNo" ) {
			msgbox_no(source);
		}
	});

	
	/* Loginform
	  
	*/
	
	$('#loginform').submit (function() {
		
		var login_status = 0;
		var username = $('#username').val();
		var password = $('#password').val();
		var pwmd5 = hex_md5(username + password);
		var data_string = 'filter=login&username=' + $('#username').val() + '&password=' + pwmd5 + '&logged_in=0';
		$('#overlay_wait').show();

		$.ajax({
			type: 'POST',
			dataType: 'xml',
			url: 'php/backend.php',
			data: data_string,
			success: function(xml) {
				var return_status = $(xml).find('status');
				var login_status = $(return_status).find('logged_in').text();
				if (login_status == 0) {
					//console.log(login_status);
					// login failed
					alert (return_status.children('msg').text());
				}
							
				else {
					// check group for admnin
					
					if (return_status.children('group').text() != "10") {
						alert ("Sie haben keine Administrator-Berechtigung");
					}
					else {
					$('#content').show();
					$('#footer').show();
					$('#overlay').hide();
					$('#menu li a[href="#nutzer"]').click ();
						//$('#allgemein').hide();
						//$('#nutzer').hide();
						//$('#formverw').hide();
					}

				}
				$('#overlay_wait').hide();
			},
					
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
				$('#overlay_wait').hide();
			} 
		}); // end ajax

	return false;
    }); // end loginform
	/*
	 menu Parameter
	*/	
	$('#btnReloadParams').click (function () {
		dataload("#allgemein");
	});
	$('#btnParamStore').click (function () {
		datastore("#allgemein");
	});		
	
	/*
	 menu Nutzerverwaltung
	*/
	
	$('#btnReloadUser').click (function () {
		dataload("#nutzer");
	});
	
	$('#userlist').click (function () {
		
		$('#frmUser input').val("");
		$('#frmUser input[name="UserId"]').val("NEW");
		$('#frmUser input[name="UserDel"]').val("false");
		$('#frmUser select option[value="1"]').attr("selected", "selected");
				
		$('#frmUser input[name="Lastname"]').removeAttr('disabled');
		$('#frmUser select[name="Group"]').removeAttr('disabled');
		$('#btnUserDel').removeAttr('disabled');
		
		$('#changePwd').prop("checked", false);
		$('#frmUser input[name="Password"]').attr('disabled', 'disabled');
		$('#frmUser input[name="Password_repeat"]').attr('disabled', 'disabled');
		var userId = $(this).val();
		$(userxml).find('userid').each (function (){
		
			if ($(this).text() == userId) {
				var userparent = $(this).parent();
				$('#frmUser input[name="Firstname"]').val($(userparent).find("firstname").text());
				$('#frmUser input[name="Lastname"]').val($(userparent).find("lastname").text());
				$('#frmUser input[name="Username"]').val($(userparent).find("username").text());
				$('#frmUser input[name="Email"]').val($(userparent).find("email").text());

				//$(userparent).find('*').each (function () {
				//	var node_name = (this).nodeName;
				//	$('#frmUser input[name="' + node_name + '"]').val($(this).text());
				//});
				
				var group = $(userparent).find("group").text();
				console.log(group);
				if (group == "0") {
					group = "1";
				}
				
				//$('#frmUser select option[value="' + group + '"]').attr("selected", "selected");
				$("#frmUser select").val(group);
				
				// disable admin Lastname
				if($('#frmUser input[name="Lastname"]').val() == "admin") {
					$('#frmUser input[name="Lastname"]').attr('disabled', 'disabled');
					$('#frmUser select[name="Group"]').attr('disabled', 'disabled');
					$('#btnUserDel').attr('disabled', 'disabled');
				}
				
			}
		});
		$('#frmUser input[name="UserDel"]').val("false");
		$('#frmUser input[name="UserId"]').val(userId);
		$('#frmUser input[name="UserIdShow"]').val(userId);
	});
		
	$('#btnUserStore').click (function () {
		datastore("#nutzer");
	});

	$('#btnUserDel').click (function () {
		var userId = $('#frmUser input[name="UserId"]').val();
		if (userId == "NEW") {
			alert ("Bitte einen Benutzer auswählen");
			
		}
		
		else {
			$('#frmUser input[name="UserDel"]').val("true");
			if (confirm("Möchten Sie den Nutzer " + $('#userlist option:selected').text() + " löschen?") == true) {
				var params= "UserDel=true&UserId=" + userId;
				datastore("#nutzer", params);
		
			}
			
//			var showText = "Möchten Sie den Nutzer " + $('#userlist option:selected').text() + " löschen?";
			//msgbox("userDel",'<p>' + showText + '</p><button type="button" name="btnYes" value="Ja">Ja</button><button type="button" name="btnNo" value="Nein">Nein</button>');
		}
	});
	
	
	$('#changePwd').click (function () {
		if ($(this).prop("checked") == true) {
			console.log($(this).prop("checked")+"true");
			$('#frmUser input[name="Password"]').removeAttr("disabled");
			$('#frmUser input[name="Password_repeat"]').removeAttr("disabled");
		}
		
		else {
			$('#frmUser input[name="Password"]').attr("disabled", "disabled");
			$('#frmUser input[name="Password_repeat"]').attr("disabled", "disabled");
		
		}
	});
	
	/*
	  Menu Formular erstellen
	*/

	
	$('#frmFormNeu').submit  (function () {
		$('#formZeigen').hide();
		$('#formClear').hide();
		ajaxFileUpload();
		return false;

	});	
	
	// load forms bound customs
	$('#btnCustoms').click  (function () {
		if ($('#formVerwAuswahl option:selected').val() == undefined) {
			alert ("Bitte ein Formular auswählen");
			return false;
		}		
		customsFileUpload();
		return false;

	});
	
	/*
	  Menu Formulare verwalten
	*/	

	$('#btnReloadFormVerw').click (function () {
		dataload("#formverw");
	});
	
	$('#formVerwAuswahl').click (function () {
		// set direct Form Link
		setFormLink();
		
	
	});
	
	$('#btnFormVerwDel').click (function () {
		if ($('#formVerwAuswahl option:selected').val() == undefined) {
			alert ("Bitte ein Formular auswählen");
			return false;
		}
		if (confirm ("Möchten Sie das Formular " + $('#formVerwAuswahl option:selected').text() + " wirklich löschen?") == true) {
			datastore("#form_del");
		}
	});
	

	/*
	  Menu Formulardaten
	*/	
	$('#btnReloadFormdaten').click (function () {
		dataload("#formdaten");
	});
	
	$('#formDatenAuswahl').click (function () {
		var currentFormId = $(this).val();
		var countSet = 0;
		var exportedSet = 0;
		console.log(currentFormId);
		console.log($(paramxml).find('formsval[formid="75"]'));
		$(paramxml).find('formsval[formid="' + currentFormId + '"]').each (function (){
			console.log(this);
			var exportType = $(this).find("export").text();
			var setCount = parseInt($(this).find("count").text(), 10);
			
			countSet = countSet + setCount;
			
			if(exportType >= "1") {
				exportedSet = exportedSet + setCount;
			}
		});
		$('#countSet').text(countSet);
		$('#exportedSet').text(exportedSet);

	});
	
	$('#btnFormDatenAkt').click (function () {
		var current_formId = $(this).val();
		$('table#formTable' + current_formId + ' >tbody >tr').remove();
		console.log(row_len);
		var row_len = $('table#formTable' + current_formId + ' >tbody >tr').length;
			console.log(row_len);
		dataload('#formdaten');
	
	});

	$('#formZeigen').click (function () {
		$('#formClear').show();
	});
	
	//
	//$('#frmFormCSV').submit (function () {
	//	
	//	//function replaceCR (string,text,by) {
	//	//			// Replaces text with by in string
	//	//	var strLength = string.length, txtLength = text.length;
	//	//	if ((strLength == 0) || (txtLength == 0)) return string;
	//	//
	//	//	var i = string.indexOf(text);
	//	//	if ((!i) && (text != string.substring(0,txtLength))) return string;
	//	//	if (i == -1) return string;
	//	//
	//	//	var newstr = string.substring(0,i) + by;
	//	//
	//	//	if (i+txtLength < strLength)
	//	//		newstr += replaceCR(string.substring(i+txtLength,strLength),text,by);
	//	//
	//	//	return newstr;
	//	//}
	//	//
	//	//var data_string = "";
	//	//var data_key = "";
	//	//
	//	//// create head
	//	//$('#formdivtable_show table tr').find('th[name!="FormvalId"]').each (function () {
	//	//	data_string = data_string + replaceCR($(this).text(),';',' ') + ';';
	//	//});
	//	//console.log(data_string);
	//	//
	//	////create body
	//	//var row_filter = '';
	//	//
	//	//if ($('#frmFormCSV input[name="export"]:checked').val() == "new") {
	//	//	row_filter = '[class="new"]';
	//	//	
	//	//}
	//	//
	//	//$('#formdivtable_show table tr' + row_filter).each (function () {
	//	//	$(this).find('td').each (function () {
	//	//		if ($(this).hasClass('table_id') == true) {
	//	//			data_key += $(this).text() + ',';
	//	//		}
	//	//		else {
	//	//			// parse text
	//	//			var td_text = $(this).text();
	//	//			td_text = replaceCR (td_text,';',' ');
	//	//			td_text = replaceCR (td_text,'\r','');
	//	//			td_text = replaceCR (td_text,'\n','');
	//	//			data_string = data_string + td_text + ';';
	//	//			
	//	//		}
	//	//	
	//	//	});
	//	//	data_string += "\n";
	//	//});
	//	//
	//	//$('#inputFormCSV_data').val(data_string);
	//	//$('#inputFormCSV_expKey').val(data_key);
	//	
	//	return true;
	//		
	//});
	
	$('#frmFormCSV').submit (function () {
		//console.log("frmData submit");
		//function replaceCR (string,text,by) {
		//			// Replaces text with by in string
		//	var strLength = string.length, txtLength = text.length;
		//	if ((strLength == 0) || (txtLength == 0)) return string;
		//
		//	var i = string.indexOf(text);
		//	if ((!i) && (text != string.substring(0,txtLength))) return string;
		//	if (i == -1) return string;
		//
		//	var newstr = string.substring(0,i) + by;
		//
		//	if (i+txtLength < strLength)
		//		newstr += replaceCR(string.substring(i+txtLength,strLength),text,by);
		//
		//	return newstr;
		//}
		//
		//function fillZero (string, count) {
		//
		//	string = $.trim(string);
		//	var strLen = string.length;
		//	
		//	while (string.length < count) {
		//		string = "0" + string;
		//
		//	}
		//	return string;
		//	
		//}
		//
		//
		//var iDStr = "";
		//var dataSr = "";
		//var currentFormId = $('#formDatenAuswahl').val();
		//$('#frmFormData input[name="formid"]').val(currentFormId);
		//
		//var formContent;
		////var exportContent = $('<exports></exports>');
		//
		//// search From
		//$(paramxml).find('forms').each (function (){
		//		var formId = $(this).find('FormId').text();
		//		if (currentFormId == formId) {
		//			formContent = $(this).find('Content').text();
		//			return;
		//		}
		//});
		//$('#exportContainer input').remove();
		//// create export container
		//var elemNames = "";
		//$(formContent).find('input[class="export"]').each (function (){
		//	//$(this).attr('type','text');
		//	elemNames = elemNames + $(this).attr('name') + ";";
		//	
		//});
		//			console.log("elemnames");
		//	console.log (elemNames);
		//
		//console.log($('#frmFormData input[name="elemnames"]').length);
		//$('#frmFormData input[name="elemnames"]').val(elemNames);
		//
		//// for each stored Data Set; update Values in export Container;
		//// output Data
		//var exportStr = "";
		//var dataKey = "";
		var returnStatus = true;
		var currentFormId = $('#formDatenAuswahl').val();
		
		console.log(currentFormId);
		if (currentFormId == null) {
			alert ("Bitte einen Bogen auswählen");
			returnStatus = false;
			
		}
		$('#inputFormCSV_expKey').val(exportObject[currentFormId]);
		$('#frmFormCSV input[name="formid"]').val(currentFormId);
		
		var countSet = parseInt($('#countSet').text(), 10);
		if (countSet == NaN) {
			countSet = 0;
		}
		var countExport = $('#exportedSet').text();
		if (countExport == NaN) {
			countExport = 0;
		}

		
		if (countSet == 0) {
			alert ("Keine erfassten Daten zum Export vorhanden");
			returnStatus = false;
			
		}
		else if ((countSet == countExport) && ($('input[name="export"]:checked').val() == "new")) {
			alert ("Keine neu erfassten Daten vorhanden.\n Es können nur bereits exportierte Daten geladen werden");
			returnStatus = false;
			
		}
		
		return returnStatus;
		
			
	});


	$('#btnFormDel').click (function () {
		
		if (confirm ("Möchten Sie die Daten wirklich löschen?") == true) (
			datastore ("#formdata_del")
		)
	});
	
	

	/*
	  bn Store
	*/
	
	// form Tourverwaltung

	$('#btnReloadTourdaten').click (function () {
		dataload("#tourdaten");
	});
	

	
	// load forms bound tours
	$('#btnTour').click  (function () {
		var formId = $('#formTourErstellen').val();
		console.log(formId);
		if (formId == null) {
			alert ("Bitte ein Formular auswählen");
			return false;
		}
		
		
		
		var tourName = $('#inputTourCreate').val();
		if ($("#formTourErstellen option:contains('" + tourName + "')").length > 0) {
			alert ("Die Tourbezeichnung existiert bereits, bitte eine neue vergeben");
			return false;
		}
		
		
		
		
		var formName = $('#formTourErstellen option:selected').text();
		if (confirm("Soll die Tour für das Formular " + formName + " erstellt werden?") == false) {
			return false;
		}
		
		console.log ("tour file");
		console.log($('#inputTourCreate').val());
		customsTourUpload();
		return false;

	});
	
	$('#formTourAuswahl').click (function () {
		console.log("tour click");
		var currentTourId = $(this).val();
		console.log("currentTourId");
		console.log(currentTourId);
		var countTour = 0;
		var countTourCollect = 0;
		
		var currentTour = $(paramxml).find('tours[tourId="' + currentTourId + '"]');
		console.log(currentTour);
		$('#countTour').text($(currentTour).find('count').text());
		$('#countTourCollect').text($(currentTour).find('countcollect').text());
		
		if (currentTourId == 0) {
			$("input[name=tourdelcustom][value=yes]").prop('checked', true);
			$("input[name=tourdelcustom]").attr("disabled", "disabled");
			
		}
		else {
			$("input[name=tourdelcustom]").removeAttr("disabled");
		}
	});
	
	
	$('#btnTourDel').click (function () {
		
		var currentTourId = $('#formTourAuswahl option:selected').val();
		console.log(currentTourId);
		if (currentTourId == undefined) {
			alert ("Bitte eine Tour auswählen");
			return false;
		}


		
		var confirmText = ""
		var countTour = parseInt($('#countTour').text(), 10);
		var countTourCollect = parseInt($('#countTourCollect').text(), 10);
		if (countTourCollect < countTour) {
			confirmText = "Die Tour wurde noch nicht vollständig erfasst.\n";
		}
		
		if ($('input[name="tourdelcustom"]:checked').val() == "yes") {
			confirmText = confirmText + "Alle zugeordneten Kunden werden gelöscht!\n"
		}
		else {
			confirmText = confirmText + "Alle zugeordneten Kunden werden freigegebn und nicht gelöscht!\n"
			
		}
		confirmText = confirmText + "Möchten Sie die Tour " + $('#formTourAuswahl option:selected').text() + " wirklich löschen?"
		if (currentTourId == 0) {
			confirmText = "Möchten Sie wirklich alle nicht zugeordneten Kunden löschen?"
		}
		
		if (confirm(confirmText) == true) {
			datastore('#tour_del');

		}
	});
	
	
	$('#frmSearch').submit (function () {

		if ( ($('#searchCustom').val() == "") && ($('#searchTour').val() == "") && ($('#searchUserId').val() == "")) {
			alert ("Bitte EPA-Nummer / Tour und / oder HB-Kennung eingeben");
			return false;
		}
		else {
			dataload('#datasearch');
		}
		return false;
	});
		

	$('.searchresult').click (function () {
		var nameAttr = $(this).attr("name");
		$('.scrollable > div').hide();
		$("#" + nameAttr).show();
		console.log("searchresult " + nameAttr);
	});	
	
	$('#formsvalAuswahl').click (function () {
		var currentId = $(this).val();
		console.log(currentId);
		$('#formsvalvalueDiv div').hide();
		$('#formsvalvalueDiv div[id="' + currentId + '"]').show();
		
	});
	
	$('#btnReloadFormdaten').click (function () {
		dataload("#formdaten");
	});	
	
	
	$('#btnLogout').click (function () {
		dataload("#logout");
	});
	
	
/* -------------------------------------------------------------- */
});
