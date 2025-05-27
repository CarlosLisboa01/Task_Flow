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