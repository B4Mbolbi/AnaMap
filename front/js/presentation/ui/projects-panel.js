/**
 * ==========================================
 * PROJECTS PANEL — PRESENTATION СЛОЙ
 * ==========================================
 * 
 * Только рендеринг карточек проектов.
 * Читает данные из Storage, строит DOM.
 * НЕ мутирует данные.
 * ==========================================
 */

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
                switchProject(project.id);
            });
        }

        const btnRename = card.querySelector('.btn-rename-project');
        if (btnRename) {
            btnRename.addEventListener('click', (e) => {
                e.stopPropagation();
                const newName = prompt('Новое имя проекта:', project.name);
                if (!newName || newName.trim() === '') return;
                renameProject(project.id, newName);
                renderProjectsPanel();
                updateProjectSelector();
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
                    renderProjectsPanel();
                    updateProjectSelector();
                }
            });
        }

        container.appendChild(card);

        // Секция слоёв для активного проекта
        if (isActive) {
            const layersDiv = document.createElement('div');
            layersDiv.className = 'layers-section';
            layersDiv.style.cssText = 'margin-top:8px;padding:8px;background:var(--bg-body);border:1px solid var(--border-subtle);border-radius:var(--radius-md);';
            layersDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                    <span style="font-size:11px;font-weight:600;color:var(--text-muted);">📂 Слои</span>
                    <button id="btn-add-layer-inline" style="margin-left:auto;padding:2px 6px;font-size:10px;background:var(--accent-blue);color:#fff;border:none;border-radius:var(--radius-sm);cursor:pointer;">+ Новый</button>
                </div>
                <div id="layers-list"></div>
            `;
            container.appendChild(layersDiv);

            // Обработчик кнопки «+ Новый слой»
            const btnAddLayer = layersDiv.querySelector('#btn-add-layer-inline');
            if (btnAddLayer) {
                btnAddLayer.addEventListener('click', () => {
                    handleAddLayer();
                });
            }

            // Рендерим список слоёв
            renderLayersPanel();
        }
    });
}
