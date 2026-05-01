import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  static override styles = css`
    :host {
      display: block;
      background: #111;
      border: 1px solid #1e1e1e;
      border-radius: 12px;
      padding: 24px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    h1 {
      margin: 0 0 16px;
      font-size: 1.1rem;
      font-weight: 500;
      color: #aaa;
    }

    .count-display {
      font-size: 3.5rem;
      font-weight: 700;
      text-align: center;
      padding: 24px;
      border-radius: 8px;
      background: #0a0a0a;
      color: #eee;
      margin: 0 0 16px;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    .controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    button {
      padding: 8px 16px;
      border: 1px solid #2a2a2a;
      border-radius: 6px;
      background: #1a1a1a;
      color: #bbb;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.1s, color 0.1s;
    }
    button:hover { background: #222; color: #eee; }

    .hint {
      margin-top: 16px;
      font-size: 12px;
      color: #444;
      line-height: 1.6;
    }
  `;

  /**
   * The name to say "Hello" to.
   */
  @property()
  name = 'World';

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  override render() {
    return html`
      <h1>${this.sayHello(this.name)}!</h1>
      <div class="count-display">${this.count}</div>

      <div class="controls">
        <button part="button" @click=${() => this.count--}>−</button>
        <button part="button" @click=${() => this.count++}>+</button>
        <button part="button" @click=${this._toggleName}>Toggle name</button>
        <button part="button" @click=${this._rapidFire}>Rapid ×10</button>
      </div>

      <p class="hint">
        Each button click triggers a rerender. "Rapid ×10" fires 10 updates
        quickly to push the counter into the amber → red range.
      </p>

      <slot></slot>
    `;
  }

  sayHello(name: string): string {
    return `Hello, ${name}`;
  }

  private _toggleName() {
    this.name = this.name === 'World' ? 'Lit' : 'World';
    this.dispatchEvent(new CustomEvent('count-changed'));
  }

  private _rapidFire() {
    let i = 0;
    const t = setInterval(() => {
      this.count++;
      this.dispatchEvent(new CustomEvent('count-changed'));
      if (++i >= 10) clearInterval(t);
    }, 60);
  }
}
