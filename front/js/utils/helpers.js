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
 * - Нормализация проектов и событий
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
 * Сгруппировать события по типам
 * @returns {Array} массив {key, label, color, events}
 */
function groupEventsByCategory() {
    const filtered = Store.getFilteredEventsFromVisibleLayers();
    const groups = {};

    filtered.forEach(ev => {
        if (!groups[ev.type]) {
            const cfg = getCategoryConfig(ev.type);
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
 * Нормализовать одно событие: приведение типов, валидация координат/даты.
 * @param {object} ev
 * @returns {object|null}
 */
function normalizeEvent(ev) {
    if (!ev || typeof ev !== 'object') return null;

    const lat = Number(ev.lat);
    const lng = Number(ev.lng);
    if (!isFinite(lat) || !isFinite(lng)) {
        console.warn('[normalizeEvent] Пропущено событие с невалидными координатами:', ev.id);
        return null;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.warn('[normalizeEvent] Координаты вне диапазона:', ev.id);
        return null;
    }

    const id = String(ev.id || ('e' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)));

    return {
        ...ev,
        id,
        lat,
        lng,
        date: ev.date && /^\d{4}-\d{2}-\d{2}$/.test(ev.date)
            ? ev.date
            : new Date().toISOString().slice(0, 10),
        type: String(ev.type || 'personal'),
        status: String(ev.status || 'planned'),
        description: String(ev.description || '').trim() || '(без описания)',
        source: ev.source ? String(ev.source) : '',
        district: ev.district ? String(ev.district) : '',
        tags: Array.isArray(ev.tags) ? ev.tags.map(String) : []
    };
}

/**
 * Нормализовать проект: события, ссылки, поля.
 * Поддерживает v1 (events/links на верхнем уровне) и v2 (layers).
 * @param {object} raw
 * @returns {object|null}
 */
function normalizeProject(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!Array.isArray(raw.events) && !Array.isArray(raw.layers)) return null;

    // v2: есть layers
    if (Array.isArray(raw.layers)) {
        const normalizedLayers = raw.layers.map(layer => {
            const events = (layer.events || []).map(normalizeEvent).filter(Boolean);
            const validIds = new Set(events.map(e => e.id));
            const links = (layer.links || []).filter(l =>
                l && l.from && l.to &&
                validIds.has(l.from) && validIds.has(l.to) &&
                ['cause', 'effect', 'coincidence'].includes(l.type || 'coincidence')
            );
            return {
                id: layer.id || 'layer_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                name: layer.name || 'Слой',
                color: layer.color || '#3b82f6',
                visible: layer.visible !== false,
                events,
                links
            };
        });

        return {
            id: 'proj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            name: String(raw.name || 'Без названия').trim() || 'Без названия',
            createdAt: raw.createdAt || new Date().toISOString(),
            layers: normalizedLayers
        };
    }

    // v1: events/links на верхнем уровне → оборачиваем в дефолтный слой
    const events = raw.events.map(normalizeEvent).filter(Boolean);
    const validIds = new Set(events.map(e => e.id));

    const links = Array.isArray(raw.links)
        ? raw.links.filter(l =>
            l && l.from && l.to &&
            validIds.has(l.from) && validIds.has(l.to) &&
            ['cause', 'effect', 'coincidence'].includes(l.type || 'coincidence')
          )
        : [];

    return {
        id: 'proj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: String(raw.name || 'Без названия').trim() || 'Без названия',
        createdAt: raw.createdAt || new Date().toISOString(),
        layers: [{
            id: 'layer_default',
            name: 'Основной',
            color: '#3b82f6',
            visible: true,
            events,
            links
        }]
    };
}
