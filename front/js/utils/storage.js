/**
 * ==========================================
 * ХРАНИЛИЩЕ (STORAGE) — КОНСОЛИДИРОВАННАЯ ВЕРСИЯ
 * ==========================================
 * 
 * Централизованный доступ к localStorage.
 * Проекты, события, связи, категории, статусы.
 * Все операции сериализации/десериализации в одном месте.
 * ==========================================
 */

const Storage = {
    // --- Ключи localStorage ---

    _PROJECTS_KEY: 'anemap_projects',
    _ACTIVE_KEY: 'anemap_active_project',
    _PROJECT_PREFIX: 'anemap_project_',

    // ==========================================
    // ПРОЕКТЫ
    // ==========================================

    /**
     * Загрузить список проектов (метаданные)
     * @returns {Array}
     */
    loadProjects() {
        try {
            const data = localStorage.getItem(this._PROJECTS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Storage] Ошибка загрузки проектов:', error);
            return [];
        }
    },

    /**
     * Сохранить список проектов
     * @param {Array} projects 
     */
    saveProjects(projects) {
        try {
            localStorage.setItem(this._PROJECTS_KEY, JSON.stringify(projects));
        } catch (error) {
            console.error('[Storage] Ошибка сохранения проектов:', error);
        }
    },

    /**
     * Загрузить полный объект проекта
     * @param {string} id 
     * @returns {object|null}
     */
    loadProject(id) {
        try {
            const data = localStorage.getItem(this._PROJECT_PREFIX + id);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('[Storage] Ошибка загрузки проекта:', error);
            return null;
        }
    },

    /**
     * Сохранить полный объект проекта
     * @param {object} project 
     */
    saveProject(project) {
        try {
            localStorage.setItem(this._PROJECT_PREFIX + project.id, JSON.stringify(project));
        } catch (error) {
            console.error('[Storage] Ошибка сохранения проекта:', error);
        }
    },

    /**
     * Создать новый проект
     * @param {string} name 
     * @returns {object}
     */
    createProject(name) {
        const projects = this.loadProjects();
        const project = {
            id: 'proj_' + Date.now(),
            name: name || 'Без названия',
            createdAt: new Date().toISOString(),
            events: [],
            links: []
        };
        projects.push(project);
        this.saveProjects(projects);
        this.saveProject(project);
        this.setActiveProjectId(project.id);
        return project;
    },

    /**
     * Переименовать проект
     * @param {string} id 
     * @param {string} name 
     */
    renameProject(id, name) {
        const projects = this.loadProjects();
        const project = projects.find(p => p.id === id);
        if (project) {
            project.name = name;
            this.saveProjects(projects);
            this.saveProject(project);
        }
    },

    /**
     * Удалить проект
     * @param {string} id 
     */
    deleteProject(id) {
        let projects = this.loadProjects();
        projects = projects.filter(p => p.id !== id);
        this.saveProjects(projects);
        localStorage.removeItem(this._PROJECT_PREFIX + id);
    },

    /**
     * Получить ID активного проекта
     * @returns {string|null}
     */
    getActiveProjectId() {
        return localStorage.getItem(this._ACTIVE_KEY);
    },

    /**
     * Установить ID активного проекта
     * @param {string|null} projectId 
     */
    setActiveProjectId(projectId) {
        if (projectId) {
            localStorage.setItem(this._ACTIVE_KEY, projectId);
        } else {
            localStorage.removeItem(this._ACTIVE_KEY);
        }
    },

    // ==========================================
    // СОБЫТИЯ (в рамках активного проекта)
    // ==========================================

    /**
     * Загрузка событий из активного проекта
     */
    loadEvents() {
        const projectId = this.getActiveProjectId();
        if (!projectId) return [];
        
        const project = this.loadProject(projectId);
        if (!project || !project.events) return [];
        return project.events;
    },

    /**
     * Сохранение событий в активный проект
     */
    saveEvents(events) {
        const projectId = this.getActiveProjectId();
        if (!projectId) return;
        
        const project = this.loadProject(projectId);
        if (!project) return;
        
        project.events = events || [];
        this.saveProject(project);
    },

    // ==========================================
    // СВЯЗИ (в рамках активного проекта)
    // ==========================================

    /**
     * Загрузка связей из активного проекта
     */
    loadLinks() {
        const projectId = this.getActiveProjectId();
        if (!projectId) return [];
        
        const project = this.loadProject(projectId);
        if (!project || !project.links) return [];
        return project.links;
    },

    /**
     * Сохранение связей в активный проект
     */
    saveLinks(links) {
        const projectId = this.getActiveProjectId();
        if (!projectId) return;
        
        const project = this.loadProject(projectId);
        if (!project) return;
        
        project.links = links || [];
        this.saveProject(project);
        
        // Синхронизация с глобальным кэшем
        if (typeof savedLinks !== 'undefined') {
            savedLinks = links || [];
        }
    },

    // ==========================================
    // КАТЕГОРИИ
    // ==========================================

    /**
     * Загрузка категорий
     */
    loadCategories() {
        try {
            const data = localStorage.getItem(CONFIG.CUSTOM_CATEGORIES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Storage] Ошибка загрузки категорий:', error);
            return [];
        }
    },

    /**
     * Сохранение категорий
     */
    saveCategories(categories) {
        try {
            localStorage.setItem(CONFIG.CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
        } catch (error) {
            console.error('[Storage] Ошибка сохранения категорий:', error);
        }
    },

    // ==========================================
    // СТАТУСЫ
    // ==========================================

    /**
     * Загрузка статусов
     */
    loadStatuses() {
        try {
            const data = localStorage.getItem(CONFIG.CUSTOM_STATUSES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Storage] Ошибка загрузки статусов:', error);
            return [];
        }
    },

    /**
     * Сохранение статусов
     */
    saveStatuses(statuses) {
        try {
            localStorage.setItem(CONFIG.CUSTOM_STATUSES_KEY, JSON.stringify(statuses));
        } catch (error) {
            console.error('[Storage] Ошибка сохранения статусов:', error);
        }
    },

    // ==========================================
    // МИГРАЦИЯ
    // ==========================================

    /**
     * Миграция старых данных в систему проектов.
     * Вызывается один раз при первом запуске.
     */
    migrateToProjects() {
        const projects = this.loadProjects();
        if (projects.length > 0) return; // Уже мигрировано

        // Читаем напрямую из старых ключей (до миграции)
        let oldEvents = [];
        let oldLinks = [];
        
        try {
            const eventsData = localStorage.getItem(CONFIG.EVENTS_KEY);
            if (eventsData) oldEvents = JSON.parse(eventsData);
        } catch (e) { /* игнорируем */ }
        
        try {
            const linksData = localStorage.getItem(CONFIG.LINKS_KEY);
            if (linksData) oldLinks = JSON.parse(linksData);
        } catch (e) { /* игнорируем */ }

        // Если нет старых данных — используем TEST_DATA
        if (oldEvents.length === 0 && oldLinks.length === 0) {
            if (typeof TEST_DATA !== 'undefined' && TEST_DATA.length > 0) {
                const testProjects = TEST_DATA.map((p) => ({
                    ...p,
                    createdAt: p.createdAt || new Date().toISOString(),
                    events: p.events || [],
                    links: p.links || []
                }));
                
                this.saveProjects(testProjects);
                
                testProjects.forEach(p => {
                    localStorage.setItem(this._PROJECT_PREFIX + p.id, JSON.stringify(p));
                });
                
                this.setActiveProjectId(testProjects[0].id);
                
                console.log('[Storage] Инициализация из TEST_DATA:', testProjects.length, 'проектов');
                return;
            }
        }

        if (oldEvents.length === 0 && oldLinks.length === 0) {
            // Не создавать проект автоматически — пользователь создаст сам
            return;
        }

        // Создаём проект из данных
        const project = {
            id: 'proj_default',
            name: 'Мой проект',
            createdAt: new Date().toISOString(),
            events: oldEvents,
            links: oldLinks
        };

        this.saveProjects([project]);
        this.setActiveProjectId(project.id);
        localStorage.setItem(this._PROJECT_PREFIX + project.id, JSON.stringify(project));

        console.log('[Storage] Миграция завершена:', oldEvents.length, 'событий,', oldLinks.length, 'связей');
    }
};
