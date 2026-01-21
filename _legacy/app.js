
// State
let tasks = [
    { id: 1, text: 'Welcome to MoolanTo-Do!', completed: false },
    { id: 2, text: 'Click the checkbox to complete a task', completed: false },
    { id: 3, text: 'Hover over a task to see the delete button', completed: true },
];

let filter = 'all'; // 'all', 'active', 'completed'

// DOM Elements
const taskListEl = document.getElementById('task-list');
const taskInputEl = document.getElementById('task-input');
const addBtnEl = document.getElementById('add-btn');
const itemsLeftEl = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const countAllEl = document.getElementById('count-all');
const countActiveEl = document.getElementById('count-active');
const countCompletedEl = document.getElementById('count-completed');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    render();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Add Task
    addBtnEl.addEventListener('click', addTask);
    taskInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Delegated Events for List (Delete, Toggle)
    taskListEl.addEventListener('click', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        const id = parseInt(item.dataset.id);

        if (e.target.closest('.delete-btn')) {
            deleteTask(id);
        } else if (e.target.closest('.task-checkbox') || e.target.closest('.custom-checkbox')) {
            // Checkbox click is handled by 'change' event on input usually, but we can do it here if we want custom logic
            // Let's rely on change event for the actual checkbox input
        }
    });

    taskListEl.addEventListener('change', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const id = parseInt(e.target.closest('.task-item').dataset.id);
            toggleTask(id);
        }
    });

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filter = btn.dataset.filter;
            render();
        });
    });

    // Clear Completed
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.completed);
        render();
    });
}

// Logic Functions
function addTask() {
    const text = taskInputEl.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };

    tasks.unshift(newTask); // Add to top
    taskInputEl.value = '';
    filter = 'all'; // Switch to all to see new task
    render();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        render();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    render();
}

function getFilteredTasks() {
    if (filter === 'active') return tasks.filter(t => !t.completed);
    if (filter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
}

// Rendering
function render() {
    // Update Filter Buttons UI
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Render List
    const visibleTasks = getFilteredTasks();
    taskListEl.innerHTML = '';
    
    visibleTasks.forEach(task => {
        const item = document.createElement('li');
        item.className = `task-item ${task.completed ? 'completed' : ''}`;
        item.dataset.id = task.id;
        
        item.innerHTML = `
            <div class="task-checkbox-wrapper">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="custom-checkbox">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            </div>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        taskListEl.appendChild(item);
    });

    // Update Counts (Footer & Filters)
    const activeCount = tasks.filter(t => !t.completed).length;
    itemsLeftEl.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
    
    countAllEl.textContent = `(${tasks.length})`;
    countActiveEl.textContent = `(${activeCount})`;
    countCompletedEl.textContent = `(${tasks.filter(t => t.completed).length})`;
}
