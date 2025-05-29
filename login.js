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
let registerForm;
let registerName;
let registerEmail;
let registerPassword;
let registerConfirmPassword;
let notification;
let notificationMessage;
let sliderContainer;
let toggleButtons;
let forgotPasswordLink;

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
    registerForm = document.getElementById('register-form');
    registerName = document.getElementById('register-name');
    registerEmail = document.getElementById('register-email');
    registerPassword = document.getElementById('register-password');
    registerConfirmPassword = document.getElementById('register-confirm-password');
    notification = document.getElementById('notification');
    notificationMessage = document.getElementById('notification-message');
    sliderContainer = document.querySelector('.slider-container');
    toggleButtons = document.querySelectorAll('.toggle-form');
    forgotPasswordLink = document.querySelector('.forgot-password');
    
    // Configurar eventos do slider
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            sliderContainer.classList.toggle('right-panel-active');
            
            // Resetar formulários ao trocar
            loginForm.reset();
            registerForm.reset();
            
            // Animar elementos do banner
            setTimeout(() => {
                const activeBanner = sliderContainer.classList.contains('right-panel-active') 
                    ? document.querySelector('.register-banner') 
                    : document.querySelector('.login-banner');
                
                activeBanner.querySelectorAll('*').forEach((element, index) => {
                    element.style.animation = 'none';
                    element.offsetHeight; // Trigger reflow
                    element.style.animation = `fadeIn 0.6s ease-in-out ${index * 0.2}s forwards`;
                });
            }, 300);
        });
    });

    // Adicionar animação ao carregar a página
    setTimeout(() => {
        document.querySelector('.login-banner').querySelectorAll('*').forEach((element, index) => {
            element.style.animation = `fadeIn 0.6s ease-in-out ${index * 0.2}s forwards`;
        });
    }, 100);
    
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
    
    // Configurar eventos dos formulários
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Configurar eventos dos botões sociais
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', handleSocialLogin);
    });

    // Configurar evento de recuperação de senha
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
});

// Função para lidar com registro
async function handleRegister(e) {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
        console.error('Elementos do formulário não encontrados');
        return;
    }
    
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const confirmPassword = registerConfirmPassword.value;
    
    // Validação básica
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem.', 'error');
        return;
    }
    
    try {
        // Mostrar indicador de carregamento
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Registrando...';
        }
        
        // Registrar com o Supabase
        const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });
        
        if (error) throw error;
        
        // Registro bem-sucedido
        showNotification('Registro realizado com sucesso! Verifique seu email para confirmar a conta.', 'success');
        
        // Voltar para o formulário de login após 2 segundos
        setTimeout(() => {
            sliderContainer.classList.remove('right-panel-active');
            registerForm.reset();
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao registrar:', error);
        showNotification(error.message || 'Erro ao criar conta. Por favor, tente novamente.', 'error');
    } finally {
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrar';
        }
    }
}

// Função para lidar com login social
async function handleSocialLogin(e) {
    e.preventDefault();
    
    try {
        // Desabilitar o botão durante o processo
        e.currentTarget.style.pointerEvents = 'none';
        e.currentTarget.style.opacity = '0.7';
        e.currentTarget.classList.add('loading');

        const options = {
            redirectTo: 'https://task-flow-orcin.vercel.app/',
            scopes: 'email profile',
            queryParams: {
                access_type: 'offline',
                prompt: 'select_account'
            }
        };

        // Tentar login com Google
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options
        });

        if (error) {
            throw error;
        }

        console.log('Redirecionando para autenticação Google...');

    } catch (error) {
        console.error('Erro ao fazer login com Google:', error);
        showNotification('Erro ao fazer login com Google. Por favor, tente novamente.', 'error');
        
        // Reabilitar o botão em caso de erro
        e.currentTarget.style.pointerEvents = 'auto';
        e.currentTarget.style.opacity = '1';
        e.currentTarget.classList.remove('loading');
    }
}

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
        const submitBtn = loginForm.querySelector('button[type="submit"]');
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
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Entrar';
        }
    }
}

// Função para lidar com recuperação de senha
async function handleForgotPassword(e) {
    e.preventDefault();
    
    // Verificar se há um email preenchido
    const email = loginEmail.value.trim();
    if (!email) {
        showNotification('Por favor, insira seu email para recuperar a senha.', 'error');
        loginEmail.focus();
        return;
    }

    try {
        // Desabilitar o link durante o processo
        const forgotLink = e.target;
        const originalText = forgotLink.textContent;
        forgotLink.style.pointerEvents = 'none';
        forgotLink.textContent = 'Enviando...';

        // Enviar email de recuperação
        const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`,
        });

        if (error) throw error;

        showNotification('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
        
    } catch (error) {
        console.error('Erro ao solicitar recuperação de senha:', error);
        showNotification(
            error.message === 'User not found'
                ? 'Email não encontrado. Verifique se digitou corretamente.'
                : 'Erro ao enviar email de recuperação. Tente novamente.',
            'error'
        );
    } finally {
        // Restaurar o link
        if (forgotPasswordLink) {
            forgotPasswordLink.style.pointerEvents = 'auto';
            forgotPasswordLink.textContent = 'Esqueceu a senha?';
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