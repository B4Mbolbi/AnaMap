/**
 * ==========================================
 * ТОЧКА ВХОДА ПРИЛОЖЕНИЯ
 * ==========================================
 * 
 * Инициализация: загрузка данных, создание карты,
 * привязка обработчиков.
 * ==========================================
 */

/** Кэш связей — всегда ссылается на State.links */
var savedLinks = [];

/**
 * Загрузить сохранённые связи из Storage
 * @returns {Array}
 */
function loadSavedLinks() {
    return Storage.loadLinks();
}

/**
 * Сохранить связи в Storage
 * @param {Array} links 
 */
function saveLinks(links) {
    State.links = links || [];
    savedLinks = State.links; // Синхронизация
    Storage.saveLinks(State.links);
}

const App = {

    /**
     * Главная функция инициализации приложения.
     * Вызывается один раз при загрузке страницы.
     */
    async init() {
        // 0. Миграция старых данных в систему проектов
        Storage.migrateToProjects();

        // 1. Инициализация системы вкладок сайдбара (ДО renderMap/renderUI)
        initSidebarTabs();

        // 2. Инициализация карты
        initMap();

        // 3. Загрузка событий и связей из активного проекта
        const activeProjectId = Storage.getActiveProjectId();
        const activeProject = activeProjectId ? Storage.loadProject(activeProjectId) : null;
        
        if (activeProject && activeProject.events && activeProject.events.length > 0) {
            State.setEvents(activeProject.events);
            State.links = activeProject.links || [];
            savedLinks = State.links;
            console.log(`[App] Загружено ${activeProject.events.length} событий из проекта "${activeProject.name}"`);
        } else if (activeProject) {
            // Проект есть, но пустой — загружаем из API/mock
            try {
                const eventsData = await API.getEvents();
                if (eventsData && eventsData.length > 0) {
                    State.setEvents(eventsData);
                    activeProject.events = eventsData;
                    activeProject.links = activeProject.links || [];
                    Storage.saveProject(activeProject);
                    console.log(`[App] Загружено ${eventsData.length} событий в проект "${activeProject.name}"`);
                }
            } catch (error) {
                console.error('Failed to load events:', error);
            }
        } else {
            console.log('[App] Нет активного проекта — данные не загружены');
        }

        // 5. Привязка обработчиков событий
        initEventHandlers();
        initEventListFilters();
        initLinkHandlers();

        // 6. Обновление списка типов в селекте (с учетом пользовательских категорий)
        updateEventTypeSelect();
        updateStatusSelect();

        // 7. Первичная отрисовка карты и UI
        renderMap();
        renderUI();
        renderEventList();
        renderLinksPanel();
        renderProjectsPanel();
        updateProjectSelector();

        // 8. Пересчет размеров карты при изменении окна
        window.addEventListener('resize', () => map.invalidateSize());
    }
};

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => App.init());
