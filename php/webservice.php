<?php
//
$client = new soapclient('http://217.6.190.18/ASA/php/KDService.php?wsdl',  array('cache_wsdl' => WSDL_CACHE_NONE,  'trace' => 1, "soap_version"=>SOAP_1_1));
$client->__setLocation('http://217.6.190.18/ASA/php/KDService.php'); 
////$result = $client->GetSingleVKR(array("tnr" => '00777',  "anr" => 16019)); //02363
////$result = $client->GetInvoicePdf(array("Kdnr" => "21001", "InvDate" => "14.08.16", "Summary" => true));
////$result = $client->GetKDProfil(array("Kdnr" => "21001"));
////$result = $client->GetKDProfil();
//
$result = $client->GetKDProfil(array("Kdnr" => "10006"));
//$result = $client->GetAllVKR(array("tnr" => '00118')); //02363
//echo "<br>" . htmlentities($client->__getLastResponse());
//
//
////$result = $client->__soapCall("GetAllVKR",array("tnr" => '00534'));
//// header("Content-Type: application/pdf");
////echo ($result->GetInvoicePdfResult);
//
////echo "<br>" . htmlentities($client->__getLastResponse()); 
////$result = $client->GetSingleVKR(array("tnr" => '00777',  "anr" => 16019)); //02363
//header("Content-Type: application/pdf");

echo ($result->GetKDProfilResult);
echo "file put " . file_put_contents("TEST.PDF", $result->GetKDProfilResult);
//print_r($result);
//
//
//$result = $client->GetAllVKRold(array("tnr" => '00118')); //02363
//echo "<br>" . htmlentities($client->__getLastResponse());
//print_r($result);


?>