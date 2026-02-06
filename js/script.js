// --- VARIABLES ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

// Load Data dari LocalStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', renderTodos);

// Cek apakah form ada sebelum menambah event listener (mencegah error)
if (todoForm) {
    todoForm.addEventListener('submit', addTodo);
}

// Event Listener untuk Tombol Filter
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Reset class active
        filterBtns.forEach(b => b.classList.remove('active-tab'));
        // Set class active ke tombol yang diklik
        e.target.classList.add('active-tab');
        
        currentFilter = e.target.getAttribute('data-filter');
        renderTodos();
    });
});

// --- FUNCTIONS ---

function addTodo(e) {
    e.preventDefault(); // Mencegah refresh halaman
    
    const text = todoInput.value.trim();
    const date = dateInput.value;

    if (!text) {
        alert("Please enter a task!");
        return;
    }

    // Membuat ID unik menggunakan timestamp + random number
    const newTodo = {
        id: Date.now() + Math.floor(Math.random() * 1000), 
        text: text,
        date: date, 
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

    // 1. FILTER DATA
    let filteredTodos = todos;
    if (currentFilter === 'pending') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // 2. SORTING (Tanggal Terdekat/Lewat Paling Atas)
    filteredTodos.sort((a, b) => {
        if (!a.date) return 1; // Yang tidak ada tanggal taruh bawah
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date); // Ascending
    });

    // 3. LOGIKA TAMPILAN KOSONG (Fix Masalah Border & Posisi Tengah)
    if (filteredTodos.length === 0) {
        // Sembunyikan List agar bordernya hilang
        todoList.classList.add('hidden');
        
        // Tampilkan Empty State dan aktifkan Flexbox agar rata tengah
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex'); 
    } else {
        // Sembunyikan Empty State
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        
        // Tampilkan List
        todoList.classList.remove('hidden');
    }

    // 4. LOOP & RENDER ITEM
    filteredTodos.forEach(todo => {
        // Setup Tanggal Hari Ini & 3 Hari ke Depan
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);

        let dateDisplay = '';
        let isOverdue = false; 
        let isToday = false;
        let isUpcoming = false;

        if (todo.date) {
            const todoDate = new Date(todo.date);
            todoDate.setHours(0,0,0,0);

            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            dateDisplay = new Date(todo.date).toLocaleDateString('id-ID', options);

            if (!todo.completed) {
                if (todoDate < today) {
                    // Telat (Overdue)
                    isOverdue = true;
                    dateDisplay += ' (Overdue)';
                } else if (todoDate.getTime() === today.getTime()) {
                    // Hari Ini (Today)
                    isToday = true;
                    dateDisplay = 'Today';
                } else if (todoDate > today && todoDate <= threeDaysLater) {
                    // Mendekati Deadline (Upcoming)
                    isUpcoming = true;
                }
            }
        }

        // Setup Warna & Style Berdasarkan Prioritas
        let containerClass = 'border-slate-100'; 
        let textClass = 'text-slate-800';        
        let dateClass = 'text-slate-400';        
        let bgClass = 'bg-white';                
        let pulseEffect = '';

        if (!todo.completed) {
            if (isOverdue) {
                // Style: Telat (Merah Gelap + Background Pink)
                containerClass = 'border-rose-500 urgent-task'; 
                bgClass = 'bg-rose-50'; 
                textClass = 'text-rose-800 font-bold';
                dateClass = 'text-rose-600 font-bold';
            } else if (isToday) {
                // Style: Hari Ini (Merah Cerah + Berdenyut)
                containerClass = 'border-red-500';
                bgClass = 'bg-white'; 
                textClass = 'text-red-600 font-bold';
                dateClass = 'text-red-500 font-bold';
                pulseEffect = 'today-task'; 
            } else if (isUpcoming) {
                // Style: Mendekati (Oranye)
                containerClass = 'border-orange-300';
                bgClass = 'bg-orange-50';
                textClass = 'text-orange-700 font-medium';
                dateClass = 'text-orange-600 font-bold';
            }
        } else {
            // Style: Selesai (Abu-abu & Coret)
            bgClass = 'bg-slate-50';
            textClass = 'line-through text-slate-400 font-normal';
            dateClass = '!text-slate-300';
            containerClass = 'border-slate-100 opacity-60';
        }

        // Buat Elemen LI
        const li = document.createElement('li');
        li.className = `${bgClass} ${containerClass} border rounded-xl p-4 flex justify-between items-center shadow-sm transition-all hover:shadow-md animate-enter ${pulseEffect}`;
        
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
        // Animasi Swipe saat pindah tab
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
        // Animasi keluar sebelum hapus
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