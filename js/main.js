/* =========================================================
   ImMiku — Creado por Chizu
   Genera la URL ImMiku (Base64 / data URL) 100% en el navegador.
   Sin servidores, sin subidas externas: imagen/video → link.
   ========================================================= */

const $ = (id) => document.getElementById(id);
const dropzone    = $("dropzone");
const fileInput   = $("fileInput");
const filePreview = $("filePreview");
const fpName      = $("fpName");
const fpSize      = $("fpSize");
const btnUpload   = $("btnUpload");
const progressWrap= $("progressWrap");
const progressFill= $("progressFill");
const progressText= $("progressText");
const result      = $("result");
const resultUrl   = $("resultUrl");
const resultNote  = $("resultNote");
const resultEmbed = $("resultEmbed");
const btnCopy     = $("btnCopy");
const errorMsg    = $("errorMsg");
const toast       = $("toast");

const HISTORY_KEY = "immiku_history";
const HISTORY_MAX_BYTES = 4 * 1024 * 1024; // guardar hasta ~4 MB de URLs en total

let currentFile = null;

/* ---------- Selección de archivo ---------- */
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
});
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) selectFile(fileInput.files[0]);
});

["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("drag"); })
);
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("drag"); })
);
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) selectFile(file);
});

function selectFile(file) {
  hideError();
  currentFile = file;
  fpName.textContent = file.name;
  fpSize.textContent = formatBytes(file.size) + " → URL de ~" + formatBytes(Math.ceil(file.size * 1.37));
  filePreview.hidden = false;
  result.hidden = true;
}

/* ---------- Generar URL ImMiku (Base64) ---------- */
btnUpload.addEventListener("click", () => {
  if (!currentFile) return;
  hideError();
  setGenerating(true);
  animateProgress();

  const reader = new FileReader();
  reader.readAsDataURL(currentFile);

  reader.addEventListener("load", () => {
    stopProgress();
    setProgress(100);
    const url = reader.result; // data:<mime>;base64,...
    showResult(url, currentFile);
    saveToHistory(currentFile.name, url);
    showToast("✅ ¡URL ImMiku generada!");
    currentFile = null;
    fileInput.value = "";
    setGenerating(false);
  });

  reader.addEventListener("error", () => {
    stopProgress();
    setGenerating(false);
    progressWrap.hidden = true;
    showError("❌ No se pudo leer el archivo. Intenta con otro.");
  });
});

function setGenerating(state) {
  btnUpload.disabled = state;
  btnUpload.textContent = state ? "Generando…" : "Generar URL ImMiku ✨";
  if (state) { progressWrap.hidden = false; result.hidden = true; setProgress(0); }
}

/* Barra animada mientras se convierte (FileReader no da progreso fino) */
let progTimer = null;
function animateProgress() {
  let p = 3;
  setProgress(p);
  progTimer = setInterval(() => {
    p = Math.min(p + Math.random() * 6, 90);
    setProgress(Math.round(p));
  }, 150);
}
function stopProgress() { if (progTimer) { clearInterval(progTimer); progTimer = null; } }

/* ---------- Resultado ---------- */
function showResult(url, file) {
  result.hidden = false;
  resultUrl.value = url;
  if (resultNote) {
    resultNote.textContent = "✨ URL ImMiku generada localmente: pégala en cualquier navegador o etiqueta <img> y funcionará. Es larga porque contiene el archivo completo en Base64.";
    resultNote.hidden = false;
  }
  resultEmbed.innerHTML = "";
  resultEmbed.hidden = true;

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = url; img.alt = file.name;
    resultEmbed.appendChild(img); resultEmbed.hidden = false;
  } else if (file.type.startsWith("video/")) {
    const vid = document.createElement("video");
    vid.src = url; vid.controls = true;
    resultEmbed.appendChild(vid); resultEmbed.hidden = false;
  } else if (file.type.startsWith("audio/")) {
    const aud = document.createElement("audio");
    aud.src = url; aud.controls = true;
    resultEmbed.appendChild(aud); resultEmbed.hidden = false;
  }
  result.scrollIntoView({ behavior: "smooth", block: "center" });
}

btnCopy.addEventListener("click", () => copyText(resultUrl.value));

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("📋 ¡URL ImMiku copiada!");
  } catch {
    resultUrl.select();
    document.execCommand("copy");
    showToast("📋 ¡URL ImMiku copiada!");
  }
}

/* ---------- Historial local (con límite de espacio) ---------- */
const historyList  = $("historyList");
const historyEmpty = $("historyEmpty");

function loadHistory() {
  const items = getHistory();
  historyList.innerHTML = "";
  historyEmpty.hidden = items.length > 0;
  items.forEach((item) => historyList.appendChild(renderHistoryItem(item)));
}
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveToHistory(name, url) {
  const items = getHistory();
  items.unshift({ name, url, date: Date.now() });
  // Recortar hasta que quepa en el presupuesto de bytes
  let total = JSON.stringify(items).length;
  while (items.length > 1 && total > HISTORY_MAX_BYTES) {
    items.pop();
    total = JSON.stringify(items).length;
  }
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    // Cuota llena: guardar solo el más reciente
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify([items[0]])); }
    catch { /* sin espacio: no guardar */ }
  }
  loadHistory();
}
function renderHistoryItem({ name, url, date }) {
  const li = document.createElement("li");

  if (url.startsWith("data:image/")) {
    const img = document.createElement("img");
    img.src = url; img.className = "h-thumb"; img.alt = "";
    li.appendChild(img);
  }
  const info = document.createElement("span");
  info.className = "h-name";
  info.textContent = name;
  info.title = name + " — " + new Date(date).toLocaleString();

  const btn = document.createElement("button");
  btn.className = "h-copy"; btn.textContent = "Copiar URL";
  btn.addEventListener("click", () => copyText(url));

  li.append(info, btn);
  return li;
}
$("btnClear").addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  loadHistory();
  showToast("🧹 Historial limpiado");
});
loadHistory();

/* ---------- Utilidades ---------- */
function setProgress(p) {
  progressFill.style.width = p + "%";
  progressText.textContent = p + "%";
}
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}
function hideError() { errorMsg.hidden = true; }
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => (toast.hidden = true), 300);
  }, 2500);
}
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}
