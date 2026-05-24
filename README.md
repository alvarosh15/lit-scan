# LitScan

Rerender visualizer for [Lit](https://lit.dev) web components, inspired by [React Scan](https://react-scan.com/).

Tracks component rerenders in real time — flashes a colored overlay with the component tag and render count, and shows a floating panel with cumulative counts and a live FPS meter.

## Install

```bash
npm install lit-scan
```

## Usage

Import `lit-scan` as the **first import** in your app's entry point:

```ts
import 'lit-scan';
import './my-element.js';
// rest of your app
```

That's it. No config, no wrappers, no changes to your components.

> **Why first?** LitScan hooks into `customElements.define`, which is called synchronously when element modules are evaluated. If other element modules load before `lit-scan`, those elements won't be tracked.

## Features

- **Rerender overlay** — colored flash with component tag and render count
- **Color coding** — green (1–2) → amber (3–10) → red (11+) by render count
- **Floating panel** — live leaderboard of components sorted by render count, draggable
- **FPS counter** — live frames-per-second in the panel header
- **Pause / resume** — freeze tracking without affecting the app
- **Report** — plain-text session summary with anomaly detection
- **Zero dependencies** — no Lit import; works regardless of how your app bundles Lit

## Getting a Report

Click **"Copy report"** in the panel footer, or call from the browser console:

```js
window.litScan.report()
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
<script src="https://unpkg.com/lit-scan/dist/lit-scan.iife.js"></script>
```

Load this before your app's script so LitScan can hook into `customElements.define` before components are registered.

## API

| | |
|---|---|
| `window.litScan.report()` | Generate and log the plain-text report, returns it as a string |
| `window.litScan.destroy()` | Remove the overlay and panel, restore `customElements.define`, and stop tracking |

## LLM Agents

See [`skill.md`](./skill.md) for a skill guide covering installation, the import ordering requirement, report retrieval, and a step-by-step agent workflow for analyzing rerender behavior.

## Repo Structure

```
litscan/
├── packages/
│   ├── litscan/        # the devtool package
│   │   └── src/
│   │       ├── scanner.ts   # customElements.define hook + render tracking
│   │       ├── panel.ts     # floating UI panel
│   │       ├── report.ts    # plain-text report generator
│   │       └── index.ts     # entry point, window.litScan global
│   └── app/            # demo / landing page
└── skill.md             # LLM skill guide
```
