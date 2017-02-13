<?php
    
   // starts the db - connection
   
	//connection for test - database
 /*  $connection=mysql_connect ("db2770.1und1.de", "dbo341127976", "0138_7X");
    if (!$connection) {
        die('Not connected : ' . mysql_error());
    }
    // Set the active MySQL database
    
    $dbMySQL = mysql_select_db("db341127976", $connection);
    if (!$dbMySQL) {
        die ('Can\'t use db : ' . mysql_error());
    }
*/    
   // connection real datatbase

   $connection=mysql_connect ("db378252021.db.1and1.com", "dbo378252021", "0138_7X_1");
    if (!$connection) {
        die('Not connected : ' . mysql_error());
    }
    
    // Set the active MySQL database
    $dbMySQL = mysql_select_db("db378252021", $connection);
    if (!$dbMySQL) {
        die ('Can\'t use db : ' . mysql_error());
    }

    

?>