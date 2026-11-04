/**
 * ==========================================
 * ТАЙМЛАЙН
 * ==========================================
 * 
 * Мини-график распределения событий
 * по месяцам с цветовой кодировкой.
 * ==========================================
 */

/** Отрисовка мини-таймлайна: распределение событий по месяцам */
function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;
    container.innerHTML = '';

    const filtered = State.getFilteredEvents();
    if (filtered.length === 0) {
        container.innerHTML = '<div style="color:#475569;font-size:11px;text-align:center;padding:12px 0;">Нет событий</div>';
        return;
    }

    // Группируем события по месяцу (YYYY-MM)
    const monthMap = {};
    filtered.forEach(e => {
        const month = e.date ? e.date.substring(0, 7) : 'unknown';
        if (!monthMap[month]) monthMap[month] = 0;
        monthMap[month]++;
    });

    // Сортируем месяцы и берём последние N
    const sortedMonths = Object.entries(monthMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-CONFIG.TIMELINE_MONTHS);

    if (sortedMonths.length === 0) {
        container.innerHTML = '<div style="color:#475569;font-size:11px;text-align:center;padding:12px 0;">Нет данных</div>';
        return;
    }

    const maxCount = Math.max(...sortedMonths.map(m => m[1]));

    // Заголовок
    const header = document.createElement('div');
    header.className = 'timeline-header';
    header.innerHTML = `
        <span class="timeline-title">Последние 12 мес.</span>
        <span class="timeline-total">${filtered.length} событий</span>
    `;
    container.appendChild(header);

    // Ряды баров
    sortedMonths.forEach(([month, count]) => {
        const row = document.createElement('div');
        row.className = 'timeline-bar-row';

        // Форматируем месяц: "2024-01" → "Янв 24"
        const [year, mon] = month.split('-');
        const monthName = CONFIG.MONTH_NAMES[parseInt(mon, 10) - 1] || mon;
        const shortYear = year.substring(2);

        const pct = (count / maxCount) * 100;
        const isEmpty = count === 0;

        // Определяем цвет на основе доминирующего типа события в этом месяце
        const monthEvents = filtered.filter(e => e.date && e.date.startsWith(month));
        const typeCounts = {};
        monthEvents.forEach(e => {
            typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
        });
        const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        const catConfig = getCategoryConfig(dominantType);
        const barColor = catConfig?.color || CONFIG.DEFAULT_BAR_COLOR;

        row.innerHTML = `
            <span class="timeline-month-label">${monthName} ${shortYear}</span>
            <div class="timeline-bar-track">
                <div class="timeline-bar-fill ${isEmpty ? 'empty' : ''}" style="width:${Math.max(pct, 2)}%;background:${barColor};" data-count="${count}"></div>
            </div>
        `;
        container.appendChild(row);
    });
}
