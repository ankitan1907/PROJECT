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

// Handle GET request to fetch employee by emp_code
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['empCode'])) {
        $empCode = $_GET['empCode'];
        $sql = "SELECT * FROM employees WHERE emp_code = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $empCode);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $employee = $result->fetch_assoc();
            echo json_encode($employee);
        } else {
            echo json_encode(['error' => 'Employee not found']);
        }
    } else {
        echo json_encode(['error' => 'empCode parameter missing']);
    }
}

$conn->close();
?>
