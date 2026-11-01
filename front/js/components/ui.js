/**
 * ==========================================
 * РЕНДЕРИНГ ИНТЕРФЕЙСА
 * ==========================================
 * 
 * Отрисовка боковой панели: фильтры,
 * статистика по типам и статусам.
 * ==========================================
 */

/**
 * Получить все категории (базовые + пользовательские)
 * @returns {Array} массив всех категорий
 */
function getAllCategories() {
    const custom = loadCustomCategories();
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
 * Главная функция рендеринга UI
 */
function renderUI() {
    updateEventCount();
    renderFilterButtons();
    renderStatsByTypes();
    renderStatsByStatus();
}

/**
 * Обновление счётчика событий в шапке
 */
function updateEventCount() {
    const count = State.getFilteredEvents().length;
    document.getElementById('event-count').textContent = `${count} событий`;
}

/**
 * Отрисовка кнопок фильтров по типам
 */
function renderFilterButtons() {
    const container = document.getElementById('filter-types');
    container.innerHTML = '';

    const categories = getAllCategories();

    categories.forEach(cat => {
        const isActive = State.filters.types.has(cat.key);
        const isBaseCategory = CONFIG.BASE_LAYERS[cat.key];

        const btn = document.createElement('button');
        btn.className = `filter-btn ${isActive ? 'active' : ''}`;

        // Подсветка активной кнопки
        if (isActive) {
            btn.style.background = cat.color + '33';
            btn.style.borderColor = cat.color + '66';
        }

        // Кнопка удаления для пользовательских категорий
        let deleteBtn = '';
        if (!isBaseCategory) {
            deleteBtn = `<span class="filter-delete" data-key="${cat.key}" style="margin-left:6px;opacity:0.5;cursor:pointer;font-size:14px;line-height:1;transition:opacity 0.2s;" title="Удалить категорию">✕</span>`;
        }

        btn.innerHTML = `<span class="filter-dot" style="background:${isActive ? cat.color : '#475569'}"></span>${cat.label}${deleteBtn}`;

        // Переключение фильтра по клику
        btn.onclick = (e) => {
            // Если кликнули на ✕ — не переключаем фильтр
            if (e.target.classList.contains('filter-delete')) return;
            if (State.filters.types.has(cat.key)) {
                State.filters.types.delete(cat.key);
            } else {
                State.filters.types.add(cat.key);
            }
            renderMap();
        };

        container.appendChild(btn);
    });

    // Обработчики на ✕
    container.querySelectorAll('.filter-delete').forEach(btn => {
        btn.onmouseenter = () => btn.style.opacity = '1';
        btn.onmouseleave = () => btn.style.opacity = '0.5';
        btn.onclick = (e) => {
            e.stopPropagation();
            deleteCategory(btn.dataset.key);
        };
    });
}

/**
 * Отрисовка статистики по типам событий
 */
function renderStatsByTypes() {
    const container = document.getElementById('stats-types');
    container.innerHTML = '';
    const total = State.events.length || 1;

    const categories = getAllCategories();

    categories.forEach(cat => {
        const count = State.events.filter(e => e.type === cat.key).length;
        const pct = (count / total) * 100;

        const div = document.createElement('div');
        div.className = 'stat-row';
        div.innerHTML = `
            <div class="stat-dot" style="background:${cat.color}"></div>
            <div class="stat-info">
                <div class="stat-label-row">
                    <span class="stat-label">${cat.label}</span>
                    <span class="stat-count">${count}</span>
                </div>
                <div class="stat-bar-bg">
                    <div class="stat-bar" style="width:${pct}%;background:${cat.color}"></div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

/**
 * Отрисовка статистики по статусам
 */
function renderStatsByStatus() {
    const container = document.getElementById('stats-status');
    container.innerHTML = '';

    const allStatuses = getAllStatuses();
    
    // Подсчёт событий по статусам
    const statusCounts = {};
    allStatuses.forEach(s => statusCounts[s.key] = 0);
    State.events.forEach(e => {
        if (statusCounts[e.status] !== undefined) {
            statusCounts[e.status]++;
        }
    });

    allStatuses.forEach(status => {
        const div = document.createElement('div');
        div.className = 'status-card';
        div.innerHTML = `
            <div class="status-num" style="color:${status.color}">${statusCounts[status.key] || 0}</div>
            <div class="status-label">${status.label}</div>
        `;
        container.appendChild(div);
    });
}

/**
 * Отрисовка списка категорий в модалке управления
 */
function renderCategoriesModal() {
    const container = document.getElementById('categories-list');
    container.innerHTML = '';

    const categories = getAllCategories();

    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = `category-item ${cat.isBase ? 'base' : ''}`;

        const badge = cat.isBase ? 'базовая' : 'польз.';

        let deleteBtn = '';
        if (!cat.isBase) {
            deleteBtn = `<button class="category-delete" data-key="${cat.key}">✕</button>`;
        }

        div.innerHTML = `
            <div class="category-color-preview" style="background:${cat.color}"></div>
            <div class="category-info">
                <span class="category-name">${cat.label}</span>
                <span class="category-badge">${badge}</span>
            </div>
            ${deleteBtn}
        `;

        container.appendChild(div);
    });

    // Навешиваем обработчики на кнопки удаления
    container.querySelectorAll('.category-delete').forEach(btn => {
        btn.onclick = async () => {
            const key = btn.dataset.key;
            await API.deleteCategory(key);
            renderCategoriesModal();
            renderFilterButtons();
            renderStatsByTypes();
        };
    });
}
