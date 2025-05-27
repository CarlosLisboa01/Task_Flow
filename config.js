// Configuração do Supabase
const SUPABASE_CONFIG = {
    url: 'https://kvwsfagncbamiezjdlms.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY'
};

// Função para inicializar o cliente Supabase
function initSupabaseClient() {
    if (!window.supabaseClient) {
        console.log('Inicializando cliente Supabase');
        window.supabaseClient = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
    }
    return window.supabaseClient;
}

// Exportar funções e configurações
window.initSupabaseClient = initSupabaseClient;
window.SUPABASE_CONFIG = SUPABASE_CONFIG; 