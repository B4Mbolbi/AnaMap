/**
 * ==========================================
 * КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ
 * ==========================================
 * 
 * Все настройки API и константы приложения
 * находятся в этом файле для удобного управления.
 * 
 * Для подключения к реальному API:
 * 1. Установите API_ENABLED = true
 * 2. Укажите BASE_URL вашего сервера
 * 3. Настройте эндпоинты при необходимости
 * ==========================================
 */

const CONFIG = {
    // Включение/выключения режима API
    // false = использовать тестовые данные (mock),
    // true = отправлять запросы к серверу
    API_ENABLED: false,

    // Базовый URL API-сервера
    // Замените на адрес вашего бэкенда
    BASE_URL: 'http://localhost:3000/api',

    // Таймаут запросов в миллисекундах
    REQUEST_TIMEOUT: 10000,

    // Эндпоинты API
    ENDPOINTS: {
        EVENTS:    '/events',     // GET /events  — получить все события
        ADD_EVENT: '/events',     // POST /events — добавить событие
        CATEGORIES: '/categories', // POST /categories — сохранить категории
    },

    // Ключи для хранения в localStorage
    CUSTOM_CATEGORIES_KEY: 'custom_event_categories',
    CUSTOM_STATUSES_KEY: 'custom_event_statuses',

    // Набор цветов для пользовательских категорий
    CUSTOM_COLORS: [
        '#a855f7', // фиолетовый
        '#ec4899', // розовый
        '#14b8a6', // бирюзовый
        '#f59e0b', // янтарный
        '#6366f1', // индиго
        '#8b5cf6', // сирень
        '#06b6d4', // голубой
        '#84cc16', // лайм
        '#f43f5e', // малиновый
        '#78716c', // камень
    ],

    // Конфигурация слоёв карты (базовые типы событий)
    BASE_LAYERS: {
        personal:  { label: 'Личное',  color: '#3b82f6' },
        traffic:   { label: 'Пробки',  color: '#f97316' },
        roadwork:  { label: 'Ремонт',  color: '#22c55e' },
        safety:    { label: 'Безопасность', color: '#ef4444' }
    },

    // Метки статусов
    STATUS_LABELS: {
        planned:     'Запланировано',
        in_progress: 'В процессе',
        completed:   'Завершено'
    },

    // Цвета статусов для статистики
    STATUS_COLORS: {
        planned:     '#fbbf24',
        in_progress: '#60a5fa',
        completed:   '#34d399'
    },

    // Начальные координаты карты и зум
    MAP: {
        center: [55.7558, 37.624],
        zoom: 12
    },

    // Максимальный радиус кластера
    CLUSTER_MAX_RADIUS: 55,

    // Задержка пересчета размера карты (мс)
    MAP_INVALIDATE_DELAY: 100
};

/**
 * Загрузка пользовательских категорий из localStorage
 * @returns {Array} массив пользовательских категорий
 */
function loadCustomCategories() {
    try {
        const data = localStorage.getItem(CONFIG.CUSTOM_CATEGORIES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        return [];
    }
}

/**
 * Сохранение пользовательских категорий в localStorage
 * @param {Array} categories - массив категорий
 */
function saveCustomCategories(categories) {
    try {
        localStorage.setItem(CONFIG.CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
        console.error('Ошибка сохранения категорий:', error);
    }
}

/**
 * Загрузка пользовательских статусов из localStorage
 * @returns {Array} массив пользовательских статусов
 */
function loadCustomStatuses() {
    try {
        const data = localStorage.getItem(CONFIG.CUSTOM_STATUSES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Ошибка загрузки статусов:', error);
        return [];
    }
}

/**
 * Сохранение пользовательских статусов в localStorage
 * @param {Array} statuses - массив статусов
 */
function saveCustomStatuses(statuses) {
    try {
        localStorage.setItem(CONFIG.CUSTOM_STATUSES_KEY, JSON.stringify(statuses));
    } catch (error) {
        console.error('Ошибка сохранения статусов:', error);
    }
}
