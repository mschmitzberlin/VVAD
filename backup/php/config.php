<?php 

/** =Constants for application-wide use
-------------------------------------------------------------- */

	$rootpath = dirname($_SERVER['SCRIPT_URI']);
	$rootpath = substr ($rootpath,0,strrpos($rootpath,'php'));
	define( ROOT_PATH, $rootpath );
    define( THEME_NAME, 'default' );
    define( THEME_PATH, 'themes/' . THEME_NAME );
    define( IMG_PATH, THEME_PATH . '/img');
    define( LOGO, IMG_PATH . '/vvvb.gif');
    define( IMG_POSITIV, IMG_PATH . '/status_positiv.png' );
    define( IMG_NEUTRAL, IMG_PATH . '/status_neutral.png' );
    define( IMG_NEGATIV, IMG_PATH . '/status_negativ.png' );
	define( IMG_BLUE, IMG_PATH . '/status_blue.png' );
	define( PICT_VKST_IN,  'pictures/in/' );
	define( PICT_VKST_OUT,  'pictures/out/' );
	define( DOC_PATH,  'documents/' );
    // define( IMG_PARAMS, ' width="24" height="24" border="0" ');
// @end constants

?>