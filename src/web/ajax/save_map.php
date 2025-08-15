<?php
require "../config.php";
header("Content-Type: application/json");
$input = json_decode(file_get_contents('php://input'), true);
if (($input['X-CSRF'] ?? $_SERVER['HTTP_X_CSRF'] ?? '') !== $_SESSION['csrf']) { http_response_code(403); echo json_encode(['error'=>'CSRF']); exit; }

$id = (int)($input['id'] ?? 0);
$MAP = $input['MAP'] ?? null;
$event = $input['event'] ?? null;
$IMG = $input['IMG'] ?? null;

$stmt = $conn->prepare("UPDATE `maps` SET `MAP`=?, `event`=?, `IMG`=? WHERE ID=?");
$stmt->bind_param("sssi", $MAP, $event, $IMG, $id);
$ok = $stmt->execute();
echo json_encode(['ok'=>$ok, 'message'=> $ok ? 'Map gespeichert' : 'Keine Änderung']);
