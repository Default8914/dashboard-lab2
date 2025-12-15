import { UIComponent } from "./UIComponent.js";

export class QuoteWidget extends UIComponent {
  constructor({ id }) {
    super({ id, title: "Quote" });
    this.quotes = [
      { text: "Сделано лучше, чем идеально задумано.", author: "Народная мудрость" },
      { text: "Сначала работаю — потом оптимизирую.", author: "Dev подход" },
      { text: "Маленькие шаги дают большой результат.", author: "Практика" },
    ];
    this.current = this.quotes[0];
  }

  nextQuote() {
    const idx = Math.floor(Math.random() * this.quotes.length);
    this.current = this.quotes[idx];
    this._renderQuote();
  }

  _renderQuote() {
    const q = this.root.querySelector("[data-quote]");
    const a = this.root.querySelector("[data-author]");
    q.textContent = `“${this.current.text}”`;
    a.textContent = `— ${this.current.author}`;
  }

  render() {
    const wrap = document.createElement("article");
    wrap.className = "widget";

    wrap.innerHTML = `
      <div class="widget-head">
        <h2 class="widget-title">💡 Quote</h2>
        <div class="widget-actions">
          <button class="icon-btn" data-min type="button">—</button>
          <button class="icon-btn" data-close type="button">✕</button>
        </div>
      </div>

      <div class="widget-body">
        <p class="quote" data-quote></p>
        <p class="muted" data-author></p>
        <button class="btn btn-small" data-next type="button">Обновить</button>
      </div>
    `;

    this.on(wrap.querySelector("[data-min]"), "click", () => this.minimize());
    this.on(wrap.querySelector("[data-close]"), "click", () =>
      wrap.dispatchEvent(new CustomEvent("widget:close", { bubbles: true }))
    );
    this.on(wrap.querySelector("[data-next]"), "click", () => this.nextQuote());

    queueMicrotask(() => this._renderQuote());
    return wrap;
  }
}
