<?php
// Allow frontend from localhost:3000 to access this API
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$username = "root";
$password = "Akhil@8247";
$database = "employee_db";

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$emp_code = $data["emp_code"] ?? '';

$stmt = $conn->prepare("SELECT COUNT(*) as count FROM employees WHERE emp_code = ?");
$stmt->bind_param("s", $emp_code);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();

echo json_encode(["exists" => $result["count"] > 0]);
$conn->close();
?>
