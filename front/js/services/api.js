/**
 * ==========================================
 * СЛОЙ ВЗАИМОДЕЙСТВИЯ С API
 * ==========================================
 * 
 * Абстракция для работы с бэкендом.
 * Fallback на mock-данные при недоступности сервера.
 * Зависимости: config.js, data/mock.js
 * ==========================================
 */

const API = {

    /**
     * Базовая функция для выполнения HTTP-запросов
     * @param {string} url - путь запроса
     * @param {object} options - настройки fetch
     * @returns {Promise} результат запроса
     */
    async _request(url, options = {}) {
        if (!CONFIG.API_ENABLED) {
            return this._getMockData(url, options);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

            const response = await fetch(`${CONFIG.BASE_URL}${url}`, {
                ...options,
                headers: { 'Content-Type': 'application/json', ...options.headers },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[API] Запрос не выполнен:', error);
            throw error;
        }
    },

    /** Получить все события */
    async getEvents() {
        try {
            return await this._request(CONFIG.ENDPOINTS.EVENTS, { method: 'GET' });
        } catch (error) {
            console.warn('[API] Бэкенд недоступен, используем mock-данные');
            // TEST_DATA — массив проектов, извлекаем плоский массив событий
            return getAllMockEvents();
        }
    },

    /** Добавить новое событие */
    async addEvent(eventData) {
        try {
            return await this._request(CONFIG.ENDPOINTS.ADD_EVENT, {
                method: 'POST',
                body: JSON.stringify(eventData)
            });
        } catch (error) {
            console.warn('[API] Бэкенд недоступен, используем mock');
            return this._getMockData('', { method: 'POST', body: JSON.stringify(eventData) });
        }
    },

    /** Добавить массив событий (пакетный импорт) */
    async addEvents(eventDataArray) {
        try {
            return await this._request(CONFIG.ENDPOINTS.ADD_EVENT + '/batch', {
                method: 'POST',
                body: JSON.stringify(eventDataArray)
            });
        } catch (error) {
            console.warn('[API] addEvents: бэкенд недоступен, сохраняем в localStorage');
            Storage.saveEvents(eventDataArray);
            return { success: true, count: eventDataArray.length };
        }
    },

    /** Сохранить пользовательские категории */
    async saveCategories(categories) {
        return new Promise((resolve) => {
            setTimeout(() => {
                Storage.saveCategories(categories);
                console.log('[API] Категории сохранены (localStorage):', categories);
                resolve({ success: true });
            }, 200);
        });
    },

    /** Получить все категории (базовые + пользовательские) */
    async getCategories() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getAllCategories());
            }, 100);
        });
    },

    /** Удалить событие */
    async deleteEvent(id) {
        try {
            return await this._request(`${CONFIG.ENDPOINTS.DELETE_EVENT}/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.warn('[API] deleteEvent: бэкенд недоступен');
            return { success: true };
        }
    },

    /** Удалить пользовательскую категорию */
    async deleteCategory(key) {
        try {
            return await this._request(`${CONFIG.ENDPOINTS.DELETE_CATEGORY}/${key}`, { method: 'DELETE' });
        } catch (error) {
            console.warn('[API] deleteCategory: бэкенд недоступен');
            return { success: true };
        }
    },

    /** Получить все статусы (базовые + пользовательские) */
    async getAllStatuses() {
        try {
            const statuses = await this._request(CONFIG.ENDPOINTS.STATUSES, { method: 'GET' });
            return statuses;
        } catch (error) {
            return getAllStatuses();
        }
    },

    /** Сохранить пользовательские статусы */
    async saveStatuses(statuses) {
        try {
            await this._request(CONFIG.ENDPOINTS.STATUSES, {
                method: 'POST',
                body: JSON.stringify(statuses)
            });
        } catch (error) {
            Storage.saveStatuses(statuses);
            console.log('[API] Статусы сохранены (localStorage):', statuses);
        }
    },

    /** Удалить пользовательский статус */
    async deleteStatus(key) {
        try {
            await this._request(`${CONFIG.ENDPOINTS.STATUSES}/${key}`, { method: 'DELETE' });
        } catch (error) {
            const custom = Storage.loadStatuses().filter(s => s.key !== key);
            Storage.saveStatuses(custom);
            console.log('[API] Статус удален (localStorage):', key);
        }
    },

    // --- MOCK ---

    _getMockData(url, options) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (options.method === 'POST') {
                    const parsed = JSON.parse(options.body);
                    resolve(mockAddEvent(parsed));
                } else {
                    resolve(TEST_DATA);
                }
            }, 300);
        });
    }
};
