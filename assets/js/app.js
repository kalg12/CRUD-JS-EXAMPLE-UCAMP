/* ============================
   CRUD To-Do con localStorage
   - Create: agregar tarea
   - Read: listar tareas
   - Update: editar tarea + toggle completada
   - Delete: eliminar tarea
   ============================ */

/* --------- 1) Referencias DOM (elementos del HTML) --------- */
const taskForm = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const prioritySelect = document.getElementById("priority");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editingIdInput = document.getElementById("editingId");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("search");
const filterButtons = document.querySelectorAll(".chip");

const countTotal = document.getElementById("countTotal");
const countPending = document.getElementById("countPending");
const countDone = document.getElementById("countDone");

const titleError = document.getElementById("titleError");

/* --------- 2) Config de localStorage --------- */
const STORAGE_KEY = "todo_crud_tasks";

/* --------- 3) Estado en memoria (lo que pintamos en pantalla) --------- */
let tasks = []; // aquí guardamos todas las tareas
let currentFilter = "all"; // all | pending | done

/* --------- 4) Helpers para localStorage --------- */
function loadTasks() {
  // Leemos el JSON guardado (si no existe, regresamos [])
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTasks(newTasks) {
  // Guardamos el arreglo como JSON
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
}

/* --------- 5) Utilidad para generar IDs únicos --------- */
function makeId() {
  // Un id simple usando fecha + random (suficiente para este proyecto)
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* --------- 6) Validación simple --------- */
function validateTitle(value) {
  // Trim quita espacios al inicio/fin
  const t = value.trim();
  return t.length >= 3; // mínimo 3 caracteres
}

/* --------- 7) Render: pintar la lista (READ) --------- */
function render() {
  // Filtramos por búsqueda + filtro seleccionado
  const searchTerm = searchInput.value.trim().toLowerCase();

  let filtered = tasks;

  // 7.1) Aplicar filtro por estado (all/pending/done)
  if (currentFilter === "pending") {
    filtered = filtered.filter((t) => !t.done);
  } else if (currentFilter === "done") {
    filtered = filtered.filter((t) => t.done);
  }

  // 7.2) Aplicar búsqueda por texto
  if (searchTerm) {
    filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(searchTerm)
    );
  }

  // 7.3) Limpiamos el HTML actual de la lista
  taskList.innerHTML = "";

  // 7.4) Mostrar estado vacío si no hay items
  const isEmpty = filtered.length === 0;
  emptyState.classList.toggle("hidden", !isEmpty);

  // 7.5) Generamos cada <li> (una tarea)
  filtered.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task";

    // Checkbox (toggle done)
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    // Cuando cambia, actualizamos esa tarea (UPDATE)
    checkbox.addEventListener("change", () => toggleDone(task.id));

    // Área central: título + meta
    const center = document.createElement("div");
    center.className = "taskTitle";

    const title = document.createElement("strong");
    title.textContent = task.title;
    title.classList.toggle("done", task.done);

    const meta = document.createElement("div");
    meta.className = `badge ${task.priority}`;
    meta.textContent =
      task.priority === "high"
        ? "Alta"
        : task.priority === "medium"
        ? "Media"
        : "Baja";

    // Fecha (solo para mostrar info)
    const date = document.createElement("small");
    date.className = "muted";
    date.textContent = `Creada: ${new Date(task.createdAt).toLocaleString()}`;

    center.appendChild(title);
    center.appendChild(meta);
    center.appendChild(date);

    // Botones de acciones (EDIT/DELETE)
    const actions = document.createElement("div");
    actions.className = "taskActions";

    const editBtn = document.createElement("button");
    editBtn.className = "iconBtn ok";
    editBtn.type = "button";
    editBtn.textContent = "Editar";

    editBtn.addEventListener("click", () => startEdit(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "iconBtn danger";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Eliminar";

    deleteBtn.addEventListener("click", () => removeTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Componemos el li
    li.appendChild(checkbox);
    li.appendChild(center);
    li.appendChild(actions);

    taskList.appendChild(li);
  });

  // 7.6) Actualizamos contadores (stats)
  updateStats();
}

/* --------- 8) Stats --------- */
function updateStats() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pending = total - done;

  countTotal.textContent = total;
  countPending.textContent = pending;
  countDone.textContent = done;
}

/* --------- 9) CREATE: agregar tarea --------- */
function addTask(title, priority) {
  const newTask = {
    id: makeId(),
    title: title.trim(),
    priority,
    done: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Agregamos al inicio para que se vea primero
  tasks.unshift(newTask);

  // Persistimos
  saveTasks(tasks);

  // Repintamos
  render();
}

/* --------- 10) UPDATE: marcar como completada --------- */
function toggleDone(id) {
  tasks = tasks.map((t) => {
    if (t.id === id) {
      return { ...t, done: !t.done, updatedAt: Date.now() };
    }
    return t;
  });

  saveTasks(tasks);
  render();
}

/* --------- 11) UPDATE: iniciar edición --------- */
function startEdit(id) {
  // Buscamos la tarea a editar
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  // Colocamos valores en el formulario
  titleInput.value = task.title;
  prioritySelect.value = task.priority;

  // Guardamos el id en el hidden input
  editingIdInput.value = task.id;

  // Cambiamos UI a modo edición
  submitBtn.textContent = "Actualizar";
  cancelEditBtn.classList.remove("hidden");

  // Enfocamos el input
  titleInput.focus();
}

/* --------- 12) UPDATE: confirmar edición --------- */
function updateTask(id, newTitle, newPriority) {
  tasks = tasks.map((t) => {
    if (t.id === id) {
      return {
        ...t,
        title: newTitle.trim(),
        priority: newPriority,
        updatedAt: Date.now(),
      };
    }
    return t;
  });

  saveTasks(tasks);
  render();
}

/* --------- 13) DELETE: eliminar tarea --------- */
function removeTask(id) {
  // confirm() es nativo del navegador; puedes cambiarlo por un modal
  const ok = confirm("¿Seguro que quieres eliminar esta tarea?");
  if (!ok) return;

  tasks = tasks.filter((t) => t.id !== id);

  saveTasks(tasks);
  render();
}

/* --------- 14) Reset de modo edición --------- */
function resetEditMode() {
  editingIdInput.value = "";
  submitBtn.textContent = "Agregar";
  cancelEditBtn.classList.add("hidden");
  titleInput.value = "";
  prioritySelect.value = "medium";
  titleError.classList.add("hidden");
}

/* --------- 15) Eventos UI --------- */

// 15.1) Submit del formulario (CREATE o UPDATE)
taskForm.addEventListener("submit", (e) => {
  e.preventDefault(); // evita recargar la página

  const title = titleInput.value;
  const priority = prioritySelect.value;
  const editingId = editingIdInput.value;

  // Validación
  if (!validateTitle(title)) {
    titleError.classList.remove("hidden");
    titleInput.focus();
    return;
  } else {
    titleError.classList.add("hidden");
  }

  // Si hay editingId => UPDATE; si no => CREATE
  if (editingId) {
    updateTask(editingId, title, priority);
    resetEditMode();
  } else {
    addTask(title, priority);
    resetEditMode();
  }
});

// 15.2) Cancelar edición
cancelEditBtn.addEventListener("click", () => {
  resetEditMode();
});

// 15.3) Buscar (READ con filtro)
searchInput.addEventListener("input", () => {
  render();
});

// 15.4) Filtros (all/pending/done)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Quitamos active de todos y se lo ponemos al actual
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Guardamos filtro actual y renderizamos
    currentFilter = btn.dataset.filter;
    render();
  });
});

/* --------- 16) Inicialización --------- */
function init() {
  // Cargamos tareas desde localStorage al inicio
  tasks = loadTasks();

  // Pintamos la UI
  render();
}

// Ejecutamos init al cargar
init();
