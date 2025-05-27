// Gerenciador de recursos
const ResourceManager = {
    // Cache de recursos
    cache: new Map(),
    
    // Carregar recursos de forma assíncrona
    async loadResources(resources) {
        const promises = resources.map(resource => {
            if (this.cache.has(resource.url)) {
                return this.cache.get(resource.url);
            }
            
            let promise;
            switch (resource.type) {
                case 'script':
                    promise = this.loadScript(resource.url);
                    break;
                case 'style':
                    promise = this.loadStyle(resource.url);
                    break;
                case 'image':
                    promise = this.loadImage(resource.url);
                    break;
                default:
                    promise = Promise.reject(new Error(`Tipo de recurso desconhecido: ${resource.type}`));
            }
            
            this.cache.set(resource.url, promise);
            return promise;
        });
        
        return Promise.all(promises);
    },
    
    // Carregar script
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Erro ao carregar script: ${url}`));
            document.head.appendChild(script);
        });
    },
    
    // Carregar estilo
    loadStyle(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Erro ao carregar estilo: ${url}`));
            document.head.appendChild(link);
        });
    },
    
    // Carregar imagem
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Erro ao carregar imagem: ${url}`));
        });
    },
    
    // Limpar cache
    clearCache() {
        this.cache.clear();
    }
};

// Exportar objeto ResourceManager
window.ResourceManager = ResourceManager; 