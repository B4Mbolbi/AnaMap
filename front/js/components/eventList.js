/**
 * ==========================================
 * СПИСОК СОБЫТИЙ ПО КАТЕГОРИЯМ
 * ==========================================
 * 
 * Рендеринг списка событий в сайдбаре,
 * группировка по категориям, удаление,
 * просмотр деталей.
 * ==========================================
 */

let currentDetailEventId = null;

/**
 * Получить все статусы (базовые + пользовательские)
 * @returns {Array} массив всех статусов
 */
function getAllStatuses() {
    const baseStatuses = Object.keys(CONFIG.STATUS_LABELS).map(key => ({
        key,
        label: CONFIG.STATUS_LABELS[key],
        color: CONFIG.STATUS_COLORS[key],
        isBase: true
    }));

    const customStatuses = loadCustomStatuses().map((s, i) => ({
        ...s,
        isBase: false,
        index: Object.keys(CONFIG.STATUS_LABELS).length + i
    }));

    return [...baseStatuses, ...customStatuses];
}

/**
 * Получить конфигурацию категории
 * @param {string} type 
 * @returns {object}
 */
function getEventCategoryConfig(type) {
    if (CONFIG.BASE_LAYERS[type]) {
        return { label: CONFIG.BASE_LAYERS[type].label, color: CONFIG.BASE_LAYERS[type].color };
    }
    const custom = loadCustomCategories();
    const found = custom.find(c => c.key === type);
    if (found) {
        return { label: found.label, color: found.color };
    }
    return { label: type, color: '#64748b' };
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
 * Рендеринг списка событий в сайдбаре
 */
function renderEventList() {
    const groups = groupEventsByCategory();
    const container = document.getElementById('event-list-container');
    const panel = document.getElementById('event-list-panel');
    const listTitle = document.getElementById('event-list-title');

    if (groups.length === 0) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';

    let totalCount = 0;
    groups.forEach(g => totalCount += g.events.length);
    listTitle.textContent = `События (${totalCount})`;

    container.innerHTML = '';

    groups.forEach(group => {
        // Заголовок категории
        const groupDiv = document.createElement('div');
        groupDiv.style.marginBottom = '12px';

        const isBaseCategory = CONFIG.BASE_LAYERS[group.key];
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #252932;';
        
        let deleteBtn = '';
        if (!isBaseCategory) {
            deleteBtn = `<button class="btn-delete-category" data-key="${group.key}" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:14px;padding:2px 4px;margin-left:4px;border-radius:4px;transition:all 0.2s;" title="Удалить категорию">✕</button>`;
        }

        header.innerHTML = `
            <span style="width:10px;height:10px;border-radius:50%;background:${group.color};flex-shrink:0;"></span>
            <span style="font-size:12px;font-weight:600;color:#e2e8f0;">${group.label}</span>
            <span style="font-size:10px;color:#64748b;margin-left:auto;">${group.events.length}</span>
            ${deleteBtn}
        `;
        groupDiv.appendChild(header);

        // События в категории
        group.events.forEach(ev => {
            const allStatuses = getAllStatuses();
            const statusInfo = allStatuses.find(s => s.key === ev.status) || { label: ev.status, color: '#64748b' };

            const item = document.createElement('div');
            item.className = 'event-list-item';
            item.innerHTML = `
                <div class="event-list-main">
                    <div class="event-list-status" style="background:${statusInfo.color}22;color:${statusInfo.color};">${statusInfo.label}</div>
                    <div class="event-list-desc">${ev.description}</div>
                    <div class="event-list-meta">
                        <span>${ev.date}</span>
                        <span>•</span>
                        <span>${ev.source || ''}</span>
                    </div>
                </div>
                <div class="event-list-actions">
                    <button class="btn-view-detail" data-id="${ev.id}" title="Подробнее">⋮</button>
                    <button class="btn-delete-event" data-id="${ev.id}" title="Удалить">✕</button>
                </div>
            `;

            groupDiv.appendChild(item);
        });

        container.appendChild(groupDiv);
    });

    // Обработчики на "Подробнее"
    container.querySelectorAll('.btn-view-detail').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            openEventDetail(id);
        };
    });

    // Обработчики на "Удалить"
    container.querySelectorAll('.btn-delete-event').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            deleteEvent(id);
        };
    });

    // Обработчики на удаление категории
    container.querySelectorAll('.btn-delete-category').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            btn.style.color = '#ef4444';
            deleteCategory(btn.dataset.key);
        };
        btn.onmouseenter = () => btn.style.color = '#ef4444';
        btn.onmouseleave = () => btn.style.color = '#64748b';
    });
}

/**
 * Удаление категории
 * @param {string} key 
 */
async function deleteCategory(key) {
    // Удаляем категорию
    await API.deleteCategory(key);

    // Удаляем все события этой категории
    State.events = State.events.filter(e => e.type !== key);

    // Обновляем фильтры
    State.filters.types.delete(key);

    // Перерисовка
    renderMap();
    renderEventList();
    renderFilterButtons();
}

/**
 * Изменение статуса события
 * @param {string} eventId 
 * @param {string} newStatus 
 */
function changeEventStatus(eventId, newStatus) {
    const ev = State.events.find(e => e.id === eventId);
    if (!ev) return;

    ev.status = newStatus;

    // Перерисовка
    renderMap();
    renderEventList();
}

/**
 * Удаление события
 * @param {string} id 
 */
async function deleteEvent(id) {
    // Удаление из mock
    await API.deleteEvent(id);

    // Обновление состояния
    State.events = State.events.filter(e => e.id !== id);

    // Закрытие модалки если это текущее событие
    if (currentDetailEventId === id) {
        closeEventDetail();
    }

    // Перерисовка
    renderMap();
    renderEventList();
}

/**
 * Открытие модалки с деталями события
 * @param {string} id 
 */
function openEventDetail(id) {
    const ev = State.events.find(e => e.id === id);
    if (!ev) return;

    currentDetailEventId = id;

    const cfg = getEventCategoryConfig(ev.type);
    const allStatuses = getAllStatuses();
    const currentStatus = allStatuses.find(s => s.key === ev.status) || { label: ev.status, color: '#64748b' };

    const content = document.getElementById('event-detail-content');
    content.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
            <span style="width:14px;height:14px;border-radius:50%;background:${cfg.color};flex-shrink:0;"></span>
            <span style="font-size:14px;font-weight:600;color:${cfg.color};text-transform:uppercase;">${cfg.label}</span>
        </div>
        
        <div style="background:#0a0b0e;border:1px solid #252932;border-radius:10px;padding:16px;margin-bottom:16px;">
            <div style="font-size:15px;line-height:1.6;color:#e2e8f0;margin-bottom:16px;">${ev.description}</div>
            
            <div style="margin-bottom:16px;">
                <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Статус</div>
                <select id="detail-status-select" style="width:100%;background:#13151c;border:1px solid #252932;border-radius:8px;padding:8px 12px;font-size:13px;color:#e2e8f0;outline:none;cursor:pointer;">
                    ${allStatuses.map(s => `<option value="${s.key}" ${s.key === ev.status ? 'selected' : ''} style="background:#13151c;color:${s.color};">${s.label}</option>`).join('')}
                </select>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="detail-field">
                    <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Дата</div>
                    <div style="font-size:13px;color:#cbd5e1;">${ev.date}</div>
                </div>
                <div class="detail-field">
                    <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Источник</div>
                    <div style="font-size:13px;color:#cbd5e1;">${ev.source || '—'}</div>
                </div>
                <div class="detail-field">
                    <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Район</div>
                    <div style="font-size:13px;color:#cbd5e1;">${ev.district || '—'}</div>
                </div>
                <div class="detail-field">
                    <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Координаты</div>
                    <div style="font-size:12px;color:#cbd5e1;">${ev.lat?.toFixed(4) || '—'}, ${ev.lng?.toFixed(4) || '—'}</div>
                </div>
            </div>
        </div>
    `;

    // Обработчик изменения статуса
    document.getElementById('detail-status-select').onchange = (e) => {
        changeEventStatus(ev.id, e.target.value);
    };

    // Обновить цвет кнопки удаления
    const deleteBtn = document.getElementById('btn-delete-event');
    deleteBtn.style.background = cfg.color + '33';
    deleteBtn.style.color = cfg.color;
    deleteBtn.style.border = `1px solid ${cfg.color}66`;

    document.getElementById('modal-event-detail').classList.remove('hidden');
}

/**
 * Закрытие модалки деталей
 */
function closeEventDetail() {
    document.getElementById('modal-event-detail').classList.add('hidden');
    currentDetailEventId = null;
}

/**
 * Рендеринг списка статусов в модалке управления
 */
function renderStatusesModal() {
    const container = document.getElementById('statuses-list');
    container.innerHTML = '';

    const statuses = getAllStatuses();

    statuses.forEach(status => {
        const div = document.createElement('div');
        div.className = `category-item ${status.isBase ? 'base' : ''}`;

        const badge = status.isBase ? 'базовый' : 'польз.';

        let deleteBtn = '';
        if (!status.isBase) {
            deleteBtn = `<button class="category-delete" data-status-key="${status.key}">✕</button>`;
        }

        div.innerHTML = `
            <div class="category-color-preview" style="background:${status.color};"></div>
            <div class="category-info">
                <span class="category-name">${status.label}</span>
                <span class="category-badge">${badge}</span>
            </div>
            ${deleteBtn}
        `;

        container.appendChild(div);
    });

    // Навешиваем обработчики на кнопки удаления статусов
    container.querySelectorAll('.category-delete').forEach(btn => {
        btn.onclick = async () => {
            const key = btn.dataset.statusKey;
            await API.deleteStatus(key);
            renderStatusesModal();
        };
    });
}

/**
 * Добавление нового пользовательского статуса
 */
async function handleAddStatus() {
    const nameInput = document.getElementById('status-new-name');
    const colorInput = document.getElementById('status-new-color');

    const name = nameInput.value.trim();
    const color = colorInput.value;

    // Валидация
    if (!name) {
        alert('Введите название статуса');
        return;
    }

    // Проверка на дубликат
    const custom = loadCustomStatuses();
    if (custom.some(s => s.label.toLowerCase() === name.toLowerCase())) {
        alert('Такой статус уже существует');
        return;
    }

    // Генерация уникального ключа
    const key = 'custom_' + name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '_') + '_' + Date.now();

    const newStatus = {
        key,
        label: name,
        color
    };

    // Сохраняем статус
    try {
        await API.saveStatuses([...custom, newStatus]);

        // Очищаем поля
        nameInput.value = '';
        colorInput.value = CONFIG.CUSTOM_COLORS[custom.length % CONFIG.CUSTOM_COLORS.length];

        renderStatusesModal();
    } catch (error) {
        console.error('Ошибка при добавлении статуса:', error);
        alert('Ошибка при сохранении статуса');
    }
}

/**
 * Инициализация обработчиков для списка событий
 */
function initEventListHandlers() {
    document.getElementById('btn-close-event-list').onclick = () => {
        document.getElementById('event-list-panel').style.display = 'none';
    };

    document.getElementById('btn-close-detail').onclick = closeEventDetail;
    document.getElementById('btn-close-event-detail').onclick = closeEventDetail;

    // Удаление из модалки деталей
    document.getElementById('btn-delete-event').onclick = () => {
        if (currentDetailEventId) {
            deleteEvent(currentDetailEventId);
        }
    };

    // --- УПРАВЛЕНИЕ СТАТУСАМИ ---

    // Открыть модалку статусов
    document.getElementById('btn-manage-statuses').onclick = () => {
        renderStatusesModal();
        document.getElementById('modal-statuses').classList.remove('hidden');
    };

    // Закрыть модалку статусов
    document.getElementById('btn-close-statuses').onclick = () => {
        document.getElementById('modal-statuses').classList.add('hidden');
    };
    document.getElementById('modal-statuses-cancel').onclick = () => {
        document.getElementById('modal-statuses').classList.add('hidden');
    };

    // Добавить новый статус
    document.getElementById('btn-add-status').onclick = handleAddStatus;
}
