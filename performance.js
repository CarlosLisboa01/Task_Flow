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