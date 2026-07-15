// Auth Session Check
let currentUser = null;
if (localStorage.getItem('todo_current_user')) {
    currentUser = JSON.parse(localStorage.getItem('todo_current_user'));
} else {
    window.location.href = 'LOGIN.HTML';
}

// State Management
let tasks = [];
let categories = {
    'Work': '#6366f1',
    'Personal': '#10b981',
    'Shopping': '#f59e0b',
    'Fitness': '#06b6d4'
};
let activeCategory = 'All';
let statusFilter = 'all';
let priorityFilter = 'all';
let searchQuery = '';
let sortBy = 'date-added-desc';
let editingTaskId = null;

// DOM Elements
const taskListContainer = document.getElementById('todo-list');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercentEl = document.getElementById('progress-percent');
const categoryListContainer = document.getElementById('category-list');
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const submitBtnText = document.getElementById('submit-btn-text');
const addCategoryForm = document.getElementById('add-category-form');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const toastContainer = document.getElementById('toast-container');
const confettiCanvas = document.getElementById('confetti-canvas');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Render user profile info in header
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.username;
        document.getElementById('user-avatar').textContent = currentUser.username.charAt(0);
    }

    // Load local storage (namespaced per user)
    const taskStorageKey = `todo_tasks_${currentUser.username}`;
    const categoryStorageKey = `todo_categories_${currentUser.username}`;

    if (localStorage.getItem(taskStorageKey)) {
        tasks = JSON.parse(localStorage.getItem(taskStorageKey));
    } else {
        // Initial dummy data to make the app look complete and pre-populated
        tasks = [
            {
                id: '1',
                title: 'Design premium dashboard UI',
                description: 'Refine user feedback system, layout grids, and visual typography hierarchy.',
                category: 'Work',
                priority: 'high',
                dueDate: new Date().toISOString().split('T')[0], // Today
                completed: false,
                createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
            },
            {
                id: '2',
                title: 'Go grocery shopping',
                description: 'Buy organic milk, eggs, fresh berries, avocados, and whole wheat bread.',
                category: 'Shopping',
                priority: 'medium',
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                completed: false,
                createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
            },
            {
                id: '3',
                title: '45-minute evening jog',
                description: 'Hit the lake trail for an outdoor aerobic running session.',
                category: 'Fitness',
                priority: 'low',
                dueDate: new Date().toISOString().split('T')[0], // Today
                completed: true,
                createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
            }
        ];
        saveTasks();
    }

    if (localStorage.getItem(categoryStorageKey)) {
        categories = JSON.parse(localStorage.getItem(categoryStorageKey));
    } else {
        saveCategories();
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Event Listeners
    setupEventListeners();

    // Initial Render
    renderCategories();
    renderTasks();
    updateStats();
});

// Setup Event Listeners
function setupEventListeners() {
    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Search Input
    document.getElementById('search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });

    // Filters & Sorting
    document.getElementById('status-filter').addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTasks();
    });

    document.getElementById('priority-filter').addEventListener('change', (e) => {
        priorityFilter = e.target.value;
        renderTasks();
    });

    document.getElementById('sort-filter').addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderTasks();
    });

    // Task Modal Controls
    document.getElementById('add-task-btn').addEventListener('click', () => openModal());
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn').addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleTaskSubmit);

    // Click outside modal to close
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });

    // Add Category Form
    addCategoryForm.addEventListener('submit', handleAddCategory);

    // Logout Button Control
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('todo_current_user');
        window.location.href = 'LOGIN.HTML';
    });
}

// Theme Controls
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Render Categories in Sidebar
function renderCategories() {
    // Clear and add "All" category
    categoryListContainer.innerHTML = '';
    
    // Calculate count for "All"
    const totalCount = tasks.length;
    createCategoryDOMItem('All', '#6366f1', totalCount, activeCategory === 'All');

    // Add other categories
    Object.keys(categories).forEach(cat => {
        const count = tasks.filter(task => task.category === cat).length;
        createCategoryDOMItem(cat, categories[cat], count, activeCategory === cat);
    });

    // Populate category select list in the task modal
    const taskCategorySelect = document.getElementById('task-category');
    const currentSelected = taskCategorySelect.value;
    taskCategorySelect.innerHTML = '';
    
    Object.keys(categories).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        taskCategorySelect.appendChild(option);
    });
    if (currentSelected && categories[currentSelected]) {
        taskCategorySelect.value = currentSelected;
    }
}

function createCategoryDOMItem(name, color, count, isActive) {
    const li = document.createElement('li');
    li.className = `category-item ${isActive ? 'active' : ''}`;
    li.innerHTML = `
        <span class="category-name">
            <span class="category-dot" style="background-color: ${color}"></span>
            <span>${name}</span>
        </span>
        <span class="category-count">${count}</span>
    `;
    li.addEventListener('click', () => {
        activeCategory = name;
        renderCategories();
        renderTasks();
    });
    categoryListContainer.appendChild(li);
}

// Render Tasks
function renderTasks() {
    taskListContainer.innerHTML = '';

    // Filter Tasks
    let filteredTasks = tasks.filter(task => {
        // Status Filter
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;

        // Category Filter
        if (activeCategory !== 'All' && task.category !== activeCategory) return false;

        // Priority Filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // Search Filter
        if (searchQuery) {
            const inTitle = task.title.toLowerCase().includes(searchQuery);
            const inDesc = task.description.toLowerCase().includes(searchQuery);
            if (!inTitle && !inDesc) return false;
        }

        return true;
    });

    // Sort Tasks
    filteredTasks.sort((a, b) => {
        if (sortBy === 'date-added-desc') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'date-added-asc') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === 'due-date-asc') {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (sortBy === 'priority-desc') {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return 0;
    });

    // Render Empty State if no tasks match
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fa-regular fa-folder-open"></i>
            <p>No tasks found. Create a new task or change filters!</p>
        `;
        taskListContainer.appendChild(emptyState);
        return;
    }

    // Render Task Elements
    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        taskListContainer.appendChild(taskCard);
    });
}

// Create Task Card DOM Element
function createTaskCard(task) {
    const div = document.createElement('div');
    div.className = `todo-item ${task.completed ? 'completed' : ''}`;
    
    // Set custom category color variable
    const categoryColor = categories[task.category] || '#6366f1';
    div.style.setProperty('--category-color', categoryColor);

    // Format due date badge
    let dateBadge = '';
    if (task.dueDate) {
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = !task.completed && task.dueDate < today;
        const isDueToday = !task.completed && task.dueDate === today;
        
        let dateClass = '';
        let dateIcon = '<i class="fa-regular fa-calendar"></i>';
        if (isOverdue) {
            dateClass = 'overdue';
            dateIcon = '<i class="fa-solid fa-triangle-exclamation"></i> Overdue: ';
        } else if (isDueToday) {
            dateClass = 'due-today';
            dateIcon = '<i class="fa-solid fa-clock"></i> Due Today: ';
        }

        // Format visual display date
        const options = { month: 'short', day: 'numeric' };
        const visualDate = new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', options);
        dateBadge = `<span class="badge badge-date ${dateClass}">${dateIcon}${visualDate}</span>`;
    }

    div.innerHTML = `
        <div class="todo-checkbox-wrapper">
            <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task completed">
        </div>
        <div class="todo-details">
            <div class="todo-title-row">
                <span class="todo-title">${escapeHTML(task.title)}</span>
                <span class="badge badge-priority-${task.priority}">${task.priority}</span>
                <span class="badge badge-category" style="border-left: 3px solid ${categoryColor}">${task.category}</span>
                ${dateBadge}
            </div>
            ${task.description ? `<p class="todo-description">${escapeHTML(task.description)}</p>` : ''}
        </div>
        <div class="todo-actions">
            <button class="action-btn edit-btn" aria-label="Edit task"><i class="fa-regular fa-pen-to-square"></i></button>
            <button class="action-btn delete-btn" aria-label="Delete task"><i class="fa-regular fa-trash-can"></i></button>
        </div>
    `;

    // Event Listeners
    const checkbox = div.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    const editBtn = div.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => openModal(task.id));

    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return div;
}

// CRUD Operations
function toggleTaskCompletion(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        const originalStatus = tasks[taskIndex].completed;
        tasks[taskIndex].completed = !originalStatus;
        
        saveTasks();
        renderTasks();
        renderCategories();
        updateStats();

        if (tasks[taskIndex].completed) {
            showToast('Task marked as completed!', 'success');
            
            // Check if all tasks are complete to trigger confetti
            const activeCount = tasks.filter(t => !t.completed).length;
            if (activeCount === 0 && tasks.length > 0) {
                triggerConfetti();
                showToast('All tasks completed! Amazing job! 🎉', 'success');
            }
        } else {
            showToast('Task marked active.', 'info');
        }
    }
}

function handleTaskSubmit(e) {
    e.preventDefault();

    const titleInput = document.getElementById('task-title');
    const descInput = document.getElementById('task-desc');
    const categorySelect = document.getElementById('task-category');
    const prioritySelect = document.getElementById('task-priority');
    const dateInput = document.getElementById('task-due-date');

    const title = titleInput.value.trim();
    if (!title) return;

    if (editingTaskId) {
        // Edit Mode
        const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].title = title;
            tasks[taskIndex].description = descInput.value.trim();
            tasks[taskIndex].category = categorySelect.value;
            tasks[taskIndex].priority = prioritySelect.value;
            tasks[taskIndex].dueDate = dateInput.value;
            showToast('Task updated successfully!', 'success');
        }
    } else {
        // Add Mode
        const newTask = {
            id: Date.now().toString(),
            title: title,
            description: descInput.value.trim(),
            category: categorySelect.value,
            priority: prioritySelect.value,
            dueDate: dateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        showToast('Task added successfully!', 'success');
    }

    saveTasks();
    closeModal();
    renderTasks();
    renderCategories();
    updateStats();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        renderCategories();
        updateStats();
        showToast('Task deleted.', 'danger');
    }
}

// Category Creation
function handleAddCategory(e) {
    e.preventDefault();
    const input = document.getElementById('new-category-name');
    const colorPicker = document.getElementById('new-category-color');
    const name = input.value.trim();

    if (!name) return;

    // Check duplicate
    if (categories[name] || name.toLowerCase() === 'all') {
        showToast('Category already exists!', 'danger');
        return;
    }

    categories[name] = colorPicker.value;
    saveCategories();
    renderCategories();
    
    input.value = '';
    showToast(`Category "${name}" created!`, 'success');
}

// Modal Control Functions
function openModal(taskId = null) {
    editingTaskId = taskId;
    taskModal.classList.add('active');
    
    if (taskId) {
        // Edit Existing Task
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            modalTitle.textContent = 'Edit Task';
            submitBtnText.textContent = 'Save Changes';
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.description || '';
            document.getElementById('task-category').value = task.category;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-due-date').value = task.dueDate || '';
        }
    } else {
        // Create New Task
        modalTitle.textContent = 'Create Task';
        submitBtnText.textContent = 'Add Task';
        taskForm.reset();
        
        // Default category to the active one (if it exists and is not 'All')
        if (activeCategory !== 'All' && categories[activeCategory]) {
            document.getElementById('task-category').value = activeCategory;
        }
        // Default due date to today
        document.getElementById('task-due-date').value = '';
    }
    
    document.getElementById('task-title').focus();
}

function closeModal() {
    taskModal.classList.remove('active');
    editingTaskId = null;
    taskForm.reset();
}

// Update Stats Dashboard
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;

    // Update Progress Bar
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressBarFill.style.width = `${percent}%`;
    progressPercentEl.textContent = `${percent}%`;
}

// Local Storage Sync (Namespaced per User)
function saveTasks() {
    localStorage.setItem(`todo_tasks_${currentUser.username}`, JSON.stringify(tasks));
}

function saveCategories() {
    localStorage.setItem(`todo_categories_${currentUser.username}`, JSON.stringify(categories));
}

// Utility Helpers
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Simple Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${
            type === 'success' ? 'fa-circle-check' : 
            type === 'danger' ? 'fa-circle-exclamation' : 'fa-circle-info'
        }"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    
    // Trigger slide-in
    setTimeout(() => toast.classList.add('active'), 50);

    // Slide-out and remove
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Simple Pure JS Confetti Animation
function triggerConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

    for (let i = 0; i < 150; i++) {
        pieces.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 5 + 3,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    let animationFrame;
    function update() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        let alive = false;
        pieces.forEach(p => {
            p.y += p.speed;
            p.x += Math.sin(p.y / 20) * 1.5;
            p.rotation += p.rotationSpeed;

            if (p.y < confettiCanvas.height) {
                alive = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }
        });

        if (alive) {
            animationFrame = requestAnimationFrame(update);
        } else {
            cancelAnimationFrame(animationFrame);
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }
    update();
}

// Resize Confetti Canvas on Window Resize
window.addEventListener('resize', () => {
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
});
