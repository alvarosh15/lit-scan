import { getStats, getSessionStart } from './scanner.js';

const ANOMALY_TOTAL = 50; // renders

function bar(renders: number, max: number, width = 16): string {
  const filled = Math.max(1, Math.round((renders / max) * width));
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function generateReport(): string {
  const stats    = getStats();
  const duration = (Date.now() - getSessionStart()) / 1000;
  const entries  = [...stats.entries()].sort((a, b) => b[1].renders - a[1].renders);
  const total    = entries.reduce((s, [, v]) => s + v.renders, 0);
  const max      = entries[0]?.[1].renders ?? 1;

  const lines: string[] = [];

  const heading = `LitScan Report — ${duration.toFixed(1)}s session`;
  lines.push(heading, '='.repeat(heading.length), '');

  if (entries.length === 0) {
    lines.push('No renders recorded.');
    return lines.join('\n');
  }

  lines.push(`Total renders: ${total} across ${entries.length} component${entries.length !== 1 ? 's' : ''}`, '');

  const anomalies = entries.filter(([, s]) => s.renders > ANOMALY_TOTAL);

  if (anomalies.length > 0) {
    lines.push('ANOMALIES');
    for (const [tag, s] of anomalies) {
      lines.push(`⚠  ${tag.padEnd(22)} ×${String(s.renders).padStart(4)} — render count unusually high`);
    }
    lines.push('');
  }

  lines.push('ALL COMPONENTS');
  for (const [tag, s] of entries) {
    const flag  = anomalies.some(([t]) => t === tag) ? '  ⚠' : '';
    const label = s.instances > 1 ? `${tag} (×${s.instances})` : tag;
    lines.push(`${label.padEnd(26)} ×${String(s.renders).padStart(4)}  ${bar(s.renders, max)}${flag}`);
  }

  return lines.join('\n');
}
