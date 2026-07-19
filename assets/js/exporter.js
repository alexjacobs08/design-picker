/* Export generators: markdown agent brief, CSS stylesheet, JSON tokens. */

import { firstFont } from "./data/tokens.js";

const title = (style) => (style ? style.name : "Custom Design");

function selectionMatchesStyle(style, selection) {
  if (!style) return false;
  return Object.entries(style.dims).every(([k, v]) => selection[k] === v);
}

/* ------------------------------ markdown brief ------------------------------ */

export function generateBrief(style, resolved, selection) {
  const { tokens, chosen } = resolved;
  const briefOf = (key) => chosen.find((c) => c.dim.key === key)?.opt.brief || "";
  const customized = style && !selectionMatchesStyle(style, selection);
  const L = [];

  L.push(`# Design Brief — ${title(style)}`);
  L.push("");
  L.push(`> Generated with DesignPicker. Paste this whole document (or just the TL;DR) into your coding agent as design direction.`);
  L.push("");
  if (style) {
    L.push(style.brief.overview);
    if (customized) L.push(`\n*Note: based on **${style.name}**, but some choices below were customized — the specific instructions override the style description.*`);
  } else {
    L.push("A custom design language. Follow the specific instructions below — they are the source of truth.");
  }
  L.push("");

  // TL;DR
  L.push("## TL;DR — paste this if you only paste one thing");
  L.push("");
  const tldr = [
    style ? `Design in a **${style.name}** style${customized ? " (customized)" : ""}.` : "Design a custom-styled web UI.",
    briefOf("mood"), briefOf("type"), briefOf("corners"), briefOf("borders"), briefOf("depth"),
    briefOf("buttons"), briefOf("density"), briefOf("motion"),
  ].filter(Boolean).join(" ");
  L.push(tldr);
  L.push("");

  L.push("## Color");
  L.push("");
  L.push(`- ${briefOf("mood")}`);
  L.push(`- ${briefOf("accent")}`);
  L.push("");
  L.push("| Role | Value |");
  L.push("|---|---|");
  L.push(`| Background | \`${tokens.bg}\` |`);
  L.push(`| Surface (cards) | \`${tokens.surface}\` |`);
  L.push(`| Surface 2 (chips) | \`${tokens.surface2}\` |`);
  L.push(`| Text | \`${tokens.text}\` |`);
  L.push(`| Secondary text | \`${tokens.muted}\` |`);
  L.push(`| Accent | \`${tokens.accent}\` |`);
  L.push(`| Accent 2 (gradient partner) | \`${tokens.accent2}\` |`);
  L.push(`| Text on accent | \`${tokens.onAccent}\` |`);
  L.push("");

  L.push("## Typography");
  L.push("");
  L.push(`- ${briefOf("type")}`);
  L.push(`- Display font: **${firstFont(tokens.fontDisplay)}** — weight ${tokens.hWeight}, letter-spacing ${tokens.hTracking}${tokens.hStyle !== "normal" ? `, ${tokens.hStyle}` : ""}${tokens.hTransform !== "none" ? `, ${tokens.hTransform}` : ""}`);
  L.push(`- Body font: **${firstFont(tokens.fontBody)}** — ${tokens.bodySize} base, line-height ${tokens.leading}`);
  L.push("");

  L.push("## Shape — corners & borders");
  L.push("");
  L.push(`- ${briefOf("corners")}`);
  L.push(`- ${briefOf("borders")}`);
  L.push("");

  L.push("## Depth");
  L.push("");
  L.push(`- ${briefOf("depth")}`);
  if (tokens.shadow !== "none") L.push(`- Card shadow: \`${tokens.shadow}\``);
  L.push(`- ${briefOf("surface")}`);
  L.push("");

  L.push("## Components");
  L.push("");
  L.push(`- ${briefOf("buttons")}`);
  L.push(`- ${briefOf("hover")}`);
  L.push(`- Inputs: same corner radius and border treatment as buttons; focus state = accent border + soft accent ring.`);
  L.push("");

  L.push("## Layout & spacing");
  L.push("");
  L.push(`- ${briefOf("density")}`);
  L.push("- Constrain content to a max-width container (~1120px) centered on the page; align everything to a consistent grid.");
  L.push("");

  L.push("## Motion");
  L.push("");
  L.push(`- ${briefOf("motion")}`);
  L.push("");

  L.push("## Background & decoration");
  L.push("");
  L.push(`- ${briefOf("decor")}`);
  L.push("");

  if (style && selectionMatchesStyle(style, selection)) {
    L.push("## Do");
    L.push("");
    for (const d of style.brief.dos) L.push(`- ${d}`);
    L.push("");
    L.push("## Don't");
    L.push("");
    for (const d of style.brief.donts) L.push(`- ${d}`);
    L.push("");
  }

  L.push("## Raw design tokens");
  L.push("");
  L.push("```json");
  L.push(JSON.stringify(generateTokensJSON(style, resolved), null, 2));
  L.push("```");
  L.push("");
  return L.join("\n");
}

/* --------------------------------- CSS --------------------------------- */

function fontImportUrl(tokens, extrasText) {
  const fams = new Map();
  const add = (name, weights) => { if (!fams.has(name)) fams.set(name, weights); };
  add(firstFont(tokens.fontDisplay), "400;600;700");
  add(firstFont(tokens.fontBody), "400;500;700");
  for (const f of ["IBM Plex Mono", "Caveat", "VT323", "Press Start 2P"]) {
    if (extrasText.includes(f)) add(f, "400;600");
  }
  const q = [...fams.entries()]
    .filter(([n]) => !/^(sans-serif|serif|monospace|cursive|system-ui)$/i.test(n))
    .map(([n, w]) => `family=${n.replace(/ /g, "+")}:wght@${w}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

function btnVariantCss(t) {
  switch (t.btn) {
    case "outline":
      return `.btn-primary {\n  background: transparent;\n  color: var(--accent);\n  border-color: var(--accent);\n}\n.btn-primary:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); }`;
    case "soft":
      return `.btn-primary {\n  background: color-mix(in srgb, var(--accent) 15%, transparent);\n  color: var(--accent);\n  border-color: transparent;\n}`;
    case "gradient":
      return `.btn-primary {\n  background: linear-gradient(120deg, var(--accent), var(--accent2));\n  color: var(--on-accent);\n  border-color: transparent;\n}`;
    case "hard":
      return `.btn-primary {\n  background: var(--accent);\n  color: var(--on-accent);\n  border: var(--border-width) var(--border-style) var(--border-color-strong);\n  box-shadow: 4px 4px 0 var(--border-color-strong);\n}\n.btn-primary:active { transform: translate(4px, 4px); box-shadow: 0 0 0 var(--border-color-strong); }`;
    case "glossy":
      return `.btn-primary {\n  background: linear-gradient(180deg,\n    color-mix(in srgb, var(--accent) 62%, #fff),\n    var(--accent) 48%,\n    color-mix(in srgb, var(--accent) 82%, #000));\n  color: var(--on-accent);\n  border: 1px solid color-mix(in srgb, var(--accent) 55%, #000);\n  box-shadow: inset 0 1px 0 rgba(255,255,255,.55), 0 2px 4px rgba(0,0,0,.25);\n  text-shadow: 0 1px 1px rgba(0,0,0,.3);\n}`;
    default:
      return `.btn-primary {\n  background: var(--accent);\n  color: var(--on-accent);\n  border-color: transparent;\n}`;
  }
}

function hoverCss(t) {
  switch (t.hover) {
    case "lift": return `.btn:hover, .card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }`;
    case "press": return `.btn-primary:hover { transform: translate(2px, 2px); }`;
    case "glow": return `.btn-primary:hover { box-shadow: 0 0 22px color-mix(in srgb, var(--accent) 60%, transparent); }`;
    case "darken": return `.btn-primary:hover { filter: brightness(1.1); }`;
    default: return `/* no hover feedback */`;
  }
}

export function generateCSS(style, resolved) {
  const { tokens: t, extras } = resolved;
  const extrasText = extras.join("\n");
  // translate preview-scoped extras into generic component CSS
  const extraCss = extrasText
    .replaceAll("& .pv-deco", ".bg-decor")
    .replaceAll("& .pv-", ".")
    .replaceAll("&", "body")
    .replace(/\.pv-([a-z-]+)/g, ".$1")
    .replace(/\.btn-sm/g, "")
    .trim();

  return `/* ============================================================
   ${title(style)} — design tokens + base stylesheet
   Generated with DesignPicker (design-picker)
   ============================================================ */

/* 1. Fonts */
@import url('${fontImportUrl(t, extrasText)}');

/* 2. Design tokens */
:root {
  /* color */
  --bg: ${t.bg};
  --surface: ${t.surface};
  --surface-2: ${t.surface2};
  --text: ${t.text};
  --text-muted: ${t.muted};
  --accent: ${t.accent};
  --accent-2: ${t.accent2};
  --on-accent: ${t.onAccent};

  /* shape */
  --radius: ${t.radius};
  --radius-sm: ${t.radiusSm};
  --border-width: ${t.bw};
  --border-style: ${t.bs};
  --border-color: ${t.borderC};
  --border-color-strong: ${t.borderC === "var(--pv-text)" ? "var(--text)" : t.borderC};

  /* depth */
  --shadow: ${t.shadow};
  --shadow-hover: ${t.shadowHover};
  --card-blur: ${t.cardBlur};

  /* typography */
  --font-display: ${t.fontDisplay};
  --font-body: ${t.fontBody};
  --heading-weight: ${t.hWeight};
  --heading-tracking: ${t.hTracking};
  --heading-style: ${t.hStyle};
  --heading-transform: ${t.hTransform};
  --body-size: ${t.bodySize};
  --line-height: ${t.leading};

  /* motion */
  --duration: ${t.dur};
  --easing: ${t.ease};

  /* spacing density multiplier — scale all padding/gaps by this */
  --density: ${t.pad};
}

/* 3. Base */
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: var(--body-size);
  line-height: var(--line-height);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, .display {
  font-family: var(--font-display);
  font-weight: var(--heading-weight);
  letter-spacing: var(--heading-tracking);
  font-style: var(--heading-style);
  text-transform: var(--heading-transform);
  line-height: 1.1;
  margin: 0 0 0.5em;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* 4. Components */

.btn {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9em;
  padding: 0.7em 1.4em;
  border-radius: var(--radius-sm);
  border: var(--border-width) var(--border-style) transparent;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  transition: all var(--duration) var(--easing);
}

${btnVariantCss(t)}

.btn-ghost {
  background: transparent;
  border-color: var(--border-color);
  color: var(--text);
}

${hoverCss(t)}

.card {
  background: var(--surface);
  border: var(--border-width) var(--border-style) var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: var(--card-blur);
  -webkit-backdrop-filter: var(--card-blur);
  padding: calc(var(--density) * 20px);
  transition: all var(--duration) var(--easing);
}

.input {
  font-family: var(--font-body);
  font-size: 0.9em;
  background: var(--surface);
  color: var(--text);
  border: var(--border-width) var(--border-style) var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.7em 1em;
  outline: none;
  transition: all var(--duration) var(--easing);
}
.input::placeholder { color: var(--text-muted); }
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
}

.eyebrow {
  font-size: 0.72em;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

/* 5. Background decoration (optional)
   Add an empty fixed element behind your app:
   <div class="bg-decor" aria-hidden="true"></div>
   .bg-decor { position: fixed; inset: 0; z-index: -1; pointer-events: none; } */

/* 6. Style-specific rules translated from the picker */
${extraCss || "/* none */"}
`;
}

/* --------------------------------- JSON --------------------------------- */

export function generateTokensJSON(style, resolved) {
  const { tokens: t } = resolved;
  return {
    name: title(style),
    color: {
      background: t.bg, surface: t.surface, surfaceAlt: t.surface2,
      text: t.text, textMuted: t.muted,
      accent: t.accent, accentAlt: t.accent2, onAccent: t.onAccent,
      border: t.borderC,
    },
    typography: {
      displayFont: firstFont(t.fontDisplay), bodyFont: firstFont(t.fontBody),
      headingWeight: Number(t.hWeight) || t.hWeight, headingTracking: t.hTracking,
      headingStyle: t.hStyle, headingTransform: t.hTransform,
      bodySize: t.bodySize, lineHeight: Number(t.leading),
    },
    shape: {
      radius: t.radius, radiusSmall: t.radiusSm,
      borderWidth: t.bw, borderStyle: t.bs,
    },
    depth: { shadow: t.shadow, shadowHover: t.shadowHover, backdropBlur: t.cardBlur },
    motion: { duration: t.dur, easing: t.ease },
    spacing: { density: Number(t.pad) },
    components: { button: t.btn, hoverFeedback: t.hover },
  };
}

export function generateJSON(style, resolved) {
  return JSON.stringify(generateTokensJSON(style, resolved), null, 2);
}
