<?php
    $db_password = 'Unity${3d}@22';
    $db_name = 'evoting';
    $conn = new mysqli("localhost", "root", $db_password, $db_name);

    if($conn->connect_error){
        die("Connection Failed".$conn->connect_error);
    }
?>