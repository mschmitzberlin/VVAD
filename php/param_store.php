
<?php
 	
	require "../dbtools/db_init.php";
	
	// Users
	$target = $_POST['target'];
	$retStr = "";
	if ($target == "#allgemein") {
		$paramGroup =  $_POST['paramGroup'];
		unset ($_POST['target']);
		unset ($_POST['paramGroup']);
		
		foreach ($_POST as $key => $value) {
			
		
			$SqlStr = sprintf("UPDATE PARAMS SET paramValue = '%s' WHERE paramGroup = '%s' AND paramName = '%s'",
									utf8_decode($value),
									$paramGroup,
									utf8_decode($key));
			mysql_query($SqlStr);
			if (mysql_error() <>"") {
					$retStr =  $retStr . mysql_error();
			}
		}
		
		$retStr = "Änderungen wurden gespeichert";
	}
	

	if ($target == "#nutzer") {
		$userId = $_POST['UserId'];
		$password = md5($_POST['Username'] . $_POST['Password']);

		if ($userId == 'NEW') {
			// new User
			
			$SqlStr = sprintf("INSERT INTO USERS (`Firstname`, `Lastname`, `Username`, `pwmd5`, `Email`, `Group`)
							  VALUES ('%s', '%s', '%s', '%s', '%s', '%s')",
								utf8_decode($_POST['Firstname']),
								utf8_decode($_POST['Lastname']),
								utf8_decode($_POST['Username']),
								$password,
								utf8_decode($_POST['Email']),
								$_POST['Group']);
			mysql_query($SqlStr);
			$retStr = "Nutzer " . $_POST['Username'] . " wurde neu angelegt";
			
			if (mysql_error() <>"") {
				$retStr = mysql_error();
			}
		}

		// save changes
		if ($_POST['UserDel'] == 'true') {
			$SqlStr = sprintf("DELETE FROM USERS WHERE userId = %d", $userId);
			mysql_query($SqlStr);
			
			$retStr = "Nutzer " . $_POST['Username'] . " wurde gelöscht";
			if (mysql_error() <>"") {
				$retStr = mysql_error();
			}
		}
		
		if ($userId <> 'NEW') {
			if ($_POST['UserDel'] <> 'true') {
			
				// update User
				
				$SqlStr = sprintf("UPDATE USERS
								  SET `Firstname`='%s',
								  `Lastname`='%s',
								  `Username`='%s',
								  `pwmd5`='%s',
								  `Email`='%s',
								  `Group`='%s'
								  WHERE UserId = %d",
									utf8_decode($_POST['Firstname']),
									utf8_decode($_POST['Lastname']),
									utf8_decode($_POST['Username']),
									$password,
									utf8_decode($_POST['Email']),
									$_POST['Group'],
									$userId);
				mysql_query($SqlStr);

				$retStr = "Änderungen für Nutzer " . $_POST['Username'] . " wurden gespeichert";
				
				if (mysql_error() <>"") {
					$retStr = mysql_error();
				}
			}
		}
		
	}
	
	if ($target == "#formneu") {
		$formame = utf8_decode($_POST['formname']);
		$SqlStr = sprintf ("SELECT * FROM FORMS WHERE UCase(Name) = '%s'", strtoupper($formame));
		$res = mysql_query ($SqlStr);
	
		if (mysql_numrows($res) == 0) {
			$SqlStr = sprintf("INSERT INTO FORMS (`Name`, `Content`, `ListTitle`, `Selection`, `FieldId`, `Test`)
								  VALUES ('%s', '%s', '%s', '%s', '%s', '%s')",
									utf8_decode($_POST['formname']),
									utf8_decode($_POST['Content']),
									'',
									'',
									'',
									'0');
				mysql_query($SqlStr);
				$retStr .= "Formular  " . $formame . " wurde neu angelegt";
				if (mysql_error() <>"") {
						$retStr = mysql_error();
					}
			}
		else {
			// name already exist
			$retStr = "Der gewählte Name existiert bereits. Bitte wählen Sie einen anderen Namen";
		}
		//$_POST['Content']),
		
	}
	
	if ($target == "#formdata_del") {
		$formid = $_POST['exportedDel'];
		
		$SqlStr = sprintf("DELETE FROM FORMSVAL WHERE Exported = 1 AND FormId = %d" ,$formid);
		mysql_query($SqlStr);
			$retStr = "Exportierte Daten wurden gelöscht";
			if (mysql_error() <>"") {
					$retStr = mysql_error();
				}
	}
	
	if ($target == "#form_del") {
		$formid = $_POST['form_del_FormId'];
		
		$SqlStr = sprintf("SELECT FormId, count(*) AS numbers FROM FORMSVAL WHERE FormId = %d GROUP BY FormId", $formid);
		$res = mysql_query($SqlStr);
		if (mysql_numrows($res) == 0) {
			$SqlStr = sprintf("DELETE FROM FORMS WHERE FormId = %d" ,$formid);
			mysql_query($SqlStr);
			$retStr = "Das Formular wurde gelöscht";
		}
		else {
			$retStr = "Für das Formular sind noch Daten gespeichert. Bitte exportieren und löschen Sie erst die Daten";
		}
	}
	

	echo $retStr;

?>