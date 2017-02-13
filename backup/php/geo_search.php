<?php
    header('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
	
	require "../dbtools/db_init.php";

	
    $xmlstr = <<<XML
<geodata>
</geodata>
XML;
	
	$xml = new SimpleXMLElement($xmlstr);
	$centerLat = $_POST['lat'];
	$centerLng = $_POST['lng'];
	$customId = $_POST['customId'];
	$address = "";

    $SqlStr = sprintf ("SELECT * FROM `SEARCH` WHERE ABS(Geo_lat - '%s' ) <= 0.008 AND ABS(Geo_lng - '%s' ) <= 0.008", $centerLat, $centerLng);
		$res = mysql_query($SqlStr);
		if (mysql_num_rows($res) > 0) {
			while ($arr_value = mysql_fetch_assoc($res)) {
				
				$markerLat = (float) str_replace(",",".",$arr_value['geo_lat']);
				$markerLng = (float) str_replace(",",".",$arr_value['geo_lng']);

				$referenz = $xml->addChild('markers');
				$referenz->addAttribute('lat', $markerLat);
				$referenz->addAttribute('lng', $markerLng);
				
				$address = $arr_value['name'] ;
				$customId = $arr_value['CustomId'] ;

				$refAdr = $referenz->addChild('address');
				$refAdr[0] = utf8_encode($address);
				$refcustomId = $referenz->addChild('customId');
				$refcustomId[0] = $customId;
			
			}
		}
	
	echo $xml->asXML();
    $xml->asXML("geo.xml");
	
 

?>