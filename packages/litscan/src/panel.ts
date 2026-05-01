import { getStats, isPaused, setPaused, onRender } from './scanner.js';
import { generateReport } from './report.js';

const COLORS = { low: '#00c896', mid: '#f59e0b', high: '#ef4444' };

function colorFor(renders: number): string {
  if (renders <= 2)  return COLORS.low;
  if (renders <= 10) return COLORS.mid;
  return COLORS.high;
}

function fpsColor(fps: number): string {
  if (fps >= 55) return COLORS.low;
  if (fps >= 30) return COLORS.mid;
  return COLORS.high;
}

// ── state ─────────────────────────────────────────────────────────────────

let listEl: HTMLElement | null         = null;
let statusDot: HTMLElement | null      = null;
let pauseBtn: HTMLButtonElement | null = null;
let fpsEl: HTMLElement | null          = null;
let rafId: number | null               = null;

// ── fps loop ──────────────────────────────────────────────────────────────

function startFpsLoop(): void {
  let frames   = 0;
  let lastTime = performance.now();

  function tick(): void {
    frames++;
    const now     = performance.now();
    const elapsed = now - lastTime;

    if (elapsed >= 1000) {
      const fps = Math.round(frames * 1000 / elapsed);
      if (fpsEl) {
        fpsEl.textContent  = `${fps} fps`;
        fpsEl.style.color  = fpsColor(fps);
      }
      frames   = 0;
      lastTime = now;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ── list refresh ──────────────────────────────────────────────────────────

function scheduleRefresh(): void {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => { refresh(); rafId = null; });
}

function refresh(): void {
  if (!listEl) return;

  const entries = [...getStats().entries()].sort((a, b) => b[1].renders - a[1].renders);

  listEl.innerHTML = '';

  if (entries.length === 0) {
    const msg = document.createElement('div');
    msg.style.cssText = 'padding:12px;color:#555;font-size:11px;text-align:center;';
    msg.textContent = 'Waiting for renders…';
    listEl.appendChild(msg);
    return;
  }

  for (const [tag, { renders, instances }] of entries) {
    const color = colorFor(renders);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 10px;';

    const dot = document.createElement('span');
    dot.style.cssText = `width:7px;height:7px;border-radius:50%;background:${color};flex-shrink:0;`;

    const tagSpan = document.createElement('span');
    tagSpan.style.cssText = `
      flex:1;color:#ccc;font-size:11px;
      font-family:ui-monospace,monospace;
      overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    `;
    tagSpan.textContent = instances > 1 ? `${tag} (${instances})` : tag;

    const countSpan = document.createElement('span');
    countSpan.style.cssText = `color:${color};font-size:11px;font-weight:600;font-family:ui-monospace,monospace;`;
    countSpan.textContent = `×${renders}`;

    row.appendChild(dot);
    row.appendChild(tagSpan);
    row.appendChild(countSpan);
    listEl.appendChild(row);
  }
}

// ── report overlay ────────────────────────────────────────────────────────

function showReportOverlay(text: string): void {
  document.getElementById('ls-report-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ls-report-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;
    background:rgba(0,0,0,0.75);
    z-index:2147483645;
    display:flex;align-items:center;justify-content:center;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background:#161616;
    border:1px solid #333;
    border-radius:8px;
    padding:20px 24px;
    max-width:640px;width:90%;
    max-height:80vh;overflow-y:auto;
    position:relative;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    position:absolute;top:12px;right:12px;
    background:none;border:none;color:#666;
    cursor:pointer;font-size:14px;line-height:1;
  `;
  closeBtn.addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const pre = document.createElement('pre');
  pre.style.cssText = `
    color:#ddd;font-size:11px;line-height:1.7;
    margin:0;white-space:pre;overflow-x:auto;
    font-family:ui-monospace,monospace;
  `;
  pre.textContent = text;

  box.appendChild(closeBtn);
  box.appendChild(pre);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

// ── draggable ─────────────────────────────────────────────────────────────

function makeDraggable(handle: HTMLElement, target: HTMLElement): void {
  let startX = 0, startY = 0, origLeft = 0, origTop = 0;

  handle.style.cursor = 'grab';

  handle.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault();
    const rect = target.getBoundingClientRect();
    startX   = e.clientX;
    startY   = e.clientY;
    origLeft = rect.left;
    origTop  = rect.top;
    handle.style.cursor = 'grabbing';

    const onMove = (e: MouseEvent) => {
      target.style.left   = `${origLeft + e.clientX - startX}px`;
      target.style.top    = `${origTop  + e.clientY - startY}px`;
      target.style.right  = 'auto';
      target.style.bottom = 'auto';
    };

    const onUp = () => {
      handle.style.cursor = 'grab';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// ── init ──────────────────────────────────────────────────────────────────

export function initPanel(): void {
  if (listEl) return;

  const style = document.createElement('style');
  style.textContent = `
    #ls-panel {
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 240px;
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      z-index: 2147483646;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
      user-select: none;
    }
    #ls-panel-header {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 10px;
      border-bottom: 1px solid #2a2a2a;
    }
    #ls-panel-list {
      max-height: 200px;
      overflow-y: auto;
      padding: 4px 0;
    }
    #ls-panel-list::-webkit-scrollbar { width: 3px; }
    #ls-panel-list::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
    #ls-panel-footer {
      padding: 6px 10px;
      border-top: 1px solid #2a2a2a;
    }
    #ls-report-btn {
      width: 100%;
      background: #222;
      border: 1px solid #333;
      border-radius: 4px;
      color: #888;
      font-size: 11px;
      padding: 5px;
      cursor: pointer;
      font-family: system-ui, -apple-system, sans-serif;
      transition: color 0.15s, background 0.15s;
    }
    #ls-report-btn:hover { background: #2a2a2a; color: #ddd; }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = 'ls-panel';

  // ── header ────────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.id = 'ls-panel-header';

  statusDot = document.createElement('span');
  statusDot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:#00c896;flex-shrink:0;';

  const title = document.createElement('span');
  title.style.cssText = 'flex:1;font-size:12px;font-weight:600;color:#eee;letter-spacing:0.04em;';
  title.textContent = 'LitScan';

  fpsEl = document.createElement('span');
  fpsEl.style.cssText = 'font-size:10px;color:#555;font-family:ui-monospace,monospace;';
  fpsEl.textContent = '-- fps';

  pauseBtn = document.createElement('button');
  pauseBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:#666;font-size:13px;padding:0;line-height:1;';
  pauseBtn.textContent = '⏸';
  pauseBtn.title = 'Pause';

  pauseBtn.addEventListener('click', () => {
    const next = !isPaused();
    setPaused(next);
    pauseBtn!.textContent           = next ? '▶' : '⏸';
    pauseBtn!.title                 = next ? 'Resume' : 'Pause';
    statusDot!.style.background     = next ? '#444' : '#00c896';
  });

  header.appendChild(statusDot);
  header.appendChild(title);
  header.appendChild(fpsEl);
  header.appendChild(pauseBtn);

  // ── list ──────────────────────────────────────────────────────────────────
  listEl = document.createElement('div');
  listEl.id = 'ls-panel-list';

  // ── footer ────────────────────────────────────────────────────────────────
  const footer = document.createElement('div');
  footer.id = 'ls-panel-footer';

  const reportBtn = document.createElement('button');
  reportBtn.id = 'ls-report-btn';
  reportBtn.textContent = 'Copy report';

  reportBtn.addEventListener('click', async () => {
    const text = generateReport();
    console.log(text);
    showReportOverlay(text);
    try {
      await navigator.clipboard.writeText(text);
      reportBtn.textContent = 'Copied!';
      setTimeout(() => { reportBtn.textContent = 'Copy report'; }, 1500);
    } catch (_) {
      // clipboard unavailable (SSH, permissions) — console + overlay still work
    }
  });

  footer.appendChild(reportBtn);

  panel.appendChild(header);
  panel.appendChild(listEl);
  panel.appendChild(footer);
  document.body.appendChild(panel);

  makeDraggable(header, panel);
  startFpsLoop();
  onRender(scheduleRefresh);
  refresh();
}
