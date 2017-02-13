<?php

    $query = $_SERVER['QUERY_STRING'];
    $post =http_build_query ( $_POST);
    $domain = $_SERVER["SERVER_NAME"];
    $logStr = "### SENDE ###\n";
    $logStr .= "query " . $query . "\n";
    $logStr .= "post " . $post . "\n";
    $output = "";
    if ($domain <> "vvberlin-online.de") {
        $output ="<span>Zugriff auf die Funktion nicht erlaubt</span>";
    }
    
    else {
    
    
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, "http://pressehandel-berlin.de/index.php?" . $query);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
        if ($post != "") {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        }
    
        curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]); // set  useragent
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // follow redirects if any
    
        $logStr .= "### EMPFANGE ###\n";
        $output = curl_exec($ch);
        $logStr .= "$output\n";
        $logStr .= "Error: " . curl_error (  $ch ) . "\n" ;
        
        curl_close($ch);
    }
    echo $output;
 
    //file_put_contents("pr.log", $logStr, FILE_APPEND);
  
?>

