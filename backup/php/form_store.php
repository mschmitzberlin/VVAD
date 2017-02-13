<?php
// form_storephp
// store forms into database
  
  	require "../dbtools/db_init.php";
	
	$customId = "";
	$formId = "";
	$store_array = $_POST;
	
	$customId = $store_array['customId'];
	$userId = $store_array['userId'];
	$formId = $store_array['formId'];
	$formvalId = $store_array['formvalId'];
	$formValKey_array = array ();
	$formValKey_array = "";
	$ins_upd_ok = true;
	
	unset($store_array['customId']);
	unset($store_array['formId']);
	unset($store_array['formvalId']);
	unset($store_array['userId']);
	
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
				$ins_upd_ok = false; // no insert / update
				echo "Es wurden bereits schon Daten erfasst, die Daten wurden nicht gespeichert";
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
					$ins_upd_ok = false; // no insert / update
					echo "Der im Feld " . $fieldId . " eingegebene Wert " . $_POST[$fieldId] . " konnte nicht gefunden werden, die Daten wurden nicht gespeichert";
				}
			}
		}
		if ($ins_upd_ok == true) { // no double dataset
			
			$mailStr = "";
			//convert values
			foreach ($store_array as $key => $value) {
					$store_array[$key] = utf8_decode ($value);
					$mailStr .= $key . "=" . "$value\r\n";
			}
			
			$array_str = base64_encode(serialize($store_array));
			if ($formvalId == "NEW") {
			// insert
				$SqlStr = sprintf("INSERT INTO FORMSVAL (FormId, UserId, CustomId, FormValKey, Formvalues, storedate) VALUES('%s', '%s', '%s', '%s', '%s', NOW())", $formId, $userId, $customId, $formValKey, $array_str);
			}
			else {
				// update
				$SqlStr = sprintf("UPDATE FORMSVAL SET FormValKey = '%s', Formvalues = '%s', storedate = NOW() WHERE FormvalId = '%s'", $formValKey, $array_str, $formvalId);
			}
			
			$res = mysql_query($SqlStr);
			echo mysql_error();
			$errStr = "";
			
			if (mysql_error() <> "") {
				$mailStr = "Fehler beim Speichern " . mysql_error() ."\r\n" . $mailStr;
				$errStr = " Fehler beim Speichern!";
				
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
	else
	echo "Die Daten konnten nicht gespeichert werden, bitte erneut versuchen!";
	
	

?>