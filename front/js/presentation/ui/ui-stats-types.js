/**
 * ==========================================
 * СТАТИСТИКА ПО ТИПАМ СОБЫТИЙ
 * ==========================================
 * 
 * Отображение количества и процентов
 * событий по типам.
 * ==========================================
 */

/** Отрисовка статистики по типам событий */
function renderStatsByTypes() {
    const container = document.getElementById('stats-types');
    container.innerHTML = '';

    // Динамический заголовок панели
    const titleEl = container.parentElement.querySelector('.panel-title');
    if (titleEl) {
        titleEl.textContent = Store.state.viewMode === 'years' ? 'События по годам' : 'События по типам';
    }

    const filtered = Store.getFilteredEventsFromVisibleLayers();
    const total = filtered.length || 1;

    getAllCategories().forEach(cat => {
        const count = filtered.filter(e => e.type === cat.key).length;
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
