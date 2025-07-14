<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';    // your DB host
$db   = 'employee_db'; // your DB name
$user = 'root'; // your DB user
$pass = 'ankuN@123987#'; // your DB password
$charset = 'utf8mb4';

// Connect to MySQL with PDO
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Create table if not exists
$tableSql = "
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
$pdo->exec($tableSql);

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Create employee
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Basic validation
    if (empty($data['code']) || empty($data['fullName']) || empty($data['designation']) || empty($data['qualification'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO employees 
        (code, fullName, designation, subDesignation, subDesignation2, hindiKnowledge, qualification)
        VALUES (?, ?, ?, ?, ?, ?, ?)");
    try {
        $stmt->execute([
            $data['code'],
            $data['fullName'],
            $data['designation'],
            $data['subDesignation'] ?? null,
            $data['subDesignation2'] ?? null,
            $data['hindiKnowledge'] ?? 'Null',
            $data['qualification']
        ]);
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Insert failed: ' . $e->getMessage()]);
    }
} elseif ($method === 'GET') {
    // Fetch all employees
    $stmt = $pdo->query("SELECT * FROM employees ORDER BY created_at DESC");
    $employees = $stmt->fetchAll();
    echo json_encode($employees);

} elseif ($method === 'DELETE') {
    // Delete employee by ID passed as query param ?id=123
    if (!isset($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing id parameter']);
        exit;
    }
    $id = (int)$_GET['id'];
    $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
    try {
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Delete failed: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
