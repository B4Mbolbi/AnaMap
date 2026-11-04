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
 * Рендеринг панели проектов
 */
function renderProjectsPanel() {
    const container = document.getElementById('projects-list');
    if (!container) return;

    const projectsMeta = Storage.loadProjects();
    const activeId = Storage.getActiveProjectId();

    if (projectsMeta.length === 0) {
        container.innerHTML = `
            <button id="btn-new-project-inline" style="width:100%;padding:10px;font-size:13px;background:var(--accent-blue);color:#fff;border:none;border-radius:var(--radius-md);cursor:pointer;margin-bottom:12px;">+ Новый проект</button>
            <div style="text-align:center;padding:16px 12px;color:var(--text-dim);font-size:12px;">
                <div style="margin-top:4px;">или импортируйте проект из JSON</div>
            </div>
        `;
        var btnNew = document.getElementById('btn-new-project-inline');
        if (btnNew) {
            btnNew.addEventListener('click', function() {
                var name = prompt('Название нового проекта:');
                if (!name || name.trim() === '') return;
                createAndSwitchToProject(name.trim());
            });
        }
        return;
    }

    container.innerHTML = '';

    projectsMeta.forEach(projectMeta => {
        // Загружаем полные данные проекта (с событиями и связями)
        const project = Storage.loadProject(projectMeta.id) || projectMeta;
        const isActive = project.id === activeId;
        const events = project.events || [];
        const links = project.links || [];
        const eventCount = events.length;
        const linkCount = links.length;

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
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Удалить проект "' + project.name + '"?')) {
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
    // 1. Сначала сохраняем текущие данные в текущий проект
    const currentProject = Storage.loadProject(Storage.getActiveProjectId());
    if (currentProject) {
        currentProject.events = State.events || [];
        currentProject.links = State.links || [];
        Storage.saveProject(currentProject);
    }

    // 2. Загружаем данные нового проекта в State
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
    Storage.saveProject(project);
    renderProjectsPanel();
    updateProjectSelector();
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
    Storage.deleteProject(projectId);

    // Если удалили активный — переключиться на первый или создать новый
    if (Storage.getActiveProjectId() === projectId) {
        if (projects.length > 0) {
            Storage.setActiveProjectId(projects[0].id);
            switchToProject(projects[0].id);
        } else {
            // Создаём новый проект, если удалили все
            const newProject = Storage.createProject('Мой проект');
            switchToProject(newProject.id);
        }
    }

    renderProjectsPanel();
    updateProjectSelector();
}

/**
 * Экспорт проекта в JSON
 * @param {string} projectId 
 */
function exportProject(projectId) {
    const projects = Storage.loadProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    Export.exportProjectJSON(project);
}

/**
 * Импорт проекта из JSON
 * @param {File} file 
 */
async function importProjectFromJSON(file) {
    try {
        const result = await Export.importProjectJSON(file);
        if (!result.success) {
            console.warn('[Projects] Ошибка импорта:', result.error);
            return;
        }

        const data = result.data;
        const allProjects = result.allProjects;

        const projects = Storage.loadProjects();

        // Если файл содержит массив проектов — импортировать все
        if (allProjects && allProjects.length > 1) {
            for (const proj of allProjects) {
                const cloned = JSON.parse(JSON.stringify(proj));
                cloned.id = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                cloned.createdAt = new Date().toISOString();
                cloned.links = cloned.links || [];
                projects.push(cloned);
            }
            Storage.saveProjects(projects);
            for (const proj of allProjects) {
                Storage.saveProject(JSON.parse(JSON.stringify(proj)));
            }
            // Переключиться на последний импортированный
            const last = allProjects[allProjects.length - 1];
            Storage.setActiveProjectId(projects[projects.length - 1].id);
            switchToProject(projects[projects.length - 1].id);
            updateProjectSelector();
        } else {
            // Один проект
            data.id = 'proj_' + Date.now();
            data.createdAt = new Date().toISOString();
            data.links = data.links || [];
            projects.push(data);
            Storage.saveProjects(projects);
            Storage.saveProject(data);
            Storage.setActiveProjectId(data.id);

            switchToProject(data.id);
            updateProjectSelector();
        }
    } catch (err) {
        console.error('[Projects] Ошибка импорта:', err);
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
            createAndSwitchToProject(name.trim());
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
