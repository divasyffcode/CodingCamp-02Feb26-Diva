const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', renderTodos);

if (todoForm) {
    todoForm.addEventListener('submit', addTodo);
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active-tab'));
        e.target.classList.add('active-tab');
        currentFilter = e.target.getAttribute('data-filter');
        renderTodos();
    });
});

function addTodo(e) {
    e.preventDefault();
    
    const text = todoInput.value.trim();
    const date = dateInput.value;

    if (!text || !date) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Information',
            text: 'Please fill in both the task and the due date!',
            confirmButtonColor: '#4F46E5',
            confirmButtonText: 'Got it!'
        });

        if (!text) {
            todoInput.focus();
        } else {
            dateInput.focus();
        }
        
        return; 
    }

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

    filteredTodos.sort((a, b) => {
        if (!a.date) return 1; 
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date); 
    });

    if (filteredTodos.length === 0) {
        todoList.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex'); 
    } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        todoList.classList.remove('hidden');
    }

    filteredTodos.forEach(todo => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const reminderLimit = new Date(today);
        reminderLimit.setDate(today.getDate() + 3);

        let dateDisplay = '';
        let isUrgent = false; 
        let isPulse = false;  

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
                    isPulse = true;
                    dateDisplay = 'Today';
                } else if (todoDate <= reminderLimit) {
                    isUrgent = true;
                }
                
            }
        }

        let containerClass = 'border-slate-100'; 
        let textClass = 'text-slate-800';        
        let dateClass = 'text-slate-400';        
        let bgClass = 'bg-white';                
        let animClass = '';

        if (!todo.completed) {
            if (isUrgent) {
                containerClass = 'border-rose-500 urgent-task'; 
                bgClass = 'bg-rose-50'; 
                textClass = 'text-rose-800 font-bold';
                dateClass = 'text-rose-600 font-bold';
                
                if (isPulse) {
                    animClass = 'today-task'; 
                }
            }
        } else {
            bgClass = 'bg-slate-50';
            textClass = 'line-through text-slate-400 font-normal';
            dateClass = '!text-slate-300';
            containerClass = 'border-slate-100 opacity-60';
        }

        const li = document.createElement('li');
        li.className = `${bgClass} ${containerClass} border rounded-xl p-4 flex justify-between items-center shadow-sm transition-all hover:shadow-md animate-enter ${animClass}`;
        
        li.innerHTML = `
            <div class="flex items-center gap-4 flex-1">
                <button onclick="toggleComplete(${todo.id}, this)" 
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-brand'}">
                    <i class="fas fa-check text-xs"></i>
                </button>
                
                <div class="flex flex-col">
                    <span class="${textClass}">${todo.text}</span>
                    <span class="text-xs ${dateClass}">
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
    const todo = todos.find(t => t.id === id);
    if (todo) {
        const listItem = btnElement.closest('li');
        
        if (currentFilter !== 'all') {
            listItem.classList.remove('today-task');
            listItem.classList.remove('animate-enter');
            listItem.classList.add('animate-leave');
            listItem.addEventListener('animationend', () => {
                todo.completed = !todo.completed;
                saveToLocal();
                renderTodos();
            }, { once: true });
            
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
        listItem.classList.remove('animate-enter');
        listItem.classList.add('animate-leave');

        listItem.addEventListener('animationend', () => {
            todos = todos.filter(t => t.id !== id);
            saveToLocal();
            renderTodos();
        });
    }
}

function clearAll() {
    if (confirm('Are you sure you want to DELETE ALL tasks?')) {
        todos = [];
        saveToLocal();
        renderTodos();
    }
}

function saveToLocal() {
    localStorage.setItem('todos', JSON.stringify(todos));
}