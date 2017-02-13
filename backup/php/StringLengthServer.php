 <?php

 //
    //function findLength($string) {
    //       //return "Length of the string " . $string . "is : ".strlen($string);
    //     return "XX";
    //}
    //
    //
    //  
    //$server = new SoapServer(null,
    //          array('uri' => "urn://vvberlin-online.de"));
    //
    //$server->addFunction("findLength");
    //   $server->handle();
    //   
//       
//function hello($someone) { 
//   return "Hello " . $someone . "!";
//   // return new SoapFault("Server", "Some error message");
//} 
//   $server = new SoapServer(null, 
//      array('uri' => ''));
//   $server->addFunction("hello"); 
//   $server->handle();
   
   class TestWebService
{
    function hello($you_name = 'ycTIN')
    {
        return "hi, i am $you_name";
    }
}
 
$server = new SoapServer(null, array ('uri'=>''));
$server->setClass('TestWebService');
$server->handle();
       

?>