<?php
    require '../../config/database.php';
    require '../../config/header.php';

    $request_method = $_SERVER['REQUEST_METHOD'];
    $data = json_decode(file_get_contents('php://input'));

    if($request_method === "POST"){
        $first_name = $data->f_name;
        $last_name = $data->l_name;
        $email = $data->email;
        $password = $data->password;
        $biometric = $data->template;

        if($first_name !== "" && $last_name !== "" && $email !== "" && $password !== "" && $biometric !== ""){
            $stmt = $conn->prepare("INSERT INTO users (f_name, l_name, email, password) VALUES(?,?,?,?)");
            $stmt->bind_param("ssss", $first_name, $last_name, $email, $password);
            if($stmt->execute()){
                $sql = "SELECT id FROM users WHERE email = '$email'";
                $result = $conn->query($sql);
                $row = $result->fetch_assoc();
                
                $biostmt = $conn->prepare("INSERT INTO biometric(user_id, template) VALUES(?,?)");
                $biostmt->bind_param("is", $row['id'], $biometric);
                if($biostmt->execute()){
                    echo json_encode(["success"=>true, "message"=>"User registered successfully"]);
                }
            }else{
                echo json_encode(["success"=>false, "message"=>"Registeration failed, something went wrong"]);
            }
        }else{
            echo json_encode("Hi");
        }
    }
?>