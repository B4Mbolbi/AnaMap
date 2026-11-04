/**
 * ==========================================
 * PROJECT SERVICE — DOMAIN СЛОЙ
 * ==========================================
 * 
 * Бизнес-логика проектов: создание, переключение,
 * переименование, удаление, импорт/экспорт.
 * НЕ содержит DOM-операций.
 * ==========================================
 */

/**
 * Создать новый проект
 * @param {string} name 
 * @returns {object}
 */
function createProject(name) {
    return Storage.createProject(name || 'Без названия');
}

/**
 * Получить активный проект
 * @returns {object|null}
 */
function getActiveProject() {
    const projects = Storage.loadProjects();
    const activeId = Storage.getActiveProjectId();
    return projects.find(p => p.id === activeId) || null;
}

/**
 * Переключиться на проект
 * @param {string} projectId 
 * @returns {boolean} true при успехе
 */
function switchProject(projectId) {
    const currentId = Storage.getActiveProjectId();

    // 1. Сохранить ТЕКУЩИЙ проект (текущий слой), только если он реально другой
    if (currentId && currentId !== projectId) {
        const current = Storage.loadProject(currentId);
        if (current) {
            // Сохраняем текущие события/связи в активный слой
            const activeLayerId = Store.state.activeLayerId;
            if (activeLayerId) {
                const layer = current.layers.find(l => l.id === activeLayerId);
                if (layer) {
                    layer.events = Store.state.events || [];
                    layer.links  = Store.state.links  || [];
                }
            }
            Storage.saveProject(current);
        }
    }

    // 2. Загрузить новый
    const full = Storage.loadProject(projectId);
    if (!full) {
        console.error('[switchProject] Проект не найден:', projectId);
        return false;
    }

    // 3. Установить активный ДО записи в Store
    Storage.setActiveProjectId(projectId);

    // 4. Загрузить данные первого видимого слоя
    const defaultLayer = full.layers && full.layers.length > 0 ? full.layers[0] : null;
    if (!defaultLayer) {
        console.error('[switchProject] Нет слоёв в проекте:', projectId);
        return false;
    }

    // 5. Установить активный слой
    Store.setActiveLayerId(defaultLayer.id);
    Store.setLayers(full.layers);

    // 6. Нормализовать данные
    const events = (defaultLayer.events || []).map(normalizeEvent).filter(Boolean);
    const links  = (defaultLayer.links  || []).filter(l => l && l.from && l.to);

    // 7. Записать в Store (через commit — вызовет App.refresh)
    Store.setEvents(events);
    Store.commit(s => { s.links = links; }, 'links');

    // 8. Сбросить фильтры, чтобы новые данные были видны
    Store.resetFilters();

    // 9. Явный refresh (на случай, если подписка ещё не установлена)
    if (typeof App !== 'undefined' && typeof App.refresh === 'function') {
        App.refresh('all');
    }

    console.log('[switchProject]', {
        projectId,
        activeLayerId: Store.state.activeLayerId,
        layers: full.layers.length,
        events: Store.state.events.length,
        links: Store.state.links.length,
        visible: Store.getFilteredEvents().length
    });

    return true;
}

/**
 * Переименовать проект
 * @param {string} projectId 
 * @param {string} newName 
 */
function renameProject(projectId, newName) {
    const projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const trimmed = newName.trim();
    if (!trimmed) return;

    project.name = trimmed;
    Storage.saveProjects(projects);
    Storage.saveProject(project);
}

/**
 * Удалить проект (и все его слои)
 * @param {string} projectId 
 * @returns {object|null} - переключённый проект или null
 */
function deleteProject(projectId) {
    let projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;

    projects = projects.filter(p => p.id !== projectId);
    Storage.saveProjects(projects);
    Storage.deleteProject(projectId);

    let switchedProject = null;
    if (Storage.getActiveProjectId() === projectId) {
        if (projects.length > 0) {
            Storage.setActiveProjectId(projects[0].id);
            switchedProject = Storage.loadProject(projects[0].id);
            // Переключаем на первый слой нового проекта
            if (switchedProject.layers && switchedProject.layers.length > 0) {
                Store.setActiveLayerId(switchedProject.layers[0].id);
                Store.setLayers(switchedProject.layers);
                Store.setEvents(switchedProject.layers[0].events || []);
                Store.commit(state => { state.links = switchedProject.layers[0].links || []; }, 'links');
            }
        } else {
            const newProject = Storage.createProject('Мой проект');
            switchedProject = newProject;
            Store.setEvents([]);
            Store.commit(state => { state.links = []; }, 'links');
        }
    }

    return switchedProject;
}

/**
 * Экспорт проекта в JSON
 * @param {string} projectId 
 */
function exportProject(projectId) {
    const project = Storage.loadProject(projectId);
    if (!project) return;

    Export.exportProjectJSON(project);
}

/**
 * Импорт проекта из JSON
 * @param {File} file 
 * @returns {Promise<object|null>}
 */
async function importProjectFromJSON(file) {
    const result = await Export.importProjectJSON(file);
    if (!result.success) {
        console.warn('[Projects] Ошибка импорта:', result.error);
        return null;
    }

    const rawProjects = result.allProjects || [result.data];
    const savedProjects = [];

    for (const raw of rawProjects) {
        const project = normalizeProject(raw);
        if (!project) continue;

        // Сохранить в список и в хранилище ПОД ОДНИМ ID
        const projects = Storage.loadProjects();
        projects.push({ id: project.id, name: project.name, createdAt: project.createdAt });
        Storage.saveProjects(projects);
        Storage.saveProject(project);

        savedProjects.push(project);
    }

    if (savedProjects.length === 0) {
        console.warn('[Projects] Не удалось импортировать ни одного проекта');
        return null;
    }

    // Переключиться на последний импортированный
    const last = savedProjects[savedProjects.length - 1];
    switchProject(last.id);

    return last;
}

/**
 * Создать новый проект и переключиться на него
 * @param {string} name 
 */
function createAndSwitchToProject(name) {
    const project = createProject(name);
    switchProject(project.id);
}
