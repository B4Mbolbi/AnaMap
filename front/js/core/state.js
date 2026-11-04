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

    /** Массив связей [{from, to, id, type, comment}] */
    links: [],

    /** Текущие фильтры */
    filters: {
        // Набор активных типов событий
        types: new Set(['personal', 'traffic', 'roadwork', 'safety']),
        // Фильтр по статусу (пусто = все статусы)
        status: '',
        // Фильтр по дате (формат: YYYY-MM-DD)
        dateFrom: '',
        dateTo: '',
        // Поиск по описанию (без учёта регистра)
        search: '',
        // Сортировка: 'date_desc' | 'date_asc' | 'status'
        sortBy: 'date_desc'
    },

    /** Текущий режим отображения ('types' | 'years') */
    viewMode: 'types',

    /**
     * Получить события, отфильтрованные по текущим настройкам
     * @returns {Array} отфильтрованный массив событий
     */
    getFilteredEvents() {
        let result = this.events.filter(e => {
            if (!this.filters.types.has(e.type)) return false;
            if (this.filters.status && e.status !== this.filters.status) return false;
            if (this.filters.dateFrom && e.date < this.filters.dateFrom) return false;
            if (this.filters.dateTo && e.date > this.filters.dateTo) return false;
            // Поиск по описанию
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                if (!e.description?.toLowerCase().includes(searchLower)) return false;
            }
            return true;
        });

        // Сортировка
        const sortBy = this.filters.sortBy;
        if (sortBy === 'date_desc') {
            result.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        } else if (sortBy === 'date_asc') {
            result.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        } else if (sortBy === 'status') {
            const statusOrder = ['planned', 'in_progress', 'completed'];
            result.sort((a, b) => {
                const sa = statusOrder.indexOf(a.status) >= 0 ? statusOrder.indexOf(a.status) : 99;
                const sb = statusOrder.indexOf(b.status) >= 0 ? statusOrder.indexOf(b.status) : 99;
                return sa - sb;
            });
        }

        return result;
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
    },

    /**
     * Установить поисковый запрос
     * @param {string} search 
     */
    setFilterSearch(search) {
        this.filters.search = search;
    },

    /**
     * Установить сортировку
     * @param {string} sortBy - 'date_desc' | 'date_asc' | 'status'
     */
    setFilterSortBy(sortBy) {
        this.filters.sortBy = sortBy;
    },

    // ==========================================
    // УПРАВЛЕНИЕ СВЯЗЯМИ
    // ==========================================

    /**
     * Получить связи для события (входящие и исходящие)
     * @param {string} eventId 
     * @returns {Array}
     */
    getLinksForEvent(eventId) {
        return this.links.filter(l => l.from === eventId || l.to === eventId);
    },

    /**
     * Проверить, существует ли связь между двумя событиями
     * @param {string} fromId 
     * @param {string} toId 
     * @returns {boolean}
     */
    linkExists(fromId, toId) {
        return this.links.some(l =>
            (l.from === fromId && l.to === toId) ||
            (l.from === toId && l.to === fromId)
        );
    },

    /**
     * Добавить новую связь
     * @param {object} linkData - {from, to, type, comment}
     * @returns {object} созданная связь
     */
    addLink(linkData) {
        const link = {
            from: linkData.from,
            to: linkData.to,
            id: Date.now(),
            type: linkData.type || 'coincidence',
            comment: linkData.comment || ''
        };
        this.links.push(link);
        savedLinks = this.links;
        Storage.saveLinks(this.links);
        return link;
    },

    /**
     * Удалить связь по ID
     * @param {number} linkId 
     */
    removeLink(linkId) {
        this.links = this.links.filter(l => l.id !== linkId);
        savedLinks = this.links;
        Storage.saveLinks(this.links);
    },

    /**
     * Обновить связь
     * @param {number} linkId 
     * @param {object} updates - {type, comment}
     */
    updateLink(linkId, updates) {
        const link = this.links.find(l => l.id === linkId);
        if (link) {
            Object.assign(link, updates);
            Storage.saveLinks(this.links);
        }
    },

    /**
     * Получить связи, отфильтрованные по видимым событиям
     * @returns {Array}
     */
    getFilteredLinks() {
        const visibleIds = new Set(this.getFilteredEvents().map(e => e.id));
        return this.links.filter(l => visibleIds.has(l.from) && visibleIds.has(l.to));
    }
};
