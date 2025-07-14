<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
$conn = new mysqli("localhost", "root", "Akhil@8247", "employee_db");

$emp_code = $_GET["code"] ?? "";

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$stmt = $conn->prepare("SELECT emp_code FROM employees WHERE emp_code = ?");
$stmt->bind_param("s", $emp_code);
$stmt->execute();
$stmt->store_result();

echo json_encode(["unique" => $stmt->num_rows === 0]);

$stmt->close();
$conn->close();
?>
