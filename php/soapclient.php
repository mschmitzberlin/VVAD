<?php

	//ini_set('display_errors',1);
	//error_reporting(E_ALL);
//    error_reporting( E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);
//	error_reporting(E_ALL & ~E_NOTICE);
// Pull in the NuSOAP code
//require_once('nusoap/nusoap.php');
ini_set("default_socket_timeout", 10);
// Create the client instance
	require "../dbtools/db_init.php";
//try {
//   $client = new soapclient('http://217.6.190.18/ASA/php/KDService.php?wsdl',  array('cache_wsdl' => WSDL_CACHE_NONE,  'trace' => 1, "soap_version"=>SOAP_1_1));
//} catch (SoapFault $e) {
//    echo "bla" . $e->faultcode;
//} 
//
//			$client->__setLocation('http://217.6.190.18/ASA/php/KDService.php');
//
//
//			
//	
//			
//			$soapResult = $client->GetADDatas(array("kdnr" => "20282", "pictindate" =>"", "pictoutdate" =>"", "kprofildate" =>"19701112"));
//		//	$soapResult = $client->GetBezug(array("kdnr" => "10009", "tnr" =>"00013"));
	


$AStr = 'KDNR;20282;NAME;"Malinski                                          ";VORNAME;"Uwe                                     ";KENNUNG;"Herr ";ADAT;23.03.1999;ANF_GR;1;VDAT;12.10.2016;SDAT;30.12.1899;END_GR;0;STRASSE;"Am Borsigturm 2 (Center)                ";PLZ;13507;ORT;"Berlin                                  ";TELEFON;"03043035210         ";KURZBEZ;"                                   ";KDART;1;SLKZ;1;KDNR_VOR;"     ";UEBIND;100;KPILOT;P0100;KVORLFG;N;NR_HAUPT;" 62350";NR_TAG;" 12000";NR_SONN;" 79902";NR_VOR;"     0";NR_VORL;"     0";NR_VLSA;"     0";NR_FRUEH;"     0";NR_FRUEHSA;"     0";NR_SPAETSA;" 62350";NR_FF_BMS1;"     0";NR_FF_BMS2;"     0";NR_FF_WAMS;"     0";NR_FF_BZSO;"     0";NR_FEIER;"     0";NR_FF_WO;"     0";NR_SPAET;" 62350";NR_NL;"  8225";NR_ABEND;"     0";NR_14;"     0";NR_NLWO;"     0";NR_NLSA;"     0";NR_SAMSTAG;" 62350";NR_ABENDSA;" 10090";NR_REMI;" 62350";NR_INTER;" 62350";NR_INTER2;" 25100";NR_ZITTY;"     0";NR_TABU_A;"     0";NR_TABU_B;"     0";NR_INTERSA;"     0";NR_NLSO;"     0";NR_DLWO;"     0";NR_DLSA;"     0";NR_DLTXL;"     0";NR_AKTION;"     0";TOUR_ART;J;ABH_TAG;0;URL_VON;15.09.2013;URL_BIS;15.09.2013;URLAUB;A;UKH1;"     ";PRZ1;" 0";UKH2;"     ";PRZ2;" 0";UKH3;"     ";PRZ3;" 0";UKZ;0;VERTR1;"     ";VERTR2;"     ";VERTR3;"     ";RJ;N;RJART;"        ";ZZIEL;"  0";PREIS_KZ;A;SOPR_KZ;N;ANZ_LS;0;ANZ_RG;0;NR_ZENTR;"    0";SAMMEL_RG;N;INDIKZ;J;KZO;N;ZWAL;J;SAIS_VON;30.12.1899;SAIS_BIS;30.12.1899;S_IND;"  0";SOZU_IND;100;REGUSP;N;LIEFSP_AB;30.12.1899;LIEFSP_BIS;30.12.1899;NR_VKB;" 8";NR_VKL;" 0";EHASTRA_KZ;J;CLUSTER;"  0";ORTSTNR1;"  2";ORTPRZ1;"  0";ORTSTNR2;"  0";ORTPRZ2;"  0";VERTBZ;" 0";DIEBVERS;N;DIEBABL;N;STATNR;" 173770";EEH_NR;18904439;EPA_NR;20045571;GEMKZ;11012012;VKST;1;G_ART;1101;QM_VKR;"   27";SAISON;1;ZUTAGE;1111113;SCHUPPEN;"  0";REGAL_M;"  6.00";F_GEST;1;THEKE;1;VERKHI;"                   ";WO_UMS;"  755";REMPR;55;REMPR_ST;43;KDKL;B;DATSP;N;ANZTIT;1918;PR_TIT;" 436";MAXTIT;1050;PR_ZSCHR;" 322";MAX_ZSCHR;1002;LTZ_REMI;15.08.2016;LTZ_RG;11.12.2016;SALDO;"    0.00";INFO_UPD;27.03.2003;PRFZF;9;LSCH_99;" ";F_MELD;" ";STATNR_SH;"      0";SCANNER;1;MW_SPERR;" ";FAXNR;"                    ";NLFG_KZ;" ";LTM;"  0";SVST;"  0";FKT_EIN;"     ";FKT_AUS;"     ";G_ART_RANG;"  55";GEM_RANG;"  17";ORT_RANG;"   5";ANZ_GROSSO;2;BEZ_KORR;"    0";NLFG;"    2";NLFG_REM;" 43";LFB;"    8";REM_REKL;"    1";F_REMI;"  192";F_REMI_K;"   16";S_REMI;"   11";S_REMI_G;100;S_REMI_ANT;"  0.7";LTZ_SO;30.12.1899;NXT_SO;30.12.1899;ZUTG_LFG;N;VMP_K_KZ;J;ANZ_REMBL;" 8";ILN;"             ";KDBTR;DE;WRNG;E;VLK;509011000;NR_SONDER;"     0";C_KAUTION;" ";FT_GA;"     ";SHOP;2;GES_QM;"   27";SHOP_G_ART;"    ";INT_BFL;"          JJ JJ ";EXT_BFL;"       JJ             ";KDFREQ_ART;2;VSR_STK_BM;" 50.00";VSR_STK_VS;" 32";SONST_BM;"  3.00";SONST_VS;" 22";CO_VS;"  0";CO_KAP;"  0";TB_VS;"  0";TB_KAP;"  0";ZTG_VS;" 24";SBLD_PRS;1;ZSCH2_VS;"  0";PR_ZSCHR_8;"   7";PR_ZTG;"  17";PR_RCR;"  97";SV_REMI;" ";RM_SCH;"  ";ANZ_SREM;" 0";W3STAT;" ";WAL_EH;0;FIL_NR;"             ";WO_UMS_GES;"  797";KDFREQ_ABS;" 3750";FR_NL1;0;NLFG_PRIO;" ";TELEFON2;"0305556841          ";O_MWST;" ";RG_LFPOS;" ";RB_GRP;" ";E_LS;" ";SCHUPP_BM;"  0.00";S_FENSTER;3;ZSCH_VS;"  0";RRTH_VS;"  0";RRTH_KAP;"  0";WO_UMS52;"  724";RG_UMF_MF;" ";PR_TIT_BM;" 6.7";MAX_ZSCHRB;A;LS_AGP_DR;" ";EKA_ID;"     ";LM_NR;0368;LMC_NR;13;LM_RANG;"   5";RG_DUPLEX;N;E_RS;" ";MAXTITB;A;REGAL_LAST;" 39";PR_ZSGES;" 505";LIEFAUF;" 0";RM_ZTGINCL;J;RM_PERINCL;J;RM_SORT;N;EAN_SPERR;"     ";SCHUPPGRAD;" 0";STITEL_BM;24.0;QR_NR;2856b743;ZNR;"     ";QO_EH;" ";KDNR;20282;KDNR_95;"          ";KAUTION;" 1500";NR_15;"    0";NR_16;"    0";NR_17;"    5";NR_18;"    0";NR_19;"    0";LNAME;"Malinski                                ";LVORNAME;"Uwe                                     ";LZL1;"                                        ";LSTRASSE;"Am Borsigturm 2                         ";LPLZ;13507;LORT;"Berlin                                  ";LFGABL;"Im Anlieferhof - auf der rechten Seite in der Ecke";LFGABL1;"Kiste                                             ";SCHLUESSEL;1;SCH_RES;1;REMIABL;"Kiste im Anlieferhof                              ";RGZL1;"                                        ";RGZL2;"Uwe Malinski                            ";UMS_MANU;" ";RGSTRASSE;"Am Borsigturm 2                         ";RGPLZ;13507;RGORT;"Berlin                                  ";O01;"  0";O02;" 17";O03;" 23";O04;" 39";O05;" 40";O06;" 19";O07;" 19";O08;"  5";O09;" 16";O10;" 57";O11;" 27";O12;" 31";O13;" 16";O14;" 11";O15;"  8";O16;" 93";KDNR_BPV;4004161;O_SO_V;" 0.00";F_TAG;N;ZEIT;" 0.00";O17;" 13";O18;"  2";O19;" 36";O20;"  1";MO_GA;09:00;MO_GE;20:00;MO_PA;"  :  ";MO_PE;"  :  ";DI_GA;09:00;DI_GE;20:00;DI_PA;"  :  ";DI_PE;"  :  ";MI_GA;09:00;MI_GE;20:00;MI_PA;"  :  ";MI_PE;"  :  ";DO_GA;09:00;DO_GE;20:00;DO_PA;"  :  ";DO_PE;"  :  ";FR_GA;09:00;FR_GE;20:00;FR_PA;"  :  ";FR_PE;"  :  ";SA_GA;09:00;SA_GE;16:00;SA_PA;"  :  ";SA_PE;"  :  ";OP_TEXT;"                              ";K1;0;K2;3;K3;0;K4;1;K5;6;K6;0;K7;0;K8;0;K9;0;K10;0;K11;0;K12;1;K13;7;K14;2;K15;1;K16;0;K17;2;K18;0;K19;0;K20;1;K21;1;K22;0;K23;0;K24;9;K25;0;K26;0;K27;1;K28;0;K29;0;K30;0;K31;0;K32;0;K33;0;K34;1;K35;1;K36;0;K37;0;K38;0;K39;1;K40;0;K41;1;K42;0;K43;1;K44;0;K45;0;K46;0;K47;0;K48;0;K49;0;K50;0;K51;0;K52;0;K53;0;K_I;"                    ";VLINIEKZ;"        0";SO_GA;13:00;SO_GE;18:00;GEOX;3747094;GEOY;5421255;L_MI_GA;07:00;L_SA_GA;07:00;L_SO_GA;"  :  ";VHS;" ";SO_PA;"  :  ";EURO_ANL;" ";KAUTION_E;" 766.94";SO_PE;"  :  ";B_TAFEL;N;LS_SPERR;N;TRAP_BIS;30.12.1899;TRAP_ID;000694DCAC;TRAP_ORT;"Kiste Innendeckel links                           ";TRAP_AB;06.07.2007;W_ALZ_FT;"     ";HS_FAKT;J;GROSSKD;" ";ST_ZEIT_K;6;ST_ZEIT_Z;" 0";W_ALZ_WT;08:00;W_ALZ_SA;08:00;W_ALZ_SO;12:45;PS_WO;"     ";PS_SA;"     ";PS_SO;"     ";UST_IDNR;"           ";EMAIL;"                                        ";GEODEZ_L;"  13.28835";GEODEZ_B;"  52.58391";IBAN;DE79100500001783920200;BIC;BELADEBEXXX;B_PLAKAT;J;X_KOORD;"                        0";Y_KOORD;"                        0";KGS12;000000000000;G_LAT;"52,5836506          ";G_LNG;"13,2855038          ";GFKORTNR;110000001202;GFKORTBEZ;"Tegel               ";BZTAFEL;N;BZPLAKAT;N;E2010;4;GEOXS;"13,28835  ";GEOYS;"52,58391  ";RM_TG_ANZ;5;VVPOST;" ";GPS_ORIG;" ";LTZ_PIL;30.12.1899;GEOABL_L;"   0.00000";GEOABL_B;"   0.00000";SEPA_AB;02.02.2014;ZART_SEPA;B;MANDAT;"20282     ";RGEMAIL;"                                        ";BANKTEXT;"               ";SORT1;"  24";SORT2;1368;SORT3;" 324";GES_UMS;"  791";ART_ZIEL;M;EH_ZIEL;24.0;GES_TIT;"     0";EIG_ANT;" 47.0";EIG_TIT;"     0";SCHUPPG;"   0.0";UMS_BPV;"   23";REMIPR_BPV;" 57"';




//						print_r( $soapResult->GetKustResult);
			$kustresultArray = explode(";", $AStr);
			$jsonArray = array();

			for($i = 0; $i < count($kustresultArray); $i+=2) {
				if (isset($kustresultArray[$i+1])) {
					$key = strtolower($kustresultArray[$i]);
					$value = $kustresultArray[$i+1];
					$value = trim(str_replace('"', '', $value));
					$jsonArray[$key] = $value;
				}
			}
			
			//Verkaufshilfen
			$pr_ztg =  $jsonArray["pr_ztg"];
			$pr_zschr =  $jsonArray["pr_zschr"];
			$pr_rcr = $jsonArray["pr_rcr"];
			$sort1 = $jsonArray["sort1"];
			$sort2 = $jsonArray["sort2"];
			$sort3 = $jsonArray["sort3"];
			
			$eig_ant = $jsonArray["eig_ant"];

			//DATEN gesamt
			$ums_ges  = $jsonArray["ges_ums"];
			//Daten VV
			$wo_ums_vv  =  $jsonArray["wo_ums"];			
			$wo_ums_prz_vv = round($wo_ums_vv * 100 / $ums_ges,0);
			$rem_pr_vv = $jsonArray["rempr"];
			$sort_anteil_vv = round(( ($pr_ztg * 2) + $pr_zschr + ($pr_rcr * 0.5))*100/(($sort1*2)+$sort2+($sort3*0.5)),0);
			$regal_anteil_vv = round( $jsonArray["eig_ant"],0);	
			
			//Daten BPV
			$wo_ums_bpv       = $ums_ges - $wo_ums_vv;
			$wo_ums_prz_bpv   = ($wo_ums_prz_vv > 0) ? 100 - $wo_ums_prz_vv : 0;
			$rem_pr_bpv       = $jsonArray["remipr_bpv"];
			$sort_anteil_bpv  = ($sort_anteil_vv > 0) ? 100 - $sort_anteil_vv : 0;
			$regal_anteil_bpv = ($regal_anteil_vv > 0) ? 100 - $regal_anteil_vv : 0;


			//Regal gesamt
			$vsr_stk_bm = $jsonArray["vsr_stk_bm"];
			$sonst_bm = $jsonArray["sonst_bm"];
			
			$vsr_stk_vs = $jsonArray["vsr_stk_vs"];
			$sonst_vs = $jsonArray["sonst_vs"];
			$zsch_vs = $jsonArray["zsch_vs"];
			$rrth_vs = $jsonArray["rrth_vs"];
			$co_vs = $jsonArray["co_vs"];
			$ztg_vs = $jsonArray["ztg_vs"];
			$schuppen = $jsonArray["schuppen"];
			
			$bm_ges      = round($vsr_stk_bm + $sonst_bm, 1);
			$korr_stapel = round(($vsr_stk_vs + $sonst_vs)*0.25,1);
			$titel_sonst = round($schuppen + $vsr_stk_vs + $sonst_vs + $zsch_vs + ($rrth_vs * 0.5) + ($co_vs * 0.5) + ($ztg_vs*2),0);
			$titel_bm_kz      = $jsonArray["art_ziel"];
			//regal vv
			$bm_vv            = round ($bm_ges * ( $eig_ant /100 ),1);
			$korr_stapel_vv   = round($korr_stapel *($eig_ant /100),1);
			$titel_sonst_vv   = round($titel_sonst * ($eig_ant/100),0);
			//$eh_ziel          = $jsonArray["eh_ziel"];
			//regal bpv
			$bm_bpv = ($bm_ges > 0) ? $bm_ges - $bm_vv : 0; 
			$korr_stapel_bpv = ($korr_stapel > 0) ? $korr_stapel - $korr_stapel_vv : 0;
			$titel_sonst_bpv  =  ($titel_sonst > 0) ? 100 - $titel_sonst_vv : 0;
			

;sortiment gesamt
$ztg_ges          = $sort1;
$zschr_ges        = $sort2;
$rcr_ges          = $sort3;
$ist_ges          = $sort1 + $sort2 + $sort3;
$ist_korr_ges     = round(($sort1 * 2) + $sort2 + ($sort3 *0.5),0);
$soll_eh_ges      =  $jsonArray["maxtit"];
$bel_prz_ges      = round($ist_korr_ges * 100 / $soll_eh_ges,1);
soll_vb_ges      = round((((VSR_STK_BM+SONST_BM)-((VSR_STK_VS + SONST_VS)*0.25))*12.5)+SCHUPPEN+VSR_STK_VS+SONST_VS+ZSCH_VS+(RRTH_VS*0.5)+(CO_VS*0.5)+(ZTG_VS*2),0)
vb_bel_prz_ges   = round(((_knd("SORT1")*2)+_knd("SORT2")+(_knd("SORT3")*0.5))*100/((((VSR_STK_BM+SONST_BM)-((VSR_STK_VS + SONST_VS)*0.25))*12.5)+SCHUPPEN+VSR_STK_VS+SONST_VS+ZSCH_VS+(RRTH_VS*0.5)+(CO_VS*0.5)+(ZTG_VS*2)),1)
;sortiment vv
ztg_vv           = PR_ZTG
zschr_vv         = PR_ZSCHR
rcr_vv           = PR_RCR
ist_vv           = PR_ZTG+PR_ZSCHR+PR_RCR
ist_korr_vv      = round((PR_ZTG*2)+PR_ZSCHR+(PR_RCR*0.5),0)
soll_eh_vv       = round(MAXTIT*(_knd("EIG_ANT")/100),0)
bel_prz_vv       = round(((PR_ZTG*2)+PR_ZSCHR+(PR_RCR*0.5))*100/(MAXTIT*(_knd("EIG_ANT")/100)),1)
soll_vb_vv       = round(((((VSR_STK_BM+SONST_BM)-((VSR_STK_VS + SONST_VS)*0.25))*12.5)+SCHUPPEN+VSR_STK_VS+SONST_VS+ZSCH_VS+(RRTH_VS*0.5)+(CO_VS*0.5)+(ZTG_VS*2))*(_knd("EIG_ANT")/100),0)
vb_bel_prz_vv    = round(((PR_ZTG*2)+PR_ZSCHR+(PR_RCR*0.5)) * 100 / (((((VSR_STK_BM+SONST_BM)-((VSR_STK_VS + SONST_VS)*0.25))*12.5)+SCHUPPEN+VSR_STK_VS+SONST_VS+ZSCH_VS+(RRTH_VS*0.5)+(CO_VS*0.5)+(ZTG_VS*2))*(_knd("EIG_ANT")/100)),1)

;sortiment bpv
ztg_bpv          = _knd("SORT1")-PR_ZTG
zschr_bpv        = _knd("SORT2")-PR_ZSCHR
rcr_bpv          = _knd("SORT3")-PR_RCR
ist_bpv          = (_knd("SORT1")+_knd("SORT2")+_knd("SORT3"))-(PR_ZTG+PR_ZSCHR+PR_RCR)
ist_korr_bpv     = round(((_knd("SORT1")-PR_ZTG)*2)+(_knd("SORT2")-PR_ZSCHR)+((_knd("SORT3")-PR_RCR)*0.5),0)
soll_eh_bpv      = round(MAXTIT*((100-_knd("EIG_ANT"))/100),0)
bel_prz_bpv      = round((((_knd("SORT1")-PR_ZTG)*2)+(_knd("SORT2")-PR_ZSCHR)+((_knd("SORT3")-PR_RCR)*0.5))*100/(MAXTIT*((100-_knd("EIG_ANT"))/100)),1)
soll_vb_bpv      = round(((((VSR_STK_BM+SONST_BM)-((VSR_STK_VS + SONST_VS)*0.25))*12.5)+SCHUPPEN+VSR_STK_VS+SONST_VS+ZSCH_VS+(RRTH_VS*0.5)+(CO_VS*0.5)+(ZTG_VS*2))*((100-_knd("EIG_ANT"))/100),0)
vb_bel_prz_bpv   = round((((_knd("SORT1")-PR_ZTG)*2)+(_knd("SORT2")-PR_ZSCHR)+((_knd("SORT3")-PR_RCR)*0.5)) * 100 / (((((VSR_STK_BM+SONST_BM)-((VSR_STK_VS + SONST_VS)*0.25))*12.5)+SCHUPPEN+VSR_STK_VS+SONST_VS+ZSCH_VS+(RRTH_VS*0.5)+(CO_VS*0.5)+(ZTG_VS*2))*((100-_knd("EIG_ANT"))/100)),1)

			
			
			$jsonArray["ums_ges"]  = $ums_ges;
			$jsonArray["wo_ums_vv"] = $wo_ums_vv;
			$jsonArray["wo_ums_prz_vv"] = $wo_ums_prz_vv;
			$jsonArray["rem_pr_vv"] =$rem_pr_vv;
			$jsonArray["sort_anteil_vv"] = $sort_anteil_vv;
			$jsonArray["regal_anteil_vv"] =$regal_anteil_vv;

			$jsonArray["wo_ums_bpv"] = $wo_ums_bpv;
			$jsonArray["wo_ums_prz_bpv"] = $wo_ums_prz_bpv;
			$jsonArray["sort_anteil_bpv"] = $sort_anteil_bpv;
			$jsonArray["regal_anteil_bpv"] = $regal_anteil_bpv;

			$jsonArray["bm_ges"] = number_format($bm_ges,1);
			$jsonArray["korr_stapel"] = number_format($korr_stapel,1);
			$jsonArray["titel_sonst"] = $titel_sonst;
			$jsonArray["titel_bm_kz"] = $titel_bm_kz;
			//regal vv
			$jsonArray["bm_vv"] = number_format($bm_vv,1);
			$jsonArray["korr_stapel_vv"] = number_format($korr_stapel_vv,1);
			$jsonArray["titel_sonst_vv"] = $titel_sonst_vv; 
			//$eh_ziel          = $jsonArray["eh_ziel"];
			//regal bpv
			$jsonArray["bm_bpv"] = number_format($bm_bpv,1);
			$jsonArray["korr_stapel_bpv"] = $korr_stapel_bpv;
			$jsonArray["titel_sonst_bpv"] = $titel_sonst_bpv; 		
			
			
			print_r($jsonArray);

?>

