
<meta content="text/html; charset=UTF-8">
    
<?php
  require "../php/config.php";
  require "db_init.php";

    function vv_xml_to_sql ($xml, $table, $key = "") {

        $Sql = "";
        if (count($xml) > 0) {
            
            // delete all records
            if ($key <> ""){
                $Sql = sprintf("DELETE FROM %s" , $table);
                mysql_query($Sql);
            }
            // create the fieldlist
            $xml_array = (array) current($xml);
            $xml_array = (array) current($xml_array);
            $array_keys = array_keys($xml_array);
            $Sql = sprintf("INSERT INTO %s (", $table);
            $Sql .=  implode (",", $array_keys);
            $Sql .= ') VALUES("';
            
            // insert values 

            foreach ($xml as $arr_key => $arr_value) {
                $xml_array = (array) $arr_value;
 
                $Sql_value = implode ('", "', $xml_array);
                $Sql_value  = iconv("utf8","ISO-8859-1",$Sql_value);
                $Sql_value .=  '")';
                $Sql_complete = $Sql . $Sql_value;

                mysql_query($Sql_complete);
                echo mysql_error();
            }
            //echo $Sql_complete;
        }
    }    

    
    $upload_files = array ('ZIP_TGL.ZIP', 'ZIP_MO.ZIP', 'ZIP_DI.ZIP', 'ZIP_MI.ZIP', 'APPVALUES.ZIP', 'ZIP_DOCS.ZIP');
    $upload_path = 'upload/';
    $mail_str = "";
    $mail_err = "";
    
    // unzip all uploaded files
     
    foreach ($upload_files as $key => $value) {
        $file_with_path = $upload_path . $value;
        $zip = new ZipArchive;
        
        if ($zip->open($file_with_path) === TRUE) {
            if ($value == "ZIP_DOCS.ZIP") {
                $zip->extractTo('../documents/');
            }
            else {
                $zip->extractTo($upload_path);
            }
            
            $zip->close();
            $mail_str = $mail_str . "zip entpackt: " . $file_with_path . date('d.m.y  H:i:s') . "\n";
            unlink($file_with_path);
        }
    }
    
    // Update APPValues
    // $xml_files[] = array ('file' => 'APPVALUES.XML', 'table' => 'APPVALUES');
    
    //Laden desribe-Tabelle
    $SqlStr = "SELECT * FROM `DESCRIBE`";
    $dbresult = mysql_query($SqlStr);
    $descrArray = array();
    
    while ($sqlValue = mysql_fetch_assoc($dbresult)) {
        $descrArray[$sqlValue["AppValName"]][$sqlValue["AppValValue"]] = $sqlValue["Describe"];
    }
    
    //laden appdef
    $SqlStr = "SELECT * FROM APPDEF";
    $dbresult = mysql_query($SqlStr);
    $appdef = array();
    
    while ($arr_value = mysql_fetch_assoc($dbresult)) {
        $appdef[$arr_value['name']]['type'] = $arr_value['typeId'];
        $appdef[$arr_value['name']]['test'] = $arr_value['Test'];
    }
    
    print_r($appdef);
    $file_with_path = $upload_path . 'APPVALUES.XML';
    echo $file_with_path = $upload_path . 'APPVALUES.XML';
   
   //  if (file_exists($file_with_path)) {
    foreach (glob($upload_path . "APPVALUES*.XML") as $filename) {
        echo "lese Appvalues " . $filename . "\n";
        $mail_str .= "Verabeite Datei: " . $filename . "\n";
        $xmlreader = new XMLReader();
        $xmlreader->open($filename);
        // load typedefs
        $SqlStr = "SELECT * FROM APPDEF";
        $dbresult = mysql_query($SqlStr);

        $def_values = get_defined_constants();
        $counter = array ();
        $errorFile = false;

        echo "\n Appval exist\n";

        
        $doc = new DOMDocument('1.0','cp1252');
        $xx = 0;
        while($xmlreader->read()) {
            $xx++;

            if($xmlreader->nodeType == XMLReader::ELEMENT && $xmlreader->name == 'APPVALUES') {
                $domNode = $xmlreader->expand();
                if ($domNode !== false) {
                    $xml = simplexml_import_dom($doc->importNode($domNode,true));

                    $customID = $xml->customID;
                    $name =  strtolower ($xml->name);
                    $content = $xml->content;
                    $content = iconv("utf-8","cp1252",$content);

                    // search and convert types
                    $counter[$name]++;
                    $tableFirstRow = "";
                   
                    if (isset($appdef[$name])) {
                        $appdef_type = $appdef[$name]['type'];
                        echo "type " . $appdef_type;
                        if ($appdef_type > 0){
                            if ($appdef_type == "1") {
                                $content =  urlencode("http://www.vvberlin-online.de/VVADNEW/vv/101214/i4PoS2go/" . DOC_PATH) . $content . "&embedded=true";
                            }                          
                            
                            if (($appdef_type == 2) or ($appdef_type == 3))  { // table
                                $csv_Data = explode("\n", $content);
                                $head_array = explode(";" , $csv_Data[0]);

                                foreach ($head_array as $key => $value) {
                                    $head_array[$key] =  htmlentities( $value, ENT_COMPAT, 'Windows-1252' );
                                }
                                
                                $table_str = '<table><colgroup>';
                                for ($l=1; $l <= count($head_array); $l++) {
                                    $table_str .= "<col></col>";    
                                }

                                $table_str .= "</colgroup>";
                                $tableFirstRow = "<thead><tr><th>" . implode ("</th><th>", $head_array) . "</th></tr></thead>";
                                if ($appdef_type == 3) {  // table with head
                                  $tableFirstRow = "<tr><td>" . implode ("</td><td>", $head_array) . "</td></tr></thead>";
                                  
                                }
                                
                                $table_str .= $tableFirstRow;
                                unset($csv_Data[0]);
                                foreach($csv_Data as $csv_Row) {
                                    if ($csv_Row <> "") {
                                        $row_array = explode(";" , $csv_Row);
                                        foreach ($row_array as $key => $value) {
                                            $row_array[$key] =  htmlentities( $value, ENT_COMPAT, 'Windows-1252' );
                                        }
                                        $table_str .= "<tr><td>" . implode ("</td><td>", $row_array) . "</td></tr>";
                                    }
                                }
                                $table_str .= "</table>"; 
                                $content = $table_str;
                            }
                            
                            if (($appdef_type == 4) or ($appdef_type == 5)) { // phone_link
                                $phone_link = "";
                                $phone_title = "Tel.: ";
                                if ($appdef_type == 5 ) {
                                    $phone_title = "Mobil: ";
                                    
                                }
                                $phone_link = '<a class="phone" title="' . $phone_title . '" href="tel:' . $content . '">' . $content . '</a>';
                                $content = $phone_link;
                                
                            }
                           
                            if ($appdef_type == 6) { // phone_link
                                $content = '<a class="forward email" title="E-Mail: " href="mailto:' . $content . '">' . $content . '</a>';
                            }
                        }
                        else {
                            $content = htmlentities( $content, ENT_COMPAT, 'Windows-1252' );
                        }
                    }
                    $appTable = "APPVALUES";
                   
                    if (isset ($appdef[$name])) {
                        if ($appdef[$name]['test'] == '1') {
                            $appTable = "APPVALUESTEST";
                        }
                    }
                    
                    //Describe!
                    
                    if (isset($descrArray[$name][$content])) {
                        $content = $descrArray[$name][$content];
                    }
                    
                    // img defines
                    foreach ($def_values as $key => $value) {
                        $content = str_replace($key, '<img src="' . $value . '" alt="' .$key . '">', $content);
                    }
                  
                    $content= mysql_escape_string($content);
                
                    $SqlStr = sprintf ("SELECT CustomId FROM $appTable WHERE CustomId = '%s' AND name = '%s'",$customID, $name);
                    $dbresult = mysql_query($SqlStr);
                    if (mysql_error() <> "") {
                         $mail_str = $mail_str . "SQL Err: " . mysql_error();
                    }
                    
                    $SqlStr = sprintf ("INSERT INTO $appTable (CustomId, name, content, last_update) VALUES ('%s', '%s', '%s', now())",$customID, $name, $content);
                    if (mysql_num_rows ($dbresult) > 0) {
                        $SqlStr = sprintf ("UPDATE $appTable SET content = '%s', last_update = NOW() WHERE CustomId = '%s' AND name = '%s'", $content, $customID, $name);
                    }
                    //echo $SqlStr;
                    mysql_query($SqlStr);
                    if (mysql_error() <> "") {
                        
                        $mail_str = $mail_str . "SQL Err: " . mysql_error();
                    }

                    //foreach ($appdef_upd as $key => $value) {
                    //    $SqlStr = sprintf ("UPDATE APPDEF SET last_update = NOW() WHERE name = '%s'",$value);
                    //    mysql_query($SqlStr);
                    //}
                
                } // if domNode !== false
             
                else {
                    //domNode falsch
                    $mail_err .= " Fehler!";
                    $mail_str .= "Fehler in Datei " . $filename . "\n";
                    $mail_str .= "zuletzt verarbeitet  " . $customID . " / " . $content . "\n";
    
                    foreach ($e as $errkey => $errvalue) {
                        $mail_str .= $errkey . ": " . $errvalue . "\n";
                    }
                    echo "setze Errorstatus " . $errorFile;
                    $errorFile = true;
                    echo "setze Errorstatus " . $errorFile;
                }
                
               
            } //   if($xmlreader->nodeType == XMLReader::ELEMENT 
        } // while xmlreader read
        
        foreach ($counter as $key => $value) {
            $mail_str .= "$key Anzahl: $value\n";
        }
      
        $xmlreader->close();
        
        if ($errorFile == true) {
            $fileBaseName = basename($filename);
            echo "Fehler " . $filename;
            unlink("error/" . $fileBaseName);
            rename ($filename, "error/" . $fileBaseName);
        
        }
         
        else {
          //  unlink($filename);

        }
        
    } // foreach file
    
    // create entries in appvalues

    $SqlStr = "DELETE FROM APPVALUES WHERE name = 'profil'";
    mysql_query($SqlStr);  

    $pfad = "../documents/";
    $ausgabe = @opendir($pfad);
    while ($datei = readdir($ausgabe))           {
        if(($datei!=".") and ($datei!=".."))    {
            if (substr($datei,5) == '_K_PROFIL.PDF') {
                $customerId = substr($datei,0,5);
                $content =  urlencode("http://www.vvberlin-online.de/VVADNEW/vv/101214/i4PoS2go/" . DOC_PATH) . $datei . "&embedded=true";
                $SqlStr = sprintf ("INSERT INTO APPVALUES (CustomId, name, content, last_update) VALUES ('%s', '%s', '%s', now())",$customerId, 'profil', $content);
                 mysql_query($SqlStr);  
                //85623_K_PROFIL.PDF
            }
        }
    }
    closedir($ausgabe);
 
     // renew saerch table
    $SqlStr = sprintf ("DELETE FROM SEARCH");
    mysql_query($SqlStr);
    
    $SqlStr = sprintf ("INSERT INTO SEARCH (CustomId, name) SELECT CustomId, content FROM APPVALUES WHERE name='nachname'");
    mysql_query($SqlStr);
    $SqlStr = sprintf ("UPDATE SEARCH S INNER JOIN APPVALUES A ON S.CustomId = A.CustomId SET S.strasse = A.content WHERE A.name = 'strasse'");
    mysql_query($SqlStr);
    $SqlStr = sprintf ("UPDATE SEARCH S INNER JOIN APPVALUES A ON S.CustomId = A.CustomId SET S.vorname = A.content WHERE A.name = 'vorname'");
    mysql_query($SqlStr);
    $SqlStr = sprintf ("UPDATE SEARCH S INNER JOIN APPVALUES A ON S.CustomId = A.CustomId SET S.ort = A.content WHERE A.name = 'ort'");
    mysql_query($SqlStr); 
    $SqlStr = sprintf ("UPDATE SEARCH S INNER JOIN APPVALUES A ON S.CustomId = A.CustomId SET S.geo_lat = A.content WHERE A.name = 'geo_lat'");
    mysql_query($SqlStr);
    $SqlStr = sprintf ("UPDATE SEARCH S INNER JOIN APPVALUES A ON S.CustomId = A.CustomId SET S.geo_lng = A.content WHERE A.name = 'geo_lng'");
    mysql_query($SqlStr);  

    $mail_betr = "Update taegl VVAD " . date('d.m.y') ." ". $mail_err;
    $mail_str = $mail_str . $mail_err;
    if ($mail_str == "") {
        $mail_betr .= " Keine Daten vorhanden.";
    }
    else {
        $mail_str .= "Update beendet:" . date('d.m.y  H:i:s'); 
    }
    // Mail
    mail ("mschmitz@vvberlin.de", $mail_betr , $mail_str);
    
?>