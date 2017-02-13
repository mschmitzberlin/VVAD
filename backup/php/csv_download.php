<?php
//Daten

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
	$res = mysql_query($SqlStr);
	$errStr = $SqlStr;
	$errStr .= mysql_error();
	
	//2. create datasets

	if (mysql_num_rows($res) > 0) {
		while ($sqlValue = mysql_fetch_assoc($res)) {
			
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
	// set exported
	
	$exportedIDs = implode (",", $selectedValues);

	if ($exportedIDs != "") {
		$SqlStr = sprintf("UPDATE FORMSVAL SET Exported = '1' WHERE FormvalId IN (%s)", $exportedIDs);
		$res = mysql_query($SqlStr);
	}
	
		
		// get FormName
	$formName ="Daten";
	$SqlStr = sprintf ("SELECT Name FROM FORMS WHERE formid = %d", $formid);
	$res = mysql_query($SqlStr);
	if (mysql_num_rows($res) > 0) {
		$sqlValue = mysql_fetch_assoc($res);
		$formName = $sqlValue['Name'];
	}
	
	
	
    $fname = $formName . "_" . date("Ymd_Hi") .".csv";
    
  
    
	header("Content-Type: application/force-download");
    header("Content-Disposition: attachment; filename=\"$fname\"");
    header("Content-Length: ". strlen($exportStr));
	
    echo $exportStr;
    
    exit();



?>