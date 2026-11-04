/**
 * ==========================================
 * ХРАНИЛИЩЕ (localStorage)
 * ==========================================
 * 
 * Централизованный доступ к localStorage.
 * Все операции сериализации/десериализации
 * в одном месте.
 * ==========================================
 */

const Storage = {
    // --- Категории ---

    loadCategories() {
        try {
            const data = localStorage.getItem(CONFIG.CUSTOM_CATEGORIES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Storage] Ошибка загрузки категорий:', error);
            return [];
        }
    },

    saveCategories(categories) {
        try {
            localStorage.setItem(CONFIG.CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
        } catch (error) {
            console.error('[Storage] Ошибка сохранения категорий:', error);
        }
    },

    // --- Статусы ---

    loadStatuses() {
        try {
            const data = localStorage.getItem(CONFIG.CUSTOM_STATUSES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Storage] Ошибка загрузки статусов:', error);
            return [];
        }
    },

    saveStatuses(statuses) {
        try {
            localStorage.setItem(CONFIG.CUSTOM_STATUSES_KEY, JSON.stringify(statuses));
        } catch (error) {
            console.error('[Storage] Ошибка сохранения статусов:', error);
        }
    },

    // --- Связи ---

    loadLinks() {
        try {
            const data = localStorage.getItem(CONFIG.LINKS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Storage] Ошибка загрузки связей:', error);
            return [];
        }
    },

    saveLinks(links) {
        try {
            localStorage.setItem(CONFIG.LINKS_KEY, JSON.stringify(links));
        } catch (error) {
            console.error('[Storage] Ошибка сохранения связей:', error);
        }
    },

    // --- События ---

    loadEvents() {
        try {
            const data = localStorage.getItem(CONFIG.EVENTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Storage] Ошибка загрузки событий:', error);
            return [];
        }
    },

    saveEvents(events = State.events) {
        try {
            localStorage.setItem(CONFIG.EVENTS_KEY, JSON.stringify(events));
        } catch (error) {
            console.error('[Storage] Ошибка сохранения событий:', error);
        }
    }
};
