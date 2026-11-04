/**
 * ==========================================
 * ФИЛЬТР ПО СТАТУСУ + ОЧИСТКА
 * ==========================================
 * 
 * Выпадающий список фильтров по статусу
 * и функция очистки всех фильтров.
 * ==========================================
 */

/** Отрисовка выпадающего списка фильтров по статусу */
function renderStatusFilter() {
    const select = document.getElementById('filter-status');
    if (!select) return;

    const allStatuses = getAllStatuses();
    const currentVal = State.filters.status || '';

    // Сохраняем текущий выбор
    select.innerHTML = '<option value="">Все статусы</option>';
    allStatuses.forEach(status => {
        const opt = document.createElement('option');
        opt.value = status.key;
        opt.textContent = status.label;
        if (status.key === currentVal) opt.selected = true;
        select.appendChild(opt);
    });

    // Обработчик изменения
    select.onchange = () => {
        State.filters.status = select.value || '';
        renderMap();
        renderUI();
        renderEventList();
    };
}

/** Очистка всех фильтров */
function clearAllFilters() {
    State.filters.types = new Set(getAllCategories().map(c => c.key));
    State.filters.dateFrom = '';
    State.filters.dateTo = '';
    State.filters.status = '';

    // Обновляем UI
    const dateFrom = document.getElementById('filter-date-from');
    const dateTo = document.getElementById('filter-date-to');
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';

    renderMap();
    renderUI();
    renderEventList();
}
