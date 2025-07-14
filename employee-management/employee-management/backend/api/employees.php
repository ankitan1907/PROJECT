<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$user = 'root';
$pass = 'Akhil@8247';
$dbname = 'employee_db';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Handle GET request to fetch employees
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT * FROM employees";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $employees = [];
        while ($row = $result->fetch_assoc()) {
            $employees[] = $row;
        }
        echo json_encode($employees);
    } else {
        echo json_encode([]);
    }
}

// Handle POST request to create or update an employee
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $emp_code = $data['emp_code'];
    $name = $data['name'];
    $designation = $data['designation'];
    $knowledge_of_hindi = $data['knowledge_of_hindi'];
    $qualification = $data['qualification'];

    // Check if the employee exists (update) or not (insert)
    $sql = "SELECT * FROM employees WHERE emp_code = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $emp_code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Update employee
        $sql = "UPDATE employees SET name = ?, designation = ?, knowledge_of_hindi = ?, qualification = ? WHERE emp_code = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sssss', $name, $designation, $knowledge_of_hindi, $qualification, $emp_code);
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Employee updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update employee']);
        }
    } else {
        // Insert new employee
        $sql = "INSERT INTO employees (emp_code, name, designation, knowledge_of_hindi, qualification) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sssss', $emp_code, $name, $designation, $knowledge_of_hindi, $qualification);
        if ($stmt->execute()) {
            echo json_encode(['message' => 'Employee added successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add employee']);
        }
    }
}

// Handle DELETE request to delete an employee
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $emp_code = $data['emp_code'];

    $sql = "DELETE FROM employees WHERE emp_code = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $emp_code);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Employee deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete employee']);
    }
}

$conn->close();
?>
