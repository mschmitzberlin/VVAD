<?php
  require "../php/config.php";
  require "db_init.php";

    header('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
    


   // export only forms with Export - Flag and not expported Values from FORMSVAL

    $sqlstr = "SELECT F.FormId, FormValId, Name, CustomId, Formvalues FROM FORMS F INNER JOIN FORMSVAL V ON F.FormId = V.FormId WHERE F.Export = TRUE AND V.Exported = FALSE";
    $dbresult = mysql_query ($sqlstr);
    
    
    if (mysql_num_rows($dbresult) > 0) {
        $xmlstr = <<<XML
<data>
</data>
XML;
        $xml = new SimpleXMLElement($xmlstr);
        
        $download_path = 'download/';
        $download_file = $download_path . "download.xml";
        
        // if exist an older download file, load the content first and append the new content
               libxml_use_internal_errors(true);     
        if (file_exists($download_file)) {

            $xml = simplexml_load_file($download_file);
                 $xml->asXML();

     
        }
    
        while ($dbres_value = mysql_fetch_assoc($dbresult)) {
            //create new node ; name = form - name
            $referenz = $xml->addChild($dbres_value['Name']);
            $formval_value = unserialize(base64_decode($dbres_value['Formvalues']));
 
           //create node values
            foreach ($formval_value as $key => $value) {
                $refContent = $referenz->addChild($key);
                $refContent[0] = utf8_encode($value);
            }
            
            // UPdate read Form values
            $sqlstr = sprintf("UPDATE FORMSVAL SET Exported = TRUE WHERE FormValId = %d", $dbres_value['FormValId']);
            // only for test
            mysql_query ($sqlstr);
        }
        
        
        // echo $xml->asXML();

        $xml->asXML($download_file);
    
    }
    
    
 
    
?>