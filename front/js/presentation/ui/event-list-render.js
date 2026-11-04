/**
 * ==========================================
 * ОТРИСОВКА СПИСКА СОБЫТИЙ
 * ==========================================
 * 
 * Группировка по категориям, создание DOM
 * элементов, привязка обработчиков.
 * ==========================================
 */

/** Рендеринг списка событий в сайдбаре */
function renderEventList() {
    // Скрытие в режиме «По годам»
    if (Store.state.viewMode === 'years') {
        document.getElementById('event-list-panel').style.display = 'none';
        return;
    }

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

        group.events.forEach(ev => {
            const allStatuses = getAllStatuses();
            const statusInfo = allStatuses.find(s => s.key === ev.status) || { label: ev.status, color: CONFIG.DEFAULT_COLOR };

            const item = document.createElement('div');
            item.className = 'event-list-item';

            const tagsHtml = (ev.tags && ev.tags.length > 0)
                ? `<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;">
                    ${ev.tags.map(t => `<span style="font-size:10px;padding:2px 6px;background:#1e293b;color:#94a3b8;border-radius:4px;">${t}</span>`).join('')}
                   </div>`
                : '';

            item.innerHTML = `
                <div class="event-list-main">
                    <div class="event-list-status" style="background:${statusInfo.color}22;color:${statusInfo.color};">${statusInfo.label}</div>
                    <div class="event-list-desc">${ev.description}</div>
                    <div class="event-list-meta">
                        <span>${ev.date}</span><span>•</span><span>${ev.source || ''}</span>
                    </div>
                    ${tagsHtml}
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

    // Обработчики кнопок
    container.querySelectorAll('.btn-view-detail').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); openEventDetail(btn.dataset.id); };
    });

    container.querySelectorAll('.btn-delete-event').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); deleteEvent(btn.dataset.id); };
    });

    container.querySelectorAll('.btn-delete-category').forEach(btn => {
        btn.onclick = (e) => { e.stopPropagation(); btn.style.color = '#ef4444'; deleteCategory(btn.dataset.key); };
        btn.onmouseenter = () => btn.style.color = '#ef4444';
        btn.onmouseleave = () => btn.style.color = '#64748b';
    });
}

/**
 * Инициализация поиска и сортировки в списке событий
 */
function initEventListFilters() {
    const searchInput = document.getElementById('event-search');
    const sortSelect = document.getElementById('event-sort');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            Store.setFilterSearch(e.target.value);
            renderEventList();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            Store.setFilterSortBy(e.target.value);
            renderEventList();
        });
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initEventListFilters();
});
