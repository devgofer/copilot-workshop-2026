const STORAGE_KEY = "todo-list-items";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const remainingCount = document.querySelector("#remaining-count");
const formMessage = document.querySelector("#form-message");
const clearCompletedButton = document.querySelector("#clear-completed");

let todos = loadTodos();

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

// 重新繪製畫面，並同步剩餘數量。
function renderTodos() {
  list.replaceChildren();

  if (todos.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "目前還沒有待辦事項，先寫下第一件吧。";
    list.append(emptyState);
  } else {
    todos.forEach((todo) => {
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

renderTodos();
