<?php

    $query = $_SERVER['QUERY_STRING'];
    $post =http_build_query ( $_POST);
    //$post["username"] =""; 
    //$post["password"] =""; 
//$get="";
    
    
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://pressehandel-berlin.de/indextst.php?" . $query);
//curl_setopt($ch, CURLOPT_URL, "http://pressehandel-berlin.de/indextst.php");
//curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
if ($post != "") {
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
}

// in real life you should use something like:
// curl_setopt($ch, CURLOPT_POSTFIELDS, 
//          http_build_query(array('postvar1' => 'value1')));

       curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]); // set  useragent
       curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // follow redirects if any

$output = curl_exec($ch);
//echo curl_error (  $ch );
//print_r($output);
curl_close($ch);
echo $output;



//    $aURLs = array("http://pressehandel-berlin.de/test3.php"); // array of URLs
//    $mh = curl_multi_init(); // init the curl Multi
//   
//    $aCurlHandles = array(); // create an array for the individual curl handles
//
//    foreach ($aURLs as $id=>$url) { //add the handles for each url
//       // $ch = curl_setup($url,$socks5_proxy,$usernamepass);
//        $ch = curl_init(); // init curl, and then setup your options
//        curl_setopt($ch, CURLOPT_URL, $url);
//        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); // returns the result - very important
//        curl_setopt($ch, CURLOPT_HEADER, 0); // no headers in the output
//       // 
//       //curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]); // set  useragent
//    //   curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // follow redirects if any
//       curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout); // max. seconds to execute
//       curl_setopt($ch, CURLOPT_FAILONERROR, 1); // stop when it encounters an error        
//
//        $aCurlHandles[$url] = $ch;
//        curl_multi_add_handle($mh,$ch);
//    }
//   
//    $active = null;
//    //execute the handles
//    do {
//        $mrc = curl_multi_exec($mh, $active);
//    }
//    while ($mrc == CURLM_CALL_MULTI_PERFORM);
//
//    while ($active && $mrc == CURLM_OK) {
//        if (curl_multi_select($mh) != -1) {
//            do {
//                $mrc = curl_multi_exec($mh, $active);
//            } while ($mrc == CURLM_CALL_MULTI_PERFORM);
//        }
//    }
//   
///* This is the relevant bit */
//        // iterate through the handles and get your content
//    foreach ($aCurlHandles as $url=>$ch) {
//        $html = curl_multi_getcontent($ch); // get the content
//        echo "<--" .$html;
//                // do what you want with the HTML
//        curl_multi_remove_handle($mh, $ch); // remove the handle (assuming  you are done with it);
//    }
///* End of the relevant bit */
//
//    curl_multi_close($mh); // close the curl multi handler
//

?>

