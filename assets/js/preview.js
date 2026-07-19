/* Renders the shared demo page, themed by a resolved token set.
   extras CSS uses '&' as placeholder for the scoped root selector. */

import { tokensToCssVars } from "./data/tokens.js";

const styleTags = new Map(); // key -> <style> element

function ensureStyleTag(key) {
  if (!styleTags.has(key)) {
    const el = document.createElement("style");
    el.dataset.pvExtras = key;
    document.head.appendChild(el);
    styleTags.set(key, el);
  }
  return styleTags.get(key);
}

export function registerExtras(key, extrasList) {
  const scope = `.pv[data-pv="${key}"]`;
  const css = (extrasList || []).map((x) => x.replaceAll("&", scope)).join("\n");
  ensureStyleTag(key).textContent = css;
}

export const PREVIEW_BODY = `
  <div class="pv-deco" aria-hidden="true"></div>
  <div class="pv-inner">
    <nav class="pv-nav">
      <span class="pv-logo">Northwind</span>
      <span class="pv-links"><a href="#">Product</a><a href="#">Pricing</a><a href="#">Docs</a><a href="#">Blog</a></span>
      <button class="pv-btn pv-btn-primary pv-btn-sm" type="button">Get started</button>
    </nav>
    <section class="pv-hero">
      <span class="pv-eyebrow">New · Version 2.0</span>
      <h1>Ship products that <em>feel</em> right</h1>
      <p class="pv-sub">Northwind is the design-aware toolkit for modern teams. Build interfaces people love without fighting your tools.</p>
      <div class="pv-cta">
        <button class="pv-btn pv-btn-primary" type="button">Start free trial</button>
        <button class="pv-btn pv-btn-ghost" type="button">Watch demo</button>
      </div>
    </section>
    <section class="pv-cards">
      <div class="pv-card"><span class="pv-ic">➤</span><h3>Fast by default</h3><p>Optimized rendering keeps every interaction snappy, no configuration required.</p><a class="pv-link" href="#">Learn more →</a></div>
      <div class="pv-card"><span class="pv-ic">◆</span><h3>Design tokens</h3><p>One source of truth for color, type and spacing across every platform you ship to.</p><a class="pv-link" href="#">Learn more →</a></div>
      <div class="pv-card"><span class="pv-ic">✦</span><h3>Delight built in</h3><p>Thoughtful micro-interactions make the whole product feel considered and alive.</p><a class="pv-link" href="#">Learn more →</a></div>
    </section>
    <section class="pv-quote">
      <span class="pv-avatar">AR</span>
      <div>
        <blockquote>"We redesigned in a week and conversion jumped 34%. It just feels right."</blockquote>
        <cite>Amara Reyes — Head of Product, Loopwork</cite>
      </div>
    </section>
    <form class="pv-form" onsubmit="return false">
      <input class="pv-input" placeholder="you@company.com" type="email">
      <button class="pv-btn pv-btn-primary" type="submit">Subscribe</button>
    </form>
    <footer class="pv-foot"><span>© 2026 Northwind</span><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a></footer>
  </div>`;

export function mountPreview(container, { tokens, extras, key }) {
  const root = document.createElement("div");
  root.className = "pv";
  root.dataset.pv = key;
  root.dataset.btn = tokens.btn || "filled";
  root.dataset.hover = tokens.hover || "lift";
  const vars = tokensToCssVars(tokens);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  root.innerHTML = PREVIEW_BODY;
  container.replaceChildren(root);
  registerExtras(key, extras);
  return root;
}
