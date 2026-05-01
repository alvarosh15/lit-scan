# LitScan — LLM Skill Guide

LitScan is a developer tool for Lit web components, inspired by React Scan. It tracks component rerenders in real time, flashes a colored overlay on each rerender, and provides a floating panel with render counts and an FPS meter.

## Installation

```bash
npm install litscan
```

## Setup

Import `litscan` as the **first import** in your app's entry point. It auto-initializes on import — no function call needed.

```ts
// src/main.ts (or index.ts)
import 'litscan';
import './my-element.js';
// rest of your app
```

> **Why first?** LitScan intercepts `customElements.define`, which is called synchronously when element modules are evaluated. If other element modules are imported before `litscan`, those elements won't be tracked.

## What You See

- **Flash overlay** — a colored border flashes over each element when it rerenders
- **Badge** — shows the cumulative render count (`×N`) in the corner of the flash
- **Floating panel** — bottom-right corner, lists all components with their render counts
- **FPS counter** — live frames-per-second display in the panel header

### Color coding (flash + panel dots)

| Color  | Renders | Meaning        |
|--------|---------|----------------|
| Green  | 1–2     | Normal         |
| Amber  | 3–10    | Moderate       |
| Red    | 11+     | Frequent       |

## Getting a Report

### Option 1 — Panel button
Click **"Copy report"** in the panel footer. This:
1. Logs the report to the browser console
2. Opens a modal overlay on the page showing the report
3. Attempts to copy to clipboard (may be unavailable over SSH or in some automation contexts)

### Option 2 — Browser console / JS execution
```js
window.litscan.report()
```
Returns the report as a string and logs it to the console. This is the most reliable method for LLM agents using browser automation (Playwright, computer use, etc.).

### Report format

```
LitScan Report — 14.2s session
================================
Total renders: 134 across 3 components

ANOMALIES
⚠  rapid-counter          ×  87 — render count unusually high

ALL COMPONENTS
rapid-counter              ×  87  ████████████████  ⚠
nav-bar                    ×  45  ████████████
user-card                  ×   2  ▌
```

A component is flagged as an anomaly when it exceeds **50 total renders** in a session.

## Pause / Resume

Click **⏸** in the panel header to pause tracking. While paused:
- Components still render normally (LitScan never interferes with rendering)
- No new counts are recorded
- No flash overlays appear
- The status dot dims to grey

Click **▶** to resume.

## Script Tag (zero-config)

Add LitScan before your app bundle in `index.html`. The script must appear before the app's `<script type="module">`.

```html
<script src="https://unpkg.com/litscan/dist/litscan.iife.js"></script>
<script type="module" src="/src/main.js"></script>
```

When loaded this way, no import or function call is needed in the app code.

## API Reference

### `window.litscan`

| Method     | Description |
|------------|-------------|
| `report()` | Generates the plain-text report, logs it to the console, and returns it as a string |

### Module exports

| Export      | Description |
|-------------|-------------|
| `destroy()` | Removes the overlay root and panel from the DOM |

## How LitScan Works (for context)

LitScan patches `customElements.define` to intercept every Lit element registration. It detects Lit elements by duck-typing — any class whose prototype has both `update` and `requestUpdate` methods is treated as a Lit element. On detection, it wraps the `update` method to track render counts and trigger the flash overlay after each render.

Because it hooks `customElements.define` (a true browser global singleton) rather than importing and patching Lit directly, it works regardless of how the app bundles its own copy of Lit.

## LLM Agent Workflow

To analyze rerender behavior in an app:

1. Ensure LitScan is installed and imported as the first import in the entry point (or added as a script tag)
2. Load the page in a browser
3. Interact with the UI — click buttons, navigate, trigger the behavior under test
4. Run `window.litscan.report()` via JS execution, or click "Copy report" in the panel
5. Read the output from the console or the modal overlay
6. Components listed under **ANOMALIES** (>50 renders) are worth investigating — they may indicate missing memoization, reactive property loops, or a parent causing unnecessary child rerenders
