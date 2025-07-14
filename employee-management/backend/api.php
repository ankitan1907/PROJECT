<?php
// Log request for debugging
file_put_contents('cors_debug.log', print_r($_SERVER, true));

// CORS headers - allow all origins and methods (adjust origin as needed for production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle OPTIONS preflight request early and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type for all other requests
header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];
$host = "localhost";
$user = "root";
$pass = "";  // your password
$dbname = ""; // your database name

// Create DB connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check DB connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

// Create table if not exists with enum default as 'Null' string
$createTable = "
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    fullName VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    subDesignation VARCHAR(100) DEFAULT NULL,
    subDesignation2 VARCHAR(100) DEFAULT NULL,
    hindiKnowledge ENUM('Good', 'Average', 'Null') NOT NULL DEFAULT 'Null',
    qualification VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($createTable);

// POST request - add new employee
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if ($data && isset($data['code'], $data['fullName'], $data['designation'], $data['qualification'])) {
        $code = $data['code'];
        $fullName = $data['fullName'];
        $designation = $data['designation'];
        $subDesignation = $data['subDesignation'] ?? null;
        $subDesignation2 = $data['subDesignation2'] ?? null;
        $hindiKnowledge = $data['hindiKnowledge'] ?? 'Null';
        $qualification = $data['qualification'];

        // Validation rules
        if ($designation === 'Director') {
            if (!empty($subDesignation)) {
                http_response_code(400);
                echo json_encode(['error' => 'Director cannot have subDesignation']);
                exit;
            }
            if (!empty($subDesignation2)) {
                http_response_code(400);
                echo json_encode(['error' => 'Director cannot have subDesignation2']);
                exit;
            }
        } elseif ($designation === 'Group Director') {
            if (empty($subDesignation)) {
                http_response_code(400);
                echo json_encode(['error' => 'Group Director must have subDesignation']);
                exit;
            }
            if (!empty($subDesignation2)) {
                http_response_code(400);
                echo json_encode(['error' => 'Group Director cannot have subDesignation2']);
                exit;
            }
        } elseif ($designation === 'Group') {
            if (empty($subDesignation)) {
                http_response_code(400);
                echo json_encode(['error' => 'Group must have subDesignation']);
                exit;
            }
            if (empty($subDesignation2)) {
                http_response_code(400);
                echo json_encode(['error' => 'Group must have subDesignation2']);
                exit;
            }
        }

        // Prepare statement with NULL handling
        $sql = "INSERT INTO employees 
            (code, fullName, designation, subDesignation, subDesignation2, hindiKnowledge, qualification) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['error' => 'Prepare statement failed: ' . $conn->error]);
            exit;
        }

        // Convert empty strings to null for subDesignations
        $subDesignationParam = !empty($subDesignation) ? $subDesignation : null;
        $subDesignation2Param = !empty($subDesignation2) ? $subDesignation2 : null;

        $stmt->bind_param(
            "sssssss",
            $code,
            $fullName,
            $designation,
            $subDesignationParam,
            $subDesignation2Param,
            $hindiKnowledge,
            $qualification
        );

        if ($stmt->execute()) {
            echo json_encode(["message" => "Employee added successfully"]);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Insert failed: " . $stmt->error]);
        }

        $stmt->close();
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
    }
}

// GET request - fetch all employees
elseif ($method === 'GET') {
    $result = $conn->query("SELECT * FROM employees ORDER BY created_at DESC");
    $employees = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $employees[] = $row;
        }
        echo json_encode($employees);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch employees']);
    }
}

// DELETE request - delete employee by id
elseif ($method === 'DELETE') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing id parameter"]);
        exit;
    }

    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM employees WHERE id = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['error' => 'Prepare statement failed: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Employee deleted successfully"]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Delete failed: " . $stmt->error]);
    }
    $stmt->close();
}

// Unsupported method
else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
