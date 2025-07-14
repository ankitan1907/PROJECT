<?php
header('Content-Type: application/json');

// Read raw input and decode JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validate JSON payload
if (!$data) {
    echo json_encode(["error" => "Invalid JSON or no data received."]);
    exit;
}

// Check for required fields
$required = ['emp_code', 'name', 'designation', 'knowledge_of_hindi', 'qualification'];
$missing = [];

foreach ($required as $field) {
    if (empty($data[$field])) {
        $missing[] = $field;
    }
}

if (count($missing) > 0) {
    echo json_encode(["error" => "Missing fields: " . implode(", ", $missing)]);
    exit;
}

// Get data
$empCode = $data['emp_code'];
$name = $data['name'];
$designation = $data['designation'];
$knowledgeOfHindi = $data['knowledge_of_hindi'];
$qualification = $data['qualification'];

// Database connection
$host = "localhost";
$username = "root";
$password = "Akhil@8247";     // adjust if different
$database = "employee_db"; // use your actual database name

$conn = new mysqli($host, $username, $password, $database);

// Check DB connection
if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed."]);
    exit;
}

// Update query
$stmt = $conn->prepare("UPDATE employees SET name = ?, designation = ?, knowledge_of_hindi = ?, qualification = ? WHERE emp_code = ?");
$stmt->bind_param("sssss", $name, $designation, $knowledgeOfHindi, $qualification, $empCode);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Employee updated successfully."]);
} else {
    echo json_encode(["error" => "Failed to update employee."]);
}

$stmt->close();
$conn->close();
?>
