<?php
require_once("nusoap/nusoap.php");
 
 
class food {
 
    public function getFood($type) {
        switch ($type) {
            case 'starter':
                return 'Soup';
                break;
            case 'Main':
                return 'Curry';
                break;
            case 'Desert':
                return 'Ice Cream';
                break;
            default:
                break;
        }
    }
}
 
$server = new soap_server();
$server->configureWSDL("foodservice" );
 
$server->register("food.getFood",
    array("type" => "xsd:string"),
    array("return" => "xsd:string"),
    "http://www.greenacorn-websolutions.com/foodservice",
    "http://www.greenacorn-websolutions.com/foodservice#getFood",
    "rpc",
    "encoded",
    "Get food by type");
 
@$server->service($HTTP_RAW_POST_DATA);

?>