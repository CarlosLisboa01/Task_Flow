// Verificar se as variáveis já foram declaradas - usando uma abordagem que evita redeclaração
console.log('Inicializando script do calendário');

// Variáveis específicas para o calendário - não declaramos currentTasks aqui pois já existe em tasks.js
var calendarTasks = []; // Usaremos essa variável específica para o calendário
var currentDate = new Date();
var selectedDay = null;
var dayTasksModal = null;

// Tornar funções disponíveis globalmente
window.fetchTasksForCalendar = fetchTasksForCalendar;
window.renderCalendar = renderCalendar;

// Elementos DOM
let calendarGrid;
let calendarTitleElement;
let prevMonthBtn;
let nextMonthBtn;
let todayBtn;
let calendarAddTaskBtn;
let closeDayModalBtn;
let addTaskToDayBtn;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado - Inicializando calendario.js');
    
    // Verificar se estamos na página de calendário - usar uma verificação mais flexível
    const path = window.location.pathname;
    const isCalendarPage = path.includes('calendario.html') || 
                          path.endsWith('calendario') || 
                          path.endsWith('calendario/') ||
                          path.includes('Anotação_lisboa/calendario.html');
    
    console.log('Caminho atual:', path, 'É página de calendário:', isCalendarPage);
    
    // Inicializar elementos DOM mesmo que não estejamos na página de calendário
    // para que as funções possam ser chamadas de outras páginas
    calendarGrid = document.getElementById('calendar-grid');
    calendarTitleElement = document.getElementById('calendar-title');
    prevMonthBtn = document.getElementById('prev-month');
    nextMonthBtn = document.getElementById('next-month');
    todayBtn = document.getElementById('today-btn');
    calendarAddTaskBtn = document.getElementById('add-task-btn');
    dayTasksModal = document.getElementById('day-tasks-modal');
    closeDayModalBtn = document.getElementById('close-day-modal');
    addTaskToDayBtn = document.getElementById('add-task-to-day');
    
    // Verificar elementos críticos para depuração
    if (isCalendarPage) {
        console.log('Verificando elementos críticos do calendário:');
        console.log('- calendarGrid:', calendarGrid);
        console.log('- calendarTitleElement:', calendarTitleElement);
        console.log('- prevMonthBtn:', prevMonthBtn);
        console.log('- nextMonthBtn:', nextMonthBtn);
        console.log('- calendarAddTaskBtn:', calendarAddTaskBtn);
        
        if (!calendarTitleElement) {
            console.error('ALERTA: Elemento calendar-title não encontrado!');
        }
    }
    
    // Se não estamos na página de calendário, não precisamos continuar
    if (!isCalendarPage) {
        console.log('Não estamos na página de calendário, pulando inicialização');
        return;
    }
    
    console.log('Inicializando página de calendário');
    
    // Verificar se temos os elementos necessários
    if (!calendarGrid) {
        console.error('Elemento calendar-grid não encontrado!');
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                <p>Erro ao inicializar calendário: Elementos HTML necessários não encontrados.</p>
                <button onclick="location.reload()" class="btn btn-sm btn-primary">Tentar novamente</button>
            `;
        }
        return;
    }
    
    // Adicionar event listeners
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
    if (todayBtn) todayBtn.addEventListener('click', goToToday);
    if (calendarAddTaskBtn) calendarAddTaskBtn.addEventListener('click', openNewTaskModal);
    if (closeDayModalBtn) closeDayModalBtn.addEventListener('click', closeDayTasks);
    if (addTaskToDayBtn) addTaskToDayBtn.addEventListener('click', addTaskToSelectedDay);
    
    try {
        // Carregar tarefas e renderizar calendário
        console.log('Iniciando carregamento de tarefas para o calendário');
        await fetchTasksForCalendar();
        console.log('Tarefas carregadas, renderizando calendário');
        renderCalendar();
    } catch (error) {
        console.error('Erro ao inicializar calendário:', error);
        // Remover loader e mostrar mensagem de erro
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                <p>Erro ao carregar calendário: ${error.message || 'Erro desconhecido'}</p>
                <button onclick="location.reload()" class="btn btn-sm btn-primary">Tentar novamente</button>
            `;
        }
    }
});

// Buscar tarefas do usuário
async function fetchTasksForCalendar() {
    try {
        console.log('Iniciando busca de tarefas para o calendário');
        
        // Verificar se o Supabase está disponível
        if (!window.supabaseClient) {
            console.error('Cliente Supabase não disponível');
            // Tentar usar a instância global
            if (window.supabase && !window.supabaseClient) {
                console.log('Tentando inicializar cliente Supabase para o calendário');
                window.supabaseClient = window.supabase.createClient(
                    'https://kvwsfagncbamiezjdlms.supabase.co',
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY'
                );
            } else {
                throw new Error('Cliente Supabase não está disponível e não foi possível inicializar');
            }
        }
        
        // Verificar autenticação
        console.log('Verificando sessão do usuário para o calendário...');
        const sessionResult = await window.supabaseClient.auth.getSession();
        console.log('Resultado da sessão para calendário:', sessionResult);
        
        if (!sessionResult.data || !sessionResult.data.session) {
            console.error('Sessão inválida ou não encontrada:', sessionResult);
            showNotification('Sessão expirada. Redirecionando para login...', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return [];
        }
        
        const session = sessionResult.data.session;
        const userId = session.user.id;
        console.log('Buscando tarefas para o calendário, usuário:', userId);
        
        // Buscar tarefas
        console.log('Executando consulta de tarefas no Supabase...');
        const { data, error } = await window.supabaseClient
            .from('tarefas')
            .select('*')
            .eq('usuario_id', userId);
        
        if (error) {
            console.error('Erro detalhado ao buscar tarefas para o calendário:', error);
            throw new Error('Erro ao carregar tarefas: ' + error.message);
        }
        
        console.log(`Carregadas ${data ? data.length : 0} tarefas para o calendário:`, data);
        
        // Armazenar tarefas em variável global
        calendarTasks = data || [];
        
        // Remover loader após carregar dados
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.style.display = 'none';
        }
        
        return calendarTasks;
    } catch (error) {
        console.error('Erro ao carregar tarefas para o calendário:', error);
        showNotification('Erro ao carregar tarefas: ' + (error.message || 'Erro desconhecido'), 'error');
        
        // Remover loader e mostrar mensagem de erro
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                <p>Erro ao carregar tarefas: ${error.message || 'Erro desconhecido'}</p>
                <button onclick="location.reload()" class="btn btn-sm btn-primary">Tentar novamente</button>
            `;
        }
        
        throw error;
    }
}

// Renderizar o calendário
function renderCalendar() {
    try {
        console.log('Iniciando renderização do calendário');
        
        // Atualizar mês e ano no cabeçalho - fazemos isso primeiro para garantir que pelo menos o título seja atualizado
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        // Atualizar o título do calendário com o mês e ano atuais
        if (calendarTitleElement) {
            const currentMonth = monthNames[currentDate.getMonth()];
            const currentYear = currentDate.getFullYear();
            console.log(`Atualizando título do calendário para: ${currentMonth} ${currentYear}`);
            calendarTitleElement.textContent = `${currentMonth} ${currentYear}`;
        } else {
            console.error('Elemento do título do calendário não encontrado!');
        }
        
        // Limpar grid do calendário
        if (!calendarGrid) {
            console.error('Grid do calendário não encontrado no DOM');
            return;
        }
        
        calendarGrid.innerHTML = '';
        
        // Calcular primeiro dia do mês
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        console.log(`Renderizando calendário para ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`);
        console.log(`Primeiro dia: ${firstDay.toDateString()}, Último dia: ${lastDay.toDateString()}`);
        
        // Calcular dias do mês anterior necessários para completar a primeira semana
        let prevMonthDays = firstDay.getDay();
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        
        // Dias para renderizar
        const daysToRender = [];
        
        // Adicionar dias do mês anterior
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
            daysToRender.push({
                date,
                day,
                currentMonth: false
            });
        }
        
        // Adicionar dias do mês atual
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            daysToRender.push({
                date,
                day,
                currentMonth: true
            });
        }
        
        // Calcular dias do próximo mês necessários para completar a última semana
        const nextMonthDays = 42 - daysToRender.length; // 6 semanas * 7 dias = 42
        
        // Adicionar dias do próximo mês
        for (let day = 1; day <= nextMonthDays; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
            daysToRender.push({
                date,
                day,
                currentMonth: false
            });
        }
        
        console.log(`Total de dias a renderizar: ${daysToRender.length}`);
        
        // Renderizar dias no grid
        daysToRender.forEach(dayInfo => {
            const dayElement = document.createElement('div');
            dayElement.className = `calendar-day${dayInfo.currentMonth ? '' : ' other-month'}`;
            
            // Verificar se é hoje
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const dayDate = new Date(dayInfo.date);
            dayDate.setHours(0, 0, 0, 0);
            
            if (
                today.getDate() === dayDate.getDate() &&
                today.getMonth() === dayDate.getMonth() &&
                today.getFullYear() === dayDate.getFullYear()
            ) {
                dayElement.classList.add('today');
            }
            
            // Adicionar número do dia
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = dayInfo.day;
            dayElement.appendChild(dayNumber);
            
            // Adicionar container para tarefas
            const tasksContainer = document.createElement('div');
            tasksContainer.className = 'day-tasks';
            
            // Encontrar tarefas para este dia
            const dayTasks = getTasksForDate(dayInfo.date);
            
            // Adicionar até 3 tarefas visíveis
            const visibleTasks = dayTasks.slice(0, 3);
            visibleTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item priority-${getPriorityClass(task.prioridade)}`;
                
                if (task.status === 'Concluído') {
                    taskElement.classList.add('status-completed');
                }
                
                taskElement.textContent = task.nome_da_tarefa;
                taskElement.title = task.nome_da_tarefa;
                taskElement.dataset.taskId = task.id;
                
                // Evento de clique para editar a tarefa
                taskElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openTaskModal(task);
                });
                
                tasksContainer.appendChild(taskElement);
            });
            
            // Adicionar indicador de "mais tarefas" se necessário
            if (dayTasks.length > 3) {
                const moreTasksElement = document.createElement('div');
                moreTasksElement.className = 'more-tasks';
                moreTasksElement.textContent = `+ ${dayTasks.length - 3} mais`;
                tasksContainer.appendChild(moreTasksElement);
            }
            
            dayElement.appendChild(tasksContainer);
            
            // Adicionar evento de clique no dia
            dayElement.addEventListener('click', () => {
                openDayTasks(dayInfo.date, dayTasks);
            });
            
            calendarGrid.appendChild(dayElement);
        });
        
        console.log('Calendário renderizado com sucesso!');
        
        // Remover qualquer indicador de carregamento
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao renderizar calendário:', error);
        // Mostrar mensagem de erro
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                <p>Erro ao carregar calendário: ${error.message}</p>
                <button onclick="location.reload()" class="btn btn-sm btn-primary">Tentar novamente</button>
            `;
        }
    }
}

// Obter tarefas para uma data específica
function getTasksForDate(date) {
    // Verificar se temos tarefas para mostrar
    if (!calendarTasks || !calendarTasks.length) {
        console.log('Sem tarefas disponíveis para calendário');
        return [];
    }
    
    try {
        // Formatar a data no mesmo formato que é salvo (YYYY-MM-DD)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        console.log(`Buscando tarefas para a data: ${dateString}`);
        
        // Filtrar as tarefas pela data
        const tasksForDate = calendarTasks.filter(task => {
            if (!task.data_limite) return false;
            
            // Comparar as datas diretamente como strings
            const matches = task.data_limite === dateString;
            
            if (matches) {
                console.log(`Tarefa encontrada: ${task.nome_da_tarefa}, data limite: ${task.data_limite}`);
            }
            return matches;
        });
        
        return tasksForDate;
    } catch (error) {
        console.error('Erro ao buscar tarefas para a data:', error);
        return [];
    }
}

// Abrir modal com tarefas do dia
function openDayTasks(date, tasks) {
    if (!dayTasksModal) return;
    
    // Armazenar dia selecionado
    selectedDay = date;
    
    // Formatar data para o título
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('pt-BR', options);
    
    // Atualizar título do modal
    const modalTitle = document.getElementById('day-modal-title');
    if (modalTitle) {
        modalTitle.textContent = `Tarefas para ${formattedDate}`;
    }
    
    // Atualizar lista de tarefas
    const tasksList = document.getElementById('day-tasks-list');
    if (tasksList) {
        tasksList.innerHTML = '';
        
        if (!tasks.length) {
            // Exibir mensagem de nenhuma tarefa
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-day-tasks';
            emptyState.innerHTML = `
                <i class="bi bi-calendar-x"></i>
                <p>Nenhuma tarefa para este dia.</p>
            `;
            tasksList.appendChild(emptyState);
        } else {
            // Renderizar tarefas
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `day-task-item priority-${getPriorityClass(task.prioridade)}`;
                
                if (task.status === 'Concluído') {
                    taskItem.classList.add('status-completed');
                }
                
                // Ícone de status
                let statusIcon = '';
                if (task.status === 'Não iniciado') {
                    statusIcon = '<i class="bi bi-circle"></i>';
                } else if (task.status === 'Em andamento') {
                    statusIcon = '<i class="bi bi-play-circle"></i>';
                } else if (task.status === 'Concluído') {
                    statusIcon = '<i class="bi bi-check-circle-fill"></i>';
                }
                
                taskItem.innerHTML = `
                    <div class="task-status-icon status-${getStatusClass(task.status)}">
                        ${statusIcon}
                    </div>
                    <div class="task-content">
                        <div class="task-title">${task.nome_da_tarefa}</div>
                        <div class="task-details">
                            ${task.prioridade} · ${task.tipo_de_tarefa}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn edit-task-btn" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="task-action-btn delete-task-btn" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
                
                // Adicionar eventos aos botões
                const editBtn = taskItem.querySelector('.edit-task-btn');
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openTaskModal(task);
                        closeDayTasks();
                    });
                }
                
                const deleteBtn = taskItem.querySelector('.delete-task-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                            deleteTask(task.id);
                        }
                    });
                }
                
                // Clicar na tarefa também deve abrir para edição
                taskItem.addEventListener('click', () => {
                    openTaskModal(task);
                    closeDayTasks();
                });
                
                tasksList.appendChild(taskItem);
            });
        }
    }
    
    // Exibir modal
    dayTasksModal.classList.add('active');
}

// Fechar modal de tarefas do dia
function closeDayTasks() {
    if (dayTasksModal) {
        dayTasksModal.classList.remove('active');
    }
}

// Adicionar nova tarefa para o dia selecionado
function addTaskToSelectedDay() {
    if (!selectedDay) return;
    
    // Abrir modal de nova tarefa com a data já preenchida
    openTaskModalWithDate(selectedDay);
    
    // Fechar modal de tarefas do dia
    closeDayTasks();
}

// Abrir modal de nova tarefa com data pré-preenchida
function openTaskModalWithDate(date) {
    // Verificar se a função showTaskModal está disponível (do arquivo fix-modal.js)
    if (typeof window.showTaskModal === 'function') {
        window.showTaskModal();
        
        // Preencher a data
        setTimeout(() => {
            const dateInput = document.getElementById('task-due-date');
            if (dateInput) {
                const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
                dateInput.value = formattedDate;
            }
        }, 100);
    } else {
        console.error('Função showTaskModal não encontrada');
        
        // Fallback usando a função original se estiver disponível
        if (typeof openTaskModal === 'function') {
            openTaskModal();
            
            setTimeout(() => {
                const dateInput = document.getElementById('task-due-date');
                if (dateInput) {
                    const formattedDate = date.toISOString().split('T')[0];
                    dateInput.value = formattedDate;
                }
            }, 100);
        }
    }
}

// Abrir modal de nova tarefa
function openNewTaskModal() {
    if (typeof window.showTaskModal === 'function') {
        window.showTaskModal();
    } else if (typeof openTaskModal === 'function') {
        openTaskModal();
    }
}

// Excluir tarefa
async function deleteTask(taskId) {
    try {
        // Verificar autenticação
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            window.location.href = 'index.html';
            return;
        }
        
        const userId = session.user.id;
        
        // Excluir tarefa
        const { error } = await window.supabaseClient
            .from('tarefas')
            .delete()
            .eq('id', taskId)
            .eq('usuario_id', userId);
        
        if (error) {
            console.error('Erro ao excluir tarefa:', error);
            showNotification(error.message, 'error');
            return;
        }
        
        // Atualizar lista de tarefas e fechar modal
        await fetchTasksForCalendar();
        renderCalendar();
        closeDayTasks();
        
        showNotification('Tarefa excluída com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        showNotification('Ocorreu um erro ao excluir a tarefa.', 'error');
    }
}

// Mudar para o mês anterior ou próximo
function changeMonth(delta) {
    console.log(`Mudando mês: delta = ${delta}`);
    
    // Adicionar classe de transição para animação suave
    if (calendarGrid) {
        calendarGrid.classList.add('month-transition');
        
        // Aguardar um pouco para a animação iniciar antes de mudar os dados
        setTimeout(() => {
            // Atualizar a data
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
            
            // Atualizar o título do calendário imediatamente para feedback visual rápido
            const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            
            if (calendarTitleElement) {
                const currentMonth = monthNames[currentDate.getMonth()];
                const currentYear = currentDate.getFullYear();
                console.log(`Atualizando título do calendário para: ${currentMonth} ${currentYear}`);
                calendarTitleElement.textContent = `${currentMonth} ${currentYear}`;
            }
            
            // Renderizar o calendário com os novos dados
            renderCalendar();
            
            // Remover a classe de transição após a renderização
            setTimeout(() => {
                calendarGrid.classList.remove('month-transition');
            }, 300);
        }, 150);
    } else {
        // Fallback se não encontrar o grid
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
        
        // Atualizar o título do calendário
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        if (calendarTitleElement) {
            const currentMonth = monthNames[currentDate.getMonth()];
            const currentYear = currentDate.getFullYear();
            calendarTitleElement.textContent = `${currentMonth} ${currentYear}`;
        }
        
        renderCalendar();
    }
}

// Ir para o mês atual
function goToToday() {
    console.log('Voltando para o mês atual');
    
    // Adicionar classe de transição para animação suave
    if (calendarGrid) {
        calendarGrid.classList.add('month-transition');
        
        // Aguardar um pouco para a animação iniciar antes de mudar os dados
        setTimeout(() => {
            // Atualizar a data
            currentDate = new Date();
            
            // Atualizar o título do calendário imediatamente para feedback visual rápido
            const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            
            if (calendarTitleElement) {
                const currentMonth = monthNames[currentDate.getMonth()];
                const currentYear = currentDate.getFullYear();
                console.log(`Atualizando título do calendário para hoje: ${currentMonth} ${currentYear}`);
                calendarTitleElement.textContent = `${currentMonth} ${currentYear}`;
            }
            
            // Renderizar o calendário com os novos dados
            renderCalendar();
            
            // Remover a classe de transição após a renderização
            setTimeout(() => {
                calendarGrid.classList.remove('month-transition');
            }, 300);
        }, 150);
    } else {
        // Fallback se não encontrar o grid
        currentDate = new Date();
        
        // Atualizar o título do calendário
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        if (calendarTitleElement) {
            const currentMonth = monthNames[currentDate.getMonth()];
            const currentYear = currentDate.getFullYear();
            calendarTitleElement.textContent = `${currentMonth} ${currentYear}`;
        }
        
        renderCalendar();
    }
}

// Obter classe CSS para o status
function getStatusClass(status) {
    switch (status) {
        case 'Não iniciado':
            return 'not-started';
        case 'Em andamento':
            return 'in-progress';
        case 'Concluído':
            return 'completed';
        default:
            return '';
    }
}

// Obter classe CSS para a prioridade
function getPriorityClass(priority) {
    switch (priority) {
        case 'Alta':
            return 'high';
        case 'Média':
            return 'medium';
        case 'Baixa':
            return 'low';
        default:
            return '';
    }
}

// Função para exibir notificações
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.classList.remove('success', 'error');
        notification.classList.add(type, 'show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
} 