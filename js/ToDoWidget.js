import { UIComponent } from "./UIComponent.js";

export class ToDoWidget extends UIComponent {
  constructor({ id }) {
    super({ id, title: "ToDo" });
    this.tasks = []; // { id, text, done }
  }

  addTask(text) {
    this.tasks.push({ id: crypto.randomUUID?.() ?? String(Date.now()), text, done: false });
    this._renderList();
  }

  toggleTask(taskId) {
    const t = this.tasks.find(x => x.id === taskId);
    if (!t) return;
    t.done = !t.done;
    this._renderList();
  }

  removeTask(taskId) {
    this.tasks = this.tasks.filter(x => x.id !== taskId);
    this._renderList();
  }

  _renderList() {
    const ul = this.root.querySelector("ul");
    ul.innerHTML = "";

    this.tasks.forEach(t => {
      const li = document.createElement("li");
      li.className = "todo-item";

      const label = document.createElement("label");
      label.className = "todo-label";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = t.done;

      const span = document.createElement("span");
      span.textContent = t.text;
      if (t.done) span.classList.add("is-done");

      const del = document.createElement("button");
      del.className = "icon-btn";
      del.type = "button";
      del.textContent = "✕";

      // слушатели через базовый .on (чтобы destroy() корректно очищал)
      this.on(cb, "change", () => this.toggleTask(t.id));
      this.on(del, "click", () => this.removeTask(t.id));

      label.append(cb, span);
      li.append(label, del);
      ul.appendChild(li);
    });
  }

  render() {
    const wrap = document.createElement("article");
    wrap.className = "widget";

    wrap.innerHTML = `
      <div class="widget-head">
        <h2 class="widget-title">📝 ToDo</h2>
        <div class="widget-actions">
          <button class="icon-btn" data-min type="button">—</button>
          <button class="icon-btn" data-close type="button">✕</button>
        </div>
      </div>

      <div class="widget-body">
        <div class="row">
          <input class="input" type="text" placeholder="Новая задача..." />
          <button class="btn btn-small" type="button">Добавить</button>
        </div>
        <ul class="list"></ul>
      </div>
    `;

    const input = wrap.querySelector("input");
    const addBtn = wrap.querySelector(".btn-small");
    const minBtn = wrap.querySelector("[data-min]");
    const closeBtn = wrap.querySelector("[data-close]");

    this.on(addBtn, "click", () => {
      const text = input.value.trim();
      if (!text) return;
      this.addTask(text);
      input.value = "";
      input.focus();
    });

    this.on(input, "keydown", (e) => {
      if (e.key === "Enter") addBtn.click();
    });

    this.on(minBtn, "click", () => this.minimize());
    this.on(closeBtn, "click", () => wrap.dispatchEvent(new CustomEvent("widget:close", { bubbles: true })));

    // стартовый рендер списка
    queueMicrotask(() => this._renderList());

    return wrap;
  }
}
