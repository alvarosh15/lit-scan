import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

type InstallMethod = 'npm' | 'unpkg';

@customElement('install-snippet')
export class InstallSnippet extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --line: #242424;
      --muted: #777;
      --dim: #4b4b4b;
      --green: #00c896;
    }

    .install {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #111;
      overflow: hidden;
    }

    .install-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 10px;
      border-bottom: 1px solid var(--line);
    }

    .label {
      margin: 0;
      color: var(--dim);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .tabs {
      display: flex;
      border: 1px solid var(--line);
      border-radius: 6px;
      overflow: hidden;
    }

    .tab {
      min-width: 72px;
      border: 0;
      border-right: 1px solid var(--line);
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      font: inherit;
      font-size: 11px;
      padding: 6px 10px;
    }

    .tab:last-child {
      border-right: 0;
    }

    .tab[aria-selected="true"] {
      background: #171717;
      color: var(--green);
    }

    .install-body {
      display: grid;
      gap: 8px;
      padding: 10px;
    }

    .code-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 9px;
      min-height: 40px;
      border: 1px solid #1c1c1c;
      border-radius: 6px;
      background: #0a0a0a;
      padding: 8px 10px;
      color: #dddddd;
      font-size: 12px;
    }

    .prompt,
    .dim {
      color: var(--dim);
    }

    .accent {
      color: var(--green);
    }

    code {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .copy-btn {
      border: 1px solid var(--line);
      border-radius: 5px;
      background: #151515;
      color: var(--muted);
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      padding: 5px 8px;
    }

    .copy-btn:hover {
      color: #e8e8e8;
    }
  `;

  @state()
  private method: InstallMethod = 'npm';

  @state()
  private copied = '';

  override render() {
    return html`
      <section class="install" aria-labelledby="install-title">
        <div class="install-head">
          <h2 class="label" id="install-title">Install</h2>
          <div class="tabs" role="tablist" aria-label="install method">
            ${this.renderTab('npm')}
            ${this.renderTab('unpkg')}
          </div>
        </div>

        <div class="install-body">
          ${this.method === 'npm' ? this.renderNpm() : this.renderUnpkg()}
        </div>
      </section>
    `;
  }

  private renderTab(method: InstallMethod) {
    return html`
      <button
        class="tab"
        type="button"
        role="tab"
        aria-selected=${String(this.method === method)}
        @click=${() => { this.method = method; }}
      >
        ${method}
      </button>
    `;
  }

  private renderNpm() {
    return html`
      <div class="code-row">
        <span class="prompt">$</span>
        <code>npm install lit-scan</code>
        ${this.renderCopyButton('npm install lit-scan')}
      </div>
      <div class="code-row">
        <span class="prompt">1</span>
        <code>import <span class="accent">'lit-scan'</span>;<span class="dim"> // first import</span></code>
        ${this.renderCopyButton("import 'lit-scan';")}
      </div>
    `;
  }

  private renderUnpkg() {
    const snippet = '<script src="https://unpkg.com/lit-scan/dist/lit-scan.iife.js"></script>';

    return html`
      <div class="code-row">
        <span class="prompt">1</span>
        <code>&lt;script src=<span class="accent">"https://unpkg.com/lit-scan/dist/lit-scan.iife.js"</span>&gt;&lt;/script&gt;</code>
        ${this.renderCopyButton(snippet)}
      </div>
    `;
  }

  private renderCopyButton(text: string) {
    return html`
      <button class="copy-btn" type="button" @click=${() => this.copy(text)}>
        ${this.copied === text ? 'copied' : 'copy'}
      </button>
    `;
  }

  private async copy(text: string) {
    await navigator.clipboard.writeText(text);
    this.copied = text;
    window.setTimeout(() => {
      if (this.copied === text) this.copied = '';
    }, 1500);
  }
}
