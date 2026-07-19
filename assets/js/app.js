/* App shell: hash router + central store. */

import { DIMENSIONS, defaultSelection } from "./data/options.js";
import { STYLE_MAP } from "./data/styles.js";
import { resolveSelection } from "./data/tokens.js";
import { renderGallery, renderStyleDetail, renderBuilder, renderLearn, renderExport } from "./views.js";

const LS_KEY = "designpicker-state-v1";
const ui = { exportFmt: "brief" };

const DEFAULT_STYLE = "midnight-saas";

function freshState() {
  return { selection: { ...STYLE_MAP[DEFAULT_STYLE].dims }, styleId: DEFAULT_STYLE };
}

/* --------------------------------- store --------------------------------- */

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.selection) return { selection: { ...defaultSelection(), ...s.selection }, styleId: s.styleId ?? null };
    }
  } catch { /* ignore */ }
  return freshState();
}

const store = {
  state: loadState(),

  save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(this.state)); } catch { /* ignore */ }
  },

  style() { return this.state.styleId ? STYLE_MAP[this.state.styleId] ?? null : null; },

  isExactMatch() {
    const s = this.style();
    if (!s) return false;
    return Object.entries(s.dims).every(([k, v]) => this.state.selection[k] === v);
  },

  resolved() {
    const r = resolveSelection(DIMENSIONS, this.state.selection);
    const s = this.style();
    if (s?.extras) r.extras.push(s.extras);
    return r;
  },

  setSelection(dimKey, optId) {
    this.state.selection[dimKey] = optId;
    // styleId is kept as the "based on" reference even after customization
    this.save();
  },

  loadStyle(id) {
    const s = STYLE_MAP[id];
    if (!s) return;
    this.state.selection = { ...s.dims };
    this.state.styleId = id;
    this.save();
  },

  randomize() {
    const sel = {};
    for (const d of DIMENSIONS) sel[d.key] = d.options[Math.floor(Math.random() * d.options.length)].id;
    this.state.selection = sel;
    this.state.styleId = null;
    this.save();
  },

  reset() {
    this.state.selection = defaultSelection();
    this.state.styleId = null;
    this.save();
  },

  updatePill() {
    const pill = document.getElementById("cfg-pill");
    if (!pill) return;
    const s = this.style();
    pill.textContent = s ? (this.isExactMatch() ? `style: ${s.name}` : `custom · based on ${s.name}`) : "custom mix";
  },

  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  },

  toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2200);
  },
};

/* --------------------------------- router --------------------------------- */

const app = document.getElementById("app");
const tabs = document.getElementById("tabs");

function route() {
  const hash = location.hash || "#/styles";
  const [, page, param] = hash.split("/"); // "#/style/x" -> ["", "style", "x"]
  const tabFor = { styles: "styles", style: "styles", builder: "builder", learn: "learn", export: "export" }[page] || "styles";

  tabs.querySelectorAll("a").forEach((a) => a.classList.toggle("active", a.dataset.tab === tabFor));

  window.scrollTo({ top: 0 });
  switch (page) {
    case "style": renderStyleDetail(app, store, param); break;
    case "builder": renderBuilder(app, store); break;
    case "learn": renderLearn(app, store); break;
    case "export": renderExport(app, store, ui); break;
    default: renderGallery(app, store);
  }
  store.updatePill();
}

window.addEventListener("hashchange", route);
route();
