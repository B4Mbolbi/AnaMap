/**
 * ==========================================
 * УПРАВЛЕНИЕ СОСТОЯНИЕМ
 * ==========================================
 * 
 * Централизованное хранилище состояния приложения.
 * Все компоненты читают и записывают данные через этот модуль.
 * ==========================================
 */

const State = {
    /** Массив событий */
    events: [],

    /** Текущие фильтры */
    filters: {
        // Набор активных типов событий
        types: new Set(['personal', 'traffic', 'roadwork', 'safety']),
        // Фильтр по статусу (пусто = все статусы)
        status: '',
        // Фильтр по дате (формат: YYYY-MM-DD)
        dateFrom: '',
        dateTo: ''
    },

    /** Текущий режим отображения ('types' | 'years') */
    viewMode: 'types',

    /**
     * Получить события, отфильтрованные по текущим настройкам
     * @returns {Array} отфильтрованный массив событий
     */
    getFilteredEvents() {
        return this.events.filter(e => {
            if (!this.filters.types.has(e.type)) return false;
            if (this.filters.status && e.status !== this.filters.status) return false;
            if (this.filters.dateFrom && e.date < this.filters.dateFrom) return false;
            if (this.filters.dateTo && e.date > this.filters.dateTo) return false;
            return true;
        });
    },

    /**
     * Обновить фильтры типов
     * @param {Set} types - новый набор типов
     */
    setFilterTypes(types) {
        this.filters.types = types;
    },

    /**
     * Установить фильтр по дате
     * @param {string} date - дата в формате YYYY-MM-DD
     */
    setFilterDateFrom(date) {
        this.filters.dateFrom = date;
    },

    /**
     * Установить верхнюю границу фильтра по дате
     * @param {string} date - дата в формате YYYY-MM-DD
     */
    setFilterDateTo(date) {
        this.filters.dateTo = date;
    },

    /**
     * Установить режим отображения
     * @param {string} mode - 'types' или 'years'
     */
    setViewMode(mode) {
        this.viewMode = mode;
    },

    /**
     * Установить массив событий (загрузка из API)
     * @param {Array} events - массив событий
     */
    setEvents(events) {
        this.events = events;
    }
};
