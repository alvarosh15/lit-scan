// No Lit import — we detect Lit elements by duck-typing so this module has
// zero external dependencies and works correctly as a script-tag IIFE
// regardless of how the app bundles its own copy of Lit.

type PropertyValues = Map<PropertyKey, unknown>;
type LitProto = {
  update: (changed: PropertyValues) => void;
  requestUpdate: () => void;
  __litScan?: boolean;
};

export interface TagStats {
  renders: number;
  instances: number;
}

const COLORS = {
  low:  '#00c896', // ≤2 renders
  mid:  '#f59e0b', // 3–10 renders
  high: '#ef4444', // 11+ renders
};

function colorFor(count: number): string {
  if (count <= 2)  return COLORS.low;
  if (count <= 10) return COLORS.mid;
  return COLORS.high;
}

function toRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const counts = new WeakMap<Element, number>(); // per-instance render count
const stats  = new Map<string, TagStats>();    // per-tag aggregate (iterable, for panel)
let overlayRoot: HTMLDivElement | null = null;
let overlayStyle: HTMLStyleElement | null = null;
let active         = false;
let paused         = false;
let sessionStart   = 0;
let renderListener: (() => void) | null = null;
let originalDefine: CustomElementRegistry['define'] | null = null;

// ── public API ────────────────────────────────────────────────────────────

export function getStats(): ReadonlyMap<string, TagStats> { return stats; }
export function getSessionStart(): number { return sessionStart; }
export function setPaused(value: boolean): void { paused = value; }
export function isPaused(): boolean { return paused; }
export function onRender(cb: () => void): void { renderListener = cb; }
export function clearRenderListener(): void { renderListener = null; }

// ── overlay ───────────────────────────────────────────────────────────────

function getRoot(): HTMLDivElement {
  if (!overlayRoot) {
    overlayStyle = document.createElement('style');
    overlayStyle.textContent = `@keyframes ls-out{from{opacity:1}to{opacity:0}}`;
    document.head.appendChild(overlayStyle);

    overlayRoot = document.createElement('div');
    overlayRoot.id = 'lit-scan-root';
    Object.assign(overlayRoot.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '2147483647',
      overflow: 'hidden',
    });
    document.body.appendChild(overlayRoot);
  }
  return overlayRoot;
}

function flash(rect: DOMRect, count: number): void {
  const color = colorFor(count);
  const dur   = 600;
  const root  = getRoot();

  const box = document.createElement('div');
  box.style.cssText = `
    position:fixed;
    top:${rect.top}px;left:${rect.left}px;
    width:${rect.width}px;height:${rect.height}px;
    border:2px solid ${color};
    background:${toRgba(color, 0.15)};
    box-sizing:border-box;
    animation:ls-out ${dur}ms ease-out forwards;
  `;
  root.appendChild(box);

  const badge = document.createElement('span');
  badge.style.cssText = `
    position:fixed;
    top:${rect.top + 2}px;left:${rect.left + 2}px;
    font:600 10px/1 ui-monospace,monospace;
    padding:2px 4px;border-radius:3px;
    background:${color};color:#000;
    animation:ls-out ${dur}ms ease-out forwards;
  `;
  badge.textContent = `×${count}`;
  root.appendChild(badge);

  setTimeout(() => { box.remove(); badge.remove(); }, dur + 50);
}

// ── detection + patching ──────────────────────────────────────────────────

function isLitProto(proto: object): proto is LitProto {
  return (
    typeof (proto as LitProto).update === 'function' &&
    typeof (proto as LitProto).requestUpdate === 'function'
  );
}

function patchProto(proto: LitProto): void {
  if (proto.__litScan) return;
  proto.__litScan = true;

  const orig = proto.update;

  proto.update = function (this: Element, changed: PropertyValues) {
    orig.call(this, changed);

    if (!active) return;
    if (paused) return;

    const prevCount = counts.get(this) ?? 0;
    const count     = prevCount + 1;
    counts.set(this, count);

    const tag = this.tagName.toLowerCase();
    const s   = stats.get(tag) ?? { renders: 0, instances: 0 };
    stats.set(tag, {
      renders:   s.renders + 1,
      instances: prevCount === 0 ? s.instances + 1 : s.instances,
    });

    renderListener?.();

    const el = this;
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) flash(rect, count);
    });
  };
}

// ── init / destroy ────────────────────────────────────────────────────────

export function init(): void {
  if (active) return;
  active = true;
  sessionStart = Date.now();

  originalDefine ??= customElements.define;
  const origDefine = originalDefine.bind(customElements);

  customElements.define = function (
    name: string,
    ctor: CustomElementConstructor,
    opts?: ElementDefinitionOptions,
  ): void {
    if (isLitProto(ctor.prototype)) patchProto(ctor.prototype);
    return origDefine(name, ctor, opts);
  };

  console.log('%c[LitScan] active', 'color:#00c896;font-weight:bold;font-family:monospace');
}

export function destroy(): void {
  active = false;
  paused = false;
  renderListener = null;

  if (originalDefine) {
    customElements.define = originalDefine;
    originalDefine = null;
  }

  overlayRoot?.remove();
  overlayStyle?.remove();
  overlayRoot = null;
  overlayStyle = null;
}
