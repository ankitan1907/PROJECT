<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$method = $_SERVER['REQUEST_METHOD'];
$host = "localhost";
$user = "root";
$pass = "ankuN@123987#";  // your password
$dbname = "employee_db";

// Create DB connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check DB connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

// Create table if not exists
$createTable = "
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    fullName VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    subDesignation VARCHAR(100),
    subDesignation2 VARCHAR(100),
    hindiKnowledge ENUM('Good', 'Average', 'Null') DEFAULT 'Null',
    qualification VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($createTable);

// Handle request
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if ($data && isset($data['code']) && isset($data['fullName']) && isset($data['designation']) && isset($data['qualification'])) {
        // Sanitize inputs
        $code = $conn->real_escape_string($data['code']);
        $fullName = $conn->real_escape_string($data['fullName']);
        $designation = $conn->real_escape_string($data['designation']);
        $subDesignation = isset($data['subDesignation']) ? $conn->real_escape_string($data['subDesignation']) : null;
        $subDesignation2 = isset($data['subDesignation2']) ? $conn->real_escape_string($data['subDesignation2']) : null;
        $hindiKnowledge = isset($data['hindiKnowledge']) ? $conn->real_escape_string($data['hindiKnowledge']) : 'Null';
        $qualification = $conn->real_escape_string($data['qualification']);

        // Validation rules based on designation
        if ($designation === 'Director') {
            if ($subDesignation !== null && $subDesignation !== '') {
                http_response_code(400);
                echo json_encode(['error' => 'Director cannot have subDesignation']);
                exit;
            }
            if ($subDesignation2 !== null && $subDesignation2 !== '') {
                http_response_code(400);
                echo json_encode(['error' => 'Director cannot have subDesignation2']);
                exit;
            }
        } elseif ($designation === 'Group Director') {
            if ($subDesignation === null || $subDesignation === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Group Director must have subDesignation']);
                exit;
            }
            if ($subDesignation2 !== null && $subDesignation2 !== '') {
                http_response_code(400);
                echo json_encode(['error' => 'Group Director cannot have subDesignation2']);
                exit;
            }
        } elseif ($designation === 'Group') {
            if ($subDesignation === null || $subDesignation === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Group must have subDesignation']);
                exit;
            }
            if ($subDesignation2 === null || $subDesignation2 === '') {
                http_response_code(400);
                echo json_encode(['error' => 'Group must have subDesignation2']);
                exit;
            }
        }

        // Prepare insert query with NULL for empty subDesignations
        $subDesignationVal = ($subDesignation === null || $subDesignation === '') ? 'NULL' : "'$subDesignation'";
        $subDesignation2Val = ($subDesignation2 === null || $subDesignation2 === '') ? 'NULL' : "'$subDesignation2'";
        $hindiKnowledgeVal = ($hindiKnowledge === null || $hindiKnowledge === '') ? "'Null'" : "'$hindiKnowledge'";

        $sql = "INSERT INTO employees 
                (code, fullName, designation, subDesignation, subDesignation2, hindiKnowledge, qualification)
                VALUES 
                ('$code', '$fullName', '$designation', $subDesignationVal, $subDesignation2Val, $hindiKnowledgeVal, '$qualification')";

        if ($conn->query($sql)) {
            echo json_encode(["message" => "Employee added successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Insert failed: " . $conn->error]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
    }
}

// Get all employees
elseif ($method === 'GET') {
    $result = $conn->query("SELECT * FROM employees ORDER BY created_at DESC");
    $employees = [];

    while ($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }

    echo json_encode($employees);
}

// Delete employee by ID
elseif ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing id parameter"]);
        exit;
    }

    $id = intval($_GET['id']);
    $deleteSql = "DELETE FROM employees WHERE id = $id";

    if ($conn->query($deleteSql)) {
        echo json_encode(["message" => "Employee deleted successfully"]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Delete failed: " . $conn->error]);
    }
}

// Invalid method
else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
