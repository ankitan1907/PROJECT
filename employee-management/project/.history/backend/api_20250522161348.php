<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    // Check if data is present
    if ($data && isset($data['fullName']) && isset($data['code'])) {
        // Connect to DB and insert
        // Example:
        $conn = new mysqli("localhost", "root", "", "employee_db");

        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode(["error" => "Database connection failed"]);
            exit();
        }

        $fullName = $conn->real_escape_string($data['fullName']);
        $code = $conn->real_escape_string($data['code']);
        // and so on...

        $sql = "INSERT INTO employees (code, fullName, designation, subDesignation, subDesignation2, hindiKnowledge, qualification)
                VALUES ('$code', '$fullName', '{$data['designation']}', '{$data['subDesignation']}', '{$data['subDesignation2']}', '{$data['hindiKnowledge']}', '{$data['qualification']}')";

        if ($conn->query($sql)) {
            echo json_encode(["message" => "Employee added successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Query failed"]);
        }

        $conn->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Only POST allowed"]);
}
