<?php
require "../config.php";
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (($input['X-CSRF'] ?? $_SERVER['HTTP_X_CSRF'] ?? '') !== $_SESSION['csrf']) { http_response_code(403); echo json_encode(['error'=>'CSRF']); exit; }

$id = (int)($input['id'] ?? 0);
$setconfig = (int)($input['setconfig'] ?? 0);

$stmt = $conn->prepare("UPDATE `config` SET `setconfig`=? WHERE ID=?");
$stmt->bind_param("ii", $setconfig, $id);
$ok = $stmt->execute();
echo json_encode(['ok'=>$ok, 'message'=> $ok ? 'Gespeichert' : 'Keine Änderung']);
