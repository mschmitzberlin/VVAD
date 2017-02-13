<?php

    function hello($you_name)   {
        return "xyz" . $you_name;
    }

ini_set("soap.wsdl_cache_enabled", "0");
$server = new SoapServer(null, array ('uri'=>'http://vvberlin-online.de'));
$server->addFunction("hello");
$server->handle();
       

?>