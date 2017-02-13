<?php
    global $dbMySQL;

    $conn_array = array ();
    $conn_array = unserialize(base64_decode(file_get_contents(dirname(__FILE__) ."/dprm.php")));
	$dbMySQL =mysqli_connect ($conn_array ['server'], $conn_array ['user'], $conn_array ['pw'], $conn_array ['db']);
	$dbMySQLi = $dbMySQL;

	function querySqli ($statement) {
		global $dbMySQLi;
		$returnArray = array();
		$names=mysqli_query($dbMySQLi, 'set names utf8');
		$res = mysqli_query($dbMySQLi, $statement);
		
		$returnArray["statement"] = $statement;


		$errNo = mysqli_errno($dbMySQLi);
		$returnArray["sqlerrorno"] = $errNo;
		$errText = mysqli_error($dbMySQLi);
		$returnArray["sqlerrortext"] = $errText;
		
		$returnArray["lastid"] = mysqli_insert_id($dbMySQLi);
		$returnArray["result"] = array();
		$returnArray["singlerow"] = array();
		$returnArray["ok"] = true;
		
		if ($errNo <> 0) {
			$returnArray["ok"] = false;
		}	
		$numRows = 0;
		if (!is_bool($res)) {
			// Kein INSERT / UPDATE
			$numRows = mysqli_num_rows($res);
		}
		$returnArray["numrows"] = $numRows;
		
		
		if ($numRows > 0) {
			while ($sqlValue = mysqli_fetch_assoc($res)) {
				$returnArray["result"][] = $sqlValue;
			}
			$returnArray["singlerow"] = $returnArray["result"][0];
		}
		

		
		return $returnArray;
	}
	
	function sqliEscape($escStr) {
		global $dbMySQLi;
		return mysqli_real_escape_string ($dbMySQLi, $escStr);
		
	}

?>