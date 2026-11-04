/**
 * ==========================================
 * ОБРАБОТЧИКИ СЛОЁВ (LAYERS HANDLERS)
 * ==========================================
 * 
 * Кнопка «Слои» на карте — dropdown с чекбоксами.
 * ==========================================
 */

/**
 * Инициализация обработчиков слоёв (dropdown на карте)
 */
function initLayersHandlers() {
    const btnLayers = document.getElementById('btn-layers-mode');
    const dropdown = document.getElementById('layers-dropdown');
    const btnAddLayer = document.getElementById('btn-add-layer-dropdown');
    const selector = document.getElementById('layer-selector');

    if (btnLayers) {
        btnLayers.addEventListener('click', () => {
            if (!dropdown) return;
            dropdown.classList.toggle('hidden');
            renderLayersDropdown();
        });
    }

    if (btnAddLayer) {
        btnAddLayer.addEventListener('click', () => {
            const activeId = Storage.getActiveProjectId();
            if (!activeId) return;
            const name = prompt('Название нового слоя:');
            if (!name || name.trim() === '') return;
            const layer = Storage.addLayer(activeId, name.trim());
            if (layer) {
                renderLayersDropdown();
            }
        });
    }

    // Селектор слоя в шапке
    if (selector) {
        selector.addEventListener('change', (e) => {
            const layerId = e.target.value;
            if (!layerId) return;
            const activeId = Storage.getActiveProjectId();
            if (!activeId) return;

            // Сохраняем текущий слой
            const currentProject = Storage.loadProject(activeId);
            if (currentProject) {
                const activeLayer = currentProject.layers.find(l => l.id === Store.state.activeLayerId);
                if (activeLayer) {
                    activeLayer.events = Store.state.events || [];
                    activeLayer.links = Store.state.links || [];
                    Storage.saveProject(currentProject);
                }
            }

            // Переключаемся на выбранный слой
            const project = Storage.loadProject(activeId);
            if (project) {
                const targetLayer = project.layers.find(l => l.id === layerId);
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
    }

    // Закрытие dropdown при клике вне
    document.addEventListener('click', (e) => {
        if (dropdown && !dropdown.classList.contains('hidden')) {
            if (!dropdown.contains(e.target) && (!btnLayers || !btnLayers.contains(e.target))) {
                dropdown.classList.add('hidden');
            }
        }
    });
}

/**
 * Рендеринг dropdown слоёв на карте
 */
function renderLayersDropdown() {
    const container = document.getElementById('layers-dropdown-list');
    const selector = document.getElementById('layer-selector');
    if (!container) return;

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

    project.layers.forEach(layer => {
        const isActive = layer.id === activeLayerId;
        const layerEvents = layer.events || [];
        const layerLinks = layer.links || [];

        const item = document.createElement('div');
        item.className = 'layer-item';
        item.style.cssText = `
            padding: 6px 8px;
            margin-bottom: 4px;
            background: ${isActive ? 'color-mix(in srgb, var(--accent-blue) 10%, transparent)' : 'transparent'};
            border-radius: var(--radius-sm);
        `;

        item.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;">
                <input type="checkbox" class="layer-visibility" data-id="${layer.id}" ${layer.visible ? 'checked' : ''}>
                <span style="width:8px;height:8px;border-radius:50%;background:${layer.color};flex-shrink:0;"></span>
                <span style="font-size:11px;color:var(--text-primary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(layer.name)}">${escapeHtml(layer.name)}</span>
                ${isActive ? '<span style="font-size:9px;color:var(--accent-blue);">✓</span>' : ''}
            </div>
            <div style="font-size:10px;color:var(--text-muted);margin-left:14px;margin-top:2px;">
                ${layerEvents.length} событий · ${layerLinks.length} связей
            </div>
        `;

        container.appendChild(item);

        // Обработчик чекбокса видимости
        const cb = item.querySelector('.layer-visibility');
        cb.addEventListener('change', (e) => {
            e.stopPropagation();
            Storage.toggleLayerVisibility(activeId, e.target.dataset.id);
            Store.toggleLayerVisibility(e.target.dataset.id);
        });
    });
}
