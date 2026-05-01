# LitScan

React Scan-inspired rerender visualizer for [Lit](https://lit.dev) web components.

Tracks component rerenders in real time — flashes a colored overlay on each rerender and shows a floating panel with cumulative counts and a live FPS meter.

## Install

```bash
npm install litscan
```

## Usage

Import `litscan` as the **first import** in your app's entry point:

```ts
import 'litscan';
import './my-element.js';
// rest of your app
```

That's it. No config, no wrappers, no changes to your components.

> **Why first?** LitScan hooks into `customElements.define`, which is called synchronously when element modules are evaluated. If other element modules load before `litscan`, those elements won't be tracked.

## Features

- **Rerender overlay** — colored flash on each component rerender
- **Color coding** — green (1–2) → amber (3–10) → red (11+) by render count
- **Floating panel** — live leaderboard of components sorted by render count, draggable
- **FPS counter** — live frames-per-second in the panel header
- **Pause / resume** — freeze tracking without affecting the app
- **Report** — plain-text session summary with anomaly detection
- **Zero dependencies** — no Lit import; works regardless of how your app bundles Lit

## Getting a Report

Click **"Copy report"** in the panel footer, or call from the browser console:

```js
window.litscan.report()
```

Example output:

```
LitScan Report — 14.2s session
================================
Total renders: 134 across 3 components

ANOMALIES
⚠  rapid-counter          ×  87 — render count unusually high

ALL COMPONENTS
rapid-counter              ×  87  ████████████████  ⚠
nav-bar                    ×  45  ████████
user-card                  ×   2  ▌
```

Components with more than 50 renders are flagged as anomalies.

## Script Tag

Add LitScan before your app bundle — no import needed in your code:

```html
<script src="https://unpkg.com/litscan/dist/litscan.iife.js"></script>
<script type="module" src="/src/main.js"></script>
```

## API

| | |
|---|---|
| `window.litscan.report()` | Generate and log the plain-text report, returns it as a string |
| `destroy()` (named export) | Remove the overlay and panel from the DOM |

## LLM Agents

See [`llms.md`](./llms.md) for a skill guide covering installation, the import ordering requirement, report retrieval, and a step-by-step agent workflow for analyzing rerender behavior.

## Repo Structure

```
litscan/
├── packages/
│   ├── litscan/        # the devtool package
│   │   └── src/
│   │       ├── scanner.ts   # customElements.define hook + render tracking
│   │       ├── panel.ts     # floating UI panel
│   │       ├── report.ts    # plain-text report generator
│   │       └── index.ts     # entry point, window.litscan global
│   └── app/            # demo / landing page
└── llms.md             # LLM skill guide
```
