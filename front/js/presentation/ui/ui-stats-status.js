/**
 * ==========================================
 * СТАТИСТИКА ПО СТАТУСАМ
 * ==========================================
 * 
 * Карточки с количеством событий
 * по каждому статусу.
 * ==========================================
 */

/** Отрисовка статистики по статусам */
function renderStatsByStatus() {
    const container = document.getElementById('stats-status');
    container.innerHTML = '';

    const allStatuses = getAllStatuses();
    const filtered = State.getFilteredEvents();
    const statusCounts = {};
    allStatuses.forEach(s => statusCounts[s.key] = 0);
    filtered.forEach(e => {
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
