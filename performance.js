// Utilitários de performance
const Performance = {
    // Função de debounce para limitar chamadas frequentes
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Função de throttle para limitar a frequência de chamadas
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Otimizar renderização de listas longas
    renderList(items, container, renderItem, batchSize = 50) {
        const total = items.length;
        let rendered = 0;

        function renderBatch() {
            const fragment = document.createDocumentFragment();
            const limit = Math.min(rendered + batchSize, total);

            for (let i = rendered; i < limit; i++) {
                fragment.appendChild(renderItem(items[i]));
            }

            container.appendChild(fragment);
            rendered += batchSize;

            if (rendered < total) {
                requestAnimationFrame(renderBatch);
            }
        }

        requestAnimationFrame(renderBatch);
    },

    // Cache de resultados de funções pesadas
    memoize(fn) {
        const cache = new Map();
        return function memoized(...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }
};

// Exportar objeto Performance
window.Performance = Performance;

// Sistema de monitoramento de performance
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.marks = new Map();
        this.measures = new Map();
        this.observers = new Set();
        this.thresholds = {
            renderTime: 16, // 60fps
            loadTime: 1000,
            interactionTime: 100
        };
    }
    
    // Iniciar medição
    start(label) {
        this.marks.set(label, performance.now());
    }
    
    // Finalizar medição
    end(label) {
        if (!this.marks.has(label)) return;
        
        const startTime = this.marks.get(label);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.measures.set(label, duration);
        this.marks.delete(label);
        
        this.notifyObservers({
            type: 'measure',
            label,
            duration
        });
        
        return duration;
    }
    
    // Registrar métrica
    track(metric, value) {
        if (!this.metrics.has(metric)) {
            this.metrics.set(metric, []);
        }
        
        this.metrics.get(metric).push({
            value,
            timestamp: Date.now()
        });
        
        this.notifyObservers({
            type: 'metric',
            metric,
            value
        });
    }
    
    // Obter média de uma métrica
    getAverage(metric) {
        const values = this.metrics.get(metric);
        if (!values || values.length === 0) return 0;
        
        const sum = values.reduce((acc, curr) => acc + curr.value, 0);
        return sum / values.length;
    }
    
    // Monitorar tempo de renderização
    monitorRender(callback) {
        requestAnimationFrame(() => {
            this.start('render');
            callback();
            const duration = this.end('render');
            
            if (duration > this.thresholds.renderTime) {
                console.warn(`Renderização lenta detectada: ${duration.toFixed(2)}ms`);
            }
        });
    }
    
    // Monitorar tempo de carregamento
    monitorLoad(resource) {
        return new Promise((resolve, reject) => {
            this.start(`load-${resource}`);
            
            fetch(resource)
                .then(response => {
                    const duration = this.end(`load-${resource}`);
                    
                    if (duration > this.thresholds.loadTime) {
                        console.warn(`Carregamento lento detectado: ${resource} (${duration.toFixed(2)}ms)`);
                    }
                    
                    resolve(response);
                })
                .catch(error => {
                    this.end(`load-${resource}`);
                    reject(error);
                });
        });
    }
    
    // Adicionar observer
    addObserver(callback) {
        this.observers.add(callback);
    }
    
    // Remover observer
    removeObserver(callback) {
        this.observers.delete(callback);
    }
    
    // Notificar observers
    notifyObservers(data) {
        this.observers.forEach(callback => callback(data));
    }
    
    // Limpar dados
    clear() {
        this.metrics.clear();
        this.marks.clear();
        this.measures.clear();
    }
    
    // Gerar relatório
    generateReport() {
        const report = {
            metrics: {},
            measures: {},
            timestamp: Date.now()
        };
        
        // Processar métricas
        this.metrics.forEach((values, metric) => {
            report.metrics[metric] = {
                average: this.getAverage(metric),
                min: Math.min(...values.map(v => v.value)),
                max: Math.max(...values.map(v => v.value)),
                count: values.length
            };
        });
        
        // Processar medições
        this.measures.forEach((duration, label) => {
            report.measures[label] = duration;
        });
        
        return report;
    }
}

// Exportar instância única
export const performanceMonitor = new PerformanceMonitor();

// Exemplo de uso:
/*
import { performanceMonitor } from './performance.js';

// Monitorar renderização
performanceMonitor.monitorRender(() => {
    // Código de renderização
});

// Monitorar carregamento
await performanceMonitor.monitorLoad('/api/data');

// Registrar métrica customizada
performanceMonitor.track('fps', 60);

// Obter relatório
const report = performanceMonitor.generateReport();
console.log(report);

// Adicionar observer
performanceMonitor.addObserver(data => {
    console.log('Performance update:', data);
});
*/ 