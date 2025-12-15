import { Dashboard } from "./js/Dashboard.js";

const grid = document.getElementById("dashboardGrid");
const dashboard = new Dashboard(grid);

// Кнопки добавления виджетов
document.querySelectorAll("[data-add]").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.add;
    dashboard.addWidget(type);
  });
});

// Стартовые виджеты (по желанию)
dashboard.addWidget("todo");
dashboard.addWidget("weather");
