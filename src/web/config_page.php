<?php require "config.php"; ?>
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Config</title>
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
      <a class="nav-link active" href="config_page.php">Config</a>
      <a class="nav-link" href="embedcontent_page.php">Embedcontent</a>
      <a class="nav-link" href="events_page.php">Events</a>
      <a class="nav-link" href="maps_page.php">Maps</a>
    </nav>
    <div class="sidebar-footer">
      <span class="user">@<?php echo htmlspecialchars($_SESSION['user']); ?></span>
      <a class="btn-ghost" href="logout.php">Logout</a>
    </div>
  </aside>

  <main class="content">
    <h1>Config</h1>
    <div class="list">
      <?php
      $res = $conn->query("SELECT ID, `config`, `setconfig` FROM `config` ORDER BY ID ASC");
      while ($row = $res->fetch_assoc()):
      ?>
        <div class="list-item">
          <div class="left">
            <div class="title"><?php echo htmlspecialchars($row['config']); ?></div>
          </div>
          <div class="right">
            <label class="switch">
              <input type="checkbox"
                     data-type="config-toggle"
                     data-id="<?php echo (int)$row['ID']; ?>"
                     <?php echo ((int)$row['setconfig'] === 1 ? 'checked' : ''); ?>>
              <span class="slider"></span>
            </label>
          </div>
        </div>
      <?php endwhile; ?>
    </div>
  </main>

  <!-- Modal shared -->
  <div id="modal" class="modal hidden" role="dialog" aria-modal="true">
    <div class="modal-backdrop" data-close-modal></div>
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="modal-title">Details</h3>
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
