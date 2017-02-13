<?php
// users.php
// functions for users login , logout, user - information and session - handling



	
	function validate_login() {
		
		$return_value = false;
		$username = strtoupper($_SESSION['username']);
		$username = iconv("utf8","ISO-8859-1",$username);
		//$password = iconv ("utf8","ISO-8859-1", $_SESSION['password']);
		$password = $_SESSION['password'];

		//$SqlStr = sprintf("SELECT * FROM USERS WHERE UPPER(Username) = '%s' AND Password = '%s'", $username, $password);
		$SqlStr = sprintf("SELECT * FROM USERS WHERE UPPER(Username) = '%s' AND pwmd5 = '%s'", $username, $password);
//print_r($SqlStr);
		$res = mysql_query($SqlStr);
	//	echo mysql_error();
		
        if (mysql_num_rows($res) > 0) {
				// login successfull
                $dbresult = mysql_fetch_assoc($res);
				$_SESSION['username'] = utf8_encode($dbresult['Firstname'] . " " . $dbresult['Lastname']);
				$_SESSION['login'] = utf8_encode($dbresult['Username']);
				$_SESSION['userId'] = $dbresult['UserId'];
				$_SESSION['group'] = $dbresult['Group'];

				$return_value = true;
			}
			
			else {
				$_SESSION['userId'] = 0;
				
			}
			// reset password
			
			$_SESSION['password'] = "";
			return $return_value;
	}
	
	
	function check_session () {
		
		/* session handler
		  start session;
		  check, if user logged in
		  check, if session time is over
		  return array sets the status in xml
		*/
		
		$status_array = array ('logged_in' => 0, 'username' => '','msg' => '');
		
		session_name ("VVAD");
		session_start();
		

		
		// check if session already started 
		
		if (!isset($_SESSION['started'])) {
			// new Start -init Session container for global variables

			// important, must be changed into 0 !!	
            $_SESSION['logged_in'] = -1; 
			$_SESSION['userId'] = 0;
			$_SESSION['username'] = "";
			$_SESSION['loginname'] = "";
			$_SESSION['password'] = "";
			$_SESSION['group'] = 0;

			$_SESSION['started'] = 1;
			
		}
		
		// session is started; 
		// read POST and store it into session; if session not started yet, POST_values will not stored
		foreach ($_POST as $key => $value) {
        
            if (isset($_SESSION[$key])) {
				
				$_SESSION[$key] = $value;
            }

        }
		
		// check for user login
		
		if ($_SESSION['logged_in'] == 0) {

			if (validate_login() == true){

				// user has logged in; set session time
                //login session params
				$_SESSION['logged_in'] = 1;
				$_SESSION['login_start'] = time();
				$_SESSION['login_last_call'] = time();
				$_SESSION['login_max'] = 3600; // maximum session in seconds
				
			}
			else {

				$status_array['msg'] = "Benutzename / Passwort nicht korrekt";
			}
		}
		
		if ($_SESSION['logged_in'] == 1) {

			// user is logged in; check if session time is over;
			$act_time = time();
			$last_call = $_SESSION['login_last_call'];
			$max_time = $last_call + $_SESSION['login_max'];
		
			if ($max_time < $act_time) {
            
				$_SESSION['logged_in'] = 0;
				$status_array['msg'] = "Session abgelaufen, bitte erneut anmelden.";
				session_logout();
			}
			else {

				// set new session time
				$_SESSION['login_last_call'] = time();
			}
		
			// check, if user has logged out
			if (isset($_POST['logged_out'])) {
			
				$_SESSION['logged_in'] = 0;				
				$status_array['msg'] = "User abgemeldet";
				session_logout();
			}
		}
		
		$status_array['logged_in'] = $_SESSION['logged_in'];
		$status_array['username'] = $_SESSION['username'];
		$status_array['userId'] = $_SESSION['userId'];
		$status_array['login'] = $_SESSION['login'];
		$status_array['group'] = $_SESSION['group'];
		return ($status_array);
	}
	
	function session_logout() {

		// stops the session, delete session_values
		session_unset ();
		session_destroy();
		SetCookie("VVAD", "", 0, "/");
	}
	


?>