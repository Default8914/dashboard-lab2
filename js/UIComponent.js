export class UIComponent {
  constructor({ id, title }) {
    if (new.target === UIComponent) {
      throw new Error("UIComponent — абстрактный класс, создайте наследника.");
    }
    this.id = id;
    this.title = title;

    this.root = null;
    this._listeners = []; // { el, type, handler }
    this._minimized = false;
  }

  render() {
    const wrap = document.createElement("div");
    wrap.className = "widget";
    wrap.textContent = "Empty widget";
    return wrap;
  }

  on(el, type, handler) {
    el.addEventListener(type, handler);
    this._listeners.push({ el, type, handler });
  }

  minimize() {
    if (!this.root) return;
    this._minimized = !this._minimized;
    this.root.classList.toggle("is-minimized", this._minimized);
  }

  destroy() {
    // снять все слушатели
    this._listeners.forEach(({ el, type, handler }) => el.removeEventListener(type, handler));
    this._listeners = [];

    // удалить из DOM
    if (this.root && this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
    this.root = null;
  }
}
