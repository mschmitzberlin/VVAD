<?php
    header('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header

	$uploaddir = '../dbtools/upload/';
	$uploadfile =  $uploaddir . $_FILES ['fileToUpload']['name'];
	$errorStr = "";
		if (move_uploaded_file($_FILES['fileToUpload']['tmp_name'], $uploadfile)) {
			 // is zip?
			$zip = new ZipArchive;
			if ($zip->open($uploadfile) === TRUE) {
				$zip->extractTo($uploaddir);
				
				for($i = 0; $i < $zip->numFiles; $i++) {  
					$formfiles[] = $uploaddir . $zip->getNameIndex($i);
				}
				$zip->close();
			}
			else {
				$formfiles[] = $uploadfile;
				
			}
			
			// scan for form
			foreach ($formfiles as $key => $value) {
				$fileContent = file_get_contents($value);
				$formStart = strrpos ($fileContent, '<form');
				$formEnd = strrpos ($fileContent, '</form>') + 7;
				if (($formStart > 0) and ($formEnd > 0)) {
					// we have the form
					$formStr = substr ($fileContent, $formStart, $formEnd - $formStart);
					// echo $formStr;
					break;
				}
				else {
					$errorStr = "In der Datei wurde kein Formular gefunden";
				}
			}
			
			@unlink($_FILES['fileToUpload']);
			// delete files
			foreach ($formfiles as $key => $value) {
				unlink($value);
			}

		}
		else {
			$errorStr = "Datei konnte nicht geladen werden";
		}
		
		
			


        $xmlstr = <<<XML
<data>
</data>
XML;
        $xml = new SimpleXMLElement($xmlstr);
		
		if ($formStr <> "") {
			$referenz = $xml->addChild('form');
			$referenz[0] = $formStr;
		}
		
		if ($errorStr <> "") {
			$referenz = $xml->addChild('error');
			$referenz[0] = $errorStr;
		}
		
		echo $xml->asXML();
		$xml->asXML("form_upload.xml");
		

	
	
?>