<?php
// config.php
session_start();

$host = "localhost";
$user = "leon";
$pass = "leon";
$dbname = "grand_fam_bot";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("DB Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");

// CSRF-Token für AJAX
if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

// Zugriffsschutz für alle Seiten außer Login/AJAX-Login
$public = ['login.php'];
$basename = basename($_SERVER['PHP_SELF']);
if (!in_array($basename, $public) && !isset($_SESSION['user'])) {
    header("Location: login.php");
    exit;
}
