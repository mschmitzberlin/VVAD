<?php

# StringLengthClient.php
# Copyright (c) 2011 by Lakmali Baminiwatta
#
   //$client = new SoapClient(null, array(
   //   'location' => "http://vvberlin-online.de/TEST/neueversion/php/StringLengthServer.php",
   //   'uri'      => "urn://vvberlin-online.de",
   //   'trace'    => 1 ));
   //
   //$return = $client->__soapCall("findLength",array("lakmali"));
   //echo("\nReturning value of __soapCall() call: ".$return);
   //
   //echo("\nDumping request headers:\n"
   //   .$client->__getLastRequestHeaders());
   //
   //echo("\nDumping request:\n".$client->__getLastRequest());
   //
   //echo("\nDumping response headers:\n"
   //   .$client->__getLastResponseHeaders());
   //
   //echo("\nDumping response:\n".$client->__getLastResponse());
   
   $options = array (
	'location'=>'http://vvberlin-online.de/TEST/neueversion/php/server.php',
	'uri'=>''
    );
 
$client = new SoapClient(null, $options);
echo $client->hello('ycTIN');
   
   //$client = new SoapClient(null, array(
   //   'location' => "http://vvberlin-online.de/TEST/neueversion/php/StringLengthServer.php",
   //   'uri'      => "",
   //   'trace'    => 1 ));
   //
   //$return = $client->__soapCall("hello",array("world"));
   //echo("\nReturning value of __soapCall() call: ".$return);
   //
   //echo("\nDumping request headers:\n" 
   //   .$client->__getLastRequestHeaders());
   //
   //echo("\nDumping request:\n".$client->__getLastRequest());
   //
   //echo("\nDumping response headers:\n"
   //   .$client->__getLastResponseHeaders());
   //
   //echo("\nDumping response:\n".$client->__getLastResponse());   
   //
   
?>

