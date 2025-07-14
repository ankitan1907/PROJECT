<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "Akhil@8247", "employee_db");

$data = json_decode(file_get_contents("php://input"));

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$stmt = $conn->prepare("INSERT INTO employees (emp_code, name, designation, knowledge_of_hindi, qualification) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $data->emp_code, $data->name, $data->designation, $data->knowledge_of_hindi, $data->qualification);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(400);
    echo json_encode(["error" => "Failed to add employee"]);
}

$stmt->close();
$conn->close();
?>
