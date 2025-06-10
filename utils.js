import CONFIG from './config.js';

// Cache para melhorar performance
const cache = new Map();

// Funções de validação
const validators = {
    // Validar entrada de texto
    validateText: (text, minLength = 1, maxLength = 255) => {
        if (!text || typeof text !== 'string') return false;
        text = text.trim();
        return text.length >= minLength && text.length <= maxLength;
    },

    // Validar data
    validateDate: (date) => {
        if (!date) return false;
        const dateObj = new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj);
    },

    // Validar email
    validateEmail: (email) => {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validar senha
    validatePassword: (password) => {
        if (!password || typeof password !== 'string') return false;
        // Mínimo 8 caracteres, pelo menos uma letra e um número
        return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    },

    // Sanitizar texto para evitar XSS
    sanitizeText: (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// Exportar funções
window.validators = validators;

// Utilitários de sanitização
export const sanitize = {
    text(str) {
        if (!str) return '';
        return str.replace(/[<>]/g, char => ({
            '<': '&lt;',
            '>': '&gt;'
        }[char]));
    },
    
    html(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    sql(str) {
        return str.replace(/['";]/g, '');
    }
};

// Utilitários de validação
export const validate = {
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },
    
    password(pwd) {
        return pwd && pwd.length >= CONFIG.SECURITY.PASSWORD_MIN_LENGTH;
    },
    
    date(date) {
        return !isNaN(Date.parse(date));
    }
};

// Utilitários de performance
export const performance = {
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
    
    memoize(fn) {
        const cache = new Map();
        return (...args) => {
            const key = JSON.stringify(args);
            if (cache.has(key)) return cache.get(key);
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    }
};

// Utilitários de DOM
export const dom = {
    // Cache de elementos DOM
    elements: new Map(),
    
    // Getter com cache
    get(selector) {
        if (!this.elements.has(selector)) {
            this.elements.set(selector, document.querySelector(selector));
        }
        return this.elements.get(selector);
    },
    
    // Criação otimizada de elementos
    create(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        return element;
    }
};

// Utilitários de data
export const dateUtils = {
    format(date, format = 'DD/MM/YYYY') {
        const d = new Date(date);
        const pad = (num) => String(num).padStart(2, '0');
        
        return format
            .replace('DD', pad(d.getDate()))
            .replace('MM', pad(d.getMonth() + 1))
            .replace('YYYY', d.getFullYear());
    },
    
    isValid(date) {
        return date instanceof Date && !isNaN(date);
    },
    
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
};

// Limpeza de cache periódica
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CONFIG.CACHE_DURATION * 1000) {
            cache.delete(key);
        }
    }
}, CONFIG.CACHE_DURATION * 1000); 