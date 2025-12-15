import { UIComponent } from "./UIComponent.js";

export class CryptoWidget extends UIComponent {
  constructor({ id }) {
    super({ id, title: "Crypto" });
    this.coin = "bitcoin";
    this.currency = "usd";
    this.state = { loading: false, error: "", price: null, change24h: null };
  }

  async fetchPrice() {
    this.state.loading = true;
    this.state.error = "";
    this._renderState();

    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(this.coin)}&vs_currencies=${encodeURIComponent(this.currency)}&include_24hr_change=true`;
      const res = await fetch(url);
      const data = await res.json();

      const obj = data?.[this.coin];
      if (!obj) throw new Error("Монета не найдена");

      this.state.price = obj[this.currency];
      this.state.change24h = obj[`${this.currency}_24h_change`];
    } catch (e) {
      this.state.error = e?.message || "Ошибка загрузки";
    } finally {
      this.state.loading = false;
      this._renderState();
    }
  }

  _renderState() {
    if (!this.root) return;

    const info = this.root.querySelector("[data-info]");
    const err = this.root.querySelector("[data-error]");
    const btn = this.root.querySelector("[data-load]");

    btn.disabled = this.state.loading;
    err.textContent = this.state.error || "";

    if (this.state.loading) {
      info.textContent = "Загрузка…";
      return;
    }
    if (this.state.error) {
      info.textContent = "—";
      return;
    }
    if (this.state.price == null) {
      info.textContent = "Нажмите “Обновить”.";
      return;
    }

    const sign = this.state.change24h >= 0 ? "+" : "";
    info.textContent = `${this.coin} = ${this.state.price} ${this.currency.toUpperCase()} (${sign}${this.state.change24h.toFixed(2)}% / 24h)`;
  }

  render() {
    const wrap = document.createElement("article");
    wrap.className = "widget";

    wrap.innerHTML = `
      <div class="widget-head">
        <h2 class="widget-title">📈 Crypto (API)</h2>
        <div class="widget-actions">
          <button class="icon-btn" data-min type="button">—</button>
          <button class="icon-btn" data-close type="button">✕</button>
        </div>
      </div>

      <div class="widget-body">
        <div class="row">
          <select class="input" data-coin>
            <option value="bitcoin">bitcoin</option>
            <option value="ethereum">ethereum</option>
            <option value="solana">solana</option>
            <option value="dogecoin">dogecoin</option>
          </select>
          <button class="btn btn-small" data-load type="button">Обновить</button>
        </div>
        <p class="muted" data-info></p>
        <p class="error" data-error></p>
      </div>
    `;

    const select = wrap.querySelector("[data-coin]");
    const loadBtn = wrap.querySelector("[data-load]");

    select.value = this.coin;

    this.on(wrap.querySelector("[data-min]"), "click", () => this.minimize());
    this.on(wrap.querySelector("[data-close]"), "click", () =>
      wrap.dispatchEvent(new CustomEvent("widget:close", { bubbles: true }))
    );

    this.on(select, "change", () => {
      this.coin = select.value;
      this.fetchPrice();
    });

    this.on(loadBtn, "click", () => this.fetchPrice());

    queueMicrotask(() => this.fetchPrice());

    return wrap;
  }
}
