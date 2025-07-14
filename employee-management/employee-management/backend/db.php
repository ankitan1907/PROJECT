<?php
// db.php
$servername = "localhost";
$username = "root";
$password = "Akhil@8247";
$dbname = "employee_db";

function getDBConnection() {
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}
?>
