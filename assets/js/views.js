/* View renderers. Each takes the #app root element + the store from app.js. */

import { STYLES, STYLE_MAP, STYLE_CATS } from "./data/styles.js";
import { DIMENSIONS } from "./data/options.js";
import { GLOSSARY } from "./data/glossary.js";
import { mountPreview } from "./preview.js";
import { generateBrief, generateCSS, generateJSON, generateTailwind } from "./exporter.js";
import { resolveSelection, firstFont } from "./data/tokens.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pageHead(kicker, title, sub) {
  return `<div class="page-head">
    <span class="kicker">${esc(kicker)}</span>
    <h1>${esc(title)}</h1>
    <p>${sub}</p>
  </div>`;
}

/* ------------------------------- gallery ------------------------------- */

export function renderGallery(root, store) {
  root.innerHTML = `<div class="page">
    ${pageHead(
      "Step 1 — Explore",
      "What's your aesthetic?",
      `${STYLES.length} design languages, rendered live — filter by family, click any style to learn its vocabulary. The <b>bold terms</b> are the words to use with your coding agent.`
    )}
    <div class="learn-controls">
      <div class="cat-filters" id="cats">
        <button data-cat="All" class="active">All · ${STYLES.length}</button>
        ${STYLE_CATS.map((c) => `<button data-cat="${esc(c)}">${esc(c)} · ${STYLES.filter((s) => s.cat === c).length}</button>`).join("")}
      </div>
    </div>
    <div class="style-grid" id="grid"></div>
  </div>`;

  const grid = root.querySelector("#grid");

  function draw(cat) {
    grid.innerHTML = "";
    for (const s of STYLES) {
      if (cat !== "All" && s.cat !== cat) continue;
      const card = document.createElement("a");
      card.className = "style-card";
      card.href = `#/style/${s.id}`;
      card.innerHTML = `
        <div class="pv-viewport"></div>
        <div class="meta">
          <h3>${esc(s.name)} ${s.hot ? `<span class="hot-badge">★ popular</span>` : ""} <span class="aka">${esc(s.aka[0] || "")}</span></h3>
          <p>${esc(s.tagline)}</p>
          <div class="traits"><span class="chip mono">${esc(s.cat)}</span>${s.traits.slice(0, 3).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        </div>`;
      grid.appendChild(card);
      const resolved = resolveSelection(DIMENSIONS, s.dims);
      if (s.extras) resolved.extras.push(s.extras);
      mountPreview(card.querySelector(".pv-viewport"), { ...resolved, key: s.id });
    }
  }

  root.querySelector("#cats").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    root.querySelectorAll("#cats button").forEach((x) => x.classList.toggle("active", x === b));
    draw(b.dataset.cat);
  });

  draw("All");
}

/* ----------------------------- style detail ----------------------------- */

export function renderStyleDetail(root, store, styleId) {
  const s = STYLE_MAP[styleId];
  if (!s) { location.hash = "#/styles"; return; }

  const dimWords = DIMENSIONS.map((d) => {
    const opt = d.options.find((o) => o.id === s.dims[d.key]);
    return opt ? `<li><b>${d.label}:</b> ${esc(opt.label)}</li>` : "";
  }).join("");

  root.innerHTML = `<div class="page">
    <a href="#/styles" class="btn small ghost">← All styles</a>
    <div class="detail-head" style="margin-top:18px">
      <div class="titles">
        <div class="aka-list">${s.aka.map((a) => `<span class="chip mono">${esc(a)}</span>`).join("")}</div>
        <h1>${esc(s.name)}</h1>
        <p class="tagline">${esc(s.tagline)}</p>
      </div>
      <div class="actions">
        <button class="btn primary" id="use-style">Open in Builder</button>
        <button class="btn" id="export-style">Export this style</button>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-preview" id="preview"></div>
      <div class="fact-panel">
        <div class="fact-box">
          <h4>The look</h4>
          <p>${esc(s.brief.overview)}</p>
        </div>
        <div class="fact-box">
          <h4>The words — say these</h4>
          <ul>${dimWords}</ul>
        </div>
        <div class="fact-box">
          <h4>Signature traits</h4>
          <div class="aka-list">${s.traits.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        </div>
        <div class="fact-box">
          <h4>Seen at</h4>
          <p>${s.examples.map(esc).join(" · ")}</p>
        </div>
      </div>
    </div>
    <div class="dodont">
      <div class="fact-box do"><h4>Do</h4><ul>${s.brief.dos.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
      <div class="fact-box dont"><h4>Don't</h4><ul>${s.brief.donts.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></div>
    </div>
  </div>`;

  const resolved = resolveSelection(DIMENSIONS, s.dims);
  if (s.extras) resolved.extras.push(s.extras);
  mountPreview(root.querySelector("#preview"), { ...resolved, key: s.id });

  root.querySelector("#use-style").addEventListener("click", () => {
    store.loadStyle(s.id);
    store.toast(`Loaded "${s.name}" into the Builder`);
    location.hash = "#/builder";
  });
  root.querySelector("#export-style").addEventListener("click", () => {
    store.loadStyle(s.id);
    location.hash = "#/export";
  });
}

/* ------------------------------- builder ------------------------------- */

function optVisual(dimKey, opt) {
  const t = opt.tokens || {};
  if (dimKey === "mood")
    return `<span class="swatches"><span class="sw" style="background:${t.bg}"></span><span class="sw" style="background:${t.surface}"></span><span class="sw" style="background:${t.text}"></span></span>`;
  if (dimKey === "accent")
    return `<span class="swatches"><span class="sw" style="background:${t.accent}"></span><span class="sw" style="background:${t.accent2}"></span></span>`;
  if (dimKey === "type")
    return `<span class="type-aa" style="font-family:${t.fontDisplay}">Aa</span>`;
  if (dimKey === "corners")
    return `<span class="sw" style="width:28px;height:20px;background:transparent;border:2px solid var(--muted);border-radius:${t.radius === "999px" ? "999px" : t.radius};margin-top:3px"></span>`;
  return "";
}

export function renderBuilder(root, store) {
  root.innerHTML = `<div class="page">
    ${pageHead(
      "Step 2 — Configure",
      "Build your design language",
      `Start from a preset or from scratch, then tune each dimension. Every option teaches you its <b>design term</b> — hover the preview, click the buttons.`
    )}
    <div class="builder-bar">
      <select id="preset" class="btn" style="appearance:none">
        <option value="">Custom (from scratch)</option>
        ${STYLES.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("")}
      </select>
      <button class="btn" id="randomize">🎲 Randomize</button>
      <button class="btn ghost" id="reset">Reset</button>
      <button class="btn ghost" id="share" title="Copy a link to this exact configuration">🔗 Share</button>
      <span class="spacer"></span>
      <span class="preset-note" id="preset-note"></span>
    </div>
    <div class="builder-grid">
      <div class="controls" id="controls"></div>
      <div class="builder-preview-col">
        <div class="builder-preview-head">
          <span class="lbl">Live preview</span>
          <span class="spacer" style="flex:1"></span>
          <button class="btn small" id="copy-tldr">Copy TL;DR</button>
          <a class="btn small primary" href="#/export">Export →</a>
        </div>
        <div class="builder-preview" id="preview"></div>
      </div>
    </div>
  </div>`;

  const controls = root.querySelector("#controls");
  const previewBox = root.querySelector("#preview");
  const presetSel = root.querySelector("#preset");
  const note = root.querySelector("#preset-note");
  const openDims = new Set(DIMENSIONS.slice(0, 3).map((d) => d.key));

  function syncBar() {
    const st = store.style();
    presetSel.value = st && store.isExactMatch() ? st.id : "";
    note.innerHTML = st
      ? (store.isExactMatch() ? `Preset: <b>${esc(st.name)}</b>` : `Custom, based on <b>${esc(st.name)}</b>`)
      : `Custom mix`;
    store.updatePill();
  }

  function renderControls() {
    controls.innerHTML = "";
    DIMENSIONS.forEach((d) => {
      const det = document.createElement("details");
      det.className = "dim";
      det.open = openDims.has(d.key);
      det.addEventListener("toggle", () => { det.open ? openDims.add(d.key) : openDims.delete(d.key); });
      const cur = d.options.find((o) => o.id === store.state.selection[d.key]);
      det.innerHTML = `<summary>
          <svg class="chev" width="10" height="10" viewBox="0 0 10 10"><path d="M3 1l4 4-4 4" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>
          <span class="dim-label">${esc(d.label)}</span>
          <span class="dim-current">${esc(cur?.label || "")}</span>
        </summary>
        <div class="dim-body">
          <p class="dim-help">${d.help}</p>
          <div class="opts ${d.oneCol || d.options.length > 8 ? "one-col" : ""}"></div>
        </div>`;
      const opts = det.querySelector(".opts");
      for (const o of d.options) {
        const b = document.createElement("button");
        b.className = "opt" + (o.id === store.state.selection[d.key] ? " selected" : "");
        b.innerHTML = `<span class="opt-name">${optVisual(d.key, o)} ${esc(o.label)}</span><span class="opt-desc">${esc(o.desc)}</span>`;
        b.addEventListener("click", () => {
          store.setSelection(d.key, o.id);
          // update in place — do NOT re-render the controls (keeps scroll + open sections)
          opts.querySelectorAll(".opt").forEach((x) => x.classList.toggle("selected", x === b));
          det.querySelector(".dim-current").textContent = o.label;
          syncBar();
          renderPreview();
        });
        opts.appendChild(b);
      }
      controls.appendChild(det);
    });
  }

  function renderPreview() {
    const resolved = store.resolved();
    mountPreview(previewBox, { ...resolved, key: "builder" });
  }

  function renderAll() { syncBar(); renderControls(); renderPreview(); }

  presetSel.addEventListener("change", () => {
    if (presetSel.value) store.loadStyle(presetSel.value);
    renderAll();
  });
  root.querySelector("#randomize").addEventListener("click", () => { store.randomize(); renderAll(); store.toast("Rolled a new random combination"); });
  root.querySelector("#reset").addEventListener("click", () => { store.reset(); renderAll(); });
  root.querySelector("#share").addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#/builder?c=${store.serialize()}`;
    await store.copy(url);
    store.toast("Share link copied — it restores this exact config");
  });
  root.querySelector("#copy-tldr").addEventListener("click", async () => {
    const brief = generateBrief(store.style(), store.resolved(), store.state.selection);
    const tldr = brief.split("## TL;DR — paste this if you only paste one thing")[1]?.split("##")[0].trim() || brief;
    await store.copy(tldr);
    store.toast("TL;DR copied — paste it into your agent");
  });

  renderAll();
}

/* -------------------------------- learn -------------------------------- */

const CATS = ["All", ...new Set(GLOSSARY.map((g) => g.cat))];

export function renderLearn(root, store) {
  root.innerHTML = `<div class="page">
    ${pageHead(
      "Reference — Vocabulary",
      "Say what you mean",
      `${GLOSSARY.length} design terms in plain English, each with a <b>ready-to-paste phrase</b> for your coding agent. Search or filter by category.`
    )}
    <div class="learn-controls">
      <input type="search" id="q" placeholder="Search terms… (e.g. 'shadow', 'kerning', 'bento')">
      <div class="cat-filters" id="cats">
        ${CATS.map((c, i) => `<button data-cat="${esc(c)}" class="${i === 0 ? "active" : ""}">${esc(c)}</button>`).join("")}
      </div>
    </div>
    <div class="vocab-grid" id="vgrid"></div>
  </div>`;

  const grid = root.querySelector("#vgrid");
  const q = root.querySelector("#q");
  let cat = "All";

  function draw() {
    const needle = q.value.trim().toLowerCase();
    const items = GLOSSARY.filter((g) =>
      (cat === "All" || g.cat === cat) &&
      (!needle || g.term.toLowerCase().includes(needle) || g.aka.toLowerCase().includes(needle) || g.def.toLowerCase().includes(needle))
    );
    grid.innerHTML = items.length
      ? items.map((g) => `<div class="vocab-card">
          <div class="v-top"><h3>${esc(g.term)}</h3><span class="v-cat">${esc(g.cat)}</span></div>
          ${g.aka ? `<p class="v-def" style="margin-bottom:6px"><span class="chip mono">${esc(g.aka)}</span></p>` : ""}
          <p class="v-def">${esc(g.def)}</p>
          <div class="v-say">${esc(g.say)}</div>
        </div>`).join("")
      : `<p style="color:var(--muted)">No terms match.</p>`;
  }

  q.addEventListener("input", draw);
  root.querySelector("#cats").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    cat = b.dataset.cat;
    root.querySelectorAll("#cats button").forEach((x) => x.classList.toggle("active", x === b));
    draw();
  });
  draw();
}

/* -------------------------------- export -------------------------------- */

const FORMATS = [
  { id: "brief", name: "Agent brief (Markdown)", desc: "Natural-language design direction. Paste into any coding agent's chat or your AGENTS.md / CLAUDE.md.", file: "design-brief.md", mime: "text/markdown" },
  { id: "css", name: "Stylesheet (CSS)", desc: "Design tokens as CSS custom properties + base styles for buttons, cards and inputs. Drop into your project.", file: "design-system.css", mime: "text/css" },
  { id: "tailwind", name: "Tailwind config (JS)", desc: "A tailwind.config.js theme extension — colors, fonts, radii, shadows, motion. For Tailwind projects.", file: "tailwind.theme.js", mime: "text/javascript" },
  { id: "json", name: "Design tokens (JSON)", desc: "Structured tokens for tools, Tailwind config generation, or precise reference.", file: "design-tokens.json", mime: "application/json" },
];

export function renderExport(root, store, ui) {
  const fmt = ui.exportFmt || "brief";
  const style = store.style();
  const resolved = store.resolved();
  const sel = store.state.selection;

  const content =
    fmt === "brief" ? generateBrief(style, resolved, sel)
    : fmt === "css" ? generateCSS(style, resolved)
    : fmt === "tailwind" ? generateTailwind(style, resolved)
    : generateJSON(style, resolved);
  const activeFmt = FORMATS.find((f) => f.id === fmt);

  root.innerHTML = `<div class="page">
    ${pageHead(
      "Step 3 — Export",
      "Hand it to your agent",
      `Your design language as <b>${esc(activeFmt.name)}</b> — copy it, or download the file. Paste the brief into chat, or drop the file into your repo.`
    )}
    <div class="export-grid">
      <div class="export-side">
        ${FORMATS.map((f) => `<button class="fmt ${f.id === fmt ? "active" : ""}" data-fmt="${f.id}"><b>${esc(f.name)}</b><span>${esc(f.desc)}</span></button>`).join("")}
      </div>
      <div class="export-main">
        <div class="export-actions">
          <button class="btn primary" id="copy">Copy to clipboard</button>
          <button class="btn" id="download">Download ${esc(activeFmt.file)}</button>
          <span class="spacer"></span>
          <a class="btn ghost small" href="#/builder">← tweak in Builder</a>
        </div>
        <pre class="export-out" id="out">${esc(content)}</pre>
      </div>
    </div>
  </div>`;

  root.querySelector(".export-side").addEventListener("click", (e) => {
    const b = e.target.closest(".fmt");
    if (!b) return;
    ui.exportFmt = b.dataset.fmt;
    renderExport(root, store, ui);
  });
  root.querySelector("#copy").addEventListener("click", async () => {
    await store.copy(content);
    store.toast(`${activeFmt.name} copied`);
  });
  root.querySelector("#download").addEventListener("click", () => {
    const blob = new Blob([content], { type: activeFmt.mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = activeFmt.file;
    a.click();
    URL.revokeObjectURL(a.href);
    store.toast(`Downloaded ${activeFmt.file}`);
  });
}
