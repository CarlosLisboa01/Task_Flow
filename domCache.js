// Sistema de cache para elementos DOM
class DOMCache {
    constructor() {
        this.cache = new Map();
        this.observers = new Map();
        this.mutationObserver = new MutationObserver(this.handleDOMChanges.bind(this));
        
        // Configuração do observer
        this.observerConfig = {
            childList: true,
            subtree: true,
            attributes: true
        };
        
        // Iniciar observação do DOM
        this.mutationObserver.observe(document.body, this.observerConfig);
    }
    
    // Obter elemento com cache
    get(selector, context = document) {
        const cacheKey = `${context.tagName || 'document'}-${selector}`;
        
        if (!this.cache.has(cacheKey)) {
            const element = context.querySelector(selector);
            if (element) {
                this.cache.set(cacheKey, element);
                this.observeElement(element, selector);
            }
        }
        
        return this.cache.get(cacheKey);
    }
    
    // Obter múltiplos elementos
    getAll(selector, context = document) {
        const cacheKey = `${context.tagName || 'document'}-${selector}-all`;
        
        if (!this.cache.has(cacheKey)) {
            const elements = Array.from(context.querySelectorAll(selector));
            this.cache.set(cacheKey, elements);
            elements.forEach(element => this.observeElement(element, selector));
        }
        
        return this.cache.get(cacheKey);
    }
    
    // Observar mudanças em um elemento
    observeElement(element, selector) {
        if (!this.observers.has(element)) {
            this.observers.set(element, selector);
        }
    }
    
    // Lidar com mudanças no DOM
    handleDOMChanges(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                // Limpar cache para seletores afetados
                this.observers.forEach((selector, element) => {
                    if (!document.contains(element)) {
                        this.cache.delete(`document-${selector}`);
                        this.observers.delete(element);
                    }
                });
            }
            else if (mutation.type === 'attributes') {
                const element = mutation.target;
                this.observers.forEach((selector, observedElement) => {
                    if (observedElement === element) {
                        this.cache.delete(`document-${selector}`);
                    }
                });
            }
        });
    }
    
    // Limpar cache
    clear() {
        this.cache.clear();
        this.observers.clear();
    }
    
    // Remover elemento específico do cache
    remove(selector) {
        const cacheKey = `document-${selector}`;
        this.cache.delete(cacheKey);
    }
    
    // Desconectar observer
    disconnect() {
        this.mutationObserver.disconnect();
        this.clear();
    }
}

// Exportar instância única
export const domCache = new DOMCache();

// Exemplo de uso:
/*
import { domCache } from './domCache.js';

// Usar cache para elementos frequentemente acessados
const header = domCache.get('#header');
const buttons = domCache.getAll('.button');

// Limpar cache quando necessário
domCache.clear();

// Desconectar observer ao desmontar componente
window.addEventListener('unload', () => {
    domCache.disconnect();
});
*/

// Cache de elementos do DOM
const DOM = {
    elements: {},
    
    // Inicializar cache do DOM
    init() {
        // Elementos comuns
        this.elements.notification = document.getElementById('notification');
        this.elements.notificationMessage = document.getElementById('notification-message');
        
        // Elementos do dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            this.elements.tasksTbody = document.getElementById('tasks-tbody');
            this.elements.addTaskBtn = document.getElementById('add-task-btn');
            this.elements.taskModal = document.getElementById('task-modal');
            this.elements.taskForm = document.getElementById('task-form');
            this.elements.filters = {
                status: document.getElementById('status-filter'),
                priority: document.getElementById('priority-filter'),
                type: document.getElementById('type-filter'),
                search: document.getElementById('search-input')
            };
        }
        
        // Elementos do calendário
        if (window.location.pathname.includes('calendario.html')) {
            this.elements.calendarGrid = document.getElementById('calendar-grid');
            this.elements.calendarTitle = document.getElementById('calendar-title');
            this.elements.calendarControls = {
                prev: document.getElementById('prev-month'),
                next: document.getElementById('next-month'),
                today: document.getElementById('today-btn')
            };
        }
    },
    
    // Obter elemento do cache
    get(elementId) {
        return this.elements[elementId] || document.getElementById(elementId);
    }
};

// Inicializar cache do DOM quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => DOM.init());

// Exportar objeto DOM
window.DOM = DOM; 