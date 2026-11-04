/**
 * ==========================================
 * ТОЧКА ВХОДА ПРИЛОЖЕНИЯ
 * ==========================================
 * 
 * Инициализация: загрузка данных, создание карты,
 * привязка обработчиков.
 * ==========================================
 */

const App = {

    /**
     * Главная функция инициализации приложения.
     * Вызывается один раз при загрузке страницы.
     */
    async init() {
        // 1. Инициализация карты
        initMap();

        // 2. Загрузка сохранённых событий из localStorage (если есть)
        const savedEvents = Storage.loadEvents();
        if (savedEvents.length > 0) {
            State.setEvents(savedEvents);
            console.log(`[App] Загружено ${savedEvents.length} сохранённых событий из localStorage`);
        }

        // 3. Загрузка событий из API (или mock-данных)
        try {
            const eventsData = await API.getEvents();
            State.setEvents(eventsData);
        } catch (error) {
            console.error('Failed to load events:', error);
            // В случае ошибки используем сохранённые данные (если есть)
            if (State.events.length === 0) {
                State.setEvents([]);
            }
        }

        // 4. Загрузка сохранённых связей (до первого renderMap)
        savedLinks = loadSavedLinks();

        // 5. Привязка обработчиков событий
        initEventHandlers();
        initEventListHandlers();
        initLinkHandlers();

        // 6. Обновление списка типов в селекте (с учетом пользовательских категорий)
        updateEventTypeSelect();
        updateStatusSelect();

        // 7. Первичная отрисовка карты и UI
        renderMap();
        renderUI();
        renderEventList();

        // 8. Пересчет размеров карты при изменении окна
        window.addEventListener('resize', () => map.invalidateSize());
    }
};

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => App.init());
