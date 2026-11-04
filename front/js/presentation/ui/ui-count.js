/**
 * ==========================================
 * ОБНОВЛЕНИЕ СЧЁТЧИКА
 * ==========================================
 * 
 * Отображение количества отфильтрованных
 * событий в шапке.
 * ==========================================
 */

/** Обновление счётчика событий в шапке */
function updateEventCount() {
    const count = Store.getFilteredEventsFromVisibleLayers().length;
    document.getElementById('event-count').textContent = `${count} событий`;
}
