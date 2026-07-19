# DesignPicker

**A visual vocabulary + style picker for vibe coding.** Explore web design styles, learn the exact words for what you're looking at, configure your own combination, and export an agent-ready design brief, stylesheet, or token JSON.

Live site: **https://alexjacobs08.github.io/design-picker/**

## Why

LLM coding agents default to generic designs unless you can describe what you want — and most of us don't know the design words. DesignPicker fixes that two ways:

1. **Learn the vocabulary** — 30 archetypal styles in 6 families (neubrutalism, glassmorphism, Swiss, luxury, terminal, Frutiger Aero…) rendered live, each annotated with the terms agents understand, plus an 85-term searchable design glossary with paste-ready phrases.
2. **Configure & export** — mix and match across 12 dimensions (color mood, accent, typography, corners, borders, shadows, surfaces, buttons, hover, motion, density, background decor), share your exact config as a URL, then export:
   - **Markdown agent brief** (natural-language direction, paste into chat or `AGENTS.md`/`CLAUDE.md`)
   - **CSS stylesheet** (tokens + base component styles)
   - **Tailwind config** theme extension
   - **Design tokens JSON**

## Stack

Zero-build vanilla HTML/CSS/JS (ES modules), no dependencies. Static hostable anywhere.

```
index.html
assets/
  css/app.css          tool UI + token-driven preview engine
  js/
    data/tokens.js     token defaults + resolution
    data/options.js    the 12 configurable dimensions
    data/styles.js     the 24 style presets
    data/glossary.js   design vocabulary
    preview.js         live preview renderer
    exporter.js        markdown / CSS / JSON generators
    views.js           gallery, detail, builder, learn, export views
    app.js             hash router + state store
```

## Develop

Serve the folder with any static server (ES modules need http):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Settings → Pages → deploy from branch `main`, root `/`. Done — it's a plain static site.
