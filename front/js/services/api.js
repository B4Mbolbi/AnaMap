/**
 * ==========================================
 * СЛОЙ ВЗАИМОДЕЙСТВИЯ С API
 * ==========================================
 * 
 * Абстракция для работы с бэкендом.
 * Если CONFIG.API_ENABLED = false, используются
 * локальные данные (mock-режим).
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
        // Если API отключен — имитируем задержку и возвращаем mock-данные
        if (!CONFIG.API_ENABLED) {
            return this._getMockData(url, options);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

            const response = await fetch(`${CONFIG.BASE_URL}${url}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    /**
     * Получить все события
     * @returns {Promise<Array>} массив событий
     */
    async getEvents() {
        return this._request(CONFIG.ENDPOINTS.EVENTS, { method: 'GET' });
    },

    /**
     * Добавить новое событие
     * @param {object} eventData - данные события
     * @returns {Promise<object>} добавленное событие
     */
    async addEvent(eventData) {
        return this._request(CONFIG.ENDPOINTS.ADD_EVENT, {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    },

    /**
     * Сохранить пользовательские категории
     * @param {Array} categories - массив категорий
     * @returns {Promise<object>} результат
     * 
     * ЗАГЛУШКА: пока не отправляет данные на сервер,
     * просто сохраняет в localStorage
     */
    async saveCategories(categories) {
        // ЗАГЛУШКА: в будущем здесь будет запрос к серверу
        // if (CONFIG.API_ENABLED) {
        //     return this._request(CONFIG.ENDPOINTS.CATEGORIES, {
        //         method: 'POST',
        //         body: JSON.stringify(categories)
        //     });
        // }

        // Сейчас — просто сохраняем в localStorage
        return new Promise((resolve) => {
            setTimeout(() => {
                saveCustomCategories(categories);
                console.log('[API] Категории сохранены (localStorage):', categories);
                resolve({ success: true });
            }, 200);
        });
    },

    /**
     * Получить все категории (базовые + пользовательские)
     * @returns {Promise<Array>} массив всех категорий
     */
    async getCategories() {
        // Заглушка — возвращаем базовые + пользовательские из localStorage
        return new Promise((resolve) => {
            setTimeout(() => {
                const custom = loadCustomCategories();
                const all = [...Object.keys(CONFIG.BASE_LAYERS).map(key => ({
                    key,
                    label: CONFIG.BASE_LAYERS[key].label,
                    color: CONFIG.BASE_LAYERS[key].color,
                    isBase: true
                })), ...custom.map((c, i) => ({
                    ...c,
                    isBase: false,
                    index: Object.keys(CONFIG.BASE_LAYERS).length + i
                }))];
                resolve(all);
            }, 100);
        });
    },

    /**
     * Удалить событие
     * @param {string} id - id события
     * @returns {Promise<object>} результат
     */
    async deleteEvent(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('[API] Событие удалено (mock):', id);
                resolve({ success: true });
            }, 150);
        });
    },

    /**
     * Удалить пользовательскую категорию
     * @param {string} key - ключ категории
     * @returns {Promise<object>} результат
     */
    async deleteCategory(key) {
        // Заглушка — удаляем из localStorage
        return new Promise((resolve) => {
            setTimeout(() => {
                const custom = loadCustomCategories().filter(c => c.key !== key);
                saveCustomCategories(custom);
                console.log('[API] Категория удалена (localStorage):', key);
                resolve({ success: true });
            }, 200);
        });
    },

    /**
     * Получить все статусы (базовые + пользовательские)
     * @returns {Promise<Array>} массив всех статусов
     */
    async getAllStatuses() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const custom = loadCustomStatuses();
                const all = [
                    ...Object.keys(CONFIG.STATUS_LABELS).map(key => ({
                        key,
                        label: CONFIG.STATUS_LABELS[key],
                        color: CONFIG.STATUS_COLORS[key],
                        isBase: true
                    })),
                    ...custom.map((c, i) => ({
                        ...c,
                        isBase: false,
                        index: Object.keys(CONFIG.STATUS_LABELS).length + i
                    }))
                ];
                resolve(all);
            }, 100);
        });
    },

    /**
     * Сохранить пользовательские статусы
     * @param {Array} statuses - массив статусов
     * @returns {Promise<object>} результат
     */
    async saveStatuses(statuses) {
        return new Promise((resolve) => {
            setTimeout(() => {
                saveCustomStatuses(statuses);
                console.log('[API] Статусы сохранены (localStorage):', statuses);
                resolve({ success: true });
            }, 200);
        });
    },

    /**
     * Удалить пользовательский статус
     * @param {string} key - ключ статуса
     * @returns {Promise<object>} результат
     */
    async deleteStatus(key) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const custom = loadCustomStatuses().filter(s => s.key !== key);
                saveCustomStatuses(custom);
                console.log('[API] Статус удален (localStorage):', key);
                resolve({ success: true });
            }, 200);
        });
    },

    /**
     * --- MOCK-ДАННЫЕ (для разработки без бэкенда) ---
     */
    _getMockData(url, options) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (options.method === 'POST') {
                    // Имитация добавления события
                    const newEvent = {
                        id: 'e' + Date.now(),
                        ...JSON.parse(options.body),
                        date: new Date().toISOString().substring(0, 10),
                        source: 'Пользователь',
                        district: 'Новый'
                    };
                    resolve(newEvent);
                } else {
                    // Имитация получения тестовых данных
                    resolve(TEST_DATA);
                }
            }, 300); // Имитация задержки сети
        });
    }
};

/**
 * Тестовые данные для mock-режима
 */
const TEST_DATA = [
    {id: 'e1', type: 'traffic',  status: 'in_progress', date: '2024-06-15', description: 'Затор на проспекте Мира', tags: ['дтп'],        lat: 55.7558, lng: 37.6173, source: 'Яндекс',     district: 'Центральный'},
    {id: 'e2', type: 'roadwork', status: 'in_progress', date: '2024-07-01', description: 'Ремонт асфальта',        tags: ['асфальт'],    lat: 55.7620, lng: 37.6090, source: 'Дептранс',   district: 'Центральный'},
    {id: 'e3', type: 'safety',   status: 'completed',   date: '2024-05-20', description: 'Установка камер',        tags: ['камеры'],     lat: 55.7500, lng: 37.6300, source: 'МВД',        district: 'Центральный'},
    {id: 'e4', type: 'personal', status: 'planned',     date: '2024-08-10', description: 'Встреча у метро',        tags: ['встреча'],    lat: 55.7400, lng: 37.6100, source: 'Пользователь', district: 'Центральный'},
    {id: 'e5', type: 'traffic',  status: 'completed',   date: '2024-06-18', description: 'Пробка из-за переезда',  tags: ['переезд'],    lat: 55.7350, lng: 37.6250, source: 'Яндекс',     district: 'Центральный'},
    {id: 'e6', type: 'roadwork', status: 'planned',     date: '2024-09-01', description: 'Замена бордюра',         tags: ['бордюр'],     lat: 55.7600, lng: 37.6200, source: 'Дептранс',   district: 'Центральный'},
    {id: 'e7', type: 'safety',   status: 'in_progress', date: '2024-07-15', description: 'Ремонт светофора',       tags: ['светофор'],   lat: 55.7480, lng: 37.6150, source: 'МВД',        district: 'Центральный'},
    {id: 'e8', type: 'personal', status: 'completed',   date: '2024-04-10', description: 'Наблюдение',             tags: ['наблюдение'], lat: 55.7520, lng: 37.6280, source: 'Пользователь', district: 'Центральный'}
];
