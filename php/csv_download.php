<?php
//Daten
	global $dbMySQL;
    require "../dbtools/db_init.php";

	$formid = $_POST['formid'];
	$expRange  = $_POST['export'];
	$elemHeader = array ();
	$elemHeader ['CustomId'] = "CustomerId";
	$elemContainer = array ();
	$elemContainer ['CustomId'] = "";
	$elemNames = explode(";", $_POST['key']);
	
	foreach ($elemNames as $key => $value) {
		$value = urldecode ($value);
		if ($value != "") {
			$tmpArray = explode("=", $value);
			$tmpHeader = trim($tmpArray[1]);
			//$tmpHeader = utf8_encode($tmpHeader);
			$tmpHeader = iconv("UTF-8", "CP1252", $tmpHeader);
			$elemHeader[trim($tmpArray[0])] = $tmpHeader;
			$elemContainer[trim($tmpArray[0])] = "";
		}
		
	}
	$elemHeader ['storeDate'] = "gespeichert am";
	$elemContainer ['storeDate'] = "";
	$exportStr.= implode (";", $elemHeader);
	$exportStr .= "\r\n";
	
	//1. get range of export / all, new

	$SqlStr = sprintf ("SELECT * FROM FORMSVAL WHERE formid = %d AND exported = '0'", $formid);
	
	if ($expRange == "all") {
		$SqlStr = sprintf ("SELECT * FROM FORMSVAL WHERE formid = %d", $formid);
		
	}
	
	$selectedValues = array ();
	
	$res = mysqli_query($dbMySQL, $SqlStr);
	$errStr = $SqlStr;
	$errStr .= mysqli_error($dbMySQL);
	
	//2. create datasets
	
	if (mysqli_num_rows($res) > 0) {
		while ($sqlValue = mysqli_fetch_assoc($res)) {
			
			$selectedValues[] = $sqlValue['FormvalId'];
			$formValues = unserialize(base64_decode($sqlValue['Formvalues']));

			// init elemManes and get values
			
			foreach ($elemContainer as $key => $value) {
				$elemContainer[$key] = "";
				
				if (isset($formValues[$key])) {
					$elemContainer[$key] =  utf8_encode($formValues[$key]);
					$elemContainer[$key] = iconv("UTF-8", "CP1252", $elemContainer[$key]);
				}
				
			}
			$elemContainer ['CustomId'] = $sqlValue['CustomId'];
			$elemContainer ['storeDate'] = date("d.m.Y H:i:s", strtotime($sqlValue['storeDate']));
			
			$exportStr.= implode (";", $elemContainer);
			$exportStr .= "\r\n";

			
		}
		
		
	}	

	//if (mysqli_num_rows($res) > 0) {
	//	
	//	// Überschrift
	//
	//	$exportStr = "";
	//	while ($sqlValue = mysqli_fetch_assoc($res)) {
	//		
	//		$selectedValues[] = $sqlValue['FormvalId'];
	//		$formValues = unserialize(base64_decode($sqlValue['Formvalues']));
	//		
	//		if ($exportStr == "") {
	//			$keyArray = array_keys($formValues);
	//			$exportStr =  "CustomId;gespeichert am;";
	//			$exportStr .= implode (";", $keyArray);
	//			$exportStr .= "\r\n";
	//		}
	//		$exportStr .= $sqlValue['CustomId'] . ";";
	//		$exportStr .=  date("d.m.Y H:i:s", strtotime($sqlValue['storeDate'])) . ";";
	//		
	//		foreach ($formValues as $key => $value) {
	//
	//			$value = iconv("UTF-8", "CP1252", $value);
	//			$value = str_replace(";", " ", $value);
	//			$value = str_replace("\n", " ", $value);
	//			$value = str_replace("\r", " ", $value);
	//			$exportStr.= $value . ";";
	//		}
	//
	//		
	//		//$exportStr = implode (";", $formValues);
	//		$exportStr .= "\r\n";
	//		
	//		//$counter = 0;
	//		//
	//		//foreach ($formValues as $key => $value) {
	//		//	$csvArray[$key][$counter] = iconv("UTF-8", "CP1252", $elemContainer[$value]);
	//		//	
	//		//}
	//		//$csvArray['CustomId'][$counter] = $sqlValue['CustomId'];
	//		//$csvArray['storeDate'][$counter] = date("d.m.Y H:i:s", strtotime($sqlValue['storeDate']));
	//		//$counter ++;
	//		// init elemManes and get values
	//		
	//		//foreach ($elemContainer as $key => $value) {
	//		//	$elemContainer[$key] = "";
	//		//	
	//		//	if (isset($formValues[$key])) {
	//		//		$elemContainer[$key] =  utf8_encode($formValues[$key]);
	//		//		$elemContainer[$key] = iconv("UTF-8", "CP1252", $elemContainer[$key]);
	//		//	}
	//		//	
	//		//}
	//		//$elemContainer ['CustomId'] = $sqlValue['CustomId'];
	//		//$elemContainer ['storeDate'] = date("d.m.Y H:i:s", strtotime($sqlValue['storeDate']));
	//		//
	//		//$exportStr.= implode (";", $elemContainer);
	//		//$exportStr .= "\r\n";
	//
	//		
	//	}
	//	
	//	
	//}
	// set exported
	
	//foreach ($csvArray as $key => $value) {
	//	$exportStr.= $key . ";";
	//}
	//$exportStr .= "\r\n";
	
	
			//$exportStr.= implode (";", $elemContainer);
			//$exportStr .= "\r\n";
	
	
	$exportedIDs = implode (",", $selectedValues);

	if ($exportedIDs != "") {
		$SqlStr = sprintf("UPDATE FORMSVAL SET Exported = '1' WHERE FormvalId IN (%s)", $exportedIDs);
		$res = mysqli_query($dbMySQL, $SqlStr);
	}
	
		
		// get FormName
	$formName ="Daten";
	$SqlStr = sprintf ("SELECT Name FROM FORMS WHERE formid = %d", $formid);
	$res = mysqli_query($dbMySQL, $SqlStr);
	if (mysqli_num_rows($res) > 0) {
		$sqlValue = mysqli_fetch_assoc($res);
		$formName = $sqlValue['Name'];
	}
	
	
	
    $fname = $formName . "_" . date("Ymd_Hi") .".csv";
    
  
    
	header("Content-Type: application/force-download");
    header("Content-Disposition: attachment; filename=\"$fname\"");
    header("Content-Length: ". strlen($exportStr));
	
    echo $exportStr;
    
    exit();



?>