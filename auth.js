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
        // Verificar se o cliente Supabase já foi inicializado
        if (!window.supabaseClient) {
            window.SUPABASE_URL = 'https://kvwsfagncbamiezjdlms.supabase.co';
            window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY';
            window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
            console.log('Cliente Supabase inicializado com sucesso em auth.js');
        } else {
            console.log('Cliente Supabase já inicializado, reusando em auth.js');
        }
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        document.addEventListener('DOMContentLoaded', function() {
            alert('Erro ao inicializar sistema de autenticação. Por favor, recarregue a página.');
        });
    }
}

// Elementos do DOM
let loginForm;
let registerForm;
let tabBtns;
let tabContents;
let notification;
let notificationMessage;

// Verificação de autenticação atual
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado - Inicializando auth.js');
    
    try {
        // Inicializar elementos do DOM para o dashboard
        notification = document.getElementById('notification');
        notificationMessage = document.getElementById('notification-message');
        
        // Verificar se o Supabase está disponível
        if (!window.supabaseClient) {
            console.error('Cliente Supabase não está disponível');
            if (notification && notificationMessage) {
                showNotification('Erro ao carregar sistema de autenticação. Por favor, recarregue a página.', 'error');
            } else {
                alert('Erro ao carregar sistema de autenticação. Por favor, recarregue a página.');
            }
            return;
        }

        // Verificar se estamos na página de login ou dashboard
        const isLoginPage = window.location.pathname.includes('index.html') || 
                           window.location.pathname === '/' || 
                           window.location.pathname.endsWith('/') ||
                           window.location.pathname.includes('registro.html');
        
        console.log('Caminho atual:', window.location.pathname, 'É página de login:', isLoginPage);
        
        // Obter a sessão do usuário
        const { data, error } = await window.supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Erro ao verificar sessão:', error);
            showNotification('Erro ao verificar sua sessão. Por favor, tente novamente.', 'error');
            return;
        }
        
        console.log('Dados da sessão:', data);
        const session = data?.session;
        
        if (isLoginPage) {
            // Se estiver na página de login e já estiver autenticado, redirecionar para o dashboard
            if (session) {
                console.log('Usuário autenticado redirecionando para dashboard');
                window.location.href = 'dashboard.html';
            }
        } else {
            // Se não estiver na página de login e não estiver autenticado, redirecionar para o login
            if (!session) {
                console.log('Usuário não autenticado redirecionando para login');
                window.location.href = 'index.html';
            } else {
                // Atualizar informações do usuário no dashboard
                const userNameElement = document.getElementById('user-name');
                const userEmailElement = document.getElementById('user-email');
                
                if (userNameElement && userEmailElement) {
                    const email = session.user.email;
                    
                    try {
                        // Obter os metadados do usuário que incluem o nome
                        const { data, error: userError } = await window.supabaseClient.auth.getUser();
                        
                        if (userError) {
                            console.error('Erro ao obter dados do usuário:', userError);
                            userNameElement.textContent = email.split('@')[0];
                        } else {
                            console.log('Dados do usuário:', data);
                            const user_metadata = data.user.user_metadata;
                            const name = user_metadata && user_metadata.name ? user_metadata.name : email.split('@')[0];
                            
                            userNameElement.textContent = name;
                        }
                        
                        userEmailElement.textContent = email;
                    } catch (userDataError) {
                        console.error('Erro ao processar dados do usuário:', userDataError);
                        userNameElement.textContent = email.split('@')[0];
                        userEmailElement.textContent = email;
                    }
                }
                
                // Configurar evento de logout
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', handleLogout);
                    console.log('Evento de logout configurado');
                }
            }
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showNotification('Ocorreu um erro ao verificar autenticação. Por favor, recarregue a página.', 'error');
    }
});

// Função para lidar com o logout
async function handleLogout() {
    try {
        if (!window.supabaseClient) {
            throw new Error('Cliente Supabase não inicializado');
        }
        
        const { error } = await window.supabaseClient.auth.signOut();
        
        if (error) {
            showNotification(error.message, 'error');
        } else {
            console.log('Logout bem-sucedido');
            window.location.href = 'index.html';
        }
    } catch (error) {
        showNotification('Ocorreu um erro ao fazer logout. Por favor, tente novamente.', 'error');
        console.error('Erro de logout:', error);
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