<?php
    header('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
	
	require "../dbtools/db_init.php";
	
	ini_set("auto_detect_line_endings", true);

	$uploaddir = '../dbtools/upload/';
	$uploadfile =  $uploaddir . $_FILES ['fileToUpload']['name'];
	$msgStr = "";
	$errorStr = "";
	
	if (move_uploaded_file($_FILES['fileToUpload']['tmp_name'], $uploadfile)) {
		$formId = $_POST['FormId'];

		$fileContent = file($uploadfile, FILE_IGNORE_NEW_LINES);
		$fileContent = array_flip($fileContent);
	
		$dataStr = base64_encode(serialize($fileContent));
		
		$SqlStr = sprintf ("UPDATE FORMS SET CustomFilter = '%s' WHERE FormID = %d " , $dataStr, $formId);
		mysql_query($SqlStr);
		@unlink($_FILES['fileToUpload']);
		// delete files
//		foreach ($formfiles as $key => $value) {
//			unlink($value);
//		}
		
	
		$msgStr = "Kundendaten geladen";
		
	}
	
	else {
		$errorStr = "Datei konnte nicht geladen werden";
	}
		
		
			


        $xmlstr = <<<XML
<data>
</data>
XML;
        $xml = new SimpleXMLElement($xmlstr);
		
		if ($msgStr <> "") {
			$referenz = $xml->addChild('msg');
			$referenz[0] = $msgStr;
		}
		
		if ($errorStr <> "") {
			$referenz = $xml->addChild('error');
			$referenz[0] = $errorStr;
		}
		
		echo $xml->asXML();
		$xml->asXML("form_upload.xml");
		

	
	
?>