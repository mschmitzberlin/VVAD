<?php
 
    

    function vv_search_custom ($Kdnr) {
        
        $result_array = array ();
        $str_search = array ('Ä','ä','Ü','ü','Ö,','ö');
        $str_repl = array('A','a','U','u','O','o');
        $Kdnr = str_replace( $str_search, $str_repl, $Kdnr);
        $search_str = "%" . $Kdnr . "%";
        $ret_str = "";
        
        $SqlStr = sprintf("SELECT * FROM(
            SELECT CONCAT(RTRIM(vorname), ' ', RTRIM(name), ', ', RTRIM(strasse),', ', RTRIM(ort), ', ', CustomId)  AS Search, CustomId FROM SEARCH WHERE NAME LIKE '%s'
                UNION
            SELECT CONCAT(RTRIM(strasse), ', ',RTRIM(ort), ', ', RTRIM(vorname), ' ',  RTRIM(name),', ', CustomId)  AS Search, CustomId FROM SEARCH WHERE STRASSE LIKE '%s' ) 
            AS T1 ORDER BY search", $search_str, $search_str);
        

        
        $SqlStr = utf8_decode($SqlStr);
        $res = mysql_query($SqlStr);
        echo mysql_error();
        if (mysql_num_rows($res) > 0) {
            
            while ($arr_value = mysql_fetch_assoc($res)) {
                $ret_str .= "<li name=" . $arr_value['CustomId'] . "><a href = '#'>" . $arr_value['Search'] . "</a></li>";
            }
        }
        if ($ret_str <> "") {
            $result_array[] = $ret_str;
        }
      
        return $result_array;
    }
    
    function getParam ($param) {
        
        $paramValue = "";
        $SqlStr = sprintf("SELECT ParamValue FROM PARAMS WHERE lCase( paramName ) = '%s'",strtolower($param));
		$res = mysql_query($SqlStr);
		
		if (mysql_num_rows($res) > 0) {
			$sqlValue = mysql_fetch_assoc($res);
            $paramValue = $sqlValue['ParamValue'];
        }
        
        return $paramValue;
    }
    
    // new global function for all variables
    function read_appvalues ($Kdnr) {
 
        $dbresult = array ();
        $SqlStr = "";
        $resultarray = array ();
       
        // $SqlStr = sprintf("SELECT V.name, content, typeId FROM APPVALUES V LEFT JOIN APPDEF D ON V.name = D.name WHERE CustomId = '%s'", $Kdnr);
        // TEST!!!
        $SqlStr = sprintf("SELECT V.name, content, typeId FROM APPVALUES V LEFT JOIN APPDEF D ON V.name = D.name WHERE CustomId = '%s'", $Kdnr);
        $res = mysql_query($SqlStr);
        
        if (mysql_num_rows($res) > 0) {
            while ($arr_value = mysql_fetch_assoc($res)) {
                
                if (rtrim($_SESSION['username']) == "Gastnutzer") {
                  if ($arr_value['name'] == 'profil') {
                    $arr_value['content'] = 'http%3A%2F%2Fwww.vvberlin-online.de%2FVVADNEW%2Fvv%2F101214%2Fi4PoS2go%2Fdocuments%2FGAST_K_PROFIL.PDF&embedded=true';
                   
                  }
                if ($arr_value['name'] == 'nachlieferung') {
                    $arr_value['content'] = '00000';
                   
                  }
                }
                //create array
                $array_key = $arr_value['name'];
                // parse type
                $type = $arr_value['typeId'];
                $resultarray[$arr_value['name']] = $arr_value['content'];
                
            }
            
                // create value for pict
                $fBaseName = getParam("pictureFName") . $Kdnr;
                
                $image_path = getcwd() . "/" .  PICT_VKST_IN;
                $image_file = "";
                $fileList = glob($image_path . $fBaseName . ".*");
				
                if (is_array($fileList) and (count($fileList) > 0 )) {
					
                    $fileArray = pathinfo($fileList[0]);
                    $image_file = $fileArray['basename'];
                    $resultarray['pict_vkst_in'] = '<img src="' . PICT_VKST_IN . $image_file . '" />';
                    
                }
                                else {
                    $resultarray['pict_vkst_in'] = '';
                }
                
                //print_r (pathinfo($fileList[0]));
                ////echo $image_path;
                //if (file_exists ($image_path . $image_file)) {
                //    $resultarray['pict_vkst_in'] = '<img src="' . PICT_VKST_IN . $image_file . '" />';
                //}
                //else {
                //    $resultarray['pict_vkst_in'] = '';
                //}
                 
                $image_path = getcwd() . "/" .  PICT_VKST_OUT;
                $image_file = "";
                $fileList = glob($image_path . $fBaseName . ".*");
                if (is_array($fileList) and (count($fileList) > 0 )) {
                    $fileArray = pathinfo($fileList[0]);
                    $image_file = $fileArray['basename'];
                    $resultarray['pict_vkst_out'] = '<img src="' . PICT_VKST_OUT . $image_file . '" />';
                }
                                else {
                    $resultarray['pict_vkst_out'] = '';
                }
                
                 
                //$image_path = getcwd() . "/" .  PICT_VKST_OUT;
                //$image_file = $Kdnr . ".JPG";
                //           
                //if (file_exists ($image_path . $image_file)) {
                //    $resultarray['pict_vkst_out'] = '<img src="' . PICT_VKST_OUT . $image_file . '" />';
                //}
                //    
                //else {
                //    $resultarray['pict_vkst_out'] = '';
                //} 
        }

        return $resultarray;  
    }
    
    // new global function for all variables
    
    function arrayToXML ($inArray, $inRef) {
        
        /* convert array int xml - string;
        rules : if key is numeric
                    if value is array:
                        call function with array, create new xml-node
                    else
                        value ist the value in xml-node
                if key = 'attr'
                        read follow array as attributes into the xml-node
 */
 
        foreach($inArray as $key => $value) {
           
            if ($key === 'attr') {
                // read attr-array, create child atributes

                
                foreach($value as $attr_key => $attr_value) {
                    $inRef->addAttribute($attr_key, $attr_value);
                }
            }
 
            else {
                if (is_numeric($key)) {
                    $newRef = $inRef;
                }
                else {
                    if ($key <> 'content') {
                        $newRef = $inRef->addChild($key);
                    }
                }
               
                if(is_array($value)) {
                    arrayToXML ($value, $newRef);
                }
                else {
                    $inRef[0] = utf8_encode($value);
                }
            }
        }
    }
	



    function vv_setcontent ($content_file) {
        
        header('Content-Type: text/xml');
        header ('Cache-Control: no-cache');
        header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header


        $search_array = array ();
        $repl_array = array ();
        $content_array = array ();
        $Kdnr = "";
        
        $return_array = array ();
        $status_array = array ();
        $xmlstr = <<<XML
<data>
</data>
XML;
        $xml = new SimpleXMLElement($xmlstr);
        
        $demo_user = "false";
        $status_array = check_session();
        $status_array['kdnr_found'] = 0; 

        if ($status_array['logged_in'] == 1) {
    
            $Kdnr = $status_array['Kdnr'];
            
            if ($Kdnr <> "") {
            
                if (is_numeric($Kdnr)){
                //Kdnr is a number
                    
                    // guest user or demo kdnr
                    if ($Kdnr == '99999') {
                        $demo_user = true;
                        $Kdnr = '10006';
                    }
                    if ($Kdnr == '99998') {
                        $demo_user = true;
                        
                    }


                    if (rtrim($_SESSION['login']) == "gast") {
                        $demo_user = true;
                        $Kdnr = '10006';
                    }
                  
                    //  $content_array = array_merge($content_array, $return_array);

                    // APPVALUES
                    $return_array = read_appvalues ($Kdnr);
                    
                    if ($demo_user === true) {
                        
                        // data for demo-user
                        // guest name, address etc
                           $return_array['nachname'] = "Muster";
                           $return_array['vorname'] = "Max";
                           $return_array['plz'] = "12103";
                           $return_array['ort'] = "Berlin";
                           $return_array['strasse'] = "Egelingzeilte 6";
                           $return_array['epanr'] = "99999";
                           $return_array['kdnr'] = "00000";
                           $return_array['telefon'] = "030 555 11 22";
                           $return_array['telefon2'] = "030 555 11 33";
                           $return_array['nachlieferung'] = "";
                           $return_array['pict_vkst_in'] = '<img src="' . PICT_VKST_IN . '99999.JPG' . '" />';
                           $return_array['pict_vkst_out'] = '<img src="' . PICT_VKST_OUT . '99999.JPG' . '" />';
                           $return_array['profil'] = 'http%3A%2F%2Fwww.vvberlin-online.de%2FVVADNEW%2Fvv%2F101214%2Fi4PoS2go%2Fdocuments%2FGAST2_K_PROFIL.PDF&embedded=true';
                           
                    }
                    
                    if ($Kdnr == "99998") {
                        $demo_user = true;
                        // data for demo-user
                        // guest name, address etc
                           $return_array['nachname'] = "";
                           $return_array['vorname'] = "STORECHECKAKTION COVER BERLIN";
                           $return_array['plz'] = "12103";
                           $return_array['ort'] = "Berlin";
                           $return_array['strasse'] = "Egelingzeilte 6";
                           $return_array['epanr'] = "99999";
                           $return_array['kdnr'] = "00000";
                           $return_array['telefon'] = "";
                           $return_array['telefon2'] = "";
                           $return_array['nachlieferung'] = "";
                           $return_array['pict_vkst_in'] = '<img src="' . PICT_VKST_IN . '99999.JPG' . '" />';
                           $return_array['pict_vkst_out'] = '<img src="' . PICT_VKST_OUT . '99999.JPG' . '" />';
                           $return_array['profil'] = 'http%3A%2F%2Fwww.vvberlin-online.de%2FVVADNEW%2Fvv%2F101214%2Fi4PoS2go%2Fdocuments%2FGAST2_K_PROFIL.PDF&embedded=true';
                           
                    }
                    
                    
                    if (!empty($return_array)) {
                       $status_array['kdnr_found'] = 1;

                        foreach ($return_array as $key => $value)  {
                            $referenz = $xml->addChild('application');
                            $refName = $referenz->addChild('name');
                            $refName[0] = "var_" . strtolower($key);
            
                            $refContent = $referenz->addChild('content');
                            $refContent[0] = utf8_encode($value);

                        }
                        
                        
                        // customId
                        $referenz = $xml->addChild('application');
                        $refName = $referenz->addChild('name');
                        $refName[0] = "var_CustomId";
                        $refContent = $referenz->addChild('content');
                        $refContent[0] = utf8_encode($Kdnr);
                        if ($demo_user === true){
                           $refContent[0] = "99999";
                        }

                         //update Kdnr and Statnr for Session - needed for Nachlieferungen online
                        $_SESSION['Kdnr'] = $Kdnr;
                        $_SESSION['Statnr'] = round($content_array['KUST_STATNR']['value']);
                    }
                    else {
                
                        $status_array['kdnr_found'] = 0;
                        $status_array['msg'] = "Falsche Kundennummer";
                                     
                    }
                }
                else {
                    // Kdnr not numeric - create search

                    $return_array = vv_search_custom ($Kdnr);
                    // print_r($return_array);
                
                  
              
                    if (!empty($return_array)) {
                    
                        $status_array['kdnr_found'] = 2; 
                        $referenz = $xml->addChild('application');
                    foreach ($return_array as $key => $value)  {
                        $refSearch = $referenz->addChild('search');
                        $refSearch[0] = utf8_encode($value);
                    }
               
                    }
                    else {
                        $status_array['msg'] = "Suchbegriff konnte nicht gefunden werden";
                    }
               
                }
            }
        }
        // set status in xml

        $referenz = $xml->addChild('status');
        
        foreach ($status_array as $key => $value)  {
            $refAttr = $referenz->addChild($key);
            $refAttr[0] = $value;
            
        }
                
        echo $xml->asXML();
        $xml->asXML("erg.xml");
    }
    
    
?>