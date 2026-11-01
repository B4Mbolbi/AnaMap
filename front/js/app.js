/**
 * ==========================================
 * ТОЧКА ВХОДА ПРИЛОЖЕНИЯ
 * ==========================================
 * 
 * Инициализация: загрузка данных, создание карты,
 * привязка обработчиков.
 * ==========================================
 */

// Загрузка данных и запуск приложения
async function init() {
    // 1. Инициализация карты
    initMap();

    // 2. Загрузка событий из API (или mock-данных)
    try {
        const eventsData = await API.getEvents();
        State.setEvents(eventsData);
    } catch (error) {
        console.error('Failed to load events:', error);
        // В случае ошибки используем пустой массив
        State.setEvents([]);
    }

    // 3. Привязка обработчиков событий
    initEventHandlers();
    initEventListHandlers();
    initLinkHandlers();

    // 4. Обновление списка типов в селекте (с учетом пользовательских категорий)
    updateEventTypeSelect();

    // 5. Первичная отрисовка карты и UI
    renderMap();

    // 6. Первичная отрисовка списка событий
    renderEventList();

    // 7. Загрузка сохранённых связей
    savedLinks = loadSavedLinks();
    renderSavedLinks();

    // 5. Пересчет размеров карты при изменении окна
    window.addEventListener('resize', () => map.invalidateSize());
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
