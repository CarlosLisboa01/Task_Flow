// Gerenciador de recursos para otimização de carregamento
class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.loadQueue = [];
        this.loading = false;
        this.maxConcurrent = 5;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }
    
    // Carregar recurso com retry e cache
    async load(url, type = 'script') {
        if (this.resources.has(url)) {
            return this.resources.get(url);
        }
        
        return new Promise((resolve, reject) => {
            this.loadQueue.push({
                url,
                type,
                resolve,
                reject,
                attempts: 0
            });
            
            this.processQueue();
        });
    }
    
    // Processar fila de carregamento
    async processQueue() {
        if (this.loading) return;
        
        const current = this.loadQueue.splice(0, this.maxConcurrent);
        if (current.length === 0) return;
        
        this.loading = true;
        
        await Promise.allSettled(
            current.map(item => this.loadResource(item))
        );
        
        this.loading = false;
        this.processQueue();
    }
    
    // Carregar recurso específico
    async loadResource(item) {
        try {
            let resource;
            
            switch (item.type) {
                case 'script':
                    resource = await this.loadScript(item.url);
                    break;
                case 'style':
                    resource = await this.loadStyle(item.url);
                    break;
                case 'image':
                    resource = await this.loadImage(item.url);
                    break;
                default:
                    throw new Error(`Tipo de recurso não suportado: ${item.type}`);
            }
            
            this.resources.set(item.url, resource);
            item.resolve(resource);
        } catch (error) {
            if (item.attempts < this.retryAttempts) {
                item.attempts++;
                setTimeout(() => {
                    this.loadQueue.push(item);
                    this.processQueue();
                }, this.retryDelay * item.attempts);
            } else {
                item.reject(error);
            }
        }
    }
    
    // Carregar script
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = true;
            
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Falha ao carregar script: ${url}`));
            
            document.head.appendChild(script);
        });
    }
    
    // Carregar estilo
    loadStyle(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Falha ao carregar estilo: ${url}`));
            
            document.head.appendChild(link);
        });
    }
    
    // Carregar imagem
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${url}`));
        });
    }
    
    // Pré-carregar recursos
    preload(urls, type = 'script') {
        urls.forEach(url => this.load(url, type));
    }
    
    // Limpar recursos
    clear() {
        this.resources.clear();
        this.loadQueue = [];
    }
}

// Exportar instância única
export const resourceManager = new ResourceManager();

// Exemplo de uso:
/*
import { resourceManager } from './resourceManager.js';

// Carregar scripts
await resourceManager.load('path/to/script.js', 'script');

// Carregar estilos
await resourceManager.load('path/to/style.css', 'style');

// Pré-carregar múltiplos recursos
resourceManager.preload([
    'script1.js',
    'script2.js'
], 'script');

// Limpar recursos
resourceManager.clear();
*/ 