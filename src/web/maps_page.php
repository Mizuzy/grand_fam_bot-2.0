<?php require "config.php"; ?>
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Maps</title>
<link rel="stylesheet" href="assets/css/style.css">
<script>
window.CSRF_TOKEN = "<?php echo $_SESSION['csrf']; ?>";
</script>
<script src="assets/js/main.js" defer></script>
</head>
<body class="app">
  <aside class="sidebar">
    <div class="brand">Admin Panel</div>
    <nav class="nav">
      <a class="nav-link" href="dashboard.php">Dashboard</a>
      <a class="nav-link" href="config_page.php">Config</a>
      <a class="nav-link" href="embedcontent_page.php">Embedcontent</a>
      <a class="nav-link" href="events_page.php">Events</a>
      <a class="nav-link active" href="maps_page.php">Maps</a>
    </nav>
    <div class="sidebar-footer">
      <span class="user">@<?php echo htmlspecialchars($_SESSION['user']); ?></span>
      <a class="btn-ghost" href="logout.php">Logout</a>
    </div>
  </aside>

  <main class="content">
    <h1>Maps</h1>
    <div class="list">
      <?php
      $res = $conn->query("SELECT ID, `name`, `MAP`, `event` FROM `maps` ORDER BY ID ASC");
      while ($row = $res->fetch_assoc()):
      ?>
        <button class="list-item as-link"
                data-open-modal
                data-kind="map"
                data-id="<?php echo (int)$row['ID']; ?>">
          <div class="left"><div class="title"><?php echo htmlspecialchars($row['name']); ?></div></div>
          <div class="right">Öffnen</div>
        </button>
      <?php endwhile; ?>
    </div>
  </main>

  <!-- Modal -->
  <div id="modal" class="modal hidden" role="dialog" aria-modal="true">
    <div class="modal-backdrop" data-close-modal></div>
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="modal-title">Map bearbeiten</h3>
        <button class="close" data-close-modal>&times;</button>
      </div>
      <div class="modal-body" id="modal-body"></div>
      <div class="modal-footer">
        <button class="btn" id="modal-save">Speichern</button>
        <button class="btn-ghost" data-close-modal>Abbrechen</button>
      </div>
    </div>
  </div>
</body>
</html>
