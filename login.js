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
        console.log('Cliente Supabase inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        document.addEventListener('DOMContentLoaded', function() {
            alert('Erro ao inicializar sistema de autenticação. Por favor, recarregue a página.');
        });
    }
}

// Variáveis do DOM
let loginForm;
let loginEmail;
let loginPassword;
let notification;
let notificationMessage;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se estamos na página de login
    if (!window.location.pathname.includes('index.html') && 
        window.location.pathname !== '/' && 
        !window.location.pathname.endsWith('/')) {
        return;
    }
    
    // Inicializar variáveis do DOM
    loginForm = document.getElementById('login-form');
    loginEmail = document.getElementById('login-email');
    loginPassword = document.getElementById('login-password');
    notification = document.getElementById('notification');
    notificationMessage = document.getElementById('notification-message');
    
    // Verificar se o Supabase está disponível
    if (!window.supabaseClient) {
        console.error('Cliente Supabase não encontrado. Inicializando...');
        try {
            window.SUPABASE_URL = 'https://kvwsfagncbamiezjdlms.supabase.co';
            window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY';
            window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        } catch (error) {
            console.error('Erro ao inicializar Supabase:', error);
            showNotification('Erro ao carregar sistema de autenticação. Por favor, recarregue a página.', 'error');
            return;
        }
    }
    
    // Verificar se o usuário já está autenticado
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (session) {
            // Redirecionar para o dashboard
            window.location.href = 'dashboard.html';
            return;
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
    
    // Configurar evento de login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Função para lidar com o login
async function handleLogin(e) {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
        console.error('Elementos do formulário não encontrados');
        return;
    }
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    // Validação básica
    if (!email || !password) {
        showNotification('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    try {
        // Verificar se o Supabase está disponível
        if (!window.supabaseClient) {
            throw new Error('Cliente Supabase não inicializado');
        }
        
        // Mostrar indicador de carregamento
        const submitBtn = document.querySelector('#login-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Aguarde...';
        }
        
        // Fazer login com o Supabase
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            console.error('Erro de login:', error);
            
            if (error.message.includes('Invalid login')) {
                showNotification('Email ou senha incorretos. Por favor, tente novamente.', 'error');
            } else {
                showNotification(error.message, 'error');
            }
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Entrar';
            }
            
            return;
        }
        
        // Login bem-sucedido, redirecionar para o dashboard
        showNotification('Login bem-sucedido!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showNotification('Ocorreu um erro ao fazer login. Por favor, tente novamente.', 'error');
        
        const submitBtn = document.querySelector('#login-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
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
        alert(message);
    }
} 