const STORAGE_KEY = "todo-list-items";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const remainingCount = document.querySelector("#remaining-count");
const formMessage = document.querySelector("#form-message");
const clearCompletedButton = document.querySelector("#clear-completed");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = themeToggle.querySelector(".theme-icon");
const themeLabel = themeToggle.querySelector(".theme-label");
const filterButtons = document.querySelectorAll(".filter-button");
const THEME_STORAGE_KEY = "todo-theme-preference";

let todos = loadTodos();
let currentFilter = "all";

// 從瀏覽器儲存空間讀取先前的清單。
function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch (error) {
    return [];
  }
}

// 儲存目前清單，讓重新整理頁面後資料仍然保留。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 根據使用者選擇或作業系統偏好設定佈景主題。
function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const isDark = theme === "dark";
  themeIcon.textContent = isDark ? "☀️" : "🌙";
  themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

// 讀取主題設定；尚未手動選擇時交給作業系統決定。
function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
    return;
  }

  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  applyTheme(colorScheme.matches ? "dark" : "light");
  document.body.removeAttribute("data-theme");
  colorScheme.addEventListener("change", (event) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      applyTheme(event.matches ? "dark" : "light");
      document.body.removeAttribute("data-theme");
    }
  });
}

// 重新繪製畫面，並同步剩餘數量。
function renderTodos() {
  list.replaceChildren();

  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  if (visibleTodos.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.setAttribute("role", "status");
    emptyState.setAttribute("aria-live", "polite");

    if (todos.length === 0) {
      emptyState.textContent = "目前還沒有待辦事項，先寫下第一件吧。";
    } else if (currentFilter === "all") {
      emptyState.textContent = "目前沒有待辦事項。";
    } else {
      const filterLabel = currentFilter === "active" ? "進行中" : "已完成";
      emptyState.textContent = `目前沒有${filterLabel}的事項。這些項目仍然存在，但不符合目前篩選條件，可切回「全部」查看。`;
    }

    list.append(emptyState);
  } else {
    visibleTodos.forEach((todo) => {
      list.append(createTodoElement(todo));
    });
  }

  const remainingTodos = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `Remaining: ${remainingTodos}`;
  clearCompletedButton.hidden = !todos.some((todo) => todo.completed);
}

// 建立單一待辦項目的 DOM 結構與操作事件。
function createTodoElement(todo) {
  const item = document.createElement("article");
  item.className = "todo-item";
  item.classList.toggle("is-complete", todo.completed);

  const checkbox = document.createElement("input");
  checkbox.className = "todo-checkbox";
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", `標記「${todo.text}」為完成`);
  checkbox.addEventListener("change", () => {
    todo.completed = checkbox.checked;
    saveTodos();
    renderTodos();
  });

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "刪除";
  deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);
  deleteButton.addEventListener("click", () => {
    todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
    saveTodos();
    renderTodos();
  });

  item.append(checkbox, text, deleteButton);
  return item;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  // 空白內容不建立項目，並提示使用者輸入有效內容。
  if (!text) {
    formMessage.textContent = "請輸入待辦事項。";
    input.focus();
    return;
  }

  todos.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });
  saveTodos();
  renderTodos();
  formMessage.textContent = "";
  form.reset();
  input.focus();
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-selected", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });
    renderTodos();
  });
});

initializeTheme();
renderTodos();
