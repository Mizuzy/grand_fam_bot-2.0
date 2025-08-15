<?php
require "../config.php";
header("Content-Type: application/json");
$input = json_decode(file_get_contents('php://input'), true);
if (($input['X-CSRF'] ?? $_SERVER['HTTP_X_CSRF'] ?? '') !== $_SESSION['csrf']) { http_response_code(403); echo json_encode(['error'=>'CSRF']); exit; }

$id = (int)($input['id'] ?? 0);
$header = $input['header'] ?? null;
$content = $input['content'] ?? null;

$stmt = $conn->prepare("UPDATE `embedcontent` SET `header`=?, `content`=? WHERE ID=?");
$stmt->bind_param("ssi", $header, $content, $id);
$ok = $stmt->execute();
echo json_encode(['ok'=>$ok, 'message'=> $ok ? 'Embed gespeichert' : 'Keine Änderung']);
