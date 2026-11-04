/**
 * ==========================================
 * STORE — ЕДИНЫЙ ИСТОЧНИК ПРАВДЫ
 * ==========================================
 * 
 * Централизованное управление состоянием.
 * Все мутации проходят через Store.commit.
 * Подписчики получают уведомления об изменениях.
 * 
 * Зависимости: config.js
 * ==========================================
 */

const Store = {
    /** Состояние приложения */
    state: {
        /** Массив событий */
        events: [],
        /** Массив связей [{from, to, id, type, comment}] */
        links: [],
        /** Текущие фильтры */
        filters: {
            types: new Set(['personal', 'traffic', 'roadwork', 'safety']),
            status: '',
            dateFrom: '',
            dateTo: '',
            search: '',
            sortBy: 'date_desc'
        },
        /** Текущий режим отображения ('types' | 'years') */
        viewMode: 'types',
        /** ID активного проекта */
        activeProjectId: null
    },

    /** Множество подписчиков */
    _subs: new Set(),

    /**
     * Подписаться на изменения
     * @param {Function} fn - callback(reason)
     * @returns {Function} функция отписки
     */
    subscribe(fn) {
        this._subs.add(fn);
        return () => this._subs.delete(fn);
    },

    /**
     * Уведомить подписчиков
     * @param {string} reason 
     */
    _notify(reason) {
        this._subs.forEach(fn => {
            try { fn(reason); } catch (e) { console.error('[Store] Subscribe error:', e); }
        });
    },

    /**
     * Применить мутацию и уведомить подписчиков
     * @param {Function} mutator - функция, мутирующая state
     * @param {string} reason - причина: 'events' | 'links' | 'filters' | 'projects' | 'view'
     */
    commit(mutator, reason) {
        mutator(this.state);
        this._persist(reason);
        this._notify(reason);
    },

    /**
     * Сохранить изменённые данные в Storage
     * @param {string} reason 
     */
    _persist(reason) {
        if (reason === 'events') Storage.saveEvents(this.state.events);
        if (reason === 'links')  Storage.saveLinks(this.state.links);
    },

    // ==========================================
    // СОБЫТИЯ
    // ==========================================

    /**
     * Установить массив событий
     * @param {Array} events 
     */
    setEvents(events) {
        this.commit(state => { state.events = events; }, 'events');
    },

    /**
     * Получить отфильтрованные события
     * @returns {Array}
     */
    getFilteredEvents() {
        let result = this.state.events.filter(e => {
            if (!this.state.filters.types.has(e.type)) return false;
            if (this.state.filters.status && e.status !== this.state.filters.status) return false;
            if (this.state.filters.dateFrom && e.date < this.state.filters.dateFrom) return false;
            if (this.state.filters.dateTo && e.date > this.state.filters.dateTo) return false;
            if (this.state.filters.search) {
                const searchLower = this.state.filters.search.toLowerCase();
                if (!e.description?.toLowerCase().includes(searchLower)) return false;
            }
            return true;
        });

        const sortBy = this.state.filters.sortBy;
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

    // ==========================================
    // СВЯЗИ
    // ==========================================

    /**
     * Добавить связь
     * @param {object} linkData 
     * @returns {object}
     */
    addLink(linkData) {
        const link = {
            from: linkData.from,
            to: linkData.to,
            id: Date.now(),
            type: linkData.type || 'coincidence',
            comment: linkData.comment || ''
        };
        this.commit(state => { state.links.push(link); }, 'links');
        return link;
    },

    /**
     * Удалить связь
     * @param {number} linkId 
     */
    removeLink(linkId) {
        this.commit(state => {
            state.links = state.links.filter(l => l.id !== linkId);
        }, 'links');
    },

    /**
     * Обновить связь
     * @param {number} linkId 
     * @param {object} updates 
     */
    updateLink(linkId, updates) {
        this.commit(state => {
            const link = state.links.find(l => l.id === linkId);
            if (link) Object.assign(link, updates);
        }, 'links');
    },

    /**
     * Получить связи для события
     * @param {string} eventId 
     * @returns {Array}
     */
    getLinksForEvent(eventId) {
        return this.state.links.filter(l => l.from === eventId || l.to === eventId);
    },

    /**
     * Проверить существование связи
     * @param {string} fromId 
     * @param {string} toId 
     * @returns {boolean}
     */
    linkExists(fromId, toId) {
        return this.state.links.some(l =>
            (l.from === fromId && l.to === toId) ||
            (l.from === toId && l.to === fromId)
        );
    },

    /**
     * Получить отфильтрованные связи
     * @returns {Array}
     */
    getFilteredLinks() {
        const visibleIds = new Set(this.getFilteredEvents().map(e => e.id));
        return this.state.links.filter(l => visibleIds.has(l.from) && visibleIds.has(l.to));
    },

    // ==========================================
    // ФИЛЬТРЫ
    // ==========================================

    setFilterTypes(types) {
        this.commit(state => { state.filters.types = types; }, 'filters');
    },

    setFilterDateFrom(date) {
        this.commit(state => { state.filters.dateFrom = date; }, 'filters');
    },

    setFilterDateTo(date) {
        this.commit(state => { state.filters.dateTo = date; }, 'filters');
    },

    setFilterSearch(search) {
        this.commit(state => { state.filters.search = search; }, 'filters');
    },

    setFilterSortBy(sortBy) {
        this.commit(state => { state.filters.sortBy = sortBy; }, 'filters');
    },

    setFilterStatus(status) {
        this.commit(state => { state.filters.status = status; }, 'filters');
    },

    // ==========================================
    // VIEW MODE
    // ==========================================

    setViewMode(mode) {
        this.commit(state => { state.viewMode = mode; }, 'view');
    },

    // ==========================================
    // ПРОЕКТЫ
    // ==========================================

    setActiveProjectId(projectId) {
        this.commit(state => { state.activeProjectId = projectId; }, 'projects');
    },

    // ==========================================
    // СБРОС ФИЛЬТРОВ
    // ==========================================

    /**
     * Сбросить все фильтры — показать все события.
     * Вызывается при переключении/импорте проекта.
     */
    resetFilters() {
        this.commit(state => {
            // Восстановить все категории (базовые + пользовательские)
            const allCats = typeof getAllCategories === 'function'
                ? getAllCategories()
                : Object.keys(CONFIG.BASE_LAYERS).map(k => ({ key: k }));
            state.filters.types = new Set(allCats.map(c => c.key));
            state.filters.status = '';
            state.filters.dateFrom = '';
            state.filters.dateTo = '';
            state.filters.search = '';
        }, 'filters');
    }
};
