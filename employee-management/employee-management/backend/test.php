<?php
$servername = "localhost";
$username = "root";
$password = "Akhil@8247";
$database = "employee_management"; // change if your database has a different name

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully!";
?>
