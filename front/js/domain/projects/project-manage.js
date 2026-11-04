/**
 * ==========================================
 * ПРОЕКТЫ — УПРАВЛЕНИЕ (PROJECT MANAGEMENT)
 * ==========================================
 * 
 * Создание, переименование, удаление,
 * переключение проектов.
 * ==========================================
 */

/**
 * Создать новый проект
 */
function createProject(name) {
    return Storage.createProject(name || 'Без названия');
}

/**
 * Получить активный проект
 */
function getActiveProject() {
    const projects = Storage.loadProjects();
    const activeId = Storage.getActiveProjectId();
    return projects.find(p => p.id === activeId) || null;
}

/**
 * Переключиться на проект
 */
function switchToProject(projectId) {
    // 1. Сохраняем текущие данные
    const currentProject = Storage.loadProject(Storage.getActiveProjectId());
    if (currentProject) {
        currentProject.events = State.events || [];
        currentProject.links = State.links || [];
        Storage.saveProject(currentProject);
    }

    // 2. Загружаем данные нового проекта
    const projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    Storage.setActiveProjectId(projectId);
    
    const fullProject = Storage.loadProject(projectId);
    if (!fullProject) return;

    State.setEvents(fullProject.events || []);
    State.links = fullProject.links || [];
    savedLinks = State.links;

    // 3. Обновить всё
    renderMap();
    renderUI();
    renderEventList();
    renderLinksPanel();
    renderProjectsPanel();
    updateProjectSelector();
}

/**
 * Переименовать проект
 */
function renameProject(projectId) {
    const projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newName = prompt('Новое имя проекта:', project.name);
    if (!newName || newName.trim() === '') return;

    project.name = newName.trim();
    Storage.saveProjects(projects);
    Storage.saveProject(project);
    renderProjectsPanel();
    updateProjectSelector();
}

/**
 * Удалить проект
 */
function deleteProject(projectId) {
    let projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    projects = projects.filter(p => p.id !== projectId);
    Storage.saveProjects(projects);
    Storage.deleteProject(projectId);

    if (Storage.getActiveProjectId() === projectId) {
        if (projects.length > 0) {
            Storage.setActiveProjectId(projects[0].id);
            switchToProject(projects[0].id);
        } else {
            const newProject = Storage.createProject('Мой проект');
            switchToProject(newProject.id);
        }
    }

    renderProjectsPanel();
    updateProjectSelector();
}

/**
 * Экспорт проекта в JSON
 */
function exportProject(projectId) {
    const projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    Export.exportProjectJSON(project);
}

/**
 * Импорт проекта из JSON
 */
async function importProjectFromJSON(file) {
    try {
        const result = await Export.importProjectJSON(file);
        if (!result.success) {
            console.warn('[Projects] Ошибка импорта:', result.error);
            return;
        }

        const data = result.data;
        data.id = 'proj_' + Date.now();
        data.createdAt = new Date().toISOString();
        data.links = data.links || [];

        const projects = Storage.loadProjects();
        projects.push(data);
        Storage.saveProjects(projects);
        Storage.saveProject(data);
        Storage.setActiveProjectId(data.id);

        switchToProject(data.id);
        updateProjectSelector();
    } catch (err) {
        console.error('[Projects] Ошибка импорта:', err);
    }
}

/**
 * Создать новый проект и переключиться на него
 */
function createAndSwitchToProject(name) {
    const project = createProject(name);
    switchToProject(project.id);
    updateProjectSelector();
}
