/**
 * ==========================================
    ВКЛАДКА «ПРОЕКТЫ»
    ==========================================
    
    Управление проектами: создание,
    переименование, удаление, экспорт/импорт.
    ==========================================
    */

/**
 * Создать новый проект
 * @param {string} name 
 * @returns {object}
 */
function createProject(name) {
    const projects = Storage.loadProjects();
    const project = {
        id: 'proj_' + Date.now(),
        name: name || 'Без названия',
        createdAt: new Date().toISOString(),
        events: [],
        links: []
    };
    projects.push(project);
    Storage.saveProjects(projects);
    Storage.setActiveProjectId(project.id);
    return project;
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
 * Рендеринг панели проектов
 */
function renderProjectsPanel() {
    const container = document.getElementById('projects-list');
    if (!container) return;

    const projects = Storage.loadProjects();
    const activeId = Storage.getActiveProjectId();

    if (projects.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:24px 12px;color:var(--text-dim);font-size:12px;">
                <div style="font-size:24px;margin-bottom:8px;">📁</div>
                <div>Проектов пока нет</div>
                <div style="margin-top:4px;font-size:10px;">Создайте первый проект</div>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    projects.forEach(project => {
        const isActive = project.id === activeId;
        const eventCount = project.events ? project.events.length : 0;
        const linkCount = project.links ? project.links.length : 0;

        const card = document.createElement('div');
        card.style.cssText = `
            padding: 10px;
            margin-bottom: 8px;
            background: ${isActive ? 'color-mix(in srgb, var(--accent-blue) 10%, var(--bg-body))' : 'var(--bg-body)'};
            border: 1px solid ${isActive ? 'var(--accent-blue)' : 'var(--border-subtle)'};
            border-radius: var(--radius-md);
            transition: all var(--transition);
        `;
        card.onmouseenter = () => {
            if (!isActive) card.style.borderColor = 'var(--border-hover)';
        };
        card.onmouseleave = () => {
            if (!isActive) card.style.borderColor = 'var(--border-subtle)';
        };

        const createdDate = new Date(project.createdAt).toLocaleDateString('ru-RU');

        card.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:13px;font-weight:600;color:var(--text-primary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(project.name)}">${escapeHtml(project.name)}</span>
                <span style="font-size:10px;color:var(--text-dim);flex-shrink:0;">${createdDate}</span>
            </div>
            <div style="display:flex;gap:6px;margin-bottom:8px;font-size:10px;color:var(--text-muted);">
                <span>📋 ${eventCount} событий</span>
                <span>🔗 ${linkCount} связей</span>
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                ${!isActive ? `<button class="btn-open-project" data-id="${project.id}" style="flex:1;padding:4px 8px;font-size:10px;background:var(--accent-blue);color:#fff;border:none;border-radius:var(--radius-sm);cursor:pointer;">Открыть</button>` : '<span style="flex:1;padding:4px 8px;font-size:10px;color:var(--accent-blue);text-align:center;">✓ Активен</span>'}
                <button class="btn-rename-project" data-id="${project.id}" style="padding:4px 8px;font-size:10px;background:transparent;border:1px solid var(--border-default);color:var(--text-muted);border-radius:var(--radius-sm);cursor:pointer;">✎</button>
                <button class="btn-export-project" data-id="${project.id}" style="padding:4px 8px;font-size:10px;background:transparent;border:1px solid var(--border-default);color:var(--text-muted);border-radius:var(--radius-sm);cursor:pointer;">💾</button>
                ${!isActive ? `<button class="btn-delete-project" data-id="${project.id}" style="padding:4px 8px;font-size:10px;background:transparent;border:1px solid var(--border-default);color:var(--text-muted);border-radius:var(--radius-sm);cursor:pointer;">🗑</button>` : ''}
            </div>
        `;

        // Обработчики
        const btnOpen = card.querySelector('.btn-open-project');
        if (btnOpen) {
            btnOpen.addEventListener('click', (e) => {
                e.stopPropagation();
                switchToProject(project.id);
            });
        }

        const btnRename = card.querySelector('.btn-rename-project');
        if (btnRename) {
            btnRename.addEventListener('click', (e) => {
                e.stopPropagation();
                renameProject(project.id);
            });
        }

        const btnExport = card.querySelector('.btn-export-project');
        if (btnExport) {
            btnExport.addEventListener('click', (e) => {
                e.stopPropagation();
                exportProject(project.id);
            });
        }

        const btnDelete = card.querySelector('.btn-delete-project');
        if (btnDelete) {
            btnDelete.addEventListener('click', (e) {
                e.stopPropagation();
                if (confirm(`Удалить проект "${project.name}"?`)) {
                    deleteProject(project.id);
                }
            });
        }

        container.appendChild(card);
    });
}

/**
 * Переключиться на проект
 * @param {string} projectId 
 */
function switchToProject(projectId) {
    const projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    Storage.setActiveProjectId(projectId);

    // Загрузить события и связи проекта
    if (project.events) {
        State.setEvents(project.events);
        Storage.saveEvents();
    }
    if (project.links) {
        savedLinks = project.links;
        saveLinks(savedLinks);
    }

    // Обновить всё
    renderMap();
    renderUI();
    renderEventList();
    renderLinksPanel();
    renderProjectsPanel();
}

/**
 * Переименовать проект
 * @param {string} projectId 
 */
function renameProject(projectId) {
    const projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newName = prompt('Новое имя проекта:', project.name);
    if (!newName || newName.trim() === '') return;

    project.name = newName.trim();
    Storage.saveProjects(projects);
    renderProjectsPanel();
}

/**
 * Удалить проект
 * @param {string} projectId 
 */
function deleteProject(projectId) {
    let projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    projects = projects.filter(p => p.id !== projectId);
    Storage.saveProjects(projects);

    // Если удалили активный — переключиться на первый
    if (Storage.getActiveProjectId() === projectId) {
        if (projects.length > 0) {
            Storage.setActiveProjectId(projects[0].id);
            switchToProject(projects[0].id);
        } else {
            Storage.setActiveProjectId(null);
            State.setEvents([]);
            savedLinks = [];
            Storage.saveEvents();
            saveLinks([]);
            renderMap();
            renderUI();
            renderEventList();
        }
    }

    renderProjectsPanel();
}

/**
 * Экспорт проекта в JSON
 * @param {string} projectId 
 */
function exportProject(projectId) {
    const projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const data = JSON.stringify(project, null, 2);
    Export.downloadFile(data, `anemap_project_${project.name}_${Export.getDateString()}.json`, 'application/json');
}

/**
 * Импорт проекта из JSON
 * @param {File} file 
 */
async function importProjectFromJSON(file) {
    try {
        const text = await Export._readFileAsText(file);
        const data = JSON.parse(text);

        // Validate project structure
        if (!data.name || !Array.isArray(data.events)) {
            alert('Некорректный формат файла проекта');
            return;
        }

        const projects = Storage.loadProjects();
        data.id = 'proj_' + Date.now();
        data.createdAt = new Date().toISOString();
        data.links = data.links || [];
        projects.push(data);
        Storage.saveProjects(projects);
        Storage.setActiveProjectId(data.id);

        // Переключиться на импортированный проект
        switchToProject(data.id);
    } catch (err) {
        console.error('[Projects] Ошибка импорта:', err);
        alert('Ошибка чтения файла проекта');
    }
}

// Обработчики кнопок проекта
document.addEventListener('DOMContentLoaded', () => {
    const btnNewProject = document.getElementById('btn-new-project');
    const btnImportProject = document.getElementById('btn-import-project');
    const fileImportProject = document.getElementById('file-import-project');

    if (btnNewProject) {
        btnNewProject.addEventListener('click', () => {
            const name = prompt('Название нового проекта:');
            if (!name || name.trim() === '') return;
            createProject(name.trim());
            renderProjectsPanel();
            renderMap();
            renderUI();
            renderEventList();
            renderLinksPanel();
        });
    }

    if (btnImportProject) {
        btnImportProject.addEventListener('click', () => {
            fileImportProject?.click();
        });
    }

    if (fileImportProject) {
        fileImportProject.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importProjectFromJSON(file);
                e.target.value = '';
            }
        });
    }
});
