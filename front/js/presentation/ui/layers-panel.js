/**
 * ==========================================
 * УПРАВЛЕНИЕ СЛОЯМИ (LAYERS PANEL)
 * ==========================================
 * 
 * Список слоёв с чекбоксами видимости,
 * кнопками переименования и удаления.
 * ==========================================
 */

/**
 * Рендеринг панели слоёв в секции «Проекты»
 */
function renderLayersPanel() {
    const container = document.getElementById('layers-list');
    if (!container) return;

    const projects = Storage.loadProjects();
    const activeId = Storage.getActiveProjectId();
    if (!activeId) {
        container.innerHTML = '';
        return;
    }

    const project = Storage.loadProject(activeId);
    if (!project || !project.layers || project.layers.length === 0) {
        container.innerHTML = '';
        return;
    }

    const activeLayerId = Store.state.activeLayerId;

    // Обновляем селектор в шапке
    const selector = document.getElementById('layer-selector');
    if (selector) {
        selector.innerHTML = '';
        project.layers.forEach(layer => {
            const option = document.createElement('option');
            option.value = layer.id;
            option.textContent = layer.name;
            if (layer.id === activeLayerId) option.selected = true;
            selector.appendChild(option);
        });
        selector.style.display = 'block';
    }

    container.innerHTML = '';

    project.layers.forEach((layer, index) => {
        const isActive = layer.id === activeLayerId;
        const layerEvents = layer.events || [];
        const layerLinks = layer.links || [];

        const item = document.createElement('div');
        item.className = 'layer-item';
        item.style.cssText = `
            padding: 8px;
            margin-bottom: 6px;
            background: ${isActive ? 'color-mix(in srgb, var(--accent-blue) 10%, var(--bg-body))' : 'var(--bg-body)'};
            border: 1px solid ${isActive ? 'var(--accent-blue)' : 'var(--border-subtle)'};
            border-radius: var(--radius-md);
            transition: all var(--transition);
        `;

        item.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                <input type="checkbox" class="layer-visibility" data-id="${layer.id}" ${layer.visible ? 'checked' : ''} title="Видимость">
                <span style="width:10px;height:10px;border-radius:50%;background:${layer.color};flex-shrink:0;"></span>
                <span style="font-size:12px;color:var(--text-primary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(layer.name)}">${escapeHtml(layer.name)}</span>
                ${isActive ? '<span style="font-size:9px;color:var(--accent-blue);">✓ активен</span>' : ''}
            </div>
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;">
                ${layerEvents.length} событий · ${layerLinks.length} связей
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                ${!isActive ? `<button class="btn-activate-layer" data-id="${layer.id}" style="flex:1;padding:3px 6px;font-size:10px;background:var(--accent-blue);color:#fff;border:none;border-radius:var(--radius-sm);cursor:pointer;">Открыть</button>` : ''}
                <button class="btn-rename-layer" data-id="${layer.id}" style="padding:3px 6px;font-size:10px;background:transparent;border:1px solid var(--border-default);color:var(--text-muted);border-radius:var(--radius-sm);cursor:pointer;">✎</button>
                ${project.layers.length > 1 ? `<button class="btn-delete-layer" data-id="${layer.id}" style="padding:3px 6px;font-size:10px;background:transparent;border:1px solid var(--border-default);color:var(--text-muted);border-radius:var(--radius-sm);cursor:pointer;">🗑</button>` : ''}
            </div>
        `;

        container.appendChild(item);
    });

    // Обработчики
    container.querySelectorAll('.layer-visibility').forEach(cb => {
        cb.addEventListener('change', (e) => {
            e.stopPropagation();
            Storage.toggleLayerVisibility(activeId, e.target.dataset.id);
            Store.toggleLayerVisibility(e.target.dataset.id);
        });
    });

    container.querySelectorAll('.btn-activate-layer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            Storage.setActiveProjectId(activeId);
            // Сохраняем текущий слой перед переключением
            const currentProject = Storage.loadProject(activeId);
            if (currentProject) {
                const activeLayer = currentProject.layers.find(l => l.id === activeLayerId);
                if (activeLayer) {
                    activeLayer.events = Store.state.events || [];
                    activeLayer.links = Store.state.links || [];
                    Storage.saveProject(currentProject);
                }
            }
            switchProject(activeId);
            // Переключаем на нужный слой
            const project = Storage.loadProject(activeId);
            if (project) {
                const targetLayer = project.layers.find(l => l.id === btn.dataset.id);
                if (targetLayer) {
                    Store.setActiveLayerId(targetLayer.id);
                    Store.setLayers(project.layers);
                    Store.setEvents((targetLayer.events || []).map(normalizeEvent).filter(Boolean));
                    Store.commit(s => { s.links = (targetLayer.links || []).filter(l => l && l.from && l.to); }, 'links');
                    Store.resetFilters();
                    App.refresh('all');
                }
            }
        });
    });

    container.querySelectorAll('.btn-rename-layer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const project = Storage.loadProject(activeId);
            const layer = project.layers.find(l => l.id === btn.dataset.id);
            if (!layer) return;
            const newName = prompt('Новое имя слоя:', layer.name);
            if (newName && newName.trim()) {
                Storage.renameLayer(activeId, btn.dataset.id, newName);
                renderLayersPanel();
            }
        });
    });

    container.querySelectorAll('.btn-delete-layer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!confirm('Удалить слой "' + btn.dataset.id + '"?')) return;
            Storage.removeLayer(activeId, btn.dataset.id);
            renderLayersPanel();
        });
    });
}

/**
 * Обработчик кнопки «+ Новый слой»
 */
function handleAddLayer() {
    const activeId = Storage.getActiveProjectId();
    if (!activeId) return;
    const name = prompt('Название нового слоя:');
    if (!name || name.trim() === '') return;
    const layer = Storage.addLayer(activeId, name.trim());
    if (layer) {
        renderLayersPanel();
    }
}
