<?php

    header ('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
	ini_set('display_errors',1);
	error_reporting(E_ALL);
	error_reporting(E_ALL & ~E_NOTICE);

	global $dbMySQL;
	$currentDir = dirname(__FILE__) . "/";
	require $currentDir . "/../dbtools/db_init.php";
	require "users.php";
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

	function loadUsers () {
		// Users
		global $xml;
        global $dbMySQL;
	
		$SqlStr = sprintf("SELECT * FROM USERS ORDER BY LastName");
		$res = mysqli_query($dbMySQL, $SqlStr);
	echo mysqli_error($dbMySQL);
		if (mysqli_num_rows ($res) > 0) {
			while ($arr_value = mysqli_fetch_assoc($res)) {
				unset($arr_value['Password']);
				$referenz = $xml->addChild('users');
				arrayToXML ($arr_value, $referenz);
				
			}
		}
	}
    
	function storeUsers () {
		
		global $xml;
        global $dbMySQL;

		$userId = $_POST['UserId'];
		
		if ($userId == 'NEW') {
			
			// new User
			//nächste UserId < 2000!
			$SqlStr = "SELECT max(UserId) +1  AS nxtId FROM USERS";
			$res = mysqli_query($dbMySQL, $SqlStr);
			$sqlValue = mysqli_fetch_assoc($res);
			$nxtId = $sqlValue["nxtId"];
			
			$SqlStr = sprintf("INSERT INTO USERS (UserId, `Firstname`, `Lastname`, `Username`, `Password`, `Email`, `Group`)
							  VALUES (%d, '%s', '%s', '%s', '%s', '%s', '%s')",
								$nxtId,
								utf8_decode($_POST['Firstname']),
								utf8_decode($_POST['Lastname']),
								utf8_decode($_POST['Username']),
								utf8_decode($_POST['Password']),
								utf8_decode($_POST['Email']),
								$_POST['Group']);
			mysqli_query($dbMySQL, $SqlStr);
			$retStr = utf8_encode("Nutzer " . $_POST['Lastname'] . " wurde neu angelegt");
			
			if (mysqli_error($dbMySQL) <>"") {
				$retStr = mysqli_error($dbMySQL);
			}
		}

		// save changes
		if ($_POST['UserDel'] == 'true') {
			$SqlStr = sprintf("DELETE FROM USERS WHERE userId = %d", $userId);
			mysqli_query($dbMySQL, $SqlStr);
			
			$retStr = utf8_encode("Nutzer " . $_POST['Lastname'] . " wurde gelöscht");
			if (mysqli_error($dbMySQL) <>"") {
				$retStr = mysqli_error($dbMySQL);
			}
		}
		
		if ($userId <> 'NEW') {
			if ($_POST['UserDel'] <> 'true') {
			
				// update User
				
				$SqlStr = sprintf("UPDATE USERS
								  SET `Firstname`='%s',
								  `Lastname`='%s',
								  `Username`='%s',
								   `Email`='%s',
								  `Group`='%s'
								  WHERE UserId = %d",
									utf8_decode($_POST['Firstname']),
									utf8_decode($_POST['Lastname']),
									utf8_decode($_POST['Username']),
									utf8_decode($_POST['Email']),
									$_POST['Group'],
									$userId);
				
				if (isset($_POST['Password'])) {
					$SqlStr = sprintf("UPDATE USERS
								  SET `Firstname`='%s',
								  `Lastname`='%s',
								  `Username`='%s',
								  `Password`='%s',
								  `Email`='%s',
								  `Group`='%s'
								  WHERE UserId = %d",
									utf8_decode($_POST['Firstname']),
									utf8_decode($_POST['Lastname']),
									utf8_decode($_POST['Username']),
									$_POST['Password'],
									utf8_decode($_POST['Email']),
									$_POST['Group'],
									$userId);
				}
				mysqli_query($dbMySQL, $SqlStr);
				
				$retStr = utf8_encode("Änderungen für Nutzer " . $_POST['Username'] . " wurden gespeichert");
				
				if (mysqli_error($dbMySQL) <>"") {
					$retStr = mysqli_error($dbMySQL);
				}
			}
		}
		
		$referenz = $xml->addChild('msg');
		$referenz[0] = $retStr . mysqli_error($dbMySQL);
		
	}
    
	function loadForms  () {
			// load forms
		global $xml;
        global $dbMySQL;        
	
		$SqlStr = sprintf("SELECT FormId, Name, Content FROM FORMS WHERE Test <> 1");
		$res = mysqli_query($dbMySQL, $SqlStr);
		$formStr = "";
		$formStart = 0;
		$formEnd = 0;
		
		if (mysqli_num_rows($res) > 0) {
			while ($arr_value = mysqli_fetch_assoc($res)) {
				$formStart = strrpos ($arr_value['Content'], '<form');
				$formEnd = strrpos ($arr_value['Content'], '</form>') + 7;
				$referenz = $xml->addChild('forms');
				$arr_value['Content'] = substr ($arr_value['Content'], $formStart, $formEnd - $formStart);
				arrayToXML ($arr_value, $referenz);
			}
		}

	}

	function loadFormsVal () {
			
		global $xml;
        global $dbMySQL;        
	
		$SqlStr = "SELECT count(*) AS Anz, FormId, Exported FROM `FORMSVAL` GROUP BY FormId, Exported";
		$res = mysqli_query($dbMySQL, $SqlStr);
		
		if (mysqli_num_rows($res) > 0) {
			while ($arr_value = mysqli_fetch_assoc($res)) {
			
				$referenz = $xml->addChild('formsval');
				$referenz->addAttribute('formid',  $arr_value['FormId']);
				$refVal = $referenz->addChild('count');
				$refVal[0] = $arr_value['Anz'];
				$refVal = $referenz->addChild('export');
				$refVal[0] = $arr_value['Exported'];

			}
		}
	}
    
	function deleteFormData($params) {
		global $xml;
         global $dbMySQL;
		// Daten in Archiv überführen, anschließend löschen
		$formIdDel = $params["formiddel"];
		$SqlStr = sprintf("INSERT INTO FORMSVALARCHIV SELECT * FROM FORMSVAL WHERE FormId = %d AND Exported = 1", $formIdDel);
		mysqli_query($dbMySQL, $SqlStr);

		$SqlStr = sprintf("DELETE FROM FORMSVAL WHERE FormId = %d AND Exported = 1", $formIdDel);
		mysqli_query($dbMySQL, $SqlStr);
		
		$delRows = mysqli_affected_rows($dbMySQL);
		
		if ($delRows <0) {
			$delRows = 0;
		}
		
		$msgStr = utf8_encode($delRows . " Erfassungen wurden archiviert und gelöscht");
		$referenz = $xml->addChild('msg');
		$referenz[0] = $msgStr;
	}
	    
    

$xmlstr = <<<XML
<data>
</data>
XML;
	
	$xml = new SimpleXMLElement($xmlstr);
    
	$status_array = check_session($dbMySQL);
    $userId = $status_array['userId'];

	$referenz = $xml->addChild('status');
	arrayToXML ($status_array, $referenz);
	
	
	$params = $_POST;
		
	$target = $_POST['target'];
	$action = $_POST['action'];

	if ($status_array['logged_in'] == 1) {
		

			if ($action == "load") {
			
			switch ($target) {
				case "#nutzer":
					loadUsers();
				break;
            	case "#logout":
					loadUsers();
				break;
				case "#formdaten":
					loadForms();
                    loadFormsVal();
				break;            
			}
		}
		else

			switch ($target) {
				
			case "#allgemein":
				storeParams();
				
				break;
			case "#nutzer":
				storeUsers();
				break;
			
			case "#formdata_del":
				deleteFormData($_POST);
			break;
		
		}
	}

	echo $xml->asXML();    

?>