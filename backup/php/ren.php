<?php 


for ($i = 10000; $i <= 99999; $i++) {
                
                if (file_exists ( "../pictures/out/" . $i . ".jpg")) {
                echo ("pictures/out/" . $i . ".JPG<br>");
                 rename("../pictures/out/" . $i . ".jpg","../pictures/out/" . $i . ".JPG");
            }

    
}

            
            
?>