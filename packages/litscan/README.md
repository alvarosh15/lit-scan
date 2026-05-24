# LitScan

Rerender visualizer for Lit web components, inspired by [React Scan](https://react-scan.com/).

LitScan highlights component updates in real time, keeps a floating render counter, and exposes a plain-text report for browser automation or LLM agents.

## Install

```bash
npm install lit-scan
```

## Usage

Import `lit-scan` before your Lit components are defined:

```ts
import 'lit-scan';
import './my-element.js';
```

LitScan hooks into `customElements.define`, so import order matters. If a component is defined before LitScan loads, it will not be tracked.

## Script Tag

```html
<script src="https://unpkg.com/lit-scan/dist/lit-scan.iife.js"></script>
```

Load this before your app bundle.

## API

```js
window.litScan.report()
```

Generates and logs a plain-text render report.

```js
window.litScan.destroy()
```

Removes LitScan UI and stops tracking.

## What It Shows

- Flash overlay on rerender
- Component tag name and render count
- Floating panel sorted by render count
- FPS counter
- Copyable render report
