import { init, destroy } from './scanner.js';
import { initPanel } from './panel.js';
import { generateReport } from './report.js';

init();
initPanel();

export function report(): string {
  const text = generateReport();
  console.log(text);
  return text;
}

export { destroy };

declare global {
  interface Window { litScan: { report: () => string; destroy: () => void } }
}

// For ESM consumers. The IIFE build gets window.litScan automatically
// via Vite's export wrapper (it assigns exports to window.litScan).
window.litScan = { report, destroy };
