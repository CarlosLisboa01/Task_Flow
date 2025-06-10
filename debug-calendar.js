// Arquivo de depuração para o calendário
console.log('Iniciando script de depuração do calendário');

// Variáveis globais locais
let currentTasks = [];
let currentDate = new Date();

// Implementação da função fetchTasksForCalendar como fallback
async function fetchTasksForCalendarFallback() {
    try {
        console.log('Executando fetchTasksForCalendar de fallback');
        
        // Verificar se o Supabase está disponível
        if (!window.supabase) {
            console.error('Cliente Supabase não disponível');
            throw new Error('Cliente Supabase não está disponível');
        }
        
        // Verificar autenticação
        console.log('Verificando sessão do usuário...');
        const sessionResult = await window.supabase.auth.getSession();
        console.log('Resultado da sessão:', sessionResult);
        
        if (!sessionResult.data || !sessionResult.data.session) {
            console.error('Sessão inválida ou não encontrada:', sessionResult);
            window.location.href = 'index.html';
            return;
        }
        
        const session = sessionResult.data.session;
        const userId = session.user.id;
        console.log('Buscando tarefas para o calendário, usuário:', userId);
        
        // Buscar tarefas
        const { data, error } = await window.supabase
            .from('tarefas')
            .select('*')
            .eq('usuario_id', userId);
        
        if (error) {
            console.error('Erro detalhado ao buscar tarefas para o calendário:', error);
            throw new Error('Erro ao carregar tarefas: ' + error.message);
        }
        
        console.log(`Carregadas ${data ? data.length : 0} tarefas para o calendário`);
        
        // Armazenar tarefas em variável global
        currentTasks = data || [];
        
        // Remover loader após carregar dados
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.style.display = 'none';
        }
        
        return currentTasks;
    } catch (error) {
        console.error('Erro ao carregar tarefas para o calendário:', error);
        
        // Mostrar mensagem de erro no loader
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.innerHTML = `
                <i class="bi bi-exclamation-triangle" style="color: #dc3545;"></i>
                <p>Erro ao carregar tarefas: ${error.message}</p>
                <button onclick="location.reload()" class="btn btn-sm btn-primary" style="margin-top: 10px;">
                    Tentar novamente
                </button>
            `;
        }
        
        throw error;
    }
}

// Implementação da função renderCalendar como fallback
function renderCalendarFallback() {
    try {
        console.log('Executando renderCalendar de fallback');
        
        // Limpar grid do calendário
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) {
            console.error('Grid do calendário não encontrado no DOM');
            return;
        }
        
        calendarGrid.innerHTML = '';
        
        // Atualizar mês e ano no cabeçalho
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const calendarTitleElement = document.getElementById('calendar-title');
        if (calendarTitleElement) {
            calendarTitleElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
        
        // Calcular primeiro dia do mês
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        console.log(`Renderizando calendário para ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`);
        
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
    if (!currentTasks || !currentTasks.length) return [];
    
    try {
        // Formatação consistente de datas para comparação
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        const dateString = dateObj.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        
        // Filtrar as tarefas pela data
        const tasksForDate = currentTasks.filter(task => {
            if (!task.data_limite) return false;
            
            let taskDate;
            try {
                // Tratar diferentes formatos possíveis da data limite
                if (typeof task.data_limite === 'string') {
                    if (task.data_limite.includes('T')) {
                        taskDate = task.data_limite.split('T')[0]; // Formato ISO
                    } else {
                        taskDate = task.data_limite; // Já está no formato YYYY-MM-DD
                    }
                } else {
                    // Se for um objeto Date, convertê-lo para string
                    taskDate = new Date(task.data_limite).toISOString().split('T')[0];
                }
                
                return taskDate === dateString;
            } catch (err) {
                console.error(`Erro ao processar data da tarefa: ${task.id}`, err);
                return false;
            }
        });
        
        return tasksForDate;
    } catch (error) {
        console.error('Erro ao buscar tarefas para a data:', error);
        return [];
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

// Função para verificar se estamos na página de calendário
function isCalendarPage() {
    const path = window.location.pathname;
    return path.includes('calendario.html') || path.endsWith('calendario') || path.endsWith('calendario/');
}

// Função para inicializar o calendário
async function initializeCalendar() {
    console.log('Função de inicialização de calendário iniciada');
    
    // Verificar se estamos na página de calendário
    if (!isCalendarPage()) {
        console.log('Não estamos na página de calendário, pulando inicialização');
        return;
    }
    
    console.log('Estamos na página de calendário, verificando elementos DOM');
    
    // Verificar elementos principais
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) {
        console.error('Grid do calendário não encontrado!');
        return;
    }
    
    console.log('Grid do calendário encontrado, verificando tarefas');
    
    try {
        // Verificar se o Supabase está disponível
        if (!window.supabase) {
            throw new Error('Cliente Supabase não inicializado!');
        }
        
        // Forçar carregamento de tarefas e renderização do calendário
        console.log('Forçando carregamento de tarefas e renderização do calendário');
        
        // Remover classe de carregamento para garantir que o calendário apareça
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.style.display = 'flex'; // Garantir que o loader esteja visível enquanto carrega
        }
        
        // Usar nossas implementações de fallback
        await fetchTasksForCalendarFallback();
        renderCalendarFallback();
        
        console.log('Calendário inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar calendário:', error);
        
        // Mostrar erro na tela
        const loader = document.querySelector('.loading-calendar');
        if (loader) {
            loader.innerHTML = `
                <i class="bi bi-exclamation-triangle" style="color: #dc3545;"></i>
                <p>Erro ao carregar calendário: ${error.message}</p>
                <button onclick="location.reload()" class="btn btn-sm btn-primary" style="margin-top: 10px;">
                    Tentar novamente
                </button>
            `;
        }
    }
}

// Aguardar que o DOM e todos os scripts estejam carregados
window.addEventListener('load', function() {
    console.log('Página totalmente carregada, iniciando calendário');
    
    // Inicializar após um pequeno atraso para garantir que todos os scripts foram processados
    setTimeout(initializeCalendar, 500);
});

// Tentar inicializar também no DOMContentLoaded para ser mais rápido se possível
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, aguardando inicialização completa');
}); 