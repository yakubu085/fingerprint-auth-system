<?php
    require '../../config/database.php';
    require '../../config/header.php';

    $request_method = $_SERVER['REQUEST_METHOD'];
    $data = json_decode(file_get_contents('php://input'));

    if($request_method === "POST"){
        $email = $data->email;
        $password = $data->password;
        $template = $data->template;

        // echo json_encode(["password"=>$password, "email"=>$email, "template"=>$template]);
        

        if((!empty($email) || $email != "") && (!empty($password) || $password != "")){
            $stmt = $conn->prepare("SELECT email,password FROM users WHERE email = ? ");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            if($result->num_rows>0){
                $row = $result->fetch_assoc();
                $pass = $row['password'];

                if($pass === $password){
                    output(true, "Login successful");
                }else{
                    output(false, "Incorrect password");
                }
            }else{
                output(false, "No user found");
            }
        }else if((!empty($email) || $email != "") && (!empty($template) || $template != "")){
            $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? ");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            $id = ($result->fetch_assoc())['id'];

            $sql = "SELECT template FROM biometric WHERE '$id' = user_id";
            $result = $conn->query($sql);
            if($result->num_rows > 0){
                $temp = ($result->fetch_assoc())['template'];

                if(!empty($temp)){
                    output1(true, "template", $temp);
                }else{
                    output(false, "Fingerprint not registered");
                }
            }else{
                output(false, "No user found");
            }
        }
    }

    function output($status, $message){
        echo json_encode(["status"=>$status, "message"=>$message]);
    }
    function output1($status, $message_text, $message_value){
        echo json_encode(["status"=>$status, $message_text=>$message_value]);
    }
?>