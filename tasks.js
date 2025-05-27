// Variáveis globais
let currentTasks = [];
let currentFilters = {
    status: '',
    priority: '',
    type: '',
    search: ''
};
let isSubmitting = false; // Flag para evitar submissões múltiplas
let taskTypes = []; // Para armazenar os tipos de tarefas

// Inicialização do cliente Supabase - exportado para window para acesso global
// Verificar se o Supabase já está inicializado para evitar múltiplas instâncias
if (!window.supabaseClient) {
    window.SUPABASE_URL = 'https://kvwsfagncbamiezjdlms.supabase.co';
    window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY';
    console.log('Inicializando cliente Supabase em tasks.js');
    window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} else {
    console.log('Cliente Supabase já inicializado, reusando instância existente');
}

// Declarações de variáveis para elementos do DOM
let tasksTbody;
let addTaskBtn;
let taskModal;
let closeModalBtn;
let taskForm;
let deleteTaskBtn;
let modalTitle;
let statusFilter;
let priorityFilter;
let typeFilter;
let searchInput;
let clearFiltersBtn;
let addTaskTypeBtn;
let modalAddTaskTypeBtn;
let taskTypeModal;
let closeTypeModalBtn;
let taskTypeForm;

// Adicionar estilos para as prioridades
const priorityStyles = document.createElement('style');
priorityStyles.textContent = `
    .priority-cell {
        text-align: center;
    }
    
    .priority-content {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .priority-indicator {
        width: 3px;
        height: 16px;
        border-radius: 2px;
    }
    
    .priority-text {
        display: inline-block;
    }
    
    .priority-alta .priority-indicator {
        background-color: #dc3545;
    }
    .priority-media .priority-indicator,
    .priority-média .priority-indicator {
        background-color: #ffc107;
    }
    .priority-baixa .priority-indicator {
        background-color: #0d6efd;
    }

    /* Estilos para os ícones de status */
    .status-cell {
        text-align: center;
    }
    
    .status-content {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .status-icon {
        font-size: 1rem;
        display: inline-flex;
        align-items: center;
    }
    
    .status-text {
        display: inline-block;
    }
    
    .status-not-started .status-icon,
    .status-not-started .status-text {
        color: #4B5563;
    }
    .status-in-progress .status-icon,
    .status-in-progress .status-text {
        color: #1E40AF;
    }
    .status-completed .status-icon,
    .status-completed .status-text {
        color: #166534;
    }
`;
document.head.appendChild(priorityStyles);

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se estamos na página dashboard
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    // Inicializar elementos do DOM
    tasksTbody = document.getElementById('tasks-tbody');
    addTaskBtn = document.getElementById('add-task-btn');
    taskModal = document.getElementById('task-modal');
    closeModalBtn = document.getElementById('close-modal');
    taskForm = document.getElementById('task-form');
    deleteTaskBtn = document.getElementById('delete-task-btn');
    modalTitle = document.getElementById('modal-title');
    statusFilter = document.getElementById('status-filter');
    priorityFilter = document.getElementById('priority-filter');
    typeFilter = document.getElementById('type-filter');
    searchInput = document.getElementById('search-input');
    clearFiltersBtn = document.getElementById('clear-filters-btn');
    addTaskTypeBtn = document.getElementById('add-task-type-btn');
    modalAddTaskTypeBtn = document.getElementById('modal-add-task-type-btn');
    taskTypeModal = document.getElementById('task-type-modal');
    closeTypeModalBtn = document.getElementById('close-type-modal');
    taskTypeForm = document.getElementById('task-type-form');
    
    // Criar a tabela no Supabase se ainda não existir
    await createTasksTableIfNotExists();
    
    // Inicializar os tipos de tarefas padrão
    taskTypes = ['Aperfeiçoar', 'Solicitação de recurso', 'Correção de bugs'];
    
    // Carregar tarefas
    await fetchTasks();
    
    // Configurar listeners de eventos
    setupEventListeners();
});

// Função para criar a tabela de tarefas no Supabase se não existir
async function createTasksTableIfNotExists() {
    try {
        // Verificar se a tabela existe executando uma consulta simples
        const { error } = await window.supabaseClient
            .from('tarefas')
            .select('id', { count: 'exact', head: true });
        
        // Se não houver erro, a tabela existe, então retornamos
        if (!error) return;
        
        // Se houver erro e não for relacionado a tabela não existente, log e retorno
        if (error.code !== '42P01') {
            console.error('Erro ao verificar tabela:', error);
            return;
        }
        
        // Criação da tabela usando SQL (isso deve ser feito no Supabase dashboard na prática)
        // Aqui está apenas para fins de demonstração
        console.log('A tabela de tarefas não existe. Por favor, crie-a no Supabase Dashboard com a seguinte estrutura:');
        console.log(`
            - nome_da_tarefa (string)
            - status (string: "Não iniciado", "Em andamento", "Concluído")
            - data_limite (date)
            - prioridade (string: "Alta", "Média", "Baixa")
            - tipo_de_tarefa (string)
            - descricao (string)
            - nivel_de_esforco (string: "Pequeno", "Médio", "Grande")
            - usuario_id (string, referência ao usuário)
        `);
    } catch (error) {
        console.error('Erro ao criar tabela:', error);
    }
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Abrir modal ao clicar no botão de adicionar tarefa
    if (addTaskBtn) {
        console.log('Adicionando evento ao botão Nova');
        addTaskBtn.addEventListener('click', function() {
            console.log('Botão Nova clicado');
            openTaskModal();
        });
    } else {
        console.log('Botão Nova não encontrado');
    }
    
    // Fechar modal ao clicar no botão de fechar
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeTaskModal);
    }
    
    // Fechar modal ao clicar fora do conteúdo
    if (taskModal) {
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                closeTaskModal();
            }
        });
    }
    
    // Fechar modal de tipo de tarefa ao clicar fora do conteúdo
    if (taskTypeModal) {
        taskTypeModal.addEventListener('click', (e) => {
            if (e.target === taskTypeModal) {
                closeAddTaskTypeModal();
            }
        });
    }
    
    // Enviar formulário de tarefa
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskFormSubmit);
    }
    
    // Excluir tarefa
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', handleDeleteTask);
    }
    
    // Filtros
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentFilters.status = statusFilter.value;
            applyFilters();
        });
    }
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', () => {
            currentFilters.priority = priorityFilter.value;
            applyFilters();
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            currentFilters.type = typeFilter.value;
            applyFilters();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentFilters.search = searchInput.value.toLowerCase();
            applyFilters();
        });
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Adicionar tipo de tarefa
    if (addTaskTypeBtn) {
        addTaskTypeBtn.addEventListener('click', openAddTaskTypeModal);
    }
    
    if (modalAddTaskTypeBtn) {
        modalAddTaskTypeBtn.addEventListener('click', openAddTaskTypeModal);
    }
    
    // Fechar modal de adição de tipo de tarefa
    if (closeTypeModalBtn) {
        closeTypeModalBtn.addEventListener('click', closeAddTaskTypeModal);
    }
    
    // Enviar formulário de adição de tipo de tarefa
    if (taskTypeForm) {
        taskTypeForm.addEventListener('submit', handleAddTaskType);
    }
}

// Buscar tarefas do usuário atual
async function fetchTasks() {
    try {
        // Obter o usuário atual
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            window.location.href = 'index.html';
            return;
        }
        
        const userId = session.user.id;
        console.log('Buscando tarefas para o usuário:', userId);
        
        // Buscar tarefas do usuário
        const { data, error } = await window.supabaseClient
            .from('tarefas')
            .select('*')
            .eq('usuario_id', userId)
            .order('data_limite', { ascending: true });
        
        if (error) {
            console.error('Erro ao buscar tarefas:', error);
            showNotification(error.message, 'error');
            return;
        }
        
        console.log('Tarefas carregadas:', data ? data.length : 0);
        
        // Atualizar tarefas e renderizar - simplificando para evitar possíveis problemas
        currentTasks = data || [];
        renderTasks(currentTasks);
        
        // Extrair tipos de tarefas das tarefas existentes e atualizar os dropdowns
        extractTaskTypesFromTasks();
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        showNotification('Ocorreu um erro ao carregar as tarefas.', 'error');
    }
}

// Extrair os tipos de tarefas das tarefas existentes
function extractTaskTypesFromTasks() {
    // Manter os tipos padrão
    let defaultTypes = ['Aperfeiçoar', 'Solicitação de recurso', 'Correção de bugs'];
    
    // Adicionar tipos das tarefas existentes
    currentTasks.forEach(task => {
        if (task.tipo_de_tarefa && !taskTypes.includes(task.tipo_de_tarefa)) {
            taskTypes.push(task.tipo_de_tarefa);
        }
    });
    
    // Adicionar tipos padrão se não existirem
    defaultTypes.forEach(type => {
        if (!taskTypes.includes(type)) {
            taskTypes.push(type);
        }
    });
    
    // Atualizar os dropdowns
    updateTaskTypeDropdowns();
}

// Atualizar os dropdowns de tipo de tarefa
function updateTaskTypeDropdowns() {
    // Atualizar o dropdown de filtro de tipo
    const typeFilterEl = document.getElementById('type-filter');
    if (typeFilterEl) {
        const currentValue = typeFilterEl.value;
        // Manter a opção "Todos"
        typeFilterEl.innerHTML = '<option value="">Todos</option>';
        
        // Adicionar todos os tipos ordenados alfabeticamente
        taskTypes.sort().forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            if (type === currentValue) {
                option.selected = true;
            }
            typeFilterEl.appendChild(option);
        });
    }
    
    // Atualizar o dropdown de tipo no formulário
    const taskTypeEl = document.getElementById('task-type');
    if (taskTypeEl) {
        const currentValue = taskTypeEl.value;
        taskTypeEl.innerHTML = '';
        
        // Adicionar todos os tipos ordenados alfabeticamente
        taskTypes.sort().forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            if (type === currentValue) {
                option.selected = true;
            }
            taskTypeEl.appendChild(option);
        });
    }
}

// Renderizar tarefas na tabela
function renderTasks(tasks) {
    if (!tasksTbody) return;
    
    // Limpar tabela
    tasksTbody.innerHTML = '';
    
    // Verificar se não há tarefas
    if (tasks.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-state';
        emptyRow.innerHTML = `
            <td colspan="10">
                <div class="empty-state-content">
                    <i class="bi bi-inbox"></i>
                    <p>Nenhuma tarefa encontrada.</p>
                </div>
            </td>
        `;
        tasksTbody.appendChild(emptyRow);
        
        return;
    }
    
    // Ordenar tarefas: primeiro as não concluídas por data, depois as concluídas
    const sortedTasks = [...tasks].sort((a, b) => {
        // Primeiro ordena por status (Concluído vai por último)
        if (a.status === 'Concluído' && b.status !== 'Concluído') return 1;
        if (a.status !== 'Concluído' && b.status === 'Concluído') return -1;
        
        // Depois por data (comparando as strings diretamente)
        return a.data_limite.localeCompare(b.data_limite);
    });
    
    // Renderizar cada tarefa
    sortedTasks.forEach(task => {
        const row = document.createElement('tr');
        row.dataset.id = task.id;
        
        // Adicionar classe para tarefas concluídas
        if (task.status === 'Concluído') {
            row.classList.add('task-completed');
        }
        
        // Verificar se a tarefa está atrasada
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const [ano, mes, dia] = task.data_limite.split('-').map(Number);
        const dataLimite = new Date(ano, mes - 1, dia);
        dataLimite.setHours(0, 0, 0, 0);
        const isAtrasada = (dataLimite < hoje && task.status !== 'Concluído');
        
        if (isAtrasada) {
            row.classList.add('task-overdue');
        }
        
        // Formatar a data para exibição (DD/MM/YYYY)
        const [anoLimite, mesLimite, diaLimite] = task.data_limite.split('-');
        const formattedDate = `${diaLimite}/${mesLimite}/${anoLimite}`;
        
        // Determinar classes de status e prioridade
        const statusClass = getStatusClass(task.status);
        const priorityClass = getPriorityClass(task.prioridade);
        
        // Adicionar a classe de prioridade à linha
        const prioridadeNormalizada = task.prioridade.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        
        // Truncar descrição se for muito longa
        const descricaoAbreviada = task.descricao && task.descricao.length > 50 
            ? task.descricao.substring(0, 50) + '...' 
            : (task.descricao || '-');
        
        row.innerHTML = `
            <td><input type="checkbox" class="task-check" ${task.status === 'Concluído' ? 'checked' : ''}></td>
            <td class="task-name-cell">${task.nome_da_tarefa}</td>
            <td class="status-cell ${statusClass}">
                <div class="status-content">
                    <span class="status-icon">${getStatusIcon(task.status)}</span>
                    <span class="status-text">${task.status}</span>
                </div>
            </td>
            <td>Você</td>
            <td class="${isAtrasada ? 'date-overdue' : ''}">${formattedDate}</td>
            <td class="priority-cell priority-${prioridadeNormalizada}">
                <div class="priority-content">
                    <div class="priority-indicator"></div>
                    <span class="priority-text">${task.prioridade}</span>
                </div>
            </td>
            <td>${task.tipo_de_tarefa}</td>
            <td title="${task.descricao || ''}">${descricaoAbreviada}</td>
            <td>${task.nivel_de_esforco}</td>
            <td>
                <button class="action-btn edit-task-btn" data-id="${task.id}" title="Editar tarefa">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn delete-task-btn" data-id="${task.id}" title="Excluir tarefa">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tasksTbody.appendChild(row);
        
        // Adicionar evento de edição
        const editBtn = row.querySelector('.edit-task-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => openTaskModal(task));
        }
        
        // Adicionar evento de exclusão direta
        const deleteBtn = row.querySelector('.delete-task-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => confirmDeleteTask(task.id));
        }
        
        // Adicionar evento de checkbox para marcar como concluído rapidamente
        const checkbox = row.querySelector('.task-check');
        if (checkbox) {
            checkbox.addEventListener('change', async (e) => {
                const isChecked = e.target.checked;
                const newStatus = isChecked ? 'Concluído' : 'Em andamento';
                
                try {
                    // Atualizar status no banco
                    const { error } = await window.supabaseClient
                        .from('tarefas')
                        .update({ status: newStatus })
                        .eq('id', task.id);
                    
                    if (error) {
                        showNotification('Erro ao atualizar status: ' + error.message, 'error');
                        e.target.checked = !isChecked; // Reverter checkbox
                        return;
                    }
                    
                    // Atualizar UI
                    const statusCell = row.querySelector('.status-badge');
                    if (statusCell) {
                        statusCell.className = `status-badge ${getStatusClass(newStatus)}`;
                        statusCell.textContent = newStatus;
                    }
                    
                    if (isChecked) {
                        row.classList.add('task-completed');
                    } else {
                        row.classList.remove('task-completed');
                    }
                    
                    // Atualizar o objeto na lista
                    task.status = newStatus;
                    
                    showNotification(
                        isChecked ? 'Tarefa marcada como concluída!' : 'Tarefa marcada como em andamento!',
                        'success'
                    );
                    
                    // Reordenar a lista após um breve delay
                    setTimeout(() => {
                        renderTasks(currentTasks);
                    }, 1500);
                } catch (error) {
                    console.error('Erro ao atualizar status:', error);
                    showNotification('Ocorreu um erro ao atualizar o status.', 'error');
                    e.target.checked = !isChecked; // Reverter checkbox
                }
            });
        }
        
        // Adicionar evento de clique rápido na célula de nome para editar
        const nameCell = row.querySelector('.task-name-cell');
        if (nameCell) {
            nameCell.addEventListener('click', () => openTaskModal(task));
        }
    });
}

// Obter ícone para o status
function getStatusIcon(status) {
    switch (status) {
        case 'Não iniciado':
            return '<i class="bi bi-circle" style="color: #4B5563;"></i>';
        case 'Em andamento':
            return '<i class="bi bi-circle" style="color: #1E40AF;"></i>';
        case 'Concluído':
            return '<i class="bi bi-check-circle-fill" style="color: #166534;"></i>';
        default:
            return '<i class="bi bi-circle" style="color: #4B5563;"></i>';
    }
}

// Obter classe CSS para o status
function getStatusClass(status) {
    switch (status) {
        case 'Não iniciado':
            return 'status-not-started';
        case 'Em andamento':
            return 'status-in-progress';
        case 'Concluído':
            return 'status-completed';
        default:
            return '';
    }
}

// Obter classe CSS para a prioridade
function getPriorityClass(priority) {
    switch (priority) {
        case 'Alta':
            return 'priority-high';
        case 'Média':
            return 'priority-medium';
        case 'Baixa':
            return 'priority-low';
        default:
            return '';
    }
}

// Abrir modal de tarefa (nova ou edição)
function openTaskModal(task = null) {
    console.log('Função openTaskModal chamada', task);
    
    // Resetar formulário
    if (taskForm) {
        taskForm.reset();
    } else {
        console.log('taskForm não encontrado');
    }
    
    const taskIdInput = document.getElementById('task-id');
    if (taskIdInput) {
        taskIdInput.value = '';
    }
    
    // Certifique-se de que o modal esteja visível
    if (taskModal) {
        console.log('Adicionando classe active ao modal');
        taskModal.classList.add('active');
        
        // Verificar se a classe foi adicionada
        setTimeout(() => {
            console.log('Modal classes:', taskModal.className);
        }, 100);
    } else {
        console.log('taskModal não encontrado');
    }
    
    if (task) {
        // Modo de edição
        modalTitle.textContent = 'Editar Tarefa';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-name').value = task.nome_da_tarefa;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-priority').value = task.prioridade;
        document.getElementById('task-due-date').value = task.data_limite;
        document.getElementById('task-type').value = task.tipo_de_tarefa;
        document.getElementById('task-description').value = task.descricao || '';
        document.getElementById('task-effort').value = task.nivel_de_esforco;
        
        // Mostrar botão de excluir
        deleteTaskBtn.classList.remove('hidden');
    } else {
        // Modo de criação
        modalTitle.textContent = 'Nova Tarefa';
        
        // Definir data padrão (hoje)
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10);
        document.getElementById('task-due-date').value = formattedDate;
        
        // Valores padrão para os outros campos
        document.getElementById('task-status').value = 'Não iniciado';
        document.getElementById('task-priority').value = 'Média';
        document.getElementById('task-type').value = 'Aperfeiçoar';
        document.getElementById('task-effort').value = 'Médio';
        
        // Esconder botão de excluir
        deleteTaskBtn.classList.add('hidden');
    }
    
    // Focar no campo de nome para facilitar a digitação
    setTimeout(() => {
        document.getElementById('task-name').focus();
    }, 100);
}

// Fechar modal de tarefa
function closeTaskModal() {
    taskModal.classList.remove('active');
}

// Após qualquer operação que modifique as tarefas (criar, editar, excluir)
function notificarAlteracaoTarefas() {
    // Disparar evento customizado
    document.dispatchEvent(new Event('tasksUpdated'));
}

// Manipular envio do formulário de tarefa
async function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) {
        console.log('Já existe uma submissão em andamento, ignorando clique adicional');
        return;
    }
    
    isSubmitting = true;
    console.log('Iniciando submissão do formulário de tarefa');
    
    const submitBtn = taskForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Salvando...';
    }
    
    try {
        // Obter dados do formulário
        const taskId = document.getElementById('task-id').value;
        const taskName = document.getElementById('task-name').value.trim();
        
        // Validação básica
        if (!taskName) {
            showNotification('O nome da tarefa é obrigatório', 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-save"></i> Salvar';
            }
            isSubmitting = false;
            return;
        }

        // Pegar a data exatamente como foi inserida
        const dataLimite = document.getElementById('task-due-date').value;
        console.log('Data limite inserida:', dataLimite);
        
        const taskData = {
            nome_da_tarefa: taskName,
            status: document.getElementById('task-status').value,
            data_limite: dataLimite,
            prioridade: document.getElementById('task-priority').value,
            tipo_de_tarefa: document.getElementById('task-type').value,
            descricao: document.getElementById('task-description').value.trim(),
            nivel_de_esforco: document.getElementById('task-effort').value
        };
        
        console.log('Dados da tarefa para salvar:', taskData);
        
        // Obter o ID do usuário atual
        console.log('Obtendo sessão do usuário...');
        const sessionResult = await window.supabaseClient.auth.getSession();
        console.log('Resultado da sessão:', sessionResult);
        
        if (!sessionResult.data || !sessionResult.data.session) {
            console.error('Sessão inválida:', sessionResult);
            window.location.href = 'index.html';
            isSubmitting = false;
            return;
        }
        
        const session = sessionResult.data.session;
        taskData.usuario_id = session.user.id;
        console.log('ID do usuário:', taskData.usuario_id);
        
        let result;
        
        if (taskId) {
            // Atualizar tarefa existente
            console.log('Atualizando tarefa existente com ID:', taskId);
            result = await window.supabaseClient
                .from('tarefas')
                .update(taskData)
                .eq('id', taskId)
                .eq('usuario_id', session.user.id);
        } else {
            // Inserir nova tarefa
            console.log('Inserindo nova tarefa');
            result = await window.supabaseClient
                .from('tarefas')
                .insert(taskData);
        }
        
        console.log('Resultado da operação:', result);
        
        if (result.error) {
            console.error('Erro detalhado do Supabase:', result.error);
            showNotification('Erro ao salvar: ' + result.error.message, 'error');
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-save"></i> Salvar';
            }
            isSubmitting = false;
            return;
        }
        
        // Fechar modal antes de atualizar lista
        console.log('Salvamento bem-sucedido, fechando modal');
        closeTaskModal();
        
        // Atualizar lista de tarefas
        console.log('Atualizando lista de tarefas');
        await fetchTasks();
        
        // Notificar alteração
        notificarAlteracaoTarefas();
        
        // Atualizar o calendário se estiver disponível
        if (typeof window.fetchTasksForCalendar === 'function' && typeof window.renderCalendar === 'function') {
            console.log('Atualizando calendário após alteração de tarefa');
            try {
                await window.fetchTasksForCalendar();
                window.renderCalendar();
            } catch (calendarError) {
                console.error('Erro ao atualizar calendário:', calendarError);
            }
        } else {
            console.log('Funções do calendário não encontradas ou não estamos na página de calendário');
        }
        
        // Mostrar notificação de sucesso
        showNotification(
            taskId ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!',
            'success'
        );
    } catch (error) {
        console.error('Erro detalhado ao salvar tarefa:', error);
        showNotification('Ocorreu um erro ao salvar a tarefa.', 'error');
    } finally {
        // Garantir que o botão seja reabilitado
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-save"></i> Salvar';
        }
        
        // Restaurar estado de submissão
        setTimeout(() => {
            console.log('Resetando flag de submissão');
            isSubmitting = false;
        }, 1000); // Esperar um segundo para evitar cliques repetidos
    }
}

// Confirmar exclusão de tarefa
function confirmDeleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        handleDeleteTaskById(taskId);
    }
}

// Manipular exclusão de tarefa a partir do modal
async function handleDeleteTask() {
    const taskId = document.getElementById('task-id').value;
    
    if (!taskId) {
        showNotification('Nenhuma tarefa selecionada para exclusão.', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        await handleDeleteTaskById(taskId);
        closeTaskModal();
    }
}

// Excluir tarefa por ID
async function handleDeleteTaskById(taskId) {
    try {
        // Obter o ID do usuário atual
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            window.location.href = 'index.html';
            return;
        }
        
        // Excluir tarefa
        const { error } = await window.supabaseClient
            .from('tarefas')
            .delete()
            .eq('id', taskId)
            .eq('usuario_id', session.user.id);
        
        if (error) {
            showNotification(error.message, 'error');
            return;
        }
        
        // Atualizar lista de tarefas
        await fetchTasks();
        
        // Notificar alteração
        notificarAlteracaoTarefas();
        
        // Atualizar o calendário se estiver disponível
        if (typeof window.fetchTasksForCalendar === 'function' && typeof window.renderCalendar === 'function') {
            console.log('Atualizando calendário após exclusão de tarefa');
            try {
                await window.fetchTasksForCalendar();
                window.renderCalendar();
            } catch (calendarError) {
                console.error('Erro ao atualizar calendário:', calendarError);
            }
        } else {
            console.log('Funções do calendário não encontradas ou não estamos na página de calendário');
        }
        
        // Mostrar notificação de sucesso
        showNotification('Tarefa excluída com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        showNotification('Ocorreu um erro ao excluir a tarefa.', 'error');
    }
}

// Aplicar filtros às tarefas
function applyFilters() {
    const filteredTasks = currentTasks.filter(task => {
        // Filtrar por status
        if (currentFilters.status && task.status !== currentFilters.status) {
            return false;
        }
        
        // Filtrar por prioridade
        if (currentFilters.priority && task.prioridade !== currentFilters.priority) {
            return false;
        }
        
        // Filtrar por tipo
        if (currentFilters.type && task.tipo_de_tarefa !== currentFilters.type) {
            return false;
        }
        
        // Filtrar por texto de busca
        if (currentFilters.search) {
            const searchText = currentFilters.search.toLowerCase();
            const nameMatch = task.nome_da_tarefa.toLowerCase().includes(searchText);
            const descMatch = task.descricao && task.descricao.toLowerCase().includes(searchText);
            
            if (!nameMatch && !descMatch) {
                return false;
            }
        }
        
        return true;
    });
    
    renderTasks(filteredTasks);
}

// Limpar todos os filtros
function clearFilters() {
    statusFilter.value = '';
    priorityFilter.value = '';
    typeFilter.value = '';
    searchInput.value = '';
    
    currentFilters = {
        status: '',
        priority: '',
        type: '',
        search: ''
    };
    
    renderTasks(currentTasks);
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

// Abrir modal de adição de tipo de tarefa
function openAddTaskTypeModal() {
    console.log('Função openAddTaskTypeModal chamada');
    
    // Certifique-se de que o modal esteja visível
    if (taskTypeModal) {
        console.log('Adicionando classe active ao modal');
        taskTypeModal.classList.add('active');
        
        // Verificar se a classe foi adicionada
        setTimeout(() => {
            console.log('Modal classes:', taskTypeModal.className);
        }, 100);
    } else {
        console.log('taskTypeModal não encontrado');
    }
}

// Fechar modal de adição de tipo de tarefa
function closeAddTaskTypeModal() {
    taskTypeModal.classList.remove('active');
}

// Manipular envio do formulário de adição de tipo de tarefa
async function handleAddTaskType(e) {
    e.preventDefault();
    
    // Obter dados do formulário
    const newTypeName = document.getElementById('new-type-name').value.trim();
    
    // Validação básica
    if (!newTypeName) {
        showNotification('O nome do tipo de tarefa é obrigatório', 'error');
        return;
    }
    
    // Verificar se o tipo já existe
    if (taskTypes.includes(newTypeName)) {
        showNotification('Este tipo de tarefa já existe', 'error');
        return;
    }
    
    // Adicionar o novo tipo à lista
    taskTypes.push(newTypeName);
    
    // Atualizar os dropdowns
    updateTaskTypeDropdowns();
    
    // Resetar o formulário
    document.getElementById('new-type-name').value = '';
    
    // Fechar o modal
    closeAddTaskTypeModal();
    
    // Mostrar notificação de sucesso
    showNotification('Tipo de tarefa adicionado com sucesso!', 'success');
}

// Buscar tipos de tarefa do usuário atual
async function fetchTaskTypes() {
    try {
        // Obter o usuário atual
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            window.location.href = 'index.html';
            return;
        }
        
        const userId = session.user.id;
        console.log('Buscando tipos de tarefa para o usuário:', userId);
        
        // Buscar tipos de tarefa do usuário
        const { data, error } = await window.supabaseClient
            .from('tipos_de_tarefa')
            .select('*')
            .eq('usuario_id', userId);
        
        if (error) {
            console.error('Erro ao buscar tipos de tarefa:', error);
            showNotification(error.message, 'error');
            return;
        }
        
        console.log('Tipos de tarefa carregados:', data ? data.length : 0);
        
        // Atualizar tipos de tarefa
        taskTypes = data || [];
        renderTaskTypes(taskTypes);
    } catch (error) {
        console.error('Erro ao buscar tipos de tarefa:', error);
        showNotification('Ocorreu um erro ao carregar os tipos de tarefa.', 'error');
    }
}

// Renderizar tipos de tarefa na tabela
function renderTaskTypes(types) {
    if (!tasksTbody) return;
    
    // Limpar tabela
    tasksTbody.innerHTML = '';
    
    // Verificar se não há tipos de tarefa
    if (types.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-state';
        emptyRow.innerHTML = `
            <td colspan="10">
                <div class="empty-state-content">
                    <i class="bi bi-inbox"></i>
                    <p>Nenhum tipo de tarefa encontrado.</p>
                </div>
            </td>
        `;
        tasksTbody.appendChild(emptyRow);
        
        return;
    }
    
    // Renderizar cada tipo de tarefa
    types.forEach(type => {
        const row = document.createElement('tr');
        row.dataset.id = type.id;
        
        row.innerHTML = `
            <td>${type.nome}</td>
            <td>
                <button class="action-btn edit-task-type-btn" data-id="${type.id}" title="Editar tipo de tarefa">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn delete-task-type-btn" data-id="${type.id}" title="Excluir tipo de tarefa">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tasksTbody.appendChild(row);
        
        // Adicionar evento de edição
        const editBtn = row.querySelector('.edit-task-type-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => openEditTaskTypeModal(type));
        }
        
        // Adicionar evento de exclusão direta
        const deleteBtn = row.querySelector('.delete-task-type-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => confirmDeleteTaskType(type.id));
        }
    });
}

// Abrir modal de edição de tipo de tarefa
function openEditTaskTypeModal(type) {
    console.log('Função openEditTaskTypeModal chamada', type);
    
    // Resetar formulário
    if (taskTypeForm) {
        taskTypeForm.reset();
    } else {
        console.log('taskTypeForm não encontrado');
    }
    
    const taskTypeIdInput = document.getElementById('task-type-id');
    if (taskTypeIdInput) {
        taskTypeIdInput.value = '';
    }
    
    // Certifique-se de que o modal esteja visível
    if (taskTypeModal) {
        console.log('Adicionando classe active ao modal');
        taskTypeModal.classList.add('active');
        
        // Verificar se a classe foi adicionada
        setTimeout(() => {
            console.log('Modal classes:', taskTypeModal.className);
        }, 100);
    } else {
        console.log('taskTypeModal não encontrado');
    }
    
    if (type) {
        // Modo de edição
        modalTitle.textContent = 'Editar Tipo de Tarefa';
        document.getElementById('task-type-id').value = type.id;
        document.getElementById('task-type-name').value = type.nome;
        
        // Mostrar botão de excluir
        deleteTaskBtn.classList.remove('hidden');
    } else {
        // Modo de criação
        modalTitle.textContent = 'Novo Tipo de Tarefa';
        
        // Esconder botão de excluir
        deleteTaskBtn.classList.add('hidden');
    }
    
    // Focar no campo de nome para facilitar a digitação
    setTimeout(() => {
        document.getElementById('task-type-name').focus();
    }, 100);
}

// Confirmar exclusão de tipo de tarefa
function confirmDeleteTaskType(taskTypeId) {
    if (confirm('Tem certeza que deseja excluir este tipo de tarefa?')) {
        handleDeleteTaskTypeById(taskTypeId);
    }
}

// Manipular exclusão de tipo de tarefa a partir do modal
async function handleDeleteTaskType() {
    const taskTypeId = document.getElementById('task-type-id').value;
    
    if (!taskTypeId) {
        showNotification('Nenhum tipo de tarefa selecionado para exclusão.', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este tipo de tarefa?')) {
        await handleDeleteTaskTypeById(taskTypeId);
        closeTaskModal();
    }
}

// Excluir tipo de tarefa por ID
async function handleDeleteTaskTypeById(taskTypeId) {
    try {
        // Obter o ID do usuário atual
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (!session) {
            window.location.href = 'index.html';
            return;
        }
        
        // Excluir tipo de tarefa
        const { error } = await window.supabaseClient
            .from('tipos_de_tarefa')
            .delete()
            .eq('id', taskTypeId)
            .eq('usuario_id', session.user.id);
        
        if (error) {
            showNotification(error.message, 'error');
            return;
        }
        
        // Atualizar lista de tipos de tarefa
        await fetchTaskTypes();
        
        // Mostrar notificação de sucesso
        showNotification('Tipo de tarefa excluído com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir tipo de tarefa:', error);
        showNotification('Ocorreu um erro ao excluir o tipo de tarefa.', 'error');
    }
} 