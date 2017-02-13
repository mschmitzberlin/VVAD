<?php
function getNumPagesInPDF($file)
{
    if(!file_exists($file))return null;
    if (!$fp = @fopen($file,"r"))return null;
    $max=0;
    while(!feof($fp)) {
            $line = fgets($fp,255);
            if (preg_match('/\/Count [0-9]+/', $line, $matches)){
                    preg_match('/[0-9]+/',$matches[0], $matches2);
                    if ($max<$matches2[0]) $max=$matches2[0];
            }
    }
    fclose($fp);
    return (int)$max;

}
 echo getNumPagesInPDF("../documents/10006_K_PROFIL.PDF");
 
 
 
 
 Array
(
    [filter] => #btnSend
    [AD] => CL
    [formid] => 
    [customid] => 10006
    [formvalid] => 29538
)
?>