function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos;
    if (currentFilter === 'pending') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // SORTING: Tanggal Terdekat/Lewat Paling Atas
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
        // Setup Tanggal Hari Ini (Jam dinolkan agar adil)
        const today = new Date();
        today.setHours(0,0,0,0);
        
        // Setup Tanggal 3 Hari ke Depan
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);

        let dateDisplay = '';
        
        // Status Flags
        let isOverdue = false;  // Lewat tenggat
        let isToday = false;    // Hari ini
        let isUpcoming = false; // 3 hari ke depan

        if (todo.date) {
            const todoDate = new Date(todo.date);
            todoDate.setHours(0,0,0,0);

            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            dateDisplay = new Date(todo.date).toLocaleDateString('id-ID', options);

            if (!todo.completed) {
                if (todoDate < today) {
                    // KONDISI 1: SUDAH LEWAT (OVERDUE)
                    isOverdue = true;
                    dateDisplay += ' (Overdue)';
                } else if (todoDate.getTime() === today.getTime()) {
                    // KONDISI 2: HARI INI (TODAY)
                    isToday = true;
                    dateDisplay = 'Today';
                } else if (todoDate > today && todoDate <= threeDaysLater) {
                    // KONDISI 3: MENDEKATI (UPCOMING 3 DAYS)
                    isUpcoming = true;
                }
            }
        }

        // --- LOGIKA PEWARNAAN ---
        
        let containerClass = 'border-slate-100'; // Default border
        let textClass = 'text-slate-800';        // Default text
        let dateClass = 'text-slate-400';        // Default date color
        let bgClass = 'bg-white';                // Default background
        let pulseEffect = '';

        if (!todo.completed) {
            if (isOverdue) {
                // Style Overdue: Merah Gelap & Background Merah Muda (Tanda Bahaya)
                containerClass = 'border-rose-500 urgent-task'; // Class urgent-task memberi border kiri tebal
                bgClass = 'bg-rose-50'; 
                textClass = 'text-rose-800 font-bold';
                dateClass = 'text-rose-600 font-bold';
            } else if (isToday) {
                // Style Today: Merah Cerah & Berdenyut (Action Now)
                containerClass = 'border-red-500';
                bgClass = 'bg-white'; // Tetap putih biar bersih, tapi border merah
                textClass = 'text-red-600 font-bold';
                dateClass = 'text-red-500 font-bold';
                pulseEffect = 'today-task'; // Efek denyut
            } else if (isUpcoming) {
                // Style Upcoming: Oranye/Amber (Warning)
                containerClass = 'border-orange-300';
                bgClass = 'bg-orange-50';
                textClass = 'text-orange-700 font-medium';
                dateClass = 'text-orange-600 font-bold';
            }
        } else {
            // Style Completed (Selesai)
            bgClass = 'bg-slate-50';
            textClass = 'line-through text-slate-400 font-normal';
            dateClass = '!text-slate-300';
            containerClass = 'border-slate-100 opacity-60';
        }

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