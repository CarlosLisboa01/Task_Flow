// Elementos do DOM
const selectAllCheckbox = document.getElementById('select-all');
const userNameElement = document.getElementById('user-name');
const userEmailElement = document.getElementById('user-email');

// Função para atualizar os dados do usuário na interface
async function updateUserInfo() {
    try {
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        
        if (error) throw error;
        
        if (session && session.user) {
            const { data: profile, error: profileError } = await window.supabaseClient
                .from('profiles')
                .select('full_name')
                .eq('id', session.user.id)
                .single();

            if (userNameElement) {
                if (profile && profile.full_name) {
                    userNameElement.textContent = profile.full_name;
                } else {
                    userNameElement.textContent = session.user.email.split('@')[0];
                }
            }

            if (userEmailElement) {
                userEmailElement.textContent = session.user.email;
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar informações do usuário:', error);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Atualizar informações do usuário
    await updateUserInfo();
    
    // Verificar se estamos na página dashboard
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    // Configurar os eventos da UI
    setupUIEvents();
});

// Configurar eventos da UI
function setupUIEvents() {
    // Selecionar/desselecionar todas as tarefas
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAllTasks);
    }
    
    // Configurar a edição inline das células da tabela
    setupTableCellEditing();
}

// Lidar com a seleção de todas as tarefas
function handleSelectAllTasks() {
    const isChecked = selectAllCheckbox.checked;
    const taskCheckboxes = document.querySelectorAll('.task-check');
    
    taskCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    // Adicionar classe selecionada às linhas
    const taskRows = document.querySelectorAll('#tasks-tbody tr');
    taskRows.forEach(row => {
        if (isChecked) {
            row.classList.add('selected');
        } else {
            row.classList.remove('selected');
        }
    });
}

// Configurar a edição inline das células da tabela
function setupTableCellEditing() {
    // Delegate event para quando clicamos em uma célula da tabela
    const tasksTable = document.querySelector('.tasks-table');
    
    if (tasksTable) {
        tasksTable.addEventListener('click', (e) => {
            // Ignorar se for um botão de ação, checkbox ou célula já com campo de edição
            if (e.target.closest('.action-btn') || 
                e.target.closest('input[type="checkbox"]') || 
                e.target.closest('.cell-editing')) {
                return;
            }
            
            // Obter a célula clicada
            const cell = e.target.closest('td');
            
            // Ignorar se não for uma célula ou se for uma célula não editável
            if (!cell || 
                cell.cellIndex === 0 || // Coluna de checkbox
                cell.cellIndex === 2 || // Coluna de status (usa o modal)
                cell.cellIndex === 3 || // Coluna de responsável
                cell.cellIndex === 5 || // Coluna de prioridade (usa o modal)
                cell.cellIndex === 9) { // Coluna de ações
                return;
            }
            
            // Somente permitir edição se houver pelo menos 1 tarefa na tabela
            if (currentTasks.length === 0) return;
            
            // Obter a linha e o ID da tarefa
            const row = cell.closest('tr');
            const taskId = row.dataset.id;
            
            // Ignorar se não houver ID da tarefa
            if (!taskId) return;
            
            // Encontrar a tarefa correspondente
            const task = currentTasks.find(t => t.id.toString() === taskId);
            
            // Ignorar se não encontrar a tarefa
            if (!task) return;
            
            // Vamos usar o modal para edição em vez de edição inline
            // para manter a interface consistente
            openTaskModal(task);
        });
    }
}

// Formatar data em pt-BR
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Função para animar elementos quando são atualizados
function animateUpdate(element) {
    element.classList.add('updated');
    
    setTimeout(() => {
        element.classList.remove('updated');
    }, 1000);
} 