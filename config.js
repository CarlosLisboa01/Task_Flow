// Configuração segura do ambiente
const CONFIG = {
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://kvwsfagncbamiezjdlms.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    API_VERSION: '1.0.0',
    DEBUG_MODE: process.env.NODE_ENV !== 'production',
    CACHE_DURATION: 3600, // 1 hora em segundos
    MAX_RETRY_ATTEMPTS: 3,
    REQUEST_TIMEOUT: 10000, // 10 segundos
    SECURITY: {
        MAX_LOGIN_ATTEMPTS: 5,
        PASSWORD_MIN_LENGTH: 8,
        SESSION_TIMEOUT: 3600000, // 1 hora em milissegundos
        ALLOWED_ORIGINS: ['http://localhost:3000', 'https://taskflow.com']
    }
};

// Validação de segurança básica
if (!CONFIG.SUPABASE_ANON_KEY) {
    console.error('Chave do Supabase não configurada!');
    throw new Error('Configuração de ambiente incompleta');
}

Object.freeze(CONFIG); // Previne modificações no objeto de configuração
export default CONFIG;

// Configurações do Supabase
const SUPABASE_CONFIG = {
    url: 'https://kvwsfagncbamiezjdlms.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY',
    
    // Configurações dos provedores OAuth
    oauth: {
        google: {
            enabled: true,
            clientId: '568240334427-sfj0tgs0cat59r7d2lsueuen07nl6tqh.apps.googleusercontent.com',
            redirectUrl: 'https://task-flow-orcin.vercel.app/',
            scope: 'email profile',
            prompt: 'select_account'
        }
    }
};

// Inicialização do cliente Supabase
function initSupabase() {
    try {
        const supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('Cliente Supabase inicializado com sucesso');
        return supabaseClient;
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        throw error;
    }
}

// Função para obter a URL de callback do OAuth
function getOAuthRedirectUrl(provider) {
    return SUPABASE_CONFIG.oauth[provider]?.redirectUrl || `${window.location.origin}/dashboard.html`;
}

// Função para obter as configurações do OAuth por provedor
function getOAuthConfig(provider) {
    return SUPABASE_CONFIG.oauth[provider] || {};
}

// Exportar as configurações e funções
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.initSupabase = initSupabase;
window.getOAuthRedirectUrl = getOAuthRedirectUrl;
window.getOAuthConfig = getOAuthConfig; 