function toggleComplete(id, btnElement) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        // Cek apakah sedang di tab filter (bukan All) atau sedang search
        // Karena di kondisi ini item harus menghilang (slide out)
        if (currentFilter !== 'all') {
            const listItem = btnElement.closest('li');
            
            // --- FIX PENTING DI SINI ---
            // Hapus class 'today-task' agar animasi berdenyut BERHENTI
            listItem.classList.remove('today-task'); 
            listItem.classList.remove('animate-enter');
            
            // Baru jalankan animasi keluar
            listItem.classList.add('animate-leave');

            listItem.addEventListener('animationend', () => {
                todo.completed = !todo.completed;
                saveToLocal();
                renderTodos();
            });
        } else {
            // Jika di tab All, langsung update saja (tidak perlu slide out)
            todo.completed = !todo.completed;
            saveToLocal();
            renderTodos();
        }
    }
}

function deleteTodo(id, btnElement) {
    if(confirm('Delete this task?')) {
        const listItem = btnElement.closest('li');
        
        // --- FIX PENTING DI SINI ---
        // Hapus class 'today-task' agar animasi berdenyut BERHENTI
        listItem.classList.remove('today-task');
        listItem.classList.remove('animate-enter');
        
        // Baru jalankan animasi keluar
        listItem.classList.add('animate-leave');

        listItem.addEventListener('animationend', () => {
            todos = todos.filter(t => t.id !== id);
            saveToLocal();
            renderTodos();
        });
    }
}