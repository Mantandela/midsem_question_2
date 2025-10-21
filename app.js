
const SID4 = "9212";
const STORAGE_KEY = `opportunityBoard_${SID4}`;

// DOM references
const formElement = document.getElementById("add-task-form");
const submitBtn = document.getElementById("add-btn-9212");
const activeList = document.getElementById("active-list");
const doneList = document.getElementById("done-list");
const filterRadios = document.querySelectorAll('input[name="filter"]');
const errMsg = document.getElementById("err-msg");
const categorySelect = document.getElementById("category-select");

// Global oppotunies
let opportunities = loadFromStorage();


submitBtn.addEventListener("click", handleSubmit);
activeList.addEventListener("click", handleListClick);
doneList.addEventListener("click", handleListClick);
filterRadios.forEach(radio => radio.addEventListener("change", renderAll));

/*
  Event delegation keeps memory stable as the list changes.
  Instead of attaching listeners to each button, we listen once on the parent
  and identify the target using class checks and closest() traversal.
*/
function handleListClick(e) {
  const btn = e.target;
  const li = btn.closest("li");
  if (!li) return;

  const id = li.dataset.id;

  if (btn.classList.contains("delete")) {
    opportunities = opportunities.filter(item => item.id !== id);
  } else if (btn.classList.contains("save")) {
    opportunities = opportunities.map(item =>
      item.id === id ? { ...item, saved: !item.saved } : item
    );
  }

  saveToStorage(opportunities);
  renderAll();
}

function handleSubmit(e) {
  e.preventDefault();
  const title = formElement.elements["task"].value.trim();
  const category = categorySelect?.value || "internship";

  if (!title) {
    errMsg.textContent = "Invalid opportunity title";
    return;
  }

  errMsg.textContent = "";

  const newOpportunity = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    category,
    saved: false
  };

  opportunities.push(newOpportunity);
  saveToStorage(opportunities);
  formElement.reset();
  renderAll();
}

// Escape user input to prevent XSS
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTasks() {
  activeList.textContent = "";
  doneList.textContent = "";

  const filter = document.querySelector('input[name="filter"]:checked').value;

  opportunities
    .filter(item => {
      if (filter === "all") return true;
      return item.category === filter;
    })
    .forEach(item => {
      const li = document.createElement("li");
      li.className = "card";
      li.dataset.id = item.id;

      const categorySpan = document.createElement("span");
      categorySpan.className = "category-label";
      categorySpan.textContent = item.category.charAt(0).toUpperCase() + item.category.slice(1);

      const titleSpan = document.createElement("span");
      titleSpan.className = "title";
      titleSpan.innerHTML = escapeHTML(item.title);

      const actionSpan = document.createElement("span");
      actionSpan.className = "action-btn";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete";
      deleteBtn.textContent = "Delete";

      const saveBtn = document.createElement("button");
      saveBtn.className = "save";
      saveBtn.textContent = item.saved ? "Unsave" : "Save";

      actionSpan.append(deleteBtn, saveBtn);
      li.append(categorySpan, titleSpan, actionSpan);

      if (item.saved) {
        doneList.appendChild(li);
      } else {
        activeList.appendChild(li);
      }
    });
}

function updateAnalytics() {
  const active = opportunities.filter(item => !item.saved).length;
  const done = opportunities.filter(item => item.saved).length;
  const total = active + done;

  document.getElementById("active-count").textContent = active;
  document.getElementById("done-count").textContent = done;
  document.getElementById("total-count").textContent = total;
}

function renderAll() {
  renderTasks();
  updateAnalytics();
}

function saveToStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Initial render
renderAll();
