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