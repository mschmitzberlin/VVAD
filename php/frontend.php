<?php
    header ('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
	//ini_set('display_errors',1);
	//error_reporting(E_ALL);
	//if (!defined('E_DEPRECATED')) {
	//	define('E_DEPRECATED', 1);
	//}
	//error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
	//error_reporting(0);
	date_default_timezone_set ("Europe/Berlin");
	global $dbMySQL;
	$currentDir = dirname(__FILE__) . "/";
	require $currentDir . "/../dbtools/db_init.php";
	require "users.php";
	
	
	$url =parse_url($_SERVER["SCRIPT_URI"]);
	$path =$url["path"];
	$pathInfo = pathinfo($path);
	$currentUrl = $pathInfo["dirname"];
	$currentUrl = dirname($currentUrl);
	$currentUrl = $url["scheme"]. "://" .$url["host"] . $currentUrl . "/";
	
	$names=mysqli_query($dbMySQL, 'set names utf8');
	
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
		global $dbMySQL;
		$search = $params['search'];
		$search = mysqli_real_escape_string($dbMySQL,$search);
		
		$searchSQL = "%" . strToUtf8($search) . "%";
		$search = substr ($search,0,5);
		$customId = "";


		$SqlStr = sprintf("SELECT CONCAT(CustomId, ', ',  RTRIM(vorname), ' ', RTRIM(name), ', ', RTRIM(strasse)) AS Search,
				CustomId FROM SEARCH WHERE name LIKE '%s' OR strasse LIKE '%s' OR CustomId LIKE  '%s'", $searchSQL, $searchSQL, $search);
        $res = mysqli_query($dbMySQL, $SqlStr);

		$numRows = mysqli_num_rows($res);
        if ($numRows > 0) {
			$referenz = $xml->addChild('searches');
			while ($sqlValue = mysqli_fetch_assoc($res)) {

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
	
	function getAppDatas ($params, $userId) {
		
		global $dbMySQL;
		global $xml;
		global $currentUrl;
		global $connect;
		$logStr = "";
		$customId = $params["customid"];
		$serchOption =  $params["searchoption"];
		$returnId = "";
		//$SqlStr = sprintf("SELECT CustomId FROM SEARCH WHERE CustomId = '%s';",  $customId);
		//$res = mysqli_query($dbMySQL, $SqlStr);
		//
		//if (mysqli_num_rows($res) > 0) {
			$SqlStr = sprintf("SELECT name, content FROM APPVALUES WHERE CustomId = '%s';",  $customId);
			$res = mysqli_query($dbMySQL, $SqlStr);
			
			$referenz = $xml->addChild('appdatas');
			// Vorbelegung Bilder
			$refImg = $referenz->addChild('images');
			$refImgIn = $refImg->addChild('in');
			$refImgIn->addAttribute("file" ,  "img/noimg.png");
			$refImgOut = $refImg->addChild('out');
			$refImgOut->addAttribute("file" ,  "img/noimg.png");
			
			while ($sqlValue = mysqli_fetch_assoc($res)) {
				$refDatas = $referenz->addChild('datas');
				$refDatas->addAttribute('name' ,strtolower($sqlValue["name"]));
				$refDatas[0] = strToUtf8($sqlValue["content"]);
			}
			
			$delArray = glob("../temp/" . $userId . "PICT*.JPG");
			if (count($delArray) > 0) {
			    foreach ($delArray as $key => $value) {
					unlink ($value);
					
				}
			}
			if ($serchOption == "1") {
				ini_set("default_socket_timeout", 15);
				try {
					$client=new soapclient('http://217.6.190.18/ASA/php/KDService.php?wsdl', array('cache_wsdl'=> WSDL_CACHE_NONE, 'trace'=> 1, "soap_version"=>SOAP_1_1));
				}
				catch (SoapFault $e) {
					$error = $xml->addChild("error");
					$error->addAttribute("msg" ,  "Daten konnten nicht abgerufen werden (keine Datenverbindung).");
					return;
				}			
				
				$client->__setLocation('http://217.6.190.18/ASA/php/KDService.php');
				
				
				$pictInFile = $customId . "PICTIN.JPG";
				$pictInFileTemp = "../temp/" . $pictInFile;
				$pictinDate =  date("YmdHi",filemtime($pictInFileTemp));
				
				$pictOutFile = $customId . "PICTOUT.JPG";
				$pictOutFileTemp = "../temp/" . $pictOutFile;
				$pictoutDate =  date("YmdHi",filemtime($pictOutFileTemp));
				
				//$kprofilFile = $customId . "K_PROFIL-0.JPG";
				//$kprofilFileTemp = "../temp/" . $kprofilFile;
				//$kprofilDate =  date("YmdHi",filemtime($kprofilFileTemp));			
				
				//$soapResult = $client->GetADDatas(array("Kdnr" => $customId, "pictindate" => $pictinDate, "pictoutdate" => $pictoutDate));
				
				$jpgresult = $soapResult->GetKDPicturesResult;
				$picArray = explode("<nextpic>", $jpgresult);
				//Vkst-pictures lesen
				$jpgStream = $picArray[0];
		
				if ($jpgStream <>"") {
					if ($jpgStream <> "getserver") {
						// neue Datei geladen -> speichern
						file_put_contents($pictInFileTemp, $jpgStream);
						exec('convert -resize 50% "'. $pictInFileTemp, $pictInFileTemp, $output, $return_var);
					}
					$refImgIn["file"] =  $currentUrl . "/temp/" . $pictInFile;				

				}
				
				$jpgStream = $picArray[1];
				
				if ($jpgStream <>"") {
					if ($jpgStream <> "getserver") {
						// neue Datei geladen -> speichern
						file_put_contents($pictOutFileTemp, $jpgStream);
						exec('convert -resize 50% "'. $pictOutFileTemp, $pictOutFileTemp, $output, $return_var);
					}
					
					//$refImgIn = $refImg->addChild('out');
					$refImgOut["file"] =  $currentUrl . "/temp/" . $pictOutFile;
					
					//$refImgIn->addAttribute("file" , $currentUrl . "/temp/" . $pictOutFile);
				
				}
							
			}			
			
			$refDatas = $referenz->addChild('datas');
			$refDatas->addAttribute("name" , "kdnr");
			$refDatas[0] = $customId;
			
			$returnId = $customId;
			
			//$kprofilresult =  $soapResult->GetKDProfilResult;
			//if ($kprofilresult <>"") {
			//	if ($kprofilresult <> "getserver") {
			//		
			//		// neue Datei geladen -> speichern
			//		$pdf =  "../temp/" . $customId . "_K_PROFIL.PDF";
			//		file_put_contents($pdf, $kprofilresult);
			//		
			//		// vorhandene jpegs löschen
			//		$delArray = glob("../temp/" . $customId . "K_PROFIL*.JPG");
			//		if (count($delArray) > 0) {
			//		    foreach ($delArray as $key => $value) {
			//				unlink ($value);
			//		
			//			}
			//		}
			//		exec('convert -density 300 "'. $pdf . '" "' . $kprofilFileTemp.'"', $output, $return_var);
			//		unlink ($pdf);
			//	}
			//	
			//	$fileArray = glob("../temp/" . $customId . "K_PROFIL*.JPG");
			//	if (count($fileArray) > 0) {
			//		
			//		foreach ($fileArray as $key => $value) {
			//			$refKProfil = $referenz->addChild('kprofil');
			//			$refKProfil->addAttribute("file" , $currentUrl . "temp/" . basename($value));
			//		//	exec('convert -resize 50% "'. "../temp/" . basename($value) . '" "' . "../temp/"  . basename($value) .'"', $output, $return_var);
			//		}
			//	}				
			//
			//}
			
			// KUST
			//$connect->createWebService();
			//$soapKustresult = $connect->callService("GetKust", array("function" =>"GetKust","Kdnr" => $customId));
			//$kustresult = $soapKustresult->GetKustResult;
			//$kustresultArray = explode(";", $kustresult);
			//$jsonArray = array();
			//
			//for($i = 0; $i < count($kustresultArray); $i+=2) {
			//	if (isset($kustresultArray[$i+1])) {
			//		$key = strtolower($kustresultArray[$i]);
			//		$value = $kustresultArray[$i+1];
			//		$value = trim(str_replace('"', '', $value));
			//		$jsonArray[$key] = $value;
			//	}
			//}
			//
			//$gart = $jsonArray["g_art"];
			//$SqlStr = sprintf("SELECT Name  FROM GART WHERE Gart = '%s'", $gart);
			//$res = querySqli ($SqlStr);
			//$jsonArray["g_art"] = $res["singlerow"]["Name"];
			//
			//$nr_vkb = $jsonArray["nr_vkb"];
			//$SqlStr = sprintf("SELECT Name FROM BEARB WHERE Kurz = '%s'", $nr_vkb);
			//$res = querySqli ($SqlStr);
			//$jsonArray["nr_vkb"] = $res["singlerow"]["Name"];
			//
			//$kdbtr = $jsonArray["kdbtr"];
			//$SqlStr = sprintf("SELECT Name FROM BEARB WHERE Kurz = '%s'", $kdbtr);
			//$res = querySqli ($SqlStr);
			//$jsonArray["kdbtr"] = $res["singlerow"]["Name"];			
			//
			//if ($jsonArray["vmp_k_kz"] <> "") {
			//	$jsonArray["vmp_k_kz"] = "Ja";
			//}
			//else {
			//	$jsonArray["vmp_k_kz"] = "Nein";
			//}
			//
			
			
			
			//$soapResult->GetKustResult = json_encode($jsonArray);
			
			// Daten speichern, falls keine Verbindung oder schnelles Laden
			//$storeArray = (array) $soapResult;
			//unset($storeArray["GetKDPicturesResult"]);
			//unset($storeArray["GetKDProfilResult"]);
			
			$arrayStr = serialize($storeArray);

			$SqlStr = sprintf("SELECT DataId FROM DATAS WHERE Customer = '%s'", $customId);
			$res = querySqli ($SqlStr);
			$SqlStr = sprintf("INSERT INTO DATAS (Customer, Datas, StoreDate) VALUES('%s', '%s', now())", $customId, $arrayStr);
			if ($res["numrows"] > 0) {
				$SqlStr = sprintf("UPDATE DATAS SET Datas = '%s', StoreDate = now() WHERE DataId = %d", $arrayStr, $res["singlerow"]["DataId"]);
			}
			$res = querySqli ($SqlStr);

			//// Topseller
			//$topsztgxml = $xml->addChild("topsellerztg");
			//$topsztgxml[0] = $soapResult->GetTopsellerZtgResult;
			//$topsztschrxml = $xml->addChild("topsellerztschr");
			//$topsztschrxml[0] = $soapResult->GetTopsellerZtschrResult;
			//
			//// SortAna
			//$sortztgxml = $xml->addChild("sortanaztg");
			//$sortztgxml[0] = $soapResult->GetSortAnaZtgResult;
			//$sortztschrxml = $xml->addChild("sortanaztschr");
			//$sortztschrxml[0] = $soapResult->GetSortAnaZtschrResult;
			//
			////Kust
			//$kustxml = $xml->addChild("kust");
			//$kustxml[0] = $soapResult->GetKustResult;
			
			
		//}
		
		// load FieldDefs
		$SqlStr = sprintf("SELECT * FROM FIELDDEFS");

		$res = mysqli_query($dbMySQL, $SqlStr);
		
		if (mysqli_num_rows($res) > 0) {
			$referenz = $xml->addChild('fielddefs');
			while ($sqlValue = mysqli_fetch_assoc($res)) {
				$refFieldDefs = $referenz->addChild('fielddef');
				$refFieldDefs->addAttribute('appvalname' ,strtolower($sqlValue["AppValName"]));
				$refFieldDefs->addAttribute('edit', $sqlValue["Edit"]);
				$refFieldDefsVal = $refFieldDefs->addChild('longname');
				$refFieldDefsVal[0] = $sqlValue["LongName"];
				$refFieldDefsVal = $refFieldDefs->addChild('fixedvalue');
				$refFieldDefsVal[0] = $sqlValue["FixedValue"];
			}
			
		}


		return $returnId;
	}
	
	function getForms ($customId) {
		global $dbMySQL;
		global $xml;
		$customArray = array();
		
        $SqlStr = sprintf("SELECT * FROM FORMS WHERE test <> '1' ORDER BY FormId");
        $res = mysqli_query($dbMySQL, $SqlStr);

        if (mysqli_num_rows($res) > 0) {
			$referenz = $xml->addChild('forms');
            while ($sqlValue = mysqli_fetch_assoc($res)) {
				$refDatas = $referenz->addChild('formdatas');
				$refDatas->addAttribute('formid' ,$sqlValue["FormId"]);
				arrayToXML ($sqlValue, $refDatas);
            }
        }
    }
	
	function getFormVals ($params) {
		global $dbMySQL;
		global $xml;
		
		$formId = $params["formid"];
		$customId = $params["customid"];
		$userId = $params["userid"];
		$selection = $params["selection"];
		
		// lastId - wenn getFormsval nach Speichern aufgerufen wird, dann setze Formsvalmenü auf diese id
		$lastid = "0";
		if (isset($params["lastid"])) {
			$lastid = $params["lastid"];
		}		


		$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE CustomId = '%s' AND FormId = %d OR date(storeDate) = date(now())
			ORDER BY storeDate DESC, CustomId ASC LIMIT 0,20", $customId, $formId);
			
		if ($Selection == 1) {
			$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE UserId = '%s' AND FormId = %d
			ORDER BY storeDate DESC, CustomId ASC LIMIT 0,20", $userId, $formId);
		}
		
		

		$res = mysqli_query($dbMySQL, $SqlStr);
		if (mysqli_num_rows($res) > 0) {
			$referenz = $xml->addChild('formvals');
			$referenz->addAttribute('lastid' , $lastid);
			
			while ($sqlValue = mysqli_fetch_assoc($res)) {
				$storeDate = date("d.m.Y H:i",strtotime($sqlValue['storeDate']));
				$listText = $customId . " " . $storeDate;
				if ($sqlValue['FormValKey'] <> "") {
					$listText = substr($sqlValue['FormValKey'],0,5);
					$listText .= " " . substr($sqlValue['FormValKey'],5);
				}
				//$listText .= " " . $storeDate;
				
				$refDatas = $referenz->addChild('formvaldatas');
				$refDatas->addAttribute('formid' , $sqlValue['FormId']);
				$refDatas->addAttribute('formvalid' , $sqlValue['FormvalId']);
				$refDatas->addAttribute('customid' , $customId);
				$refDatas->addAttribute('storedate' , $storeDate);
				$refDatas->addAttribute('exported' , $sqlValue['Exported']);
				$refDatas->addAttribute('listtext' , $listText);

				$formVals =unserialize(base64_decode($sqlValue['Formvalues']));
				
				foreach ($formVals as $key => $value) {
					$refVals = $refDatas->addChild('formvalues');
					$refVals->addAttribute('name' , strToUtf8($key));
					$refVals->addAttribute('value' , strToUtf8($value));
					
				}
			}
		}
	}
				
	
	
	function getMap  ($params) {
		global $dbMySQL;
		global $xml;
		$centerLat = $params['lat'];
		$centerLng = $params['lng'];
		$customId = $params['customId'];
		$address = "";
	
		$SqlStr = sprintf ("SELECT * FROM `SEARCH` WHERE ABS(Geo_lat - '%s' ) <= 0.008 AND ABS(Geo_lng - '%s' ) <= 0.008", $centerLat, $centerLng);
		$res = mysqli_query($dbMySQL, $SqlStr);
		if (mysqli_num_rows($res) > 0) {
			$referenz = $xml->addChild('geodata');
			while ($arr_value = mysqli_fetch_assoc($res)) {
				
				$markerLat = (float) str_replace(",",".",$arr_value['geo_lat']);
				$markerLng = (float) str_replace(",",".",$arr_value['geo_lng']);

				$refGeo = $referenz->addChild('markers');
				$refGeo->addAttribute('lat', $markerLat);
				$refGeo->addAttribute('lng', $markerLng);
				
				$address = $arr_value['name'] ;
				$customId = $arr_value['CustomId'] ;

				$refAdr = $refGeo->addChild('address');
				//$refAdr[0] = utf8_encode($address);
				$refAdr[0] = strToUtf8($address);
				$refcustomId = $refGeo->addChild('customId');
				$refcustomId[0] = $customId;
			
			}
		}
	
	}
	

	
	
	function setEditVals ($params) {
		
		global $dbMySQL;
		global $xml;
		global $status_array;
		$customerId = $params["customerid"];
		$customerName = $params["customername"];
		$jsonStr = $params["params"];
		$jsonStr = stripslashes($jsonStr);
		$paramArray = json_decode($jsonStr, true);
		$status = "1";
		$msgStr = "";
		$mailContent = "";

		foreach ($paramArray as $valArray) {
			if (isset($valArray["newvalue"]) and ($valArray["newvalue"] <> "")) {
				$mailContent = $mailContent . "<tr><td>" . $valArray["longname"] . "</td><td>" . $valArray["oldvalue"] .
				"</td><td>" . $valArray["newvalue"] . "</td></tr>";
			}
			
		}

		if ($mailContent <> "") {
			//Speichern in Tabelle
			$paramStr = base64_encode(serialize($paramArray));
			$SqlStr = sprintf("INSERT INTO FORMSVAL (FormId, UserId, CustomId, FormValKey, Formvalues, storedate, Exported)
				VALUES('0', '%s', '%s', '0', '%s', NOW(), '2')", $status_array["userId"], $customId, $paramStr);
			$res = mysqli_query($dbMySQL, $SqlStr);
			
			if (mysqli_error($dbMySQL) <> "") {
					$msgStr = "Fehler beim Speichern: " .mysqli_error($dbMySQL);
					$status = "0";
				
			}
			
			if ($status == true) {
				$mailPart1 = '<html><head><meta content="text/html; charset=UTF-8" />
				<style>
					body {font-family: Arial, Helvetica, sans-serif;color: black;}
					table {font-size: 12px;}table, th, td {border: 1px solid;border-collapse: collapse;padding: 5px;}
				</style></head>
				<body bgcolor="#FFFFFF"><h4>Änderungen für Kunde ' . $customerId . ', ' . $customerName .'</h4> 
				<table><tr><th>Bezeichnung</th><th>Alter Wert</th><th>Neuer Wert</th></tr>';
				$mailPart2 = '</table><p>Erfasst von:' . $status_array["username"] . '</p><p>' . date("d.m.Y H:i:s") . '</p></body></html>';
			
				$headers = "MIME-Version: 1.0\r\n";
				$headers .= "Content-type: text/html; charset=UTF8\r\n";			
				
				$mailOutStr = $mailPart1 . $mailContent . $mailPart2;
				$mailOutStr = utf8_decode($mailOutStr);
	
				$mailSend = mail ("mschmitz@vvberlin.de", utf8_decode("Ehastra Änderungen für $customerId") . $mailBetreff , $mailOutStr, $headers);
				if ($mailSend == false) {
					$status = 0;
					$msgStr = "Mail konnte nicht versendet werden, bitte erneut versuchen";
				}
			}
		}
		
		$referenz = $xml->addChild('editvals');
		$refStatus = $referenz->addChild('status');
		$refStatus[0] = $status;
		$refMsg = $referenz->addChild('msg');
		$refMsg[0] = $msgStr;

	}
	
	//function getBezug($params) {
	//	global $dbMySQL;
	//	global $xml;		
	//	$kdnr = $params["kdnr"];
	//	$tnr = $params["tnr"];
	//	ini_set("default_socket_timeout", 15);
	//	try {
	//		$client = new soapclient('http://217.6.190.18/ASA/php/KDService.php?wsdl', array('cache_wsdl' => WSDL_CACHE_NONE, 'trace' => 1, "soap_version" => SOAP_1_1));
	//	} catch (SoapFault $e) {
	//		$error = $xml-> addChild("error");
	//		$error-> addAttribute("msg", "Daten konnten nicht abgerufen werden (keine Datenverbindung).");
	//		return;
	//	}
	//
	//	$client-> __setLocation('http://217.6.190.18/ASA/php/KDService.php');
	//	$soapResult = $client->GetBezug(array("Kdnr" => $kdnr, "Tnr" => $tnr));
	//	$bezugxml = $xml->addChild("bezug");
	//	$bezugxml[0] = $soapResult->GetBezugResult;		
	//
	//
	//}
	

//    function connectService () {
//        $client = false;
//        ini_set("default_socket_timeout", 15);
//		try {
//			$client = new soapclient('http://217.6.190.18/ASA/php/KDService.php?wsdl', array('cache_wsdl'=> WSDL_CACHE_NONE, 'trace'=> 1, "soap_version"=>SOAP_1_1));
//			print_r($client);
//		}
//		catch (SoapFault $e) {
//			
//			print_r($e)	;
//		}			
//		
//        if ($client !== false) {	
//			$client->__setLocation('http://217.6.190.18/ASA/php/KDService.php');
//           
//        }
//		echo "client"	;
//		
//        return $client;
//    }
	

	
	class connect {
		
		private $client;
		private $serviceError = false;
		private $soapCallError = false;
		private $responseError = false;
		private $isConnected = false;
		
		public function __construct() {
			ini_set("default_socket_timeout", 15);
		}
			
		public function createWebService () {
			
			if ($this->isConnected === false) {
				try {
					$this->client = new soapclient('http://217.6.190.18/ASA/php/KDService.php?wsdl', array('cache_wsdl'=> WSDL_CACHE_NONE, 'trace'=> 1, "soap_version"=>SOAP_1_1));
					$this->isConnected = true;

				}
				catch (SoapFault $e) {
					$this->serviceError = $e;
					$this->isConnected = false;
				}			
				
				if ($this->isConnected !== false) {	
					$this->client->__setLocation('http://217.6.190.18/ASA/php/KDService.php');
				}
			}
			return $this->isConnected;
		}
		
		public function callService ($funcName, $funcParams) {
			$response;
			try {
				$response = $this->client->__soapCall($funcName, array($funcParams));
			}
			catch (SoapFault $e) {
				// Verbindungsfehler
				$this->soapCallError = $e;
				$this->isConnected = false;
				$response = false;
			}
			
			if($response !== false) {
				if ($response->errno <> 0) {
					// Verbindung ok, Speicherfehler
					$response->$funcName = false;
					$this->responseError = $response->errno . " " . $response->error;
				}
			}
			// Hier noch einfügen Fehlermail bei einem von den drei Fehlern!

			unset ($response->errno);
			unset ($response->error);
			return $response;
		}
	}

	class getDatas {
		
		private $params;
		private $funcName;
		private $connect;
		private $responseContent = "";
		private $serviceResponse;
		private $msgStr;
		
		
		
		public function __construct($connect) {
			$this->connect = $connect;

		}
		
		private function callDatas () {
			$this->responseContent = "";
			$this->msgStr = "Verbindungsfehler. Daten können im Moment nicht abgerufen werden.";
			if ($this->connect->createWebService() == false) {
				// keine Verbindung zum Service - Daten speichern, späterer Export
				
				return false;
			}
			
			$serviceResponse = $this->connect->callService($this->funcName, $this->params);
			if ($serviceResponse == false) {
				return false;
			}

			reset($serviceResponse);
			$respFuncName = key($serviceResponse);
			if ($serviceResponse->$respFuncName === false) {
				// kein TCP Connect
				return false;
			}
			// alles ok!
			$this->msgStr ="";
			//$this->responseContent = $serviceResponse->$respFuncName;
			$this->serviceResponse = $serviceResponse;
			return true;
		}
		
		// Prev Verarabeitung

		private function GetADDatas () {
			$kdnr = $this->params["kdnr"];
			
			unset ($this->params);
			$this->params["kdnr"] = $kdnr;
			$this->params["pictindate"] =  date("YmdHi",filemtime($kdnr . "../temp/PICTIN.JPG"));
			$this->params["pictoutdate"] = date("YmdHi",filemtime($kdnr . "../temp/PICTOUT.JPG"));
		}		
				
		private function GetKDProfil () {
			$kdnr = $this->params["kdnr"];
			$kprofilFile =  "../temp/" . $kdnr . "K_PROFIL-0.JPG";
			$kprofilDate =  "199001010000";	
			if (file_exists($kprofilFile)) {
				$kprofilDate =  date("YmdHi",filemtime($kprofilFile));	
			}
			
			unset ($this->params);
			$this->params["kdnr"] = $kdnr;
			$this->params["kprofildate"] = $kprofilDate;

		}
		
		
		// Post Verarbeitung Weiterbehandlung
		private function GetKustResult () {
			
			$kustresultArray = explode(";", $this->responseContent);
			$jsonArray = array();

			for($i = 0; $i < count($kustresultArray); $i+=2) {
				if (isset($kustresultArray[$i+1])) {
					$key = strtolower($kustresultArray[$i]);
					$value = $kustresultArray[$i+1];
					$value = trim(str_replace('"', '', $value));
					$jsonArray[$key] = $value;
				}
			}
			
			$gart = $jsonArray["g_art"];
			$SqlStr = sprintf("SELECT Name  FROM GART WHERE Gart = '%s'", $gart);
			$res = querySqli ($SqlStr);
			$jsonArray["g_art"] = $res["singlerow"]["Name"];

			$nr_vkb = $jsonArray["nr_vkb"];
			$SqlStr = sprintf("SELECT Name FROM BEARB WHERE Kurz = '%s'", $nr_vkb);
			$res = querySqli ($SqlStr);
			$jsonArray["nr_vkb"] = $res["singlerow"]["Name"];

			$kdbtr = $jsonArray["kdbtr"];
			$SqlStr = sprintf("SELECT Name FROM BEARB WHERE Kurz = '%s'", $kdbtr);
			$res = querySqli ($SqlStr);
			$jsonArray["kdbtr"] = $res["singlerow"]["Name"];			
			
			if ($jsonArray["vmp_k_kz"] <> "") {
				$jsonArray["vmp_k_kz"] = "Ja";
			}
			else {
				$jsonArray["vmp_k_kz"] = "Nein";
			}
			
			
			
			$this->responseContent = json_encode($jsonArray);
		}
		
		private function GetKndalzResult () {
			$rowArray = explode("\r\n", $this->responseContent);
			$startDate = new DateTime();
			$startDate->modify("sunday this week");
			
			for ($l=21; $l >=1;  $l--) {
				$loopDate = $startDate->format("d.m.Y");
				$dateArray[$loopDate]["count"]= intval(($l-1) /7);
				$dateArray[$loopDate]["KW"]= $startDate->format("W");
				$dateArray[$loopDate]["date"]= $startDate->format("Y-m-d");
					
				$weekDay = $startDate->format("w");
				if ($weekDay == 0) {
					$weekDay = 7;
				}
				$dateArray[$loopDate]["weekday"] = $weekDay;	
				
				$startDate->modify("- 1 days");							  
			}
			
			$gaArray =  array("ga"=>"Öffnungszeit", 1=>"", 2=>"", 3=>"", 4=>"", 5=>"", 6=>"", 7=>"");
			$walzArray =  array("walz"=>"Wunschzeit", 1=>"", 2=>"", 3=>"", 4=>"", 5=>"", 6=>"", 7=>"");
			$abwArray = array("abw"=>"Abweichung", 1=>"", 2=>"", 3=>"", 4=>"", 5=>"", 6=>"", 7=>"");
			$kndalzArray = array();
			for ($l=2; $l >=0;  $l--) {
				$kndalzArray[$l] = array("KW"=>"", 1=>"", 2=>"", 3=>"", 4=>"", 5=>"", 6=>"", 7=>"");
			}
			foreach ($rowArray as $row) {
				$colArray = explode(";", $row);
					$colDate = $colArray[4];
					
					$dateArray[$colDate]["anlzeit"] = substr($colArray[1],0,5);
					$weekDay = $dateArray[$colDate]["weekday"];
					$gaArray[$weekDay] = $colArray[2];
					$walzArray[$weekDay] = $colArray[3];
					$abwArray[$weekDay] = "";
				}
				foreach ($dateArray as $valueDateArray) {
					$weekDay = $valueDateArray["weekday"];
					$count = $valueDateArray["count"];
					$kndalzArray[$count]["KW"] = "KW " . $valueDateArray["KW"];
					$kndalzArray[$count][$weekDay] = $valueDateArray["anlzeit"];
					
					// bereits berechnet oder keine AnlZeilt -> Abbruch
					if (($abwArray[$weekDay] != "") or (!isset($valueDateArray["anlzeit"]))) {
						continue;
					}
					
					// neu berechnen
					$anlZeitStr = $valueDateArray["anlzeit"];
					$abwStr = "";
					$walzStr = $walzArray[$weekDay];
					
					$anlZeit = new DateTime ('2000-01-01 ' . substr($anlZeitStr,0,5));
					$walz = new DateTime ('2000-01-01 ' . $walzStr);
					$abw =  round(($walz->format('U') - $anlZeit->format('U'))/60) ;
					$vorzch = ($abw >=0) ? "" : "-";
					$abw = abs($abw);
					
					$abwHour = intval($abw / 60);
					$abwMin = $abw - ($abwHour * 60);
					$abwStr =  $vorzch . str_pad($abwHour, 2, "0", STR_PAD_LEFT) . ":" .  str_pad($abwMin, 2, "0", STR_PAD_LEFT);
					$abwArray[$weekDay] = $abwStr;
					
			
				}
			
			
			$kndalzArray["ga"] = $gaArray;
			$kndalzArray["walz"] = $walzArray;
			$kndalzArray["abw"] = $abwArray;
			
			// create output
			$outArray = array();
			
			foreach ($kndalzArray as $valueArray) {
				$outArray[]  = implode (";", $valueArray);
			}
			
			$outStr = implode($outArray, "\r\n");
			$outStr = ";Mo;Di;Mi;Do;Fr;Sa;So\r\n" . $outStr;
			$this->responseContent = $outStr;
		}

		private function GetKDPicturesResult () {
			
			$kdnr = $this->params["kdnr"];
			$picArray = explode("<nextpic>", $this->responseContent);
				//Vkst-pictures lesen
				$jpgStream = $picArray[0];
				
				$pictInFile = "img/noimg.png";
				$pictOutFile = "img/noimg.png";
		
				if ($jpgStream <>"-1") {
					if ($jpgStream <> "getserver") {
						$tmpFile = "../temp/" .$kdnr . "PICTIN.JPG";
						// neue Datei geladen -> speichern
						file_put_contents($tmpFile, $jpgStream);
						exec('convert -resize 50% "'.$tmpFile, $tmpFile, $output, $return_var);
					}
					$pictInFile = "temp/" . $kdnr . "PICTIN.JPG";		

				}
				
				$jpgStream = $picArray[1];
				
				if ($jpgStream <>"") {
					if ($jpgStream <> "getserver") {
						$tmpFile = "../temp/" .$kdnr . "PICTOUT.JPG";
						// neue Datei geladen -> speichern
						file_put_contents($tmpFile, $jpgStream);
						exec('convert -resize 50% "'. $tmpFile, $tmpFile, $output, $return_var);
					}
					$refImgOut["file"] =  $currentUrl . "/temp/" . $pictOutFile;
					$pictOutFile = "temp/" . $kdnr . "PICTOUT.JPG";		
				}
				
				$this->responseContent = $pictInFile . ";" . $pictOutFile;
		}		
		
		private function GetKDProfilResult () {

			$kprofilresult = $this->responseContent;
			$kdnr = $this->params["kdnr"];
			
			$this->responseContent = "";
			if ($kprofilresult <> "") {
				if ($kprofilresult <> "getserver") {
					
					// neue Datei geladen -> speichern
					$pdf =  "../temp/" . $kdnr . "_K_PROFIL.PDF";
					file_put_contents($pdf, $kprofilresult);
					
					// vorhandene jpegs löschen
					$delArray = glob("../temp/" . $kdnr . "K_PROFIL*.JPG");
					if (count($delArray) > 0) {
					    foreach ($delArray as $key => $value) {
							unlink ($value);
					
						}
					}
					
					$kprofilFileTemp = "../temp/" . $kdnr . "K_PROFIL.JPG";
					//exec('convert -density 150 "'. $pdf . '" "' . $kprofilFileTemp.'"', $output, $return_var);
					exec('convert -density 150 "'. $pdf . '" "' . $kprofilFileTemp.'"', $output, $return_var);
					unlink ($pdf);
				}
				
				$fileArray = glob("../temp/" . $kdnr . "K_PROFIL*.JPG");
				if (count($fileArray) > 0) {
					
					$fileName = array();
					foreach ($fileArray as $value) {
						$fileName[] = " temp/" . basename($value);
						//exec('convert -resize 50% "'. "../temp/" . basename($value) . '" "' . "../temp/"  . basename($value) .'"', $output, $return_var);
					}
					$this->responseContent = implode(";", $fileName);
				}				

			}			
		}
		
		private function GetWmBestandResult () {
			
			$wmImgFolder = "../img/wm/";
			$wmImgWebFolder = "img/wm/";
			$rowArray = explode("\r\n", $this->responseContent);
			if (count($rowArray >0)) {
				$keyArray = explode(";", $rowArray[0]);
				unset($rowArray[0]);
				$jsonArray = array();
				foreach ($rowArray  as $rowKey => $value) {
					$colArray = explode(";", $rowArray[$rowKey]);
					$imgName = end($colArray);
					$lastKey = key($colArray);
					$colArray[$lastKey] = "img/noimg.png";
					if ($imgName <> "") {
						if (file_exists("../img/wm/" . $imgName)) {
							$colArray[$lastKey] = "img/wm/" . $imgName;
						}
						
					}
					$jsonArray[$rowKey] = array_combine($keyArray, $colArray);
				}
				$this->responseContent = json_encode($jsonArray);
			}
		}
		

		
		
		public function getDatas ($params) {
			global $xml;
			$this->params = $params;
			unset ($this->params["filter"]);
			$this->funcName = $this->params["function"];
			unset ($this->params["function"]);
			$dataResponseXml = $xml->addChild("dataresponse");
		
			// Prev Verarbeitung
			if (method_exists($this, $this->funcName)) {
							$this->{$this->funcName}();
			}
			
			if ($this->callDatas() == true) {
				foreach ($this->serviceResponse as $resultName => $responseContent) {
				
					$responseXml = $dataResponseXml->addChild("response");
					$responseXml->addAttribute("function",strtolower($resultName));
					$responseContentXml = $responseXml->addChild("content");
					$resultErrorXml = $responseXml->addChild("resulterror");
					
					// auf Fehler prüfen - muss für jeden Funktionsaufruf separat erfolgen
					$resultErrorArray = explode("<resulterror>", $responseContent);
					if (count($resultErrorArray) > 1) {
						$resultErrorXml[0] = end($resultErrorArray);
					}
					
					else {
						//Weiterbehandlung
						$this->responseContent = $responseContent;
						if (method_exists($this, $resultName)) {
							$this->{$resultName}();
						}
						//$contentXml = $respXml->addChild("content");
						$responseContentXml[0] = $this->responseContent;						
					}
				}
			}

			$msgXml = $dataResponseXml-> addChild("msg");
			$msgXml[0] = $this->msgStr;				
		}		
		
	}
	
	class setFormVals {
	
		private $params;
		private $customId = "";
		private $formId = "";
		private $formvalId = "";
		private $userId = "";
		// validate 
		private $formFieldId = "";
		private $formFieldIdValue = "";
		private $formValKey = array();
		private $formValKeySearch = "";
		private $validate = true;
		private $msgStr = "";
		private $exportVal = "0";
		
		private $connect; // connetc Klasse
		
		// Errorlevel
		// 0 = alles ok
		// 1 = doppelter formValKey
		// 2 = FieldId nicht in SEARCH
		// 3 = JSON-Fehler
		// 4 = Webservice Fehler
		// 5 = Webservice Function Fehler
		// 6 = TCP Connect Fehler
		// 7 = ungültige Daten (Befo-Speicherfehler)
		// 8 = DB Fehler

		
		private $errorLevel = 0;
		
		public function __construct($params, $connect) {
			$this->params = $params;
			$this->customId = $params['customid'];
			$this->formId = $params['formid'];
			$this->formvalId = $params['formvalid'];
			$this->userId = $params['userid'];
			$this->connect = $connect;
			
			unset($this->params['customid']);
			unset($this->params['formid']);
			unset($this->params['formvalid']);
			unset($this->params['userid']);
			unset($this->params["filter"]);
			
			foreach( $this->params as $key => $value) {
           		$this->params[$key] = strToUtf8($value);
           	}
			
			$this->createSearchKeys();
		}
		
		private	function createSearchKeys() {
					
			$SqlStr = sprintf("SELECT FieldId, FormValKey FROM FORMS WHERE FormId = %d", $this->formId);
			$res = querySqli($SqlStr);
		
			if ($res["numrows"] > 0) {
				$this->formFieldId = $res["singlerow"]["FieldId"];
				$this->formFieldIdValue = $this->params[$this->formFieldId];
				// Umschreiben CustomId
				if ($this->customId <>  $this->formFieldIdValue) {
					$this->customId = $this->formFieldIdValue;
				}
				
				$formValKeyStr = $res["singlerow"]["FormValKey"];
		   
				if ($formValKeyStr <> "") {
					$this->formValKey = explode (",", $formValKeyStr);
					$this->formValKey = array_flip ($this->formValKey);
	
					foreach ($this->formValKey as $key => $value) {
						$this->formValKey[$key] =  $this->params[$key];
						$this->formValKeySearch .= $this->params[$key];
					}
				}		
			}
		}
		
		private function validateFormVals() {
	
			// Prüfen, ob DS bereits mit gleichem Formvalkey gespeichert

			$SqlStr = sprintf("SELECT FormvalId FROM FORMSVAL WHERE FormValKey = '%s' AND Exported > 0", $this->formValKeySearch);
			$res = querySqli($SqlStr);
			if ($res["numrows"] > 0) {
				$this->validate = false;
				$msgTmp = "";
				foreach ($this->formValKey as $key => $value) {
					$msgTmp  .= $key . ": " . $value . " ";	
				}
				$this->errorLevel = 1;
				$this->msgStr = "Es wurden bereits Daten erfasst ( " . $msgTmp . "), die Daten können nicht gesspeichert werden.\n Bitte die Werte ändern";
			}
	   
	
			// bis jetzt alles ok, gültige FieldId prüfen
			if ($this->validate === true) {
				
				if ($this->formFieldId <> "") {
					$SqlStr = sprintf("SELECT CustomId FROM SEARCH WHERE CustomId = '%s'", $this->formFieldIdValue);
					$res = querySqli($SqlStr);
					if ($res["numrows"] == 0) {
						$this->validate = false;
						$this->errorLevel = 2;
						$this->msgStr = "Der im Feld " . $this->formFieldId . " eingegebene Wert " .
						$this->formFieldIdValue . " konnte nicht gefunden werden. Die Daten wurden nicht gespeichert";
					}                    
				}
			}
		}
		
		private function sendTCP()  {
			$service = false;
			$datas = "";
            $datas = json_encode( $this->params);
			if ($datas == false) {
				// Fehler Json - kein Speichern in DB
				$this->validate = false;
				$this->errorLevel = 3;
				$this->msgStr = "Die Daten beinhalten ungültige Zeichen und können nicht gespeichert werden";
				return;
			}

			// json ok, connect
			// für die folgenden drei Prüfungen ist msg immer gleich
			$this->msgStr = "Die Daten wurden gespeichert, konnten aber nicht zu Befo übertragen werden. Die Übertragung wird zu einem
				 späteren Zeitpunkt automatisch durchgeführt";
			if ($this->connect->createWebService() == false) {
				// keine Verbindung zum Service - Daten speichern, späterer Export
				$this->errorLevel = 4;
				return;
			}
			
			$serviceResponse = $this->connect->callService("SetBesuchsbericht", (array("Kdnr" => $this->customId, "Datas" => $datas)));
			if ($serviceResponse == false) {
				// Fehler beim func Aufruf
				$this->errorLevel = 5;
				return;
			}
			
			if ($serviceResponse->SetBesuchsberichtResult == false) {
				// kein TCP Connect
					$this->errorLevel = 6;
				return;

			}
			
			if ($serviceResponse->SetBesuchsberichtResult <> "OK") {
				// Connet ok aber Daten nicht speicherbar
					$this->validate = false;
					$this->errorLevel = 7;
					$this->msgStr = "Fehler beim Speichern: " . $serviceResponse->SetBesuchsberichtResult . " Bitte die Daten korrigieren";
			}
			else {
				// Daten gesendet - in DB als exportiert kennzeichnen
				$this->exportVal = "1";
			}
			   			
		}
		
		private function storeDB()  {
			$paramStr = base64_encode(serialize($this->params));
			
			
			// Kein sofortiger Export bei AD-MA
			if (strpos("11000 20000 60000 80000", $this->customId) !== false) {
				$this->exportVal = "0";
			}
			
            if ($this->formvalId == "NEW") {
                 
				// insert
				$SqlStr = sprintf("INSERT INTO FORMSVAL (FormId, UserId, CustomId, FormValKey, Formvalues, storedate, Exported)
					VALUES('%s', '%s', '%s', '%s', '%s', NOW(), '%s')",
					$this->formId, $this->userId, $this->customId, $this->formValKeySearch, $paramStr, $this->exportVal);
					$res = querySqli($SqlStr);
					$this->formvalId = $res["lastid"];
					if ($this->msgStr == "") {
						$this->msgStr = "Daten wurden gespeichert.";
					}
			}
			else {
				// Update
				$SqlStr = sprintf("UPDATE FORMSVAL SET Formvalues = '%s', storedate = NOW() WHERE FormvalId = '%s'",
				$paramStr, $this->formvalId);
				$res = querySqli($SqlStr);
				if ($this->msgStr == "") {
					$this->msgStr = "Daten wurden geändert.";
				}
			}
			
			if ($res["sqlerrortext"] <> "") {
				$this->errorLevel = 8;
				$this->msgStr = "Die Daten konnten nicht gespeichert werden, Fehler: " . $res["sqlerrortext"] . ". Bitte erneut versuchen!";
				$this->validate = false;
			}
		}
		
		private function endFormsVals()  {
			global $xml;
			$mailSubject = "";
			$mailBody = "";

			if ($this->errorLevel >= 3) {
				ob_start();
				var_dump($this);
				$obj = ob_get_clean();
				mail ("mschmitz@vvberlin.de", "AD-Besuchsbericht Fehler ". date("d.m.Y H:i") , $obj);
			}
			
			if ($this->formId == "3") {
				$mailSubject = "AD-Besuchsbericht EH " . $this->customId;
				foreach ($this->params as $key => $value) {
					$mailBody .= $key . "=" . "$value\r\n";
				}
			
				if ($this->errorLevel > 0) {
					$mailSubject .= " - Fehler beim Speichern!";
					$mailBody .= $this->msgStr;
				}
				$SqlStr = sprintf("SELECT Email FROM USERS WHERE UserId = %d", $this->userId);
				$res = querySqli($SqlStr);
				$email = $res["singlerow"]['Email'];
				if ($email <> "") {
					mail ($email, $mailSubject, $mailBody);
				}
			}
			$referenz = $xml->addChild('check');
			$referenz->addAttribute("status", $this->errorLevel);
			$referenz->addAttribute("formid", $this->formId);
			$referenz->addAttribute("formvalid", $this->formvalId);
			$referenz->addAttribute("customid", $this->customId);
			$referenz->addAttribute("userid", $this-userId);
			$referenz->addAttribute("validate", $this->validate ? "1": "0");
			$referenzMsg = $referenz->addChild('msg');
			$referenzMsg[0] = $this->msgStr;
			
		}			
		
		public function setFormVals()  {
			$this->validateFormVals();
			
			if (($this->validate == true) and ($this->formId == "3")) {
				// FormId 3 Daten an tcp senden
				$this->sendTCP();
			}
			// Daten in DB speichern
			if ($this->validate == true) {
				$this->storeDB();
			}
			
			$this->endFormsVals();
		}
		
		
		public function delFormVals()  {
			
			$exported = "0";
			$SqlStr = sprintf("SELECT Exported FROM FORMSVAL WHERE FormvalId = %d", $this->formvalId);
			$res = querySqli($SqlStr);
			$exported = $res["singlerow"]["Exported"];			

			if ($exported == "0") {
				$SqlStr = sprintf("DELETE FROM FORMSVAL WHERE FormvalId = %d", $this->formvalId);
				querySqli($SqlStr);
				$this->msgStr = "Daten wurden gelöscht";
				$this->errorLevel = 0;
			}
			else {
				$this->msgStr = "Daten konnten nicht gelöscht werden, wurden bereits in Befo gespeichert";
				$this->errorLevel = 1;
			}
			$this->endFormsVals();
		}
		
		
	}
	

	
$xmlstr = <<<XML
<data>
</data>
XML;
	
	$xml = new SimpleXMLElement($xmlstr);
    $connect = new connect();
	$getDatas = new getDatas($connect);
	
	$status_array = check_session($dbMySQL);
	$userId = $status_array['userId'];

	$referenz = $xml->addChild('status');
	arrayToXML ($status_array, $referenz);
	
		$params = $_POST;
		//print_r($params);
		$filter = "";
		if (isset($_POST['filter'])) {
			$filter = $_POST['filter'];
		}

		
		
		if ($filter == "#btnSend") {
			$setFormVals = new setFormVals($params, $connect);
			$setFormVals->setFormVals();
		}
		
		if ($filter == "#btnDel") {
			$setFormVals = new setFormVals($params, $connect);
			$setFormVals->delFormVals();
		}
	
		if ($filter == "#editvals") {
			
			setEditVals($params);
		}
		
	
		switch ($filter) {

			case "#searchcustom":
				$customId = searchCustom($params);

				if ($customId <> "" ) {
					// Kdnr gefunden
					$params["customid"] = $customId;
					getAppDatas($params, $userId);
				//	$getDatas->getDatas(array("function"=>"GetKust", "Kdnr"=>$customId));
					$getDatas->getDatas(array("function"=>"GetADDatas", "kdnr" => $customId));
					getForms($customId);
				}
			break;
		
			case "#formsval":
				getFormVals($params);
			break;
		
			case "#map":
				getMap($params);
			break;

			case "#getdatas":
				$getDatas->getDatas($params);
			break;
			//
			//case "#getnlf":
			//	getNlf($params);
			//break;			

		}

	echo $xml->asXML();
	
	
	//	function setFormsVal ($params) {
//		
//		print_r($params);
//		global $dbMySQL;
//		global $xml;
//		$customId = "";
//		$formId = "";
//		$msgStr = "";
//		$store_array = $params;
//	
//		$customId = $store_array['customid'];
//		$userId = $store_array['userid'];
//		$formId = $store_array['formid'];
//		$formvalId = $store_array['formvalid'];
//		$formValKey_array = array ();
//		$formValKey_array = "";
//		$ins_upd_ok = "1";
//	
//		unset($store_array['customid']);
//		unset($store_array['formid']);
//		unset($store_array['formvalid']);
//		unset($store_array['userid']);
//
//		
//	if ($formId == "3") {
//		$besRepArray = $store_array;
//		unset ($besRepArray["filter"]);
//		foreach ($besRepArray as $key => $value) {
//		//	$besRepArray[$key] = strToUtf8($value);
//		}
//	}
//		
//		if ($formvalId == "NEW") {
//			// neuer DS, prüfen, ob speichern möglich
//			$SqlStr = sprintf("SELECT FieldId, FormValKey FROM FORMS WHERE FormId = %d", $formId);
//			$res = querySqli($SqlStr);
//			$fieldId = $res["singlerow"]["FieldId"];
//			$formValKey = $res["singlerow"]["FormValKey"];
//echo $fieldId. " " . $formValKey;
//			if (mysqli_num_rows($res) > 0) {
//				// we have a formavalkey
//				$res_array = mysqli_fetch_assoc($res);
//				$formValKey_array = explode (",", $res_array['FormValKey']);
//			
//				if (sizeof($formValKey_array) > 0) {
//					foreach ($formValKey_array as $key => $value) {
//						$formValKey .= $formvalKey . $store_array[$value];
//						$msgStr .= "$value: $store_array[$value] ";
//					}
//				}
//				
//				// Prüfen, ob DS bereits mit gleichem Formvalkey gespeichert 
//			
//				$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE FormValKey = '%s' AND FormValId <> %d", $formValKey, $formvalId);
//				$res = mysqli_query($dbMySQL, $SqlStr);
//			
//				if (mysqli_num_rows($res) > 0) {
//					$ins_upd_ok = "0"; // no insert / update
//					$msgStr = "Es wurden bereits Daten erfasst ( " . $msgStr . " ), die Daten können nicht gespeichert werden.\n Bitte die Werte ändern";
//				}
//		
//			}
//		
//		
//			//search for FieldId in FORMS
//			$SqlStr = sprintf("SELECT FieldId FROM FORMS WHERE FormId = %d ", $formId);
//			$res = mysqli_query($dbMySQL, $SqlStr);
//		
//			if (mysqli_num_rows($res) > 0) {
//				// we have a FieldId
//				$res_array = mysqli_fetch_assoc($res);
//		
//				$fieldId = $res_array['FieldId'];
//			
//				if ($fieldId <> "") {
//				// serach for
//			
//					$SqlStr = sprintf("SELECT * FROM SEARCH WHERE CustomId = '%s'", $_POST[$fieldId]);
//					$res = mysqli_query($dbMySQL, $SqlStr);
//		
//					if (mysqli_num_rows($res) == 0) {
//						$ins_upd_ok = "0"; // no insert / update
//						$msgStr = "Der im Feld " . $fieldId . " eingegebene Wert " . $_POST[$fieldId] . " konnte nicht gefunden werden, die Daten wurden nicht gespeichert";
//					}
//				}
//			}
//			
//			
//			if ($ins_upd_ok == "1") { // no double dataset
//			
//				$mailStr = "";
//				//convert values
//				foreach ($store_array as $key => $value) {
//						$store_array[$key] = strToUtf8($value);
//						$mailStr .= $key . "=" . "$value\r\n";
//				}
//			
//				$array_str = base64_encode(serialize($store_array));
//				if ($formvalId == "NEW") {
//					// insert
//					$SqlStr = sprintf("INSERT INTO FORMSVAL (FormId, UserId, CustomId, FormValKey, Formvalues, storedate) VALUES('%s', '%s', '%s', '%s', '%s', NOW())", $formId, $userId, $customId, $formValKey, $array_str);
//					$res = mysqli_query($dbMySQL, $SqlStr);
//					$formvalId = mysqli_insert_id($dbMySQL);
//				}
//				else {
//					// update
//					$SqlStr = sprintf("UPDATE FORMSVAL SET FormValKey = '%s', Formvalues = '%s', storedate = NOW() WHERE FormvalId = '%s'", $formValKey, $array_str, $formvalId);
//					$res = mysqli_query($dbMySQL, $SqlStr);
//				}
//			
//				//$res = mysql_query($SqlStr);
//				//$formvalId = mysql_insert_id();
//				echo mysqli_error($dbMySQL);
//				$errStr = "";
//			
//				if (mysqli_error($dbMySQL) <> "") {
//					$mailStr = "Fehler beim Speichern " . mysql_error() ."\r\n" . $mailStr;
//					$errStr = " Fehler beim Speichern!";
//					$msgStr = $errStr;
//					$ins_upd_ok = "0";
//				
//				}
//				else {
//					$mailStr =  "Erfassungsdaten gespeichert\r\n" . $mailStr;
//				}
//		
//				if ($formId == "3") {
//					$SqlStr = sprintf("SELECT Email FROM USERS WHERE UserId = %d", $userId);
//					$res = mysqli_query($dbMySQL, $SqlStr);
//					$sqlValue = mysqli_fetch_assoc($res);
//					$email = $sqlValue['Email'];
//				
//					if ($email <> "") {
//						mail ($email, "AD-Besuchsbericht EH " . $customId . $errStr, $mailStr);
//					}
//				}
//			}
//		} // new
//		else {
//			$ins_upd_ok = "0";
//			$msgStr = "Die Daten konnten nicht gespeichert werden, bitte erneut versuchen!";
//		}
//		
//		$referenz = $xml->addChild('check');
//		$referenz->addAttribute("status", $ins_upd_ok);
//		$referenz->addAttribute("formid", $formId);
//		$referenz->addAttribute("formvalid", $formvalId);
//		$referenz->addAttribute("customid", $customId);
//		$referenz->addAttribute("userid", $userId);
//		$referenz->addAttribute("msg", $msgStr);
//		
//	}
?>