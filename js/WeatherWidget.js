import { UIComponent } from "./UIComponent.js";

export class WeatherWidget extends UIComponent {
  constructor({ id }) {
    super({ id, title: "Weather" });
    this.city = "Tallinn";
    this.state = { loading: false, error: "", temp: null, wind: null };
  }

  async fetchWeather(city) {
    this.state.loading = true;
    this.state.error = "";
    this._renderState();

    try {
      // 1) геокодинг
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error("Город не найден");

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2) текущая погода
      const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&timezone=auto`;
      const wRes = await fetch(wUrl);
      const wData = await wRes.json();

      const temp = wData.current?.temperature_2m;
      const wind = wData.current?.wind_speed_10m;

      this.city = `${name}, ${country}`;
      this.state.temp = temp;
      this.state.wind = wind;
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
    if (this.state.temp == null) {
      info.textContent = "Введите город и нажмите “Обновить”.";
      return;
    }

    info.textContent = `${this.city}: ${this.state.temp}°C, ветер ${this.state.wind} м/с`;
  }

  render() {
    const wrap = document.createElement("article");
    wrap.className = "widget";

    wrap.innerHTML = `
      <div class="widget-head">
        <h2 class="widget-title">🌦 Weather (API)</h2>
        <div class="widget-actions">
          <button class="icon-btn" data-min type="button">—</button>
          <button class="icon-btn" data-close type="button">✕</button>
        </div>
      </div>

      <div class="widget-body">
        <div class="row">
          <input class="input" type="text" value="${this.city}" placeholder="Город..." />
          <button class="btn btn-small" data-load type="button">Обновить</button>
        </div>
        <p class="muted" data-info></p>
        <p class="error" data-error></p>
      </div>
    `;

    const input = wrap.querySelector("input");
    const loadBtn = wrap.querySelector("[data-load]");

    this.on(wrap.querySelector("[data-min]"), "click", () => this.minimize());
    this.on(wrap.querySelector("[data-close]"), "click", () =>
      wrap.dispatchEvent(new CustomEvent("widget:close", { bubbles: true }))
    );

    this.on(loadBtn, "click", () => {
      const city = input.value.trim();
      if (!city) return;
      this.fetchWeather(city);
    });

    // авто-загрузка при старте
    queueMicrotask(() => this.fetchWeather(this.city));

    return wrap;
  }
}
