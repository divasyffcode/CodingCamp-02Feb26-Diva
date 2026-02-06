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
        } else if (!date) {
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

    // 1. FILTER STATUS
    let filteredTodos = todos;
    if (currentFilter === 'pending') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // 2. AUTO-SORTING (Tanggal Terdekat/Lewat Paling Atas)
    filteredTodos.sort((a, b) => {
        if (!a.date) return 1; 
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date); 
    });

    // 3. TAMPILAN KOSONG
    if (filteredTodos.length === 0) {
        todoList.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex'); // Pakai flex biar rata tengah
    } else {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        todoList.classList.remove('hidden');
    }

    // 4. RENDER ITEM
    filteredTodos.forEach(todo => {
        // --- LOGIKA TANGGAL ---
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // Batas Reminder (3 Hari ke depan)
        const reminderLimit = new Date(today);
        reminderLimit.setDate(today.getDate() + 3);

        let dateDisplay = '';
        let isUrgent = false; // Flag untuk warna merah
        let isPulse = false;  // Flag untuk animasi denyut (khusus hari ini)

        if (todo.date) {
            const todoDate = new Date(todo.date);
            todoDate.setHours(0,0,0,0);

            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            dateDisplay = new Date(todo.date).toLocaleDateString('id-ID', options);

            if (!todo.completed) {
                if (todoDate < today) {
                    // Kasus 1: Sudah Lewat (Overdue) -> MERAH
                    isUrgent = true;
                    dateDisplay += ' (Overdue)';
                } else if (todoDate.getTime() === today.getTime()) {
                    // Kasus 2: Hari Ini -> MERAH + BERDENYUT
                    isUrgent = true;
                    isPulse = true;
                    dateDisplay = 'Today';
                } else if (todoDate <= reminderLimit) {
                    // Kasus 3: Kurang dari atau sama dengan 3 Hari Lagi -> MERAH
                    isUrgent = true;
                }
                // Selain itu (masih lama) -> Tetap warna normal (putih/abu)
            }
        }

        // --- DEFINISI STYLE WARNA ---
        // Default (Normal)
        let containerClass = 'border-slate-100'; 
        let textClass = 'text-slate-800';        
        let dateClass = 'text-slate-400';        
        let bgClass = 'bg-white';                
        let animClass = '';

        if (!todo.completed) {
            if (isUrgent) {
                // JIKA URGENT (H-3, Hari Ini, atau Telat) -> WARNA MERAH
                containerClass = 'border-rose-500 urgent-task'; // Border kiri tebal merah
                bgClass = 'bg-rose-50'; // Background agak pink
                textClass = 'text-rose-800 font-bold';
                dateClass = 'text-rose-600 font-bold';
                
                if (isPulse) {
                    animClass = 'today-task'; // Animasi berdenyut khusus hari ini
                }
            }
        } else {
            // JIKA SELESAI
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
        
        // Jika sedang di tab 'Pending' atau 'Done', kita jalankan animasi slide out
        if (currentFilter !== 'all') {
            // Hapus animasi pulse (jika ada) agar tidak mengganggu animationend
            listItem.classList.remove('today-task');
            listItem.classList.remove('animate-enter');
            
            // Tambahkan animasi keluar
            listItem.classList.add('animate-leave');

            // Gunakan { once: true } agar event listener langsung terhapus setelah jalan
            listItem.addEventListener('animationend', () => {
                todo.completed = !todo.completed;
                saveToLocal();
                renderTodos();
            }, { once: true });
            
        } else {
            // Jika di tab 'All', langsung update tanpa slide out
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
    if (confirm('Are you sure you want to delete ALL tasks?')) {
        todos = [];
        saveToLocal();
        renderTodos();
    }
}

function saveToLocal() {
    localStorage.setItem('todos', JSON.stringify(todos));
}