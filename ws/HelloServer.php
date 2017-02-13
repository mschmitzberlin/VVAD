<?php # HelloServerWsdl.php
# Copyright (c) 2005 by Dr. Herong Yang
#
function hello($someone) { 
   return "Hello " . $someone . "! - With WSDL";
} 
   ini_set("soap.wsdl_cache_enabled", "0"); 
   $server = new SoapServer("Hello.wsdl",
      array('soap_version' => SOAP_1_2));
   $server->addFunction("hello"); 
   $server->handle();
?>