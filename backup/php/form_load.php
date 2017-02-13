<?php
    header('Content-Type: text/xml');
    header ('Cache-Control: no-cache');
    header ('Cache-Control: no-store' , false);     // false => this header not override the previous similar header
	
	require "../dbtools/db_init.php";
	require "users.php";

    function arrayToXML ($inArray, $inRef) {
 
        foreach($inArray as $key => $value) {
 
            if (is_numeric($key)) {
                $key = "numeric_" . $key;
            }
                            
            $newRef = $inRef->addChild($key);
                            
            if(is_array($value)) {
                arrayToXML ($value, $newRef);
            }
            else {
                $newRef[0] = utf8_encode ($value);
            }
        }
    }
	
	function forms ($customId) {
        
		global $form_sql;
		$result_array = array ();
        $formid = "";
        $list_value = array ();
		$formOk = false;
		$customArray = array();

        if(is_numeric($customId)) {
            $customId = $customId *1;
        }
        //$SqlStr = sprintf("SELECT * FROM FORMS");
        $res = mysql_query($form_sql);
        if (mysql_num_rows($res) > 0) {
            while ($arr_value = mysql_fetch_assoc($res)) {
				//check for customFilter
				
				$customArray = unserialize(base64_decode($arr_value['CustomFilter']));
				
				if (!is_array($customArray)) {
					$customArray[$customId] = 0;

				}
				else {
                
                //delete Nulls
                foreach ($customArray as $key => $value) {
                        if(is_numeric($value)) {
                            $customArray[$key] = $value *1;
                        }
                    }
                    
                }
				
				if (isset($customArray[$customId])) {

 				$arr_value['form_id'] = "custom_form_" . $arr_value['FormId'];
				$arr_value['menu_id'] = "custom_menu_" . $arr_value['FormId'];
				$arr_value['div_id'] = "custom_div_" . $arr_value['FormId'];
				$arr_value['list_id'] = "custom_list_" . $arr_value['FormId'];
                $result_array[] = $arr_value;
				}
            }
        }
        return $result_array;
    }
	
	function blank_form_vals ($Kdnr){
		
		global $form_sql;
		$blank_value = array ();
		
		// create for all forms blnk formvals which will used for initial and new forms;
		// if defaults are setting, so it is possible here
		
		// $SqlStr = sprintf("SELECT * FROM FORMS");
        $res = mysql_query($form_sql);
        if (mysql_num_rows($res) > 0) {
            while ($arr_value = mysql_fetch_assoc($res)) {
				$FormId = $arr_value['FormId'];
				//hidden values needed for docking the values to the form
				$blank_value[$FormId]['status']['exported'] = false;
				$blank_value[$FormId]['hidden']['FormvalId'] = "NEW"; 
				$blank_value[$FormId]['hidden']['FormId'] = "custom_form_" . $FormId;
				$blank_value[$FormId]['hidden']['CustomId'] = $Kdnr;
				
				// list values needed for create lists
				$blank_value[$FormId]['list']['listTitle'] = "Neuer Eintrag";
				$blank_value[$FormId]['list']['list_id'] = "custom_list_" . $FormId;
				$blank_value[$FormId]['list_item_id'] = "custom_list_item_id_NEW_" . $FormId;
			}
		}
		
		return $blank_value;
		
		
		
	}
	function form_vals ($Kdnr, $userId) {
		
		global $form_sql;
		$listname = "";
		$return_value = array ();
		$formId = "";
		
		// get Selction of forms - 0 = customid, 1 = Userid
		
		// $SqlStr = "SELECT * FROM FORMS";
		$resForms = mysql_query($form_sql);
		
		while ($forms_arr_value = mysql_fetch_assoc($resForms)) {
			$forms_FormId = $forms_arr_value['FormId'];
			$Selection = $forms_arr_value['Selection'];
			
			unset($title_split);
			if ($forms_arr_value['ListTitle'] <> '') {
				$title_split = explode (',', $forms_arr_value['ListTitle']);
			}
			$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE CustomId = '%s' AND FormId = %d ORDER BY storeDate DESC, CustomId ASC LIMIT 0,20", $Kdnr, $forms_FormId);
			
			if ($Selection == 1) {
				$SqlStr = sprintf("SELECT * FROM FORMSVAL WHERE UserId = '%s' AND FormId = %d ORDER BY storeDate DESC, CustomId ASC LIMIT 0,20", $userId, $forms_FormId);
			}

			$res = mysql_query($SqlStr);
			if (mysql_num_rows($res) > 0) {
				while ($arr_value = mysql_fetch_assoc($res)) {
					$FormId = $arr_value['FormId'];
					$return_value['status']['exported'] = $arr_value['Exported'];
					$return_value['hidden']['FormvalId'] = $arr_value['FormvalId'];
	
					$return_value['list']['storeDate'] = date("d.m.Y H:i",strtotime($arr_value['storeDate']));
					$return_value['list']['list_id'] = "custom_list_" . $FormId;
	
					$listname = "custom_list_item_id_" . $arr_value['FormvalId'];
	
					$return_value['list_item_id'] = $listname;
					$list_value = unserialize(base64_decode($arr_value['Formvalues']));
					//foreach ($list_value as $key => $value) {
					//	$list_value[$key] = utf8_encode ($value);
					//}
					
					
					$return_value['list']['listTitle'] = date("d.m.Y H:i",strtotime($arr_value['storeDate']));
					if ( !empty($title_split)) {
						$listTitle = "";
						
						foreach ($title_split as $key => $value)  {
							$listTitle = $listTitle . $list_value[$value] . " ";
						}
	
						$return_value['list']['listTitle'] = $listTitle;
					}
	
					$return_value['content'] = $list_value;
					$return_value['FormId'] = "custom_form_" . $FormId;
					$result_array[] = $return_value;  
				}
			}	
        }
		return $result_array;
	}
				

	// main - read POST
	
    $xmlstr = <<<XML
<data>
</data>
XML;
	
	$xml = new SimpleXMLElement($xmlstr);
	$customId = "";
	$customId = $_POST['customId'];
	$forms_stat = $_POST['loadParam'];  // Forms read status - 0 = all, 1 only formvals etc
	$userId = $_POST['userId'];
	$login = $_POST['login'];
	$return_array = array ();
	
	$status_array = check_session();
	
	if ($status_array['logged_in'] == 1) {
	
	//load forms
		$form_sql = "SELECT * FROM FORMS WHERE test <> '1' ORDER BY FormId";
		
		if ($login == "gast") {
			// only test forms
			$form_sql = "SELECT * FROM FORMS WHERE test = '1' ORDER BY FormId";
		}
	
		if ($customId <> "") {
		
			if ($forms_stat == 0) {
				$return_array = forms ($customId);
		
				if (!empty($return_array)) {
					foreach ($return_array as $arrkey => $arrvalue)  {
						$referenz = $xml->addChild('forms');
						arrayToXML ($arrvalue, $referenz);
					}
				}
			}
	
		
			$return_array = form_vals ($customId, $userId);
			if (!empty($return_array)) {
			
				foreach ($return_array as $arrkey => $arrvalue)  {
					$referenz = $xml->addChild('formvalues');
					$referenz->addAttribute('list_item_id', $arrvalue['list_item_id']);
					
					arrayToXML ($arrvalue, $referenz);
				}
			}
			
			$return_array = blank_form_vals ($customId);
			
			if (!empty($return_array)) {
			
				foreach ($return_array as $arrkey => $arrvalue)  {
					$referenz = $xml->addChild('formvalues');
					$referenz->addAttribute('list_item_id', $arrvalue['list_item_id']);
					
					arrayToXML ($arrvalue, $referenz);
				}
			}
		
			echo $xml->asXML();
			$xml->asXML("forms.xml");
		}
	}
	
 

?>