// assets/js/main.js

// --- Helpers ---
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF": window.CSRF_TOKEN || ""
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

function $(sel, ctx=document){ return ctx.querySelector(sel); }
function $all(sel, ctx=document){ return Array.from(ctx.querySelectorAll(sel)); }

// --- Modal logic ---
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalSave = document.getElementById("modal-save");

function openModal() { modal.classList.remove("hidden"); }
function closeModal() { modal.classList.add("hidden"); modalBody.innerHTML = ""; modalSave.onclick = null; }

document.addEventListener("click", (e)=>{
  if (e.target.matches("[data-close-modal]")) closeModal();
  if (e.target === modal) closeModal();
});

// --- Open item modals (embed, event, map) ---
document.addEventListener("click", async (e)=>{
  const btn = e.target.closest("[data-open-modal]");
  if (!btn) return;

  const kind = btn.dataset.kind;
  const id = parseInt(btn.dataset.id, 10);

  try {
    if (kind === "embed") {
      const data = await postJSON("ajax/get_embedcontent.php", { id });
      modalBody.innerHTML = `
        <div class="form">
          <label>Event</label>
          <input type="text" value="${escapeHTML(data.event)}" disabled>
          <label>Header</label>
          <input id="hdr" type="text" value="${escapeHTML(data.header||'')}">
          <label>Content</label>
          <textarea id="cnt" rows="8">${escapeHTML(data.content||'')}</textarea>
        </div>`;
      modalSave.onclick = async ()=>{
        const header = $("#hdr").value;
        const content = $("#cnt").value;
        const res = await postJSON("ajax/save_embedcontent.php", { id, header, content });
        toast(res.message || "Gespeichert");
        closeModal();
      };
    }

    if (kind === "event") {
      const data = await postJSON("ajax/get_event.php", { id });
      modalBody.innerHTML = `
        <div class="form">
          <label>Event</label>
          <input type="text" value="${escapeHTML(data.Event)}" disabled>
          <label>Prio</label>
          <input id="prio" type="text" value="${escapeHTML(data.Prio||'')}">
          <label>MapID</label>
          <input id="mapid" type="text" value="${escapeHTML(data.MapID||'')}">
        </div>`;
      modalSave.onclick = async ()=>{
        const Prio = $("#prio").value;
        const MapID = $("#mapid").value;
        const res = await postJSON("ajax/save_event.php", { id, Prio, MapID });
        toast(res.message || "Gespeichert");
        closeModal();
      };
    }

if (kind === "map") {
  const data = await postJSON("ajax/get_map.php", { id });
  modalBody.innerHTML = `
    <div class="form">
      <label>Name</label>
      <input type="text" value="${escapeHTML(data.name)}" disabled>
      <label>MAP</label>
      <input id="map" type="text" value="${escapeHTML(data.MAP||'')}">
      <label>Event</label>
      <input id="event" type="text" value="${escapeHTML(data.event||'')}">
      <label>IMG (Bild-URL)</label>
      <input id="img" type="text" value="${escapeHTML(data.IMG||'')}">
    </div>`;
  modalSave.onclick = async ()=>{
    const MAP = $("#map").value;
    const event = $("#event").value;
    const IMG = $("#img").value;
    const res = await postJSON("ajax/save_map.php", { id, MAP, event, IMG });
    toast(res.message || "Gespeichert");
    closeModal();
  };
}

    openModal();
  } catch (err) {
    toast("Fehler: " + err.message);
  }
});

// --- Config toggles (realtime) ---
document.addEventListener("change", async (e)=>{
  const cb = e.target.closest("input[data-type='config-toggle']");
  if (!cb) return;
  const id = parseInt(cb.dataset.id, 10);
  const value = cb.checked ? 1 : 0;
  try {
    const res = await postJSON("ajax/update_config.php", { id, setconfig: value });
    toast(res.message || "Aktualisiert");
  } catch (err) {
    cb.checked = !cb.checked; // revert
    toast("Fehler: " + err.message);
  }
});

// --- Small toast ---
let toastTimer;
function toast(msg){
  let t = document.getElementById("toast");
  if (!t){
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = "toast show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ t.className = "toast"; }, 2000);
}

function escapeHTML(s){
  return String(s ?? "").replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
