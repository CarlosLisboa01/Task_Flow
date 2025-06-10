// Script de correção do modal
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de correção carregado');
    
    // Verificar em qual página estamos
    const isDashboardPage = window.location.pathname.includes('dashboard.html');
    const isCalendarPage = window.location.pathname.includes('calendario.html');
    
    console.log('Página atual:', window.location.pathname);
    console.log('É página dashboard:', isDashboardPage);
    console.log('É página calendário:', isCalendarPage);
    
    // Se estamos na página de dashboard, configurar o botão alternativo
    if (isDashboardPage) {
        const altAddTaskBtn = document.getElementById('alt-add-task-btn');
        if (altAddTaskBtn) {
            console.log('Botão Nova Tarefa encontrado, adicionando evento');
            altAddTaskBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Botão Nova Tarefa clicado');
                showTaskModal();
            });
        } else {
            console.log('Botão Nova Tarefa alternativo não encontrado no DOM');
        }
    }
    
    // Se estamos na página de calendário, configurar botão do calendário
    if (isCalendarPage) {
        const calendarAddTaskBtn = document.getElementById('calendar-add-task-btn');
        if (calendarAddTaskBtn) {
            console.log('Botão Nova Tarefa do calendário encontrado, adicionando evento');
            calendarAddTaskBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Botão Nova Tarefa do calendário clicado');
                showTaskModal();
            });
        } else {
            console.log('Botão Nova Tarefa do calendário não encontrado no DOM');
        }
    }
    
    // Verificar o modal
    const taskModal = document.getElementById('task-modal');
    if (taskModal) {
        console.log('Modal encontrado, configurando...');
        
        // Verificar botão de fechar
        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) {
            closeModalBtn.onclick = function(e) {
                e.preventDefault();
                console.log('Botão fechar clicado');
                hideTaskModal();
            };
        }
        
        // Fechar ao clicar fora
        taskModal.addEventListener('click', function(e) {
            if (e.target === taskModal) {
                hideTaskModal();
            }
        });
        
        // Configurar o form
        const taskForm = document.getElementById('task-form');
        if (taskForm) {
            taskForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('Formulário de tarefa enviado');
                
                try {
                    // Mostrar feedback visual
                    const submitBtn = taskForm.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Salvando...';
                    }
                    
                    // Obter dados
                    const taskName = document.getElementById('task-name').value.trim();
                    if (!taskName) {
                        showNotification('O nome da tarefa é obrigatório', 'error');
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = '<i class="bi bi-save"></i> Salvar';
                        }
                        return;
                    }
                    
                    // Verificar se o Supabase está disponível globalmente
                    if (!window.supabase) {
                        console.error('Cliente Supabase não encontrado no objeto window');
                        showNotification('Erro de conexão com o banco de dados - Cliente não inicializado', 'error');
                        return;
                    }
                    
                    // Reabilitar o botão após algum tempo se houver erro
                    setTimeout(function() {
                        if (submitBtn && submitBtn.disabled) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = '<i class="bi bi-save"></i> Salvar';
                        }
                    }, 5000);
                    
                    // Se a função original não existir, implementamos nossa própria
                    if (typeof handleTaskFormSubmit === 'function') {
                        console.log('Usando função handleTaskFormSubmit original');
                        try {
                            await handleTaskFormSubmit(e);
                        } catch (error) {
                            console.error('Erro na função handleTaskFormSubmit original:', error);
                            handleTaskSaveFallback(e);
                        }
                    } else {
                        console.log('Função handleTaskFormSubmit não encontrada, usando fallback');
                        handleTaskSaveFallback(e);
                    }
                } catch (error) {
                    console.error('Erro ao processar formulário:', error);
                    showNotification('Ocorreu um erro ao processar o formulário', 'error');
                }
            });
            
            // Implementação de fallback para salvar tarefas
            async function handleTaskSaveFallback(e) {
                e.preventDefault();
                console.log('Executando salvamento via fallback');
                
                // Verificar se já existe um salvamento em andamento
                if (window.isSubmitting) {
                    console.log('Já existe uma submissão em andamento, ignorando clique adicional');
                    return;
                }
                
                // Marcar como em submissão (usando a variável global)
                window.isSubmitting = true;
                
                try {
                    // Obter dados do formulário
                    const taskId = document.getElementById('task-id').value;
                    const taskName = document.getElementById('task-name').value.trim();
                    
                    if (!taskName) {
                        showNotification('O nome da tarefa é obrigatório', 'error');
                        window.isSubmitting = false;
                        return;
                    }
                    
                    const taskData = {
                        nome_da_tarefa: taskName,
                        status: document.getElementById('task-status').value,
                        data_limite: document.getElementById('task-due-date').value,
                        prioridade: document.getElementById('task-priority').value,
                        tipo_de_tarefa: document.getElementById('task-type').value,
                        descricao: document.getElementById('task-description').value.trim(),
                        nivel_de_esforco: document.getElementById('task-effort').value
                    };
                    
                    // Obter o ID do usuário atual
                    console.log('Obtendo sessão do usuário via fallback...');
                    // Verificar qual cliente Supabase está disponível
                    if (!window.supabaseClient && !window.supabase) {
                        console.error('Erro: Nenhum cliente Supabase encontrado!');
                        showNotification('Erro de conexão com o banco de dados', 'error');
                        window.isSubmitting = false;
                        return;
                    }
                    
                    // Usar o cliente correto
                    const supabaseToUse = window.supabaseClient || window.supabase;
                    const sessionResult = await supabaseToUse.auth.getSession();
                    console.log('Resultado da sessão via fallback:', sessionResult);
                    
                    if (!sessionResult.data || !sessionResult.data.session) {
                        console.error('Sessão inválida via fallback:', sessionResult);
                        window.location.href = 'index.html';
                        window.isSubmitting = false;
                        return;
                    }
                    
                    const session = sessionResult.data.session;
                    taskData.usuario_id = session.user.id;
                    console.log('ID do usuário via fallback:', taskData.usuario_id);
                    
                    let result;
                    
                    if (taskId) {
                        // Atualizar tarefa existente
                        console.log('Atualizando tarefa existente via fallback com ID:', taskId);
                        result = await supabaseToUse
                            .from('tarefas')
                            .update(taskData)
                            .eq('id', taskId)
                            .eq('usuario_id', session.user.id);
                    } else {
                        // Inserir nova tarefa
                        console.log('Inserindo nova tarefa via fallback');
                        // Imprimir os dados para depuração
                        console.log('Dados sendo enviados para o Supabase:', JSON.stringify(taskData));
                        
                        // Tentar inserir com tratamento específico de erro
                        try {
                            result = await supabaseToUse
                                .from('tarefas')
                                .insert(taskData);
                        } catch (insertError) {
                            console.error('Erro de exceção na inserção:', insertError);
                            showNotification('Erro de exceção ao inserir: ' + (insertError.message || 'Erro desconhecido'), 'error');
                            window.isSubmitting = false;
                            return;
                        }
                    }
                    
                    console.log('Resultado da operação via fallback:', result);
                    
                    if (result.error) {
                        console.error('Erro detalhado do Supabase via fallback:', result.error);
                        showNotification('Erro ao salvar: ' + result.error.message, 'error');
                        window.isSubmitting = false;
                        return;
                    }
                    
                    // Fechar o modal antes de recarregar
                    hideTaskModal();
                    
                    // Mostrar notificação de sucesso
                    showNotification(
                        taskId ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!',
                        'success'
                    );
                    
                    // Recarregar a página após um pequeno atraso
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } catch (error) {
                    console.error('Erro ao salvar via fallback:', error);
                    showNotification('Erro ao salvar tarefa: ' + (error.message || 'Erro desconhecido'), 'error');
                    window.isSubmitting = false;
                } finally {
                    // Garantir que a flag de submissão seja resetada após um tempo
                    setTimeout(() => {
                        window.isSubmitting = false;
                    }, 2000);
                }
            }
        }
    } else {
        console.error('Modal não encontrado no DOM');
    }
    
    // Função para exibir o modal de forma confiável
    window.showTaskModal = function() {
        const modal = document.getElementById('task-modal');
        if (modal) {
            console.log('Exibindo modal...');
            
            // Forçar exibição com estilo inline
            modal.style.display = 'flex';
            modal.style.opacity = '1';
            modal.style.visibility = 'visible';
            modal.style.pointerEvents = 'auto';
            
            // Adicionar classe active
            modal.classList.add('active');
            
            // Verificar se o modal está visível
            setTimeout(function() {
                const computed = window.getComputedStyle(modal);
                console.log('Estilos computados do modal:', {
                    visibility: computed.visibility,
                    opacity: computed.opacity,
                    display: computed.display
                });
            }, 100);
            
            // Resetar formulário
            const form = document.getElementById('task-form');
            if (form) {
                form.reset();
                
                // Definir data padrão (hoje)
                const today = new Date();
                const formattedDate = today.toISOString().slice(0, 10);
                const dateInput = document.getElementById('task-due-date');
                if (dateInput) dateInput.value = formattedDate;
                
                // Valores padrão
                const taskIdInput = document.getElementById('task-id');
                if (taskIdInput) taskIdInput.value = '';
                
                // Ocultar botão de exclusão
                const deleteBtn = document.getElementById('delete-task-btn');
                if (deleteBtn) deleteBtn.classList.add('hidden');
                
                // Título do modal
                const modalTitle = document.getElementById('modal-title');
                if (modalTitle) modalTitle.textContent = 'Nova Tarefa';
            }
        }
    };
    
    // Função para ocultar o modal
    window.hideTaskModal = function() {
        const modal = document.getElementById('task-modal');
        if (modal) {
            console.log('Ocultando modal...');
            modal.classList.remove('active');
            modal.style.opacity = '';
            modal.style.visibility = '';
            modal.style.display = '';
            modal.style.pointerEvents = '';
        }
    };
    
    // Função para mostrar notificações
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
}); 