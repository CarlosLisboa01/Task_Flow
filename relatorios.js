// Inicialização do cliente Supabase
if (!window.supabaseClient) {
    window.SUPABASE_URL = 'https://kvwsfagncbamiezjdlms.supabase.co';
    window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY';
    window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

// Função para buscar tarefas do usuário
async function fetchUserTasks() {
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) {
            console.log('Usuário não autenticado, redirecionando...');
            window.location.href = 'index.html';
            return [];
        }

        console.log('Buscando tarefas para o usuário:', session.user.id);
        const { data, error } = await window.supabaseClient
            .from('tarefas')
            .select('*')
            .eq('usuario_id', session.user.id);

        if (error) {
            console.error('Erro ao buscar tarefas:', error);
            return [];
        }

        console.log('Tarefas encontradas:', data?.length || 0);
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        return [];
    }
}

// Função para calcular estatísticas
function calcularRelatorios(tasks) {
    console.log('Calculando relatórios para', tasks.length, 'tarefas');
    
    const total = tasks.length;
    const concluidas = tasks.filter(t => t.status === 'Concluído').length;
    const andamento = tasks.filter(t => t.status === 'Em andamento').length;
    const naoIniciadas = tasks.filter(t => t.status === 'Não iniciado').length;
    
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const atrasadas = tasks.filter(t => {
        if (!t.data_limite) return false;
        const [ano, mes, dia] = t.data_limite.split('-').map(Number);
        const dataLimite = new Date(ano, mes-1, dia);
        return dataLimite < hoje && t.status !== 'Concluído';
    }).length;

    const alta = tasks.filter(t => t.prioridade === 'Alta').length;
    const media = tasks.filter(t => t.prioridade === 'Média').length;
    const baixa = tasks.filter(t => t.prioridade === 'Baixa').length;
    
    const taxaConclusao = total > 0 ? ((concluidas/total)*100).toFixed(1) : 0;

    console.log('Estatísticas calculadas:', {
        total, concluidas, andamento, naoIniciadas, atrasadas,
        alta, media, baixa, taxaConclusao
    });

    return {
        total,
        concluidas,
        andamento,
        naoIniciadas,
        atrasadas,
        alta,
        media,
        baixa,
        taxaConclusao
    };
}

// Função para atualizar a interface
function atualizarRelatorios(dados) {
    console.log('Atualizando interface com dados:', dados);

    // Atualizar números principais
    document.getElementById('total-tasks').textContent = dados.total;
    document.getElementById('completion-rate').textContent = `${dados.taxaConclusao}%`;
    document.getElementById('overdue-tasks').textContent = dados.atrasadas;

    // Calcular e atualizar barras de status
    const totalStatus = dados.concluidas + dados.andamento + dados.naoIniciadas;
    if (totalStatus > 0) {
        const completedPercent = ((dados.concluidas/totalStatus)*100).toFixed(1);
        const inProgressPercent = ((dados.andamento/totalStatus)*100).toFixed(1);
        const notStartedPercent = ((dados.naoIniciadas/totalStatus)*100).toFixed(1);

        // Atualizar barras de status
        const statusCompleted = document.getElementById('status-completed');
        const statusInProgress = document.getElementById('status-in-progress');
        const statusNotStarted = document.getElementById('status-not-started');

        if (statusCompleted) {
            statusCompleted.style.width = `${completedPercent}%`;
            const label = statusCompleted.querySelector('span') || document.getElementById('status-completed-label');
            if (label) label.textContent = `${completedPercent}%`;
        }
        
        if (statusInProgress) {
            statusInProgress.style.width = `${inProgressPercent}%`;
            const label = statusInProgress.querySelector('span') || document.getElementById('status-in-progress-label');
            if (label) label.textContent = `${inProgressPercent}%`;
        }
        
        if (statusNotStarted) {
            statusNotStarted.style.width = `${notStartedPercent}%`;
            const label = statusNotStarted.querySelector('span') || document.getElementById('status-not-started-label');
            if (label) label.textContent = `${notStartedPercent}%`;
        }

        console.log('Status atualizados:', {
            completedPercent,
            inProgressPercent,
            notStartedPercent
        });
    }

    // Calcular e atualizar barras de prioridade
    const totalPrioridade = dados.alta + dados.media + dados.baixa;
    if (totalPrioridade > 0) {
        const highPercent = ((dados.alta/totalPrioridade)*100).toFixed(1);
        const mediumPercent = ((dados.media/totalPrioridade)*100).toFixed(1);
        const lowPercent = ((dados.baixa/totalPrioridade)*100).toFixed(1);

        // Atualizar barras de prioridade
        const priorityHigh = document.getElementById('priority-high');
        const priorityMedium = document.getElementById('priority-medium');
        const priorityLow = document.getElementById('priority-low');

        if (priorityHigh) {
            priorityHigh.style.width = `${highPercent}%`;
            const label = priorityHigh.querySelector('span') || document.getElementById('priority-high-label');
            if (label) label.textContent = `${highPercent}%`;
        }
        
        if (priorityMedium) {
            priorityMedium.style.width = `${mediumPercent}%`;
            const label = priorityMedium.querySelector('span') || document.getElementById('priority-medium-label');
            if (label) label.textContent = `${mediumPercent}%`;
        }
        
        if (priorityLow) {
            priorityLow.style.width = `${lowPercent}%`;
            const label = priorityLow.querySelector('span') || document.getElementById('priority-low-label');
            if (label) label.textContent = `${lowPercent}%`;
        }

        console.log('Prioridades atualizadas:', {
            highPercent,
            mediumPercent,
            lowPercent
        });
    }
}

// Função para criar o gráfico de tarefas concluídas por dia da semana
function createWeeklyTasksChart(tasks) {
    console.log('Iniciando criação do gráfico com', tasks.length, 'tarefas');
    
    const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const tarefasPorDia = new Array(7).fill(0);
    
    // Pegar a data atual para calcular a semana atual
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    
    console.log('Período do gráfico:', inicioSemana, 'até', fimSemana);
    
    // Filtrar e contar tarefas concluídas na semana atual
    tasks.forEach(task => {
        console.log('Analisando tarefa:', task);
        if (task.status === 'Concluído') {
            let dataConclusao;
            
            // Tentar obter a data de diferentes campos
            if (task.data_conclusao) {
                dataConclusao = new Date(task.data_conclusao);
            } else if (task.updated_at) {
                dataConclusao = new Date(task.updated_at);
            } else if (task.created_at) {
                dataConclusao = new Date(task.created_at);
            }

            // Verificar se a data é válida
            if (dataConclusao && !isNaN(dataConclusao)) {
                console.log('Data de conclusão válida:', dataConclusao);
                if (dataConclusao >= inicioSemana && dataConclusao <= fimSemana) {
                    const diaDaSemana = dataConclusao.getDay();
                    tarefasPorDia[diaDaSemana]++;
                    console.log('Tarefa contabilizada para', diasDaSemana[diaDaSemana]);
                }
            } else {
                console.log('Data de conclusão inválida para a tarefa:', task);
            }
        }
    });
    
    console.log('Contagem por dia:', tarefasPorDia);
    
    // Criar ou atualizar o gráfico
    const ctx = document.getElementById('weeklyTasksChart');
    if (!ctx) {
        console.error('Canvas não encontrado!');
        return;
    }
    
    try {
        // Destruir gráfico existente se houver
        if (window.weeklyTasksChart instanceof Chart) {
            window.weeklyTasksChart.destroy();
        }
        
        window.weeklyTasksChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: diasDaSemana,
                datasets: [{
                    label: 'Tarefas Concluídas',
                    data: tarefasPorDia,
                    backgroundColor: '#7B68EE',
                    borderColor: '#6A5ACD',
                    borderWidth: 1,
                    borderRadius: 5,
                    maxBarThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => diasDaSemana[context[0].dataIndex],
                            label: (context) => {
                                const count = context.raw;
                                return `${count} tarefa${count !== 1 ? 's' : ''} concluída${count !== 1 ? 's' : ''}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: '#e0e0e0'
                        },
                        title: {
                            display: true,
                            text: 'Número de Tarefas',
                            font: {
                                size: 14
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
        console.log('Gráfico criado com sucesso!');
    } catch (error) {
        console.error('Erro ao criar o gráfico:', error);
    }
}

// Função para verificar se o Chart.js está carregado
function isChartJsLoaded() {
    return typeof Chart !== 'undefined';
}

// Função para esperar o Chart.js carregar
function waitForChartJs() {
    return new Promise((resolve, reject) => {
        if (isChartJsLoaded()) {
            resolve();
            return;
        }

        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(() => {
            attempts++;
            if (isChartJsLoaded()) {
                clearInterval(interval);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                reject(new Error('Chart.js não carregou após várias tentativas'));
            }
        }, 500);
    });
}

// Função principal para atualizar tudo
async function atualizarTudo() {
    console.log('Iniciando atualização dos relatórios...');
    try {
        await waitForChartJs();
        const tasks = await fetchUserTasks();
        console.log('Tarefas obtidas:', tasks);
        const dados = calcularRelatorios(tasks);
        atualizarRelatorios(dados);
        createWeeklyTasksChart(tasks);
    } catch (error) {
        console.error('Erro ao atualizar relatórios:', error);
    }
}

// Inicialização e listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página de relatórios carregada');
    
    // Carregar script do Chart.js dinamicamente se necessário
    if (!isChartJsLoaded()) {
        console.log('Carregando Chart.js...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            console.log('Chart.js carregado com sucesso');
            atualizarTudo();
        };
        document.head.appendChild(script);
    } else {
        atualizarTudo();
    }

    // Subscrever ao canal de atualizações em tempo real
    const channel = window.supabaseClient
        .channel('tarefas_changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'tarefas' }, 
            (payload) => {
                console.log('Mudança detectada nas tarefas:', payload);
                atualizarTudo();
            }
        )
        .subscribe((status) => {
            console.log('Status da subscrição:', status);
        });
});

// Função para atualizar a data de conclusão de uma tarefa
async function atualizarDataConclusao(taskId) {
    try {
        const { data, error } = await window.supabaseClient
            .from('tarefas')
            .update({ data_conclusao: new Date().toISOString() })
            .eq('id', taskId)
            .select();

        if (error) {
            console.error('Erro ao atualizar data de conclusão:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao atualizar data de conclusão:', error);
        return false;
    }
}

// Atualizar quando houver mudanças nas tarefas
document.addEventListener('tasksUpdated', async (event) => {
    console.log('Evento tasksUpdated recebido');
    if (event.detail && event.detail.taskId && event.detail.status === 'Concluído') {
        await atualizarDataConclusao(event.detail.taskId);
    }
    atualizarTudo();
});

// Atualização periódica a cada 30 segundos
setInterval(atualizarTudo, 30000); 