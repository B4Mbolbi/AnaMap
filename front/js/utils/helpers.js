/**
 * ==========================================
 * ОБЩИЕ ФУНКЦИИ (HELPERS)
 * ==========================================
 * 
 * Переиспользуемая чистая логика:
 * - Экранирование HTML
 * - Категории (базовые + пользовательские)
 * - Статусы (базовые + пользовательские)
 * - Группировка событий
 * ==========================================
 */

/**
 * Экранирование HTML-сущностей
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Получить все категории (базовые + пользовательские)
 * @returns {Array} массив {key, label, color, isBase}
 */
function getAllCategories() {
    const custom = Storage.loadCategories();
    const baseKeys = Object.keys(CONFIG.BASE_LAYERS);

    const baseCategories = baseKeys.map(key => ({
        key,
        label: CONFIG.BASE_LAYERS[key].label,
        color: CONFIG.BASE_LAYERS[key].color,
        isBase: true
    }));

    const customCategories = custom.map((c, i) => ({
        ...c,
        isBase: false,
        index: baseKeys.length + i
    }));

    return [...baseCategories, ...customCategories];
}

/**
 * Получить конфигурацию категории по ключу
 * @param {string} type - ключ категории
 * @returns {object} {label, color}
 */
function getCategoryConfig(type) {
    if (CONFIG.BASE_LAYERS[type]) {
        return CONFIG.BASE_LAYERS[type];
    }
    const custom = Storage.loadCategories();
    const found = custom.find(c => c.key === type);
    if (found) {
        return { label: found.label, color: found.color };
    }
    return { label: type, color: CONFIG.DEFAULT_COLOR };
}

/**
 * Получить все статусы (базовые + пользовательские)
 * @returns {Array} массив {key, label, color, isBase}
 */
function getAllStatuses() {
    const baseStatuses = Object.keys(CONFIG.STATUS_LABELS).map(key => ({
        key,
        label: CONFIG.STATUS_LABELS[key],
        color: CONFIG.STATUS_COLORS[key],
        isBase: true
    }));

    const customStatuses = Storage.loadStatuses().map((s, i) => ({
        ...s,
        isBase: false,
        index: Object.keys(CONFIG.STATUS_LABELS).length + i
    }));

    return [...baseStatuses, ...customStatuses];
}

/**
 * Получить конфигурацию категории для события
 * @param {string} type - ключ типа
 * @returns {object} {label, color}
 */
function getEventCategoryConfig(type) {
    return getCategoryConfig(type);
}

/**
 * Сгруппировать события по типам
 * @returns {Array} массив {key, label, color, events}
 */
function groupEventsByCategory() {
    const filtered = State.getFilteredEvents();
    const groups = {};

    filtered.forEach(ev => {
        if (!groups[ev.type]) {
            const cfg = getEventCategoryConfig(ev.type);
            groups[ev.type] = {
                key: ev.type,
                label: cfg.label,
                color: cfg.color,
                events: []
            };
        }
        groups[ev.type].events.push(ev);
    });

    return Object.values(groups);
}

/**
 * Получить конфигурацию типа связи
 * @param {string} type
 * @returns {object} {key, label, icon, color}
 */
function getLinkTypeConfig(type) {
    return CONFIG.LINK_TYPES[type] || CONFIG.LINK_TYPES.coincidence;
}

/**
 * Получить стиль линии связи по типу
 * @param {string} type
 * @returns {object} {color, weight, opacity, dashArray, lineCap}
 */
function getLinkStyle(type) {
    const linkType = CONFIG.LINK_TYPES[type] || CONFIG.LINK_TYPES.coincidence;
    const linkStyle = CONFIG.LINK_STYLES[type] || CONFIG.LINK_STYLES.coincidence;
    return {
        color: linkType.color,
        weight: linkStyle.weight,
        opacity: linkStyle.opacity,
        dashArray: linkStyle.dashArray,
        lineCap: 'round'
    };
}

/**
 * Получить метку статуса
 * @param {string} status
 * @returns {string}
 */
function getStatusLabel(status) {
    return CONFIG.STATUS_LABELS[status] || status;
}

/**
 * Получить цвет статуса
 * @param {string} status
 * @returns {string}
 */
function getStatusColor(status) {
    return CONFIG.STATUS_COLORS[status] || CONFIG.DEFAULT_COLOR;
}
