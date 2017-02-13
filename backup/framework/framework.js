$(document).ready(function() {
    
    //prepare viewport
	$(".window").addClass("transparent");
	$(".window").first().removeClass("transparent").addClass("current");
	$(".window.transparent").first().addClass("slideleft");
    
    
    // back Button slide right
    $("header a").click( function () {
        var slideClass = "slideleft";
        
        if ($(this).hasClass("back")) {
            slideClass = "slideright";
        }
        
            
    	$(".window").removeClass("slideleft slideright current");
    	//$(".window").removeClass("slideright");
        //$(".window").removeClass("current");
    	var nextWindow = $(this).attr("href");
        $(nextWindow).addClass(slideClass);
      
        console.log(nextWindow);

        
        setTimeout(function(){
            $(nextWindow).addClass("current");
	
	
	
            $('.window').addClass("transparent");
	  
            $(nextWindow).removeClass("transparent"); 
            $(nextWindow).removeClass("slideright");
            $(nextWindow).removeClass("slideleft");
            
            
        },200); 
        
        return false;
        
    });
    
    
});