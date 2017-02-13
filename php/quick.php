<?php

	require "../dbtools/db_init.php";
	//require "frontend.php";
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
				print_r($e);
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
				echo "ws";
				return false;
			}
			
			$serviceResponse = $this->connect->callService($this->funcName, $this->params);
			if ($serviceResponse == false) {
				echo "servrs";
				return false;
			}

			reset($serviceResponse);
			$respFuncName = key($serviceResponse);
			print_r($serviceResponse);
			if ($serviceResponse->$respFuncName === false) {
				echo "func";
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

		private function GetADDatas () {
			$kdnr = $this->params["kdnr"];
			
			unset ($this->params);
			$this->params["kdnr"] = $kdnr;
			$this->params["pictindate"] = "";

			$this->params["pictoutdate"] = "";
		}		
		
		
		// Post Verarbeitung Weiterbehandlung
		private function GetKustResult () {
			
			$kustresultArray = explode(";",  $this->responseContent);
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
					exec('convert -density 300 -resize 80% "'. $pdf . '" "' . $kprofilFileTemp.'"', $output, $return_var);
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
	
$xmlstr = <<<XML
<data>
</data>
XML;
	
	$xml = new SimpleXMLElement($xmlstr);
	
	$params["function"]="GetBezug";
	$params["Kdnr"]="10009"	;
	$params["Tnr"]="00426"	;
	$connect = new connect();
	$getDatas = new getDatas($connect);
	$getDatas->getDatas($params);

	//$getDatas->getDatas($params);	
    echo $xml->asXML(); 
?>