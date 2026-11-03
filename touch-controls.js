const STORE_KEY = "bf1942-web.touch-layout.v1";

const PRESETS = {
  infantry: [
    {id:"move", label:"MOVE", glyph:"✥", x:14, y:70, size:86, opacity:.72, kind:"stick"},
    {id:"fire", label:"FIRE", glyph:"●", x:88, y:67, size:68, opacity:.9, kind:"fire"},
    {id:"aim", label:"AIM", glyph:"⊙", x:77, y:42, size:52, opacity:.78},
    {id:"reload", label:"RELOAD", glyph:"↻", x:91, y:37, size:44, opacity:.72},
    {id:"jump", label:"JUMP", glyph:"↑", x:68, y:76, size:48, opacity:.72},
    {id:"crouch", label:"CROUCH", glyph:"↓", x:57, y:87, size:43, opacity:.68},
    {id:"grenade", label:"GRENADE", glyph:"◉", x:54, y:48, size:44, opacity:.72}
  ],
  vehicle: [
    {id:"steer", label:"STEER", glyph:"✥", x:14, y:70, size:90, opacity:.74, kind:"stick"},
    {id:"throttle", label:"GAS", glyph:"▲", x:88, y:72, size:64, opacity:.9, kind:"fire"},
    {id:"brake", label:"BRAKE", glyph:"■", x:72, y:83, size:50, opacity:.76},
    {id:"vehicle-fire", label:"FIRE", glyph:"●", x:88, y:37, size:58, opacity:.86, kind:"fire"},
    {id:"camera", label:"CAMERA", glyph:"◉", x:69, y:42, size:48, opacity:.72},
    {id:"seat", label:"SEAT", glyph:"⇄", x:49, y:84, size:45, opacity:.7},
    {id:"exit", label:"EXIT", glyph:"×", x:92, y:16, size:40, opacity:.68}
  ]
};

const copy = value => JSON.parse(JSON.stringify(value));

function loadLayouts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return {
      infantry: Array.isArray(saved.infantry) ? saved.infantry : copy(PRESETS.infantry),
      vehicle: Array.isArray(saved.vehicle) ? saved.vehicle : copy(PRESETS.vehicle)
    };
  } catch {
    return { infantry: copy(PRESETS.infantry), vehicle: copy(PRESETS.vehicle) };
  }
}

const stage = document.querySelector("#hud-stage");
const tray = document.querySelector("#hud-controls");
const sizeInput = document.querySelector("#control-size");
const opacityInput = document.querySelector("#control-opacity");
const sizeOutput = document.querySelector("#size-output");
const opacityOutput = document.querySelector("#opacity-output");
const selectedOutput = document.querySelector("#selected-control");
const statusOutput = document.querySelector("#layout-status");
const modeButtons = [...document.querySelectorAll("[data-hud-mode]")];
const layouts = loadLayouts();

let mode = "infantry";
let selectedId = "fire";
let drag = null;

function selectedControl() {
  return layouts[mode].find(item => item.id === selectedId) || null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateInspector() {
  const item = selectedControl();
  if (!item) {
    selectedOutput.textContent = "Выбери элемент на экране";
    sizeInput.disabled = true;
    opacityInput.disabled = true;
    return;
  }
  selectedOutput.textContent = item.label;
  sizeInput.disabled = false;
  opacityInput.disabled = false;
  sizeInput.value = String(item.size);
  opacityInput.value = String(Math.round(item.opacity * 100));
  sizeOutput.textContent = item.size + " px";
  opacityOutput.textContent = Math.round(item.opacity * 100) + "%";
}

function render() {
  tray.replaceChildren();
  layouts[mode].forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hud-control" + (item.kind ? " " + item.kind : "") + (item.id === selectedId ? " selected" : "");
    button.dataset.id = item.id;
    button.setAttribute("aria-label", item.label + ", перетащить или выбрать");
    button.setAttribute("aria-grabbed", item.id === selectedId ? "true" : "false");
    button.style.left = item.x + "%";
    button.style.top = item.y + "%";
    button.style.width = item.size + "px";
    button.style.height = item.size + "px";
    button.style.opacity = String(item.opacity);
    button.innerHTML = '<span class="hud-glyph" aria-hidden="true"></span><span class="hud-label"></span>';
    button.querySelector(".hud-glyph").textContent = item.glyph;
    button.querySelector(".hud-label").textContent = item.label;
    button.addEventListener("pointerdown", startDrag);
    button.addEventListener("pointermove", moveDrag);
    button.addEventListener("pointerup", endDrag);
    button.addEventListener("pointercancel", endDrag);
    button.addEventListener("keydown", nudgeWithKeyboard);
    button.addEventListener("click", () => {
      selectedId = item.id;
      render();
    });
    tray.append(button);
  });

  modeButtons.forEach(button => {
    const active = button.dataset.hudMode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  updateInspector();
}

function startDrag(event) {
  const item = layouts[mode].find(entry => entry.id === event.currentTarget.dataset.id);
  if (!item) return;
  selectedId = item.id;
  drag = { pointerId: event.pointerId, item };
  event.currentTarget.setPointerCapture(event.pointerId);
  event.preventDefault();
  renderSelectionOnly();
  updateInspector();
}

function renderSelectionOnly() {
  tray.querySelectorAll(".hud-control").forEach(button => {
    const active = button.dataset.id === selectedId;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-grabbed", String(active));
  });
}

function moveDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const bounds = stage.getBoundingClientRect();
  const radiusX = (drag.item.size / 2) / bounds.width * 100;
  const radiusY = (drag.item.size / 2) / bounds.height * 100;
  drag.item.x = clamp((event.clientX - bounds.left) / bounds.width * 100, radiusX, 100 - radiusX);
  drag.item.y = clamp((event.clientY - bounds.top) / bounds.height * 100, radiusY, 100 - radiusY);
  const button = tray.querySelector('[data-id="' + drag.item.id + '"]');
  if (button) {
    button.style.left = drag.item.x + "%";
    button.style.top = drag.item.y + "%";
  }
}

function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  drag = null;
}

function nudgeWithKeyboard(event) {
  const item = layouts[mode].find(entry => entry.id === event.currentTarget.dataset.id);
  if (!item) return;
  const step = event.shiftKey ? 5 : 1;
  const moves = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step]
  };
  if (!moves[event.key]) return;
  event.preventDefault();
  item.x = clamp(item.x + moves[event.key][0], 4, 96);
  item.y = clamp(item.y + moves[event.key][1], 7, 93);
  event.currentTarget.style.left = item.x + "%";
  event.currentTarget.style.top = item.y + "%";
}

function selectMode(nextMode) {
  if (!PRESETS[nextMode]) return;
  mode = nextMode;
  selectedId = mode === "infantry" ? "fire" : "throttle";
  statusOutput.textContent = mode === "infantry" ? "Пехота · отдельная раскладка" : "Техника · отдельная раскладка";
  render();
}

modeButtons.forEach(button => button.addEventListener("click", () => selectMode(button.dataset.hudMode)));

sizeInput.addEventListener("input", () => {
  const item = selectedControl();
  if (!item) return;
  item.size = Number(sizeInput.value);
  sizeOutput.textContent = item.size + " px";
  const button = tray.querySelector('[data-id="' + item.id + '"]');
  if (button) {
    button.style.width = item.size + "px";
    button.style.height = item.size + "px";
  }
});

opacityInput.addEventListener("input", () => {
  const item = selectedControl();
  if (!item) return;
  item.opacity = Number(opacityInput.value) / 100;
  opacityOutput.textContent = Math.round(item.opacity * 100) + "%";
  const button = tray.querySelector('[data-id="' + item.id + '"]');
  if (button) button.style.opacity = String(item.opacity);
});

document.querySelector("#save-layout").addEventListener("click", () => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(layouts));
    statusOutput.textContent = "Раскладки сохранены на этом устройстве";
  } catch {
    statusOutput.textContent = "Браузер запретил локальное сохранение";
  }
});

document.querySelector("#reset-layout").addEventListener("click", () => {
  layouts[mode] = copy(PRESETS[mode]);
  selectedId = mode === "infantry" ? "fire" : "throttle";
  render();
  statusOutput.textContent = "Восстановлена исходная раскладка";
});

document.querySelector("#export-layout").addEventListener("click", () => {
  const payload = {
    format: "bf1942-web-touch-layout",
    version: 1,
    exportedAt: new Date().toISOString(),
    layouts
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bf1942-touch-layout.json";
  link.click();
  URL.revokeObjectURL(url);
  statusOutput.textContent = "JSON-раскладка экспортирована";
});

render();
