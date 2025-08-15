<?php
require "../config.php";
header("Content-Type: application/json");
$input = json_decode(file_get_contents('php://input'), true);
if (($input['X-CSRF'] ?? $_SERVER['HTTP_X_CSRF'] ?? '') !== $_SESSION['csrf']) { http_response_code(403); echo json_encode(['error'=>'CSRF']); exit; }
$id = (int)($input['id'] ?? 0);

$stmt = $conn->prepare("SELECT ID, `Event`, `Prio`, `MapID` FROM `events` WHERE ID=?");
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
echo json_encode($res ?: []);
