// Selektor Elemen
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.querySelector('.todo-list');
const emptyMsg = document.getElementById('empty-msg');
const filterOptions = document.querySelectorAll('.filters span');

// Event Listeners
document.addEventListener('DOMContentLoaded', loadTodos);
addBtn.addEventListener('click', addTodo);
todoList.addEventListener('click', deleteCheck);

// Fungsi Tambah Todo [cite: 31]
function addTodo(event) {
    event.preventDefault(); // Mencegah form submit default

    // Validasi Input [cite: 32]
    if (todoInput.value === '') {
        todoInput.classList.add('error-border');
        setTimeout(() => todoInput.classList.remove('error-border'), 500);
        return;
    }

    // Buat Object Todo
    const todoDiv = document.createElement('li');
    todoDiv.classList.add('todo-item');

    // Struktur HTML Item
    // Kita gunakan innerHTML agar lebih singkat
    todoDiv.innerHTML = `
        <div class="todo-content">
            <span class="todo-text">${todoInput.value}</span>
            <span class="todo-date">${dateInput.value ? dateInput.value : 'No Date'}</span>
        </div>
        <div class="actions">
            <button class="check-btn"><i class="fas fa-check"></i></button>
            <button class="trash-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Masukkan ke List
    todoList.appendChild(todoDiv);

    // Simpan ke Local Storage (Improvement)
    saveLocalTodos({
        text: todoInput.value,
        date: dateInput.value,
        completed: false
    });

    // Reset Input
    todoInput.value = '';
    dateInput.value = '';
    checkEmpty();
}

// Fungsi Hapus dan Selesai (Check) [cite: 31]
function deleteCheck(e) {
    const item = e.target;
    // Cari elemen induk terdekat (tombol -> li)
    const todo = item.closest('.todo-item'); 

    // Jika tombol hapus diklik
    if (item.classList.contains('trash-btn') || item.parentElement.classList.contains('trash-btn')) {
        todo.style.animation = 'slideIn 0.3s reverse'; // Animasi keluar
        removeLocalTodos(todo);
        todo.addEventListener('animationend', function() {
            todo.remove();
            checkEmpty();
        });
    }

    // Jika tombol check diklik
    if (item.classList.contains('check-btn') || item.parentElement.classList.contains('check-btn')) {
        todo.classList.toggle('completed');
        updateLocalStatus(todo);
    }
}

// Fungsi Filter (All, Pending, Completed) [cite: 31]
function filterTodo(status) {
    const todos = todoList.childNodes;
    
    // Update tombol aktif
    filterOptions.forEach(span => span.classList.remove('active'));
    event.target.classList.add('active');

    todos.forEach(function(todo) {
        if (todo.nodeType === 1) { // Pastikan elemen HTML
            switch (status) {
                case 'all':
                    todo.style.display = 'flex';
                    break;
                case 'completed':
                    if (todo.classList.contains('completed')) {
                        todo.style.display = 'flex';
                    } else {
                        todo.style.display = 'none';
                    }
                    break;
                case 'pending':
                    if (!todo.classList.contains('completed')) {
                        todo.style.display = 'flex';
                    } else {
                        todo.style.display = 'none';
                    }
                    break;
            }
        }
    });
}

// Fungsi Hapus Semua
function clearAll() {
    if(confirm("Yakin ingin menghapus semua tugas?")) {
        todoList.innerHTML = '';
        localStorage.clear();
        checkEmpty();
    }
}

// Cek jika list kosong untuk menampilkan pesan
function checkEmpty() {
    if (todoList.children.length === 0) {
        emptyMsg.style.display = 'block';
    } else {
        emptyMsg.style.display = 'none';
    }
}

// --- LOCAL STORAGE (Agar data tidak hilang saat refresh) ---

function saveLocalTodos(todo) {
    let todos;
    if (localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    let todos;
    if (localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    
    todos.forEach(function(todo) {
        const todoDiv = document.createElement('li');
        todoDiv.classList.add('todo-item');
        if (todo.completed) todoDiv.classList.add('completed');

        todoDiv.innerHTML = `
            <div class="todo-content">
                <span class="todo-text">${todo.text}</span>
                <span class="todo-date">${todo.date ? todo.date : 'No Date'}</span>
            </div>
            <div class="actions">
                <button class="check-btn"><i class="fas fa-check"></i></button>
                <button class="trash-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        todoList.appendChild(todoDiv);
    });
    checkEmpty();
}

function removeLocalTodos(todo) {
    let todos;
    if (localStorage.getItem('todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('todos'));
    }
    // Cari index berdasarkan teks
    const todoText = todo.querySelector('.todo-text').innerText;
    todos.splice(todos.findIndex(item => item.text === todoText), 1);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function updateLocalStatus(todo) {
    let todos = JSON.parse(localStorage.getItem('todos'));
    const todoText = todo.querySelector('.todo-text').innerText;
    const index = todos.findIndex(item => item.text === todoText);
    
    if (index !== -1) {
        todos[index].completed = todo.classList.contains('completed');
        localStorage.setItem('todos', JSON.stringify(todos));
    }
}