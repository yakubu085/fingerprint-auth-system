<?php
    include '../config/database.php';
    include '../config/header.php';

    if($_SERVER['REQUEST_METHOD'] === 'POST'){
        $data = json_decode(file_get_contents("php://input"));

        $id = $data->id;
        $template = $data->template;

        $stmt = $conn->prepare("INSERT INTO template(user_id, template) VALUES(?,?)");
        $stmt->bind_param("is",$id,$template);
        if($stmt->execute()){
            echo json_encode(["status"=>true]);
        }else{
            echo json_encode(["status"=>false]);
        }
    }
?>