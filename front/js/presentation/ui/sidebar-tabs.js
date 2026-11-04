/**
 * ==========================================
     ВЕРТИКАЛЬНЫЕ ВКЛАДКИ САЙДБАРА
     ==========================================
     
     Переключение вкладок с запоминанием
     в localStorage.
     ==========================================
     */

const SIDEBAR_TABS_KEY = 'anemap_active_tab';
const DEFAULT_TAB = 'filters';
const TAB_NAMES = {
    filters: 'Фильтры',
    stats: 'Статистика',
    events: 'События',
    links: 'Связи',
    projects: 'Проекты',
    data: 'Данные'
};

/**
 * Инициализация системы вкладок сайдбара
 */
function initSidebarTabs() {
    const tabs = document.querySelectorAll('.sidebar-tab');
    const panels = document.querySelectorAll('.sidebar-panel');

    // Восстановить последнюю активную вкладку
    const lastTab = localStorage.getItem(SIDEBAR_TABS_KEY) || DEFAULT_TAB;
    if (lastTab) {
        switchSidebarTab(lastTab, false);
    }

    // Навесить обработчики
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const panelName = tab.dataset.panel;
            switchSidebarTab(panelName);
        });
    });
}

/**
 * Переключить вкладку
 * @param {string} panelName — ключ панели
 * @param {boolean} save — сохранять ли в localStorage
 */
function switchSidebarTab(panelName, save = true) {
    const tabs = document.querySelectorAll('.sidebar-tab');
    const panels = document.querySelectorAll('.sidebar-panel');

    tabs.forEach(tab => {
        const isActive = tab.dataset.panel === panelName;
        tab.classList.toggle('active', isActive);
    });

    panels.forEach(panel => {
        const isActive = panel.dataset.panel === panelName;
        panel.classList.toggle('active', isActive);
    });

    if (save) {
        localStorage.setItem(SIDEBAR_TABS_KEY, panelName);
    }

    // Ререндер компонентов при переключении
    switch (panelName) {
        case 'links':
            renderLinksPanel();
            break;
        case 'projects':
            renderProjectsPanel();
            break;
        case 'events':
            // Обновить поиск/сортировку при открытии вкладки
            const searchInput = document.getElementById('event-search');
            const sortSelect = document.getElementById('event-sort');
            if (searchInput) State.filters.search = searchInput.value;
            if (sortSelect) State.filters.sortBy = sortSelect.value;
            renderEventList();
            break;
    }
}
