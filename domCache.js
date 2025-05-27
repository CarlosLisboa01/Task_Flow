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