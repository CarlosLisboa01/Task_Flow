// Verificação se a biblioteca Supabase está disponível
if (typeof supabase === 'undefined') {
    console.error('Biblioteca Supabase não foi carregada. Verifique a importação do script.');
    document.addEventListener('DOMContentLoaded', function() {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        if (notification && notificationMessage) {
            notificationMessage.textContent = 'Erro ao carregar biblioteca de autenticação. Por favor, recarregue a página.';
            notification.classList.add('error', 'show');
        } else {
            alert('Erro ao carregar biblioteca de autenticação. Por favor, recarregue a página.');
        }
    });
} else {
    // Configuração do Supabase
    try {
        window.SUPABASE_URL = 'https://kvwsfagncbamiezjdlms.supabase.co';
        window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY';
        window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('Cliente Supabase inicializado com sucesso em registro.js');
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        document.addEventListener('DOMContentLoaded', function() {
            alert('Erro ao inicializar sistema de autenticação. Por favor, recarregue a página.');
        });
    }
}

// Elementos do DOM
let registerForm;
let notification;
let notificationMessage;

// Verificação de autenticação atual
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado - Inicializando registro.js');
    
    // Inicializar elementos do DOM
    registerForm = document.getElementById('register-form');
    notification = document.getElementById('notification');
    notificationMessage = document.getElementById('notification-message');
    
    // Verificar se estamos na página de registro
    if (!registerForm) {
        console.log('Form de registro não encontrado, provavelmente não estamos na página de registro');
        return;
    }
    
    try {
        // Verificar se o Supabase está disponível
        if (!window.supabaseClient) {
            console.error('Cliente Supabase não está disponível');
            showNotification('Erro ao carregar sistema de autenticação. Por favor, recarregue a página.', 'error');
            return;
        }
        
        console.log('Verificando sessão do usuário na página de registro...');
        
        // Obter a sessão do usuário
        const { data, error } = await window.supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            showNotification('Erro ao verificar sua sessão. Por favor, tente novamente.', 'error');
            return;
        }
        
        console.log('Dados da sessão:', data);
        
        // Se já estiver autenticado, redirecionar para o dashboard
        if (data && data.session) {
            console.log('Usuário já está autenticado, redirecionando para dashboard');
            window.location.href = 'dashboard.html';
            return;
        }
        
        console.log('Usuário não autenticado, configurando formulário de registro');
        
        // Configurar evento de registro
        registerForm.addEventListener('submit', handleRegister);
        console.log('Evento de submit adicionado ao formulário de registro');
        
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showNotification('Ocorreu um erro ao verificar autenticação. Por favor, recarregue a página.', 'error');
    }
});

// Função para lidar com o registro
async function handleRegister(e) {
    e.preventDefault();
    console.log('Iniciando processo de registro');
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Verificar se as senhas coincidem
    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem.', 'error');
        return;
    }
    
    // Validações adicionais
    if (!name || !email || !password) {
        showNotification('Todos os campos são obrigatórios.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }
    
    // Desabilitar botão para evitar múltiplos envios
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';
    }
    
    try {
        if (!window.supabaseClient) {
            throw new Error('Cliente Supabase não inicializado');
        }
        
        console.log('Enviando requisição de registro para o Supabase');
        
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });
        
        if (error) {
            let mensagemErro = error.message;
            console.error('Erro ao registrar:', error);
            
            // Traduzir mensagens de erro comuns
            if (error.message.includes('already registered')) {
                mensagemErro = 'Este email já está registrado.';
            } else if (error.message.includes('valid email')) {
                mensagemErro = 'Por favor, forneça um email válido.';
            } else if (error.message.includes('weak password')) {
                mensagemErro = 'A senha é muito fraca. Use uma combinação de letras, números e símbolos.';
            }
            
            showNotification(mensagemErro, 'error');
        } else {
            console.log('Registro bem-sucedido:', data);
            showNotification('Conta criada com sucesso!', 'success');
            
            // Redirecionar para o dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Erro de registro:', error);
        showNotification('Ocorreu um erro ao criar a conta. Por favor, tente novamente.', 'error');
    } finally {
        // Reabilitar botão independente do resultado
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrar';
        }
    }
}

// Função para exibir notificações
function showNotification(message, type = 'success') {
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.classList.remove('success', 'error');
        notification.classList.add(type, 'show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    } else {
        console.log('Notification:', message, '(', type, ')');
    }
} 