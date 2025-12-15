import { ToDoWidget } from "./ToDoWidget.js";
import { QuoteWidget } from "./QuoteWidget.js";
import { WeatherWidget } from "./WeatherWidget.js";
import { CryptoWidget } from "./CryptoWidget.js";

export class Dashboard {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.widgets = [];

    this.registry = {
      todo: ToDoWidget,
      quote: QuoteWidget,
      weather: WeatherWidget,
      crypto: CryptoWidget,
    };
  }

  _makeId(prefix) {
    return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random()}`;
  }

  addWidget(widgetType) {
    const WidgetClass = this.registry[widgetType];
    if (!WidgetClass) throw new Error(`Неизвестный виджет: ${widgetType}`);

    const id = this._makeId(widgetType);
    const widget = new WidgetClass({ id });

    const el = widget.render();
    widget.root = el;

    // общий обработчик “закрыть” через кастомное событие (полиморфизм не ломаем)
    el.addEventListener("widget:close", () => this.removeWidget(id));

    this.widgets.push(widget);
    this.containerEl.appendChild(el);
  }

  removeWidget(widgetId) {
    const idx = this.widgets.findIndex(w => w.id === widgetId);
    if (idx === -1) return;

    const widget = this.widgets[idx];
    widget.destroy();
    this.widgets.splice(idx, 1);
  }
}
