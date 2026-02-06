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
        // Update tampilan tab aktif
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
        alert("Please enter a task!"); // Bisa diganti custom alert
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        date: date, // Format YYYY-MM-DD
        completed: false
    };

    todos.push(newTodo);
    saveToLocal();
    renderTodos();
    
    // Reset Form
    todoInput.value = '';
    dateInput.value = '';
}

function renderTodos() {
    todoList.innerHTML = '';

    // 1. FILTERING
    let filteredTodos = todos;
    if (currentFilter === 'pending') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // 2. SORTING (Logika Urutan Tanggal)
    // Prioritas: Tanggal Terdekat/Lewat -> Tanggal Nanti -> Tanpa Tanggal
    filteredTodos.sort((a, b) => {
        if (!a.date) return 1; // Jika A tidak ada tanggal, taruh bawah
        if (!b.date) return -1; // Jika B tidak ada tanggal, A di atas
        return new Date(a.date) - new Date(b.date); // Urutkan ascending (terkecil/terdekat dulu)
    });

    // Cek Kosong
    if (filteredTodos.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    // 3. RENDERING
    filteredTodos.forEach(todo => {
        // Hitung status urgensi tanggal
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let dateDisplay = '';
        let isUrgent = false;
        let isToday = false;

        if (todo.date) {
            const todoDate = new Date(todo.date);
            todoDate.setHours(0,0,0,0); // Reset jam agar perbandingan adil

            // Format tanggal cantik
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            dateDisplay = new Date(todo.date).toLocaleDateString('id-ID', options);

            // Logika Warna Merah
            if (!todo.completed) {
                if (todoDate < today) {
                    isUrgent = true; // Sudah lewat
                    dateDisplay += ' (Overdue)';
                } else if (todoDate.getTime() === today.getTime()) {
                    isUrgent = true;
                    isToday = true; // Hari ini
                    dateDisplay = 'Today';
                }
            }
        }

        // Tentukan Class CSS berdasarkan kondisi
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
    const todo = todos.find(t => t.id === id);
    if (todo) {
        // Jika sedang di tab filter (bukan All), kita kasih animasi keluar dulu
        if (currentFilter !== 'all') {
            const listItem = btnElement.closest('li');
            listItem.classList.remove('animate-enter');
            listItem.classList.add('animate-leave');

            // Tunggu animasi selesai baru update data
            listItem.addEventListener('animationend', () => {
                todo.completed = !todo.completed;
                saveToLocal();
                renderTodos();
            });
        } else {
            // Jika di tab All, update langsung tanpa swipe hilang
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