/* Shared token defaults + resolution helpers.
   A "selection" is { [dimensionKey]: optionId }.
   resolveTokens() folds the selected options (in canonical dimension order)
   into one flat token object that drives both the live preview and exports. */

export const DEFAULTS = {
  // color
  bg: "#FFFFFF", surface: "#F6F7F9", surface2: "#ECEEF2",
  text: "#101318", muted: "#5D6673",
  accent: "#4F46E5", accent2: "#4F46E5", onAccent: "#FFFFFF",
  // borders / shape
  borderC: "rgba(16,19,24,0.12)", bw: "1px", bs: "solid",
  radius: "12px", radiusSm: "8px",
  // depth
  shadow: "none", shadowHover: "none", cardBlur: "none",
  // typography
  fontDisplay: '"Inter", sans-serif', fontBody: '"Inter", sans-serif',
  hWeight: "700", hTracking: "-0.02em", hStyle: "normal", hTransform: "none",
  bodySize: "15px", leading: "1.6",
  // motion
  dur: "160ms", ease: "ease-out",
  // density
  pad: "1",
  // behavior attrs (mapped to data-attrs, not CSS vars)
  btn: "filled", hover: "lift",
  // links (defaults to accent when unset)
  linkC: "",
};

/* token keys that become CSS custom properties (camelCase -> --pv-kebab) */
export const CSS_VAR_KEYS = [
  "bg","surface","surface2","text","muted","accent","accent2","onAccent",
  "borderC","bw","bs","radius","radiusSm","shadow","shadowHover","cardBlur",
  "fontDisplay","fontBody","hWeight","hTracking","hStyle","hTransform",
  "bodySize","leading","dur","ease","pad","linkC",
];

const kebab = (s) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

export function tokensToCssVars(tokens) {
  const out = {};
  for (const k of CSS_VAR_KEYS) {
    let v = tokens[k];
    if (v === undefined || v === null || v === "") continue;
    out["--pv-" + kebab(k)] = String(v);
  }
  return out;
}

/* Resolve a selection against the dimension list into tokens + extras css */
export function resolveSelection(dimensions, selection) {
  const tokens = { ...DEFAULTS };
  const extras = [];
  const chosen = []; // [{dim, opt}]
  for (const dim of dimensions) {
    const id = selection[dim.key] ?? dim.options[0].id;
    const opt = dim.options.find((o) => o.id === id) ?? dim.options[0];
    if (opt.tokens) Object.assign(tokens, opt.tokens);
    if (opt.extras) extras.push(opt.extras);
    chosen.push({ dim, opt });
  }
  return { tokens, extras, chosen };
}

/* First family name from a font stack: '"Space Grotesk", sans-serif' -> 'Space Grotesk' */
export function firstFont(stack) {
  const m = String(stack).match(/"([^"]+)"|'([^']+)'|([^,]+)/);
  return (m && (m[1] || m[2] || m[3]) || "Inter").trim();
}
