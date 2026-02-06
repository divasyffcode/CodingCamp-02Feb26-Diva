// --- VARIABLES ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', renderTodos);
todoForm.addEventListener('submit', addTodo);

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active-tab'));
        e.target.classList.add('active-tab');
        currentFilter = e.target.getAttribute('data-filter');
        renderTodos();
    });
});

// --- FUNCTIONS ---

function addTodo(e) {
    e.preventDefault();
    
    const text = todoInput.value.trim();
    const date = dateInput.value;

    if (!text) {
        alert("Please enter a task!");
        return;
    }

    // PERBAIKAN: Menambahkan Random Number agar ID tidak pernah kembar
    const newTodo = {
        id: Date.now() + Math.floor(Math.random() * 1000), 
        text: text,
        date: date, 
        completed: false
    };

    todos.push(newTodo);
    saveToLocal();
    renderTodos();
    
    todoInput.value = '';
    dateInput.value = '';
}

function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos;
    if (currentFilter === 'pending') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // Sorting
    filteredTodos.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });

    if (filteredTodos.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filteredTodos.forEach(todo => {
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let dateDisplay = '';
        let isUrgent = false;
        let isToday = false;

        if (todo.date) {
            const todoDate = new Date(todo.date);
            todoDate.setHours(0,0,0,0);

            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            dateDisplay = new Date(todo.date).toLocaleDateString('id-ID', options);

            if (!todo.completed) {
                if (todoDate < today) {
                    isUrgent = true;
                    dateDisplay += ' (Overdue)';
                } else if (todoDate.getTime() === today.getTime()) {
                    isUrgent = true;
                    isToday = true;
                    dateDisplay = 'Today';
                }
            }
        }

        const li = document.createElement('li');
        li.className = `bg-white border rounded-xl p-4 flex justify-between items-center shadow-sm transition-all hover:shadow-md animate-enter ${isUrgent ? 'urgent-task border-red-300' : 'border-slate-100'} ${isToday ? 'today-task' : ''} ${todo.completed ? 'opacity-60 bg-slate-50' : ''}`;
        
        li.innerHTML = `
            <div class="flex items-center gap-4 flex-1">
                <button onclick="toggleComplete(${todo.id}, this)" 
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-brand'}">
                    <i class="fas fa-check text-xs"></i>
                </button>
                
                <div class="flex flex-col">
                    <span class="font-medium text-slate-800 ${todo.completed ? 'line-through text-slate-400' : ''}">${todo.text}</span>
                    <span class="text-xs ${isUrgent ? 'text-red-500 font-bold' : 'text-slate-400'}">
                        ${dateDisplay ? `<i class="far fa-calendar-alt mr-1"></i>${dateDisplay}` : ''}
                    </span>
                </div>
            </div>

            <button onclick="deleteTodo(${todo.id}, this)" class="text-slate-300 hover:text-red-500 transition-colors px-2">
                <i class="fas fa-trash"></i>
            </button>
        `;

        todoList.appendChild(li);
    });
}

function toggleComplete(id, btnElement) {
    // Mencari todo berdasarkan ID yang spesifik
    const todo = todos.find(t => t.id === id);
    if (todo) {
        if (currentFilter !== 'all') {
            const listItem = btnElement.closest('li');
            listItem.classList.remove('animate-enter');
            listItem.classList.add('animate-leave');

            listItem.addEventListener('animationend', () => {
                todo.completed = !todo.completed;
                saveToLocal();
                renderTodos();
            });
        } else {
            todo.completed = !todo.completed;
            saveToLocal();
            renderTodos();
        }
    }
}

function deleteTodo(id, btnElement) {
    if(confirm('Delete this task?')) {
        const listItem = btnElement.closest('li');
        listItem.classList.add('animate-leave');

        listItem.addEventListener('animationend', () => {
            todos = todos.filter(t => t.id !== id);
            saveToLocal();
            renderTodos();
        });
    }
}

function clearAll() {
    if (confirm('Are you sure you want to delete ALL tasks?')) {
        todos = [];
        saveToLocal();
        renderTodos();
    }
}

function saveToLocal() {
    localStorage.setItem('todos', JSON.stringify(todos));
}