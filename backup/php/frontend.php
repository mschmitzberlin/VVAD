<?php
    header ('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
	ini_set('display_errors',1);
	error_reporting(E_ALL);
	error_reporting(E_ALL & ~E_NOTICE);

	
	$currentDir = dirname(__FILE__) . "/";
	require $currentDir . "/../dbtools/db_init.php";	
	require "users.php";
	$names=mysql_query('set names utf8');
	
    function strToUtf8 ($string) {
		if (mb_detect_encoding($string, 'UTF-8', true) === FALSE) {
			$string = utf8_encode($string);
		}
		return $string;
	}
	
    
    
    function arrayToXML ($inArray, $inRef) {
 
        foreach($inArray as $key => $value) {
			$key = strtolower($key);
            if (is_numeric($key)) {
                $key = "numeric_" . $key;
            }
                            
            $newRef = $inRef->addChild($key);
                            
            if(is_array($value)) {
                arrayToXML ($value, $newRef);
            }
            else {
                $newRef[0] = strToUtf8(trim($value));
				
            }
        }
    }
	
	
	
	function searchCustom ($params) {
        
		
		global $xml;
		$search = $params['search'];
		$search = mysql_real_escape_string($search);
		
		$searchSQL = "%" . strToUtf8($search) . "%";
		$search = substr ($search,0,5);
		$customId = "";


		$SqlStr = sprintf("SELECT CONCAT(CustomId, ', ',  RTRIM(vorname), ' ', RTRIM(name), ', ', RTRIM(strasse)) AS Search,
				CustomId FROM SEARCH WHERE name LIKE '%s' OR strasse LIKE '%s' OR CustomId LIKE  '%s'", $searchSQL, $searchSQL, $search);
        $res = mysql_query($SqlStr);
//echo $SqlStr;
		$numRows = mysql_num_rows($res);
        if ($numRows > 0) {
			$referenz = $xml->addChild('searches');
			while ($sqlValue = mysql_fetch_assoc($res)) {

				if ($numRows == 1) {
					// nur ein Eintrag gefunden - return CustomId
					$customId = $sqlValue['CustomId'];
				}
				else {
				
					$refSearch = $referenz->addChild('search');
					$refSearch->addAttribute('customid', $sqlValue['CustomId']);
					$refSearch->addAttribute('result', strToUtf8($sqlValue['Search']));
				}

			}
           
        }
		
		return $customId;
    }
	
	function getAppDatas ($customId){
		global $xml;
		//$customId = $params['search'];
		$returnId = "";
		$SqlStr = sprintf("SELECT CustomId FROM SEARCH WHERE CustomId = '%s';",  $customId);
		
		$res = mysql_query($SqlStr);
		
		if (mysql_num_rows($res) > 0) {
			$SqlStr = sprintf("SELECT name, content FROM APPVALUES WHERE CustomId = '%s';",  $customId);
			$res = mysql_query($SqlStr);
			
			$referenz = $xml->addChild('appdatas');

			while ($sqlValue = mysql_fetch_assoc($res)) {
				$refDatas = $referenz->addChild('datas');
				$refDatas->addAttribute('name' ,strtolower($sqlValue["name"]));
				$refDatas[0] = strToUtf8($sqlValue["content"]);
			}
			
			//pictures
			$fileList = glob(getcwd() . "/../pictures/in/" . $customId . ".*");

			if (count($fileList) > 0 ) {
				    $fileArray = pathinfo($fileList[0]);
                    $imageFile = $fileArray['basename'];
					$refDatas = $referenz->addChild('datas');
					$refDatas->addAttribute('name' ,'pict_vkst_in');
					$refDatas[0] = '<img src="pictures/in/' . $imageFile . '" />';
			}
			
			$fileList = glob(getcwd() . "/../pictures/out/" . $customId . ".*");

			if (count($fileList) > 0 ) {
				    $fileArray = pathinfo($fileList[0]);
                    $imageFile = $fileArray['basename'];
					$refDatas = $referenz->addChild('datas');
					$refDatas->addAttribute('name' ,'pict_vkst_out');
					$refDatas[0] = '<img src="pictures/out/' . $imageFile . '" />';
			}
			
			$refDatas = $referenz->addChild('datas');
			$refDatas->addAttribute("name" , "kdnr");
			$refDatas[0] = $customId;
			
			$returnId = $customId;
			
		}
		
		return $returnId;
	}
	
	function getForms ($customId) {
		
		global $xml;
		$customArray = array();

        //if(is_numeric($customId)) {
        //    $customId = $customId *1;
        //}
		
        $SqlStr = sprintf("SELECT * FROM FORMS WHERE test <> '1' ORDER BY FormId");
        $res = mysql_query($SqlStr);

        if (mysql_num_rows($res) > 0) {
			$referenz = $xml->addChild('forms');
            while ($sqlValue = mysql_fetch_assoc($res)) {
//				//check for customFilter
//				$customArray = unserialize(base64_decode($sqlValue['CustomFilter']));
//				
//				if (!is_array($customArray)) {
//					$customArray[$customId] = 0;
//				}
//				else {
//                //delete Nulls
//                foreach ($customArray as $key => $value) {
//                        if(is_numeric($value)) {
//                            $customArray[$key] = $value *1;
//                        }
//                    }
//                    
//                }
				
				//if (isset($customArray[$customId])) {
					$refDatas = $referenz->addChild('formdatas');
					$refDatas->addAttribute('formid' ,$sqlValue["FormId"]);
					arrayToXML ($sqlValue, $refDatas);
				//}
            }
        }
    }
	
	function getFormVals ($params) {
		global $xml;
		//$Kdnr, $userId
		//
		//$listname = "";
		//$return_value = array ();
		
		$formId = $params["formid"];
		$customId = $params["customid"];
		$userId = $params["userid"];
		$selection = $params["selection"];
		
		// lastId - wenn getFormsval nach Speichern aufgerufen wird, dann setze Formsvalmenü auf diese id
		$lastid = "0";
		if (isset($params["lastid"])) {
			$lastid = $params["lastid"];
		}		


		$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE CustomId = '%s' AND FormId = %d
			ORDER BY storeDate DESC, CustomId ASC LIMIT 0,20", $customId, $formId);
			
		if ($Selection == 1) {
			$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE UserId = '%s' AND FormId = %d
			ORDER BY storeDate DESC, CustomId ASC LIMIT 0,20", $userId, $formId);
		}
		
		

		$res = mysql_query($SqlStr);
		if (mysql_num_rows($res) > 0) {
			$referenz = $xml->addChild('formvals');
			$referenz->addAttribute('lastid' , $lastid);
			
			while ($sqlValue = mysql_fetch_assoc($res)) {
				$refDatas = $referenz->addChild('formvaldatas');
				$refDatas->addAttribute('formid' , $sqlValue['FormId']);
				$refDatas->addAttribute('formvalid' , $sqlValue['FormvalId']);
				$refDatas->addAttribute('customid' , $customId);
				$refDatas->addAttribute('storedate' , date("d.m.Y H:i",strtotime($sqlValue['storeDate'])));
				$refDatas->addAttribute('exported' , $sqlValue['Exported']);

				$formVals =unserialize(base64_decode($sqlValue['Formvalues']));
				
				foreach ($formVals as $key => $value) {
					$refVals = $refDatas->addChild('formvalues');
					$refVals->addAttribute('name' , strToUtf8($key));
					$refVals->addAttribute('value' , strToUtf8($value));
					
				}
				//print_r($formVals);
				//arrayToXML ($formVals, $refDatas);
				
			}
		}
	}
				
	
	
	function getMap  ($params) {
		global $xml;
		$centerLat = $params['lat'];
		$centerLng = $params['lng'];
		$customId = $params['customId'];
		$address = "";
	
		$SqlStr = sprintf ("SELECT * FROM `SEARCH` WHERE ABS(Geo_lat - '%s' ) <= 0.008 AND ABS(Geo_lng - '%s' ) <= 0.008", $centerLat, $centerLng);
		$res = mysql_query($SqlStr);
		if (mysql_num_rows($res) > 0) {
			$referenz = $xml->addChild('geodata');
			while ($arr_value = mysql_fetch_assoc($res)) {
				
				$markerLat = (float) str_replace(",",".",$arr_value['geo_lat']);
				$markerLng = (float) str_replace(",",".",$arr_value['geo_lng']);

				$refGeo = $referenz->addChild('markers');
				$refGeo->addAttribute('lat', $markerLat);
				$refGeo->addAttribute('lng', $markerLng);
				
				$address = $arr_value['name'] ;
				$customId = $arr_value['CustomId'] ;

				$refAdr = $refGeo->addChild('address');
				$refAdr[0] = utf8_encode($address);
				$refcustomId = $refGeo->addChild('customId');
				$refcustomId[0] = $customId;
			
			}
		}
	
	}
	
	function setFormsVal ($params) {
		global $xml;
		$customId = "";
		$formId = "";
		$msgStr = "";
		$store_array = $params;
	
		$customId = $store_array['customid'];
		$userId = $store_array['userid'];
		$formId = $store_array['formid'];
		$formvalId = $store_array['formvalid'];
		$formValKey_array = array ();
		$formValKey_array = "";
		$ins_upd_ok = "1";
	
		unset($store_array['customid']);
		unset($store_array['formid']);
		unset($store_array['formvalid']);
		unset($store_array['userid']);
	
		if ($formvalId <> "") {
			//search vor Formvalkey in FORMS
			$SqlStr = sprintf("SELECT FormValKey FROM FORMS WHERE FormId = %d AND not ISNULL(FormValKey)", $formId);
			$res = mysql_query($SqlStr);
		
			if (mysql_num_rows($res) > 0) {
				// we have a formavalkey
				$res_array = mysql_fetch_assoc($res);
				$formValKey_array = explode (",", $res_array['FormValKey']);
			
				if (sizeof($formValKey_array) > 0) {
					foreach ($formValKey_array as $key => $value) {
						$formValKey .= $formvalKey . $store_array[$value];
					}
				}
				
				// if we have stored a dataset with the same formvalkey, so we create a message and don't store the new dataset
			
				$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE FormValKey = '%s' AND FormValId <> %d", $formValKey, $formvalId);
				$res = mysql_query($SqlStr);
			
				if (mysql_num_rows($res) > 0) {
					$ins_upd_ok = "0"; // no insert / update
					$msgStr = "Es wurden bereits schon Daten erfasst, die Daten wurden nicht gespeichert";
				}
		
			}
		
		
			//search for FieldId in FORMS
			$SqlStr = sprintf("SELECT FieldId FROM FORMS WHERE FormId = %d ", $formId);
			$res = mysql_query($SqlStr);
		
			if (mysql_num_rows($res) > 0) {
				// we have a FieldId
				$res_array = mysql_fetch_assoc($res);
		
				$fieldId = $res_array['FieldId'];
			
				if ($fieldId <> "") {
				// serach for
			
					$SqlStr = sprintf("SELECT * FROM SEARCH WHERE CustomId = '%s'", $_POST[$fieldId]);
					$res = mysql_query($SqlStr);
		
					if (mysql_num_rows($res) == 0) {
						$ins_upd_ok = "0"; // no insert / update
						$msgStr = "Der im Feld " . $fieldId . " eingegebene Wert " . $_POST[$fieldId] . " konnte nicht gefunden werden, die Daten wurden nicht gespeichert";
					}
				}
			}
			
			
			if ($ins_upd_ok == "1") { // no double dataset
			
				$mailStr = "";
				//convert values
				foreach ($store_array as $key => $value) {
						$store_array[$key] = strToUtf8($value);
						$mailStr .= $key . "=" . "$value\r\n";
				}
			
				$array_str = base64_encode(serialize($store_array));
				if ($formvalId == "NEW") {
					// insert
					$SqlStr = sprintf("INSERT INTO FORMSVAL (FormId, UserId, CustomId, FormValKey, Formvalues, storedate) VALUES('%s', '%s', '%s', '%s', '%s', NOW())", $formId, $userId, $customId, $formValKey, $array_str);
					$res = mysql_query($SqlStr);
					$formvalId = mysql_insert_id();
				}
				else {
					// update
					$SqlStr = sprintf("UPDATE FORMSVAL SET FormValKey = '%s', Formvalues = '%s', storedate = NOW() WHERE FormvalId = '%s'", $formValKey, $array_str, $formvalId);
					$res = mysql_query($SqlStr);
				}
			
				//$res = mysql_query($SqlStr);
				//$formvalId = mysql_insert_id();
				echo mysql_error();
				$errStr = "";
			
				if (mysql_error() <> "") {
					$mailStr = "Fehler beim Speichern " . mysql_error() ."\r\n" . $mailStr;
					$errStr = " Fehler beim Speichern!";
					$msgStr = $errStr;
					$ins_upd_ok = "0";
				
				}
				else {
					$mailStr =  "Erfassungsdaten gespeichert\r\n" . $mailStr;
				}
		
				if ($formId == "3") {
					$SqlStr = sprintf("SELECT Email FROM USERS WHERE UserId = %d", $userId);
					$res = mysql_query($SqlStr);
					$sqlValue = mysql_fetch_assoc($res);
					$email = $sqlValue['Email'];
				
					if ($email <> "") {
						mail ($email, "AD-Besuchsbericht EH " . $customId . $errStr, $mailStr);
					}
				}
			}
		}
		else {
			$ins_upd_ok = "0";
			$msgStr = "Die Daten konnten nicht gespeichert werden, bitte erneut versuchen!";
		}
		
		$referenz = $xml->addChild('check');
		$referenz->addAttribute("status", $ins_upd_ok);
		$referenz->addAttribute("formid", $formId);
		$referenz->addAttribute("formvalid", $formvalId);
		$referenz->addAttribute("customid", $customId);
		$referenz->addAttribute("userid", $userId);
		$referenz->addAttribute("msg", $msgStr);
		
	}
	
	
        

$xmlstr = <<<XML
<data>
</data>
XML;
	
	$xml = new SimpleXMLElement($xmlstr);
    
	$status_array = check_session($currentUser);
	$userId = $status_array['userId'];

	$referenz = $xml->addChild('status');
	arrayToXML ($status_array, $referenz);
	
	
		$params = $_POST;
		
		$filter = "";
		if (isset($_POST['filter'])) {
			$filter = $_POST['filter'];
		}

		
		
		if ($filter == "#btnSend") {
			setFormsVal ($params);	
		}
	
		
		switch ($filter) {

			case "#searchcustom":
				$customId = searchCustom($params);

				if ($customId <> "" ) {
					// Kdnr gefunden
					getAppDatas($customId);
					getForms($customId);
				}
			break;
		
			case "#formsval":
				getFormVals($params);
			break;
		
			case "#map":
				getMap($params);
			break;
			
			
			

		}

	echo $xml->asXML();
?>