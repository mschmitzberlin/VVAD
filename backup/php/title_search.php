<?php
    header('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
	
	require "../dbtools/db_init.php";

	
    $xmlstr = <<<XML
<title>
</title>
XML;
	
	$xml = new SimpleXMLElement($xmlstr);
	$titleId = $_POST['titleId'];
	// search for title number
	
	if ( is_numeric($titleId)) {
		$titleId = "T" . $titleId;
	
	}
	else {
		// id is a string, search for titleid
		$search_str = "%" . $titleId . "%";
		$search_str = utf8_decode($search_str);
		$SqlStr = sprintf("SELECT customId FROM APPVALUES WHERE name='tname' AND content LIKE '%s'", $search_str);

		$res = mysql_query($SqlStr);
		if (mysql_num_rows($res) == 1) {
			// we have one title
			$arr_value = mysql_fetch_assoc($res);
			$titleId = $arr_value['customId'];
		}
		
	}
	

	$SqlStr = sprintf("SELECT * FROM APPVALUES WHERE customId = '%s'", $titleId);
       		$res = mysql_query($SqlStr);
		if (mysql_num_rows($res) >0) {
			// we have the title number, now we need the profil path and the name of the title
			$referenz = $xml->addChild('found');
			while ($arr_value = mysql_fetch_assoc($res)) {
				$referenz->addAttribute($arr_value['name'], utf8_encode($arr_value['content']));
			}
		}
		
		else {
			
			$str_search = array ('Ä','ä','Ü','ü','Ö,','ö');
			$str_repl = array('A','a','U','u','O','o');
			$titleId = str_replace( $str_search, $str_repl, $titleId);
			$search_str = "%" . $titleId . "%";
			// nothing found, so we need a search list
			$SqlStr = sprintf("SELECT customId as titleId, CONCAT(RTRIM(content)) as tsearch FROM APPVALUES WHERE content LIKE '%s' AND name = 'tname' ORDER BY content", $search_str);
			$res = mysql_query($SqlStr);
			if (mysql_num_rows($res) > 0) {
					
					while ($arr_value = mysql_fetch_assoc($res)) {
						$referenz = $xml->addChild('search');
						$refAttr = $referenz->addChild('titleId');
						$refAttr[0] = $arr_value['titleId'];
						$refAttr = $referenz->addChild('tsearch');
						$refAttr[0] = utf8_encode($arr_value['tsearch']);
						
						// get profile path
						$SqlStr = sprintf("SELECT content as tprofil FROM APPVALUES WHERE customId = '%s' AND name = 'tprofil'", $arr_value['titleId']);
						$pathres = mysql_query($SqlStr);
						
						if (mysql_num_rows($pathres) > 0) {
							$path_arr_value = mysql_fetch_assoc($pathres);
							$refAttr = $referenz->addChild('tprofil');
							$refAttr[0] = utf8_encode($path_arr_value['tprofil']);
							
						}
						
					}
			
					
					
				}
		}
	

	echo $xml->asXML();
    $xml->asXML("title.xml");
	
 

?>