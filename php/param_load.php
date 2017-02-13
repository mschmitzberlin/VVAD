<?php
    header('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
	
	require "../dbtools/db_init.php";
	require "users.php";

    function param_arrayToXML ($inArray, $inRef) {
 
        foreach($inArray as $key => $value) {
 
            if (is_numeric($key)) {
                $key = "numeric_" . $key;
            }
                            
            $newRef = $inRef->addChild($key);
                            
            if(is_array($value)) {
                param_arrayToXML ($value, $newRef);
            }
            else {
                $newRef[0] = utf8_encode(trim($value));
				
            }
        }
    }
	
	function loadUsers () {
		// Users
		global $xml;
	
		$SqlStr = sprintf("SELECT * FROM USERS");
		$res = mysql_query($SqlStr);
		
		if (mysql_num_rows($res) > 0) {
			while ($arr_value = mysql_fetch_assoc($res)) {
				$referenz = $xml->addChild('users');
				
				param_arrayToXML ($arr_value, $referenz);
			}
		}
	}
	
	function loadParams () {
			// Params
		global $xml;
		
		$SqlStr = sprintf("SELECT * FROM PARAMS");
		$res = mysql_query($SqlStr);
		
		if (mysql_num_rows($res) > 0) {
			while ($arr_value = mysql_fetch_assoc($res)) {
				$referenz = $xml->addChild('params');
				
				param_arrayToXML ($arr_value, $referenz);
			}
		}
	}
	
	function loadForms  () {
			// load forms
		global $xml;
	
		$SqlStr = sprintf("SELECT * FROM FORMS");
		$res = mysql_query($SqlStr);
		$formStr = "";
		$formStart = 0;
		$formEnd = 0;
		
		if (mysql_num_rows($res) > 0) {
			while ($arr_value = mysql_fetch_assoc($res)) {
				$formStart = strrpos (strtolower($arr_value['Content']), '<form');
				$formEnd = strrpos (strtolower($arr_value['Content']), '</form>') + 7;
				$referenz = $xml->addChild('forms');
				$arr_value['Content'] = substr ($arr_value['Content'], $formStart, $formEnd - $formStart);
				param_arrayToXML ($arr_value, $referenz);
			}
		}

	}
	
		function loadFormsVal  ($FormId) {
			// load formsVal
		global $xml;
	
		$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE FormId = %d LIMIT 0,50", $FormId);
		//$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE FormId = %d", $FormId);
		$res = mysql_query($SqlStr);
		
		if (mysql_num_rows($res) > 0) {
			while ($arr_value = mysql_fetch_assoc($res)) {
				$formdata = unserialize(base64_decode($arr_value['Formvalues']));
				$arr_value['Formvalues'] = $formdata;
				$arr_value['storeDate'] = date("d.m.Y H:i",strtotime($arr_value['storeDate']));
				$referenz = $xml->addChild('formsval');
				
				param_arrayToXML ($arr_value, $referenz);
			}
		}
	}
	


	// main - read POST
	
	$status_array = check_session();
	

	
    $xmlstr = <<<XML
<data>
</data>
XML;
	
	$xml = new SimpleXMLElement($xmlstr);
	$filter = $_POST['filter'];
	
	if ($status_array['logged_in'] == 1) {		
		switch ($filter) {
			case "#allgemein":
				loadParams();
				break;
			case "#nutzer":
				loadUsers();
				break;
			case "#formdaten":
				loadForms();
				if (isset($_POST['FormId'])) {
					loadFormsVal($_POST['FormId']);
				}	
				
				break;
			case "#formverw":
				loadForms();
				break;
		}
		

	}
	
	else {
		// not logged in; need app_param
		
			loadParams();
		
		
	}
	
	echo $xml->asXML();
	$xml->asXML("formsval.xml");
	
 

?>