
	var paramxml;
	var source;
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

	
	
    function dataload (target) {
		
		//$('.overlay_wait').fadeIn(600);
		var data_string = "";
		
		
		data_string = "filter="+target;
		if ($('#formDatenAuswahl option:selected').length !=0) {
			data_string = data_string + "&FormId=" + $('#formDatenAuswahl option:selected').val();
			
			
		}
		
		
		
    	$.ajax({
	    type: 'POST',
	    dataType: 'xml',
	    url: 'php/param_load.php',
	    data: data_string,
	    			
	    success: function(xml) {
			
			paramxml = xml;
			// Users
			switch (target) {
				case "#allgemein":
					$(xml).find('paramGroup').each (function (){
						if ($(this).text() == 'allgemein') {
							var paramParent = $(this).parent();
							var paramName = $(paramParent).find('paramName');
							var paramValue = $(paramParent).find('paramValue');
							$('#frmAllgemein input[name="' + $(paramName).text() + '"]').val($(paramValue).text());
						}
						});
					$('.overlay_wait').hide();
					break;
					
				case "#nutzer":
					$('#userlist option').remove();
					$('#userlist').append('<option value="NEW">#Neuer Nutzer</option>');
					$('#frmUser select option[value="1"]').attr("selected", "selected");
					$('#frmUser input[name="Lastname"]').removeAttr('disabled');
					$('#frmUser select[name="Group"]').removeAttr('disabled');
					$('#btnUserDel').removeAttr('disabled')
						
					$(xml).find('users').each(function(){
		
						$('#userlist').append('<option value="' + $(this).find('UserId').text() + '">' + $(this).find('Lastname').text() + '</option>');
						$('#frmUser input').val("");
						$('#frmUser input[name="UserId"]').val("NEW");
						$('#frmUser input[name="UserDel"]').val("false");
					
					}); // find.formvalues
					$('.overlay_wait').hide();
					break;
				
					case "#formdaten":
					
						
//							var current_formId = $(this).val();
		// if ($('table#formTable' + current_formId).length== 0){
			// create table header
			$(xml).find('forms').each (function (){
				var formId = $(this).find('FormId').text();
					// create Dropdown List
					if ($('#formDatenAuswahl option[value="' + formId + '"]').length == 0 ) {
						$('#formDatenAuswahl').append('<option value="' + formId + '">' + $(this).find('Name').text() + '</option>');
					}		
				
				if ($('table#formTable' + formId).length== 0) {
					var table_row_id = "";  // row for Id
					
							
					$('#formdaten').append('<div style="display:none;" id="Form_' + formId + '"></div>');
					var div_content = '<div style="display:none;">' + $(this).find('Content').text() + '</div>';
									
					// create placeholder and table
	
					$('#formdivtable_hide').append('<table id="formTable' + formId +'"><thead><tr></tr></thead></table>');
									
					// create id-column
					$('#formTable' + formId + ' thead tr').append('<th style="display:none;" name="FormvalId">FormvalId</th>');
					$('#formTable' + formId + ' thead tr').append('<th name="CustomId">Customer</th>');
									
					// create Id-row; first blank for customId
					table_row_id = "<th></th>";
					
					var exportElems = "";
					$(div_content).find('input[type!="submit"], select, textarea').each(function(){
						var element_id = $(this).attr('id');
						
						var element_name = $(this).attr('name');
						var element_type = $(this).attr('type');
						//var element_type = $(this).attr('type');
						var thead_text = element_name;
						
						var element_label = $(div_content).find('label[for="' + element_id + '"]');

						if (element_type == "radio") {
							//create radio - container; change val into 'label for' if possible; select first 'label for' as head
							if (element_label.length > 0) {
								
								$(this).text(element_label.text());
							}
							
							
							element_label = $(div_content).find('label[for="' + element_name + '"]');
								//$('#Form_' + formId).append($(this));
							
						}
					
						if ($.trim(element_label.text()) !="") {
							thead_text = element_label.text();
					
						}

						if ($('#formTable' + formId + ' thead tr th[name="' + element_name + '"]').length  == 0 ) {
							$('#formTable' + formId + ' thead tr').append('<th name="' + element_name + '">' + thead_text + '</th>');
							table_row_id = table_row_id + "<th>" + element_name + "</th>";
							exportElems = exportElems + element_name + "=" + encodeURIComponent(thead_text) + ";";
						}
						
						if (($(this).attr('type') == "select-one") || ($(this).attr('type') == "radio")){
						//if (($(this).attr('type') == "select-one")){
							$('#Form_' + formId).append($(this));
						}
					//	
					});
					
						// store Date
						$('#formTable' + formId + ' thead tr').append('<th name="storeDate">erstellt am</th>');
									
						$('#formdivtable_hide').append($('#formTable' + formId));
						$('#formdivtable_hide').append('<input id="' + formId +'" name="exportelem" value="' + exportElems + '">');
				
				
				}
				
				else {
					// remove tr in table
					$('table#formTable' + formId).find('tbody tr').remove();
					
					
				}
			});
			
		// }
//		var row_len = $('table#formTable' + formId + ' >tbody >tr').length;
		
//		if (row_len == 0) {
			var rowCount = 0;
			$(xml).find('formsval').each (function (){
				
				
				if (rowCount > 20) {
					$('.overlay_wait').hide();
					return;
				}
				rowCount++;
				
				var formId = $(this).find('FormId').text();
				
				//if (formId == current_formId) {
						
				var row_color ='class="new"';
				if ($(this).find('Exported').text() !="0" ) {
					row_color = 'class="exported" style="background-color:#C0C0C0;"'
				}
				
				var table_row = '<tr ' + row_color + '><td class="table_id" style="display:none;">'+ $(this).find('FormvalId').text() + '</td>';
				var CustomId = $(this).find('CustomId').text();
				var storeDate = $(this).find('storeDate').text();
				
				//var table_row = '<tr>';
				var form_values = $(this).find('Formvalues');
				
				
				$('table#formTable' + formId + ' tr:first').find('th[name!="FormvalId"]').each (function (){
					var element_name = $(this).attr('name');
					var td_text = form_values.find(element_name).text();
					var td_elem = $('#Form_' + formId + ' [name="' + element_name + '"]');
					if (element_name == "CustomId") {
						 td_text = CustomId;
					}
					if (element_name == "storeDate") {
						 td_text = storeDate;
					}
					
				//	var sel_elem = $(td_elem + ' option[value="'+ td_text+ '"]');
					
					if (td_elem.length > 0 ) {
						if ($(td_elem).attr('type') == "select-one") {
						// drop down
							var select_elem = $(td_elem).find(' option[value="'+ td_text+ '"]');
							td_text = $(select_elem).text();
						}
						if ($(td_elem).attr('type') == "radio"){
							$(td_elem).each  (function (){
								if ($(this).val() == td_text) {
									// do we have a text ?
									if ($(this).text() != "") {
										td_text = $(this).text();
									}
								}
							});
						}
					}
					table_row = table_row + '<td>' + td_text + '</td>';
				});
				
				table_row = table_row + '</tr>'
				 $('#formTable' + formId ).append(table_row);
				 
				//}
			});
		//}
		
		//switch tables!
					$('.overlay_wait').hide();	
					break;
				
				case "#formverw":
					
					$('#formVerwAuswahl option').remove();
					$(xml).find('forms').each (function (){
						var formId = $(this).find('FormId').text();
						$('#formVerwAuswahl').append('<option value="' + formId + '">' + $(this).find('Name').text() + '</option>');
					});
					$('.overlay_wait').hide();
					break
				case "#formneu":
					$('#frmParam input').val('');
					$('.overlay_wait').hide();
					break
			}
		$('.overlay_wait').hide();
	
	    },
				
	    error: function (XMLHttpRequest, textStatus, errorThrown) {
		alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
		$('*[name="var_kust_name"]').append(XMLHttpRequest.responseText);
		$('.overlay_wait').hide();
		
	    } 
	}); // end ajax
    }
	
	function datastore (target) {
	
		//build data string
		var datastring = "";
		validate_ok = true;
		switch (target) {
			case "#allgemein":
				datastring = $('#frmAllgemein').serialize() + '&target=' + target;
				
				break;
			case "#nutzer":
				// validate
				// no validates on Delete
				if ($('#frmUser input[name="UserDel"]').val() == "false") {
					if ($('#frmUser input[name="Username"]').val() == "") {
						alert ("Bitte Nutzernamen eingeben");
						validate_ok=false;
					}
					if ($('#frmUser input[name="Lastname"]').val() == "") {
						alert ("Bitte Nachnamen eingeben");
						validate_ok=false;
					}
					if ($('#frmUser input[name="Password"]').val() == "") {
						alert ("Bitte Passwort eingeben");
						validate_ok=false;
					}
				}
				
				$('#frmUser input[name="Lastname"]').removeAttr('disabled');
				$('#frmUser select[name="Group"]').removeAttr('disabled');
				$('#btnUserDel').removeAttr('disabled')

				datastring = $('#frmUser').serialize() + '&target=' + target;
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
				datastring = $('#frmParam').serialize() + '&Content=' + encodeURIComponent($('#formClear').html()) + '&target=' + target;
				break;
			case "#formdata_del":
				datastring ='exportedDel=' + $('#formDatenAuswahl option:selected').val() + '&target=#formdata_del';
				// set target for dataload
				target = "#formdaten";
				break;
			
			case "#form_del":
				datastring ='form_del_FormId=' + $('#formVerwAuswahl option:selected').val() + '&target=#form_del';
				// set target for dataload
				target = "#formverw";
				break;
		
		}
		
		if (validate_ok == true) {
			$.ajax({
				type: 'POST',
				url: 'php/param_store.php',
				data: datastring,
								
				success: function(html) {
					alert (html);
					dataload(target);
				},
						
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
					alert(XMLHttpRequest.responseText);
				} 
			}); // end ajax
		}
    }
	

	
	function msgbox (source, content) {
		var doc_h = $(document).height();
		var doc_w = $(document).width();
		$('#overlay').fadeIn(100).height(doc_h).width(doc_w);
		$('#overlay .inner').html(content);
	}
	
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
						//$('#formClear').append('<form><div id="frmLeft" style="width:300px; float:left; display:block;"></div><div id="frmRight" style="width:300px; float:right; display:block;"></div></form>');
						$('#formClear').append('<form></form>');
						var l = 0
						

						$('#formOriginal').find('input[type!="hidden"], textarea, select, p, h1, h2, h3, h4 , label').each(function(){
						$('#formClear form').append($(this));
							
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
						$('#formClear input[type="submit"]').addClass('whiteButton');
						$('#formClear input[type="submit"]').val("Senden");
						$('#formClear input[type="submit"]').attr('disabled', 'disabled');
						//
						//$('#formClear input').removeAttr('size');
						
						$('#formZeigen').show();
						$('#frmParam input').val('');
						alert ("Formular wurde erfolgreich geladen");
					}
				},
				error: function (xml)
				{
					alert(xml);
				}
			}
		)
		
		return false;

	}
	
	function customsFileUpload() {
		
		//starting setting some animation when the ajax starts and completes
		$("#loading")
		.ajaxStart(function(){
			$(this).show();
		})
		.ajaxComplete(function(){
			$(this).hide();
		});
		var data_array = new Array ();
		data_array ['FormId'] = $('#formVerwAuswahl option:selected').val();

		$.ajaxFileUpload (
			
			{
				url:'php/form_customupload.php', 
				secureuri:false,
				fileElementId:'customFile',
				type: 'POST',
				data: data_array,
				success: function (xml)	{

					var xml_error = $(xml).find('error');
					if ($(xml_error).length > 0) {
						alert ($(xml_error).text());
					}
					
					var xml_msg = $(xml).find('msg');
					if ($(xml_msg).length > 0) {
						alert ($(xml_msg).text());
						}
				},
				error: function (xml)
				{

					alert(xml);

				}
			}
		)
		
		return false;

	}
	

$(document).ready(function() {
	
	$('#menu li a:first').addClass('active');
// create login - dialog
	var loginMsgBox = $('#overlay_login').html();
	
	
	//Test
		msgbox("",loginMsgBox);


	//Test comment msg_box
		//	$('#overlay').hide();
				//dataload('#allgemein');
		//source = '#allgemein';
		//window.location.href = '#allgemein';
			//Test ende
	
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
					// check group for admnin
					
					if (return_status.children('group').text() != "10") {
						alert ("Sie haben keine Administrator-Berechtigung");
					}
					
					else {
						$('#overlay').hide();
						$('#content').show();
						source = '#allgemein';
						dataload('#allgemein');
						window.location.href = '#allgemein';

						
					}
				}
			},
					
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				alert(XMLHttpRequest.responseText); alert(textStatus); alert(errorThrown);
			} 
		}); // end ajax

	return false;
    }); // end loginform
	
	
	
	$('#menu li a').click (function () {
		$('#menu li a').removeClass('active'); 
		source = $(this).attr('href');
		dataload(source);
		$(this).addClass('active');
		
		//hack for ie - kotz

		if ($('#browser').text() == "MSIE") {
			$('#primary div').hide();
			$(source).css('min-height', '500px');
			$(source).show();


		}

			
	});
	
	$('#overlay .inner button').live ('click', function () {
		$('#overlay').hide();
	
		if ( $(this).attr('name') == "btnYes" ) {
			msgbox_yes(source);
		}
		
		if ( $(this).attr('name') == "btnNo" ) {
			msgbox_no(source);
		}
	});
	
	
	$('#userlist').click (function () {
		
		$('#frmUser input').val("");
		$('#frmUser input[name="UserId"]').val("NEW");
		$('#frmUser input[name="UserDel"]').val("false");
		$('#frmUser select option[value="1"]').attr("selected", "selected");
				
		$('#frmUser input[name="Lastname"]').removeAttr('disabled');
		$('#frmUser select[name="Group"]').removeAttr('disabled');
		$('#btnUserDel').removeAttr('disabled');
		
		var userId = $(this).val();
		$(paramxml).find('UserId').each (function (){

			if ($(this).text() == userId) {
				var userparent = $(this).parent();

				$(userparent).find('*').each (function () {
					var node_name = (this).nodeName;
					$('#frmUser input[name="' + node_name + '"]').val($(this).text());
				});
				var group = $(userparent).find('Group').text();
				$('#frmUser select option[value="' + group + '"]').attr("selected", "selected");
				// disable admin Lastname
				if($('#frmUser input[name="Lastname"]').val() == "admin") {
					$('#frmUser input[name="Lastname"]').attr('disabled', 'disabled');
					$('#frmUser select[name="Group"]').attr('disabled', 'disabled');
					$('#btnUserDel').attr('disabled', 'disabled');
				}
			}
		});
		$('#frmUser input[name="UserDel"]').val("false");
	});
		

	$('#btnUserDel').click (function () {
		
		if ($('#frmUser input[name="UserId"]').val() == "NEW") {
			alert ("Bitte einen Benutzer auswählen");
			
		}
		
		else {
			$('#frmUser input[name="UserDel"]').val("true");
			var showText = "Möchten Sie den Nutzer " + $('#userlist option:selected').text() + " löschen?";
			msgbox("userDel",'<p>' + showText + '</p><button type="button" name="btnYes" value="Ja">Ja</button><button type="button" name="btnNo" value="Nein">Nein</button>');
		}
	});
	
	$('#btnStore').click (function () {
		datastore(source);
	});
	

	
	$('#frmFormNeu').submit  (function () {
		$('#formZeigen').hide();
		$('#formClear').hide();
		ajaxFileUpload();
		return false;

	});
	
	// load forms bound customs
	$('#btnCustoms').click  (function () {
		customsFileUpload();
		return false;

	})
		

// foermulare verwalten
	
	$('#formVerwAuswahl').click (function () {
	
	});
	
	// formulardaten
	
	$('#formDatenAuswahl').click (function () {
		dataload('#formdaten');
		
		$('#formdivtable_hide').append($('#formdivtable_show').html());
		var formId = $(this).val();
		$('#formdivtable_show').html($('#formdivtable_hide table#formTable' + formId ));
		$('.overlay_wait').hide();

	});

	$('#btnFormDatenAkt').click (function () {
		
		dataload('#formdaten');
	
	});

	$('#formZeigen').click (function () {
		$('#formClear').show();
	});
	
	
		$('#frmFormCSV').submit (function () {
			
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
			//var data_string = "";
			//var data_key = "";
			//
			//// greate hed
			//$('#formdivtable_show table tr').find('th[name!="FormvalId"]').each (function () {
			//	var td_text = $(this).text();
			//			td_text = replaceCR (td_text,';',' ');
			//			td_text = replaceCR (td_text,'\r','');
			//			td_text = replaceCR (td_text,'\n','');
			//	data_string = data_string + td_text + ';';
			//
			//});
			//
			////create body
			//var row_filter = '';
			//
			//if ($('#frmFormCSV input[name="export"]:checked').val() == "new") {
			//	row_filter = '[class="new"]';
			//	
			//}
			//
			//$('#formdivtable_show table tr' + row_filter).each (function () {
			//	$(this).find('td').each (function () {
			//		if ($(this).hasClass('table_id') == true) {
			//			data_key += $(this).text() + ',';
			//		}
			//		else {
			//			// parse text
			//			var td_text = $(this).text();
			//			td_text = replaceCR (td_text,';',' ');
			//			td_text = replaceCR (td_text,'\r','');
			//			td_text = replaceCR (td_text,'\n','');
			//			data_string = data_string + td_text + ';';
			//
			//		}
			//	
			//	});
			//	data_string += "\n";
			//});
			
			var currentFormId = $('#formDatenAuswahl option:selected').val();
			
			$('#inputFormCSV_expKey').val($('#formdivtable_hide input[id="' + currentFormId + '"]').val());
			$('#inputFormCSV_formid').val(currentFormId);
			return true;
			
	});


	$('#btnFormDel').click (function () {
		source = '#formdata_del'
		msgbox(source,'<p>Möchten Sie die Daten wirklich löschen?</p><button type="button" name="btnYes" value="Ja">Ja</button><button type="button" name="btnNo" value="Nein">Nein</button>');
	});
	
	
	$('#btnFormVerwDel').click (function () {
		source = '#form_del'
		msgbox(source,'<p>Möchten Sie das Formular ' + $('#formVerwAuswahl option:selected').text() + ' wirklich löschen?</p><button type="button" name="btnYes" align=left value="Ja">Ja</button><button type="button" name="btnNo" value="Nein">Nein</button>');
	});	
	
/* -------------------------------------------------------------- */
});
