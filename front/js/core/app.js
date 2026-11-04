/**
 * ==========================================
 * ТОЧКА ВХОДА ПРИЛОЖЕНИЯ
 * ==========================================
 * 
 * Инициализация: загрузка данных, создание карты,
 * привязка обработчиков, единая точка перерисовки.
 * ==========================================
 */

/**
 * Обновить селектор проектов в шапке
 */
function updateProjectSelector() {
    const selector = document.getElementById('project-selector');
    if (!selector) return;
    
    const projects = Storage.loadProjects();
    const activeId = Storage.getActiveProjectId();
    
    selector.innerHTML = '';
    
    if (projects.length === 0) {
        selector.innerHTML = '<option value="">Нет проектов</option>';
        return;
    }
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        if (project.id === activeId) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
}

const App = {

    /**
     * Единая точка перерисовки UI.
     * Вызывается Store при каждом изменении состояния.
     * @param {string} reason - 'events' | 'links' | 'filters' | 'projects' | 'view' | 'all'
     */
    refresh(reason) {
        // Защита от вызова до инициализации
        if (typeof renderMap !== 'function' && reason !== 'projects') return;

        if (reason === 'all' || reason === 'events' || reason === 'filters' || reason === 'view') {
            renderMap();
            renderUI();
            renderEventList();
        }
        if (reason === 'all' || reason === 'links') {
            renderSavedLinks();
            renderLinksPanel();
        }
        if (reason === 'all' || reason === 'projects') {
            renderProjectsPanel();
            updateProjectSelector();
        }
    },

    /**
     * Главная функция инициализации приложения.
     */
    async init() {
        // 0. Миграция старых данных в систему проектов
        Storage.migrateToProjects();

        // 1. Подписка на изменения Store — единая точка перерисовки
        Store.subscribe((reason) => {
            App.refresh(reason);
        });

        // 2. Инициализация системы вкладок сайдбара
        initSidebarTabs();

        // 3. Инициализация карты
        initMap();

        // 4. Загрузить активный проект через switchProject
        const activeId = Storage.getActiveProjectId();
        if (activeId) {
            switchProject(activeId);
        } else {
            // Нет активного — создать пустой
            const p = Storage.createProject('Мой проект');
            switchProject(p.id);
        }

        // 5. Привязка обработчиков событий
        initEventHandlers();
        initEventListFilters();
        initLinkHandlers();
        initStorageHandlers();

        // 6. Обновление списка типов в селекте
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
        window.addEventListener('resize', () => MapView.map.invalidateSize());
    }
};

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => App.init());
