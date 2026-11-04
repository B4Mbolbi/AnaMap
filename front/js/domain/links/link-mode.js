/**
 * ==========================================
 * СВЯЗИ — РЕЖИМ СВЯЗИ (LINK MODE)
 * ==========================================
 * 
 * Управление режимом связывания маркеров:
 * - Вход/выход из режима
 * - Выбор маркеров
 * - Подсказки режима
 * ==========================================
 */

var linkMode = false;
var linkSelection = []; // [{marker, data}]
var linkLines = []; // L.polyline[]

/**
 * Войти в режим связи
 */
function enterLinkMode() {
    linkMode = true;
    linkSelection = [];

    map.removeLayer(markersLayer);

    if (heatVisible) {
        map.removeLayer(heatLayer);
    }

    renderMap();

    const btn = document.getElementById('btn-link-mode');
    btn.classList.add('active');
    btn.style.background = '#3b82f633';
    btn.style.borderColor = '#3b82f666';
    btn.style.color = '#3b82f6';
    map.getContainer().style.cursor = 'crosshair';
    showLinkHint();
    updateLinkHint();
}

/**
 * Выйти из режима связи
 */
function exitLinkMode() {
    linkMode = false;

    map.eachLayer(layer => {
        if (layer._isEventMarker) {
            map.removeLayer(layer);
        }
    });

    clearSelection();
    map.addLayer(markersLayer);
    renderMap();

    if (heatVisible) {
        heatLayer.addTo(map);
        updateHeatLayer();
    }

    const btn = document.getElementById('btn-link-mode');
    btn.classList.remove('active');
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    map.getContainer().style.cursor = '';
    hideLinkHint();
}

/**
 * Переключить режим связи
 */
function toggleLinkMode() {
    if (linkMode) {
        exitLinkMode();
    } else {
        enterLinkMode();
    }
}

/**
 * Показать подсказку режима связи
 */
function showLinkHint() {
    if (document.getElementById('link-hint')) return;
    
    const hint = document.createElement('div');
    hint.id = 'link-hint';
    hint.style.cssText = `
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        background: rgba(13, 15, 20, 0.95);
        border: 1px solid #3b82f6;
        border-radius: 10px;
        padding: 10px 16px;
        font-size: 12px;
        color: #e2e8f0;
        text-align: center;
        backdrop-filter: blur(8px);
        pointer-events: none;
    `;
    hint.innerHTML = `
        <div style="font-weight:600;margin-bottom:4px;">🔗 Режим связи</div>
        <div style="color:#94a3b8;">Кликайте по маркерам для создания связей</div>
        <div style="color:#64748b;font-size:10px;margin-top:4px;">Esc — отмена</div>
    `;
    
    document.querySelector('.map-container').appendChild(hint);
}

/**
 * Скрыть подсказку
 */
function hideLinkHint() {
    const hint = document.getElementById('link-hint');
    if (hint) hint.remove();
}

/**
 * Обновить подсказку с выбранными маркерами
 */
function updateLinkHint() {
    const hint = document.getElementById('link-hint');
    if (!hint) return;
    
    const count = linkSelection.length;
    hint.innerHTML = `
        <div style="font-weight:600;margin-bottom:4px;">🔗 Режим связи</div>
        <div style="color:#94a3b8;">Выбрано: ${count} ${count === 1 ? 'маркер' : count < 5 ? 'маркера' : 'маркеров'}</div>
        ${count >= 2 ? '<div style="color:#3b82f6;font-size:10px;margin-top:2px;">Нажмите на следующий маркер для связи</div>' : ''}
        <div style="color:#64748b;font-size:10px;margin-top:4px;">Esc — отмена</div>
    `;
}

/**
 * Очистить выбор и временные линии
 */
function clearSelection() {
    linkSelection.forEach(item => {
        if (item.marker && item.marker._icon) {
            item.marker._icon.classList.remove('link-selected');
        }
    });
    linkSelection = [];

    linkLines.forEach(l => linksLayer.removeLayer(l));
    linkLines = [];

    updateLinkHint();
}

/**
 * Добавить маркер в выборку
 */
function addMarkerToSelection(marker, eventData) {
    const exists = linkSelection.some(item => item.data.id === eventData.id);
    if (exists) {
        linkSelection = linkSelection.filter(item => item.data.id !== eventData.id);
        if (marker._icon) {
            marker._icon.classList.remove('link-selected');
        }
        updateLinkHint();
        return;
    }

    linkSelection.push({ marker, data: eventData });
    
    if (marker._icon) {
        marker._icon.classList.add('link-selected');
    }
    
    updateLinkHint();
    
    if (linkSelection.length >= 2) {
        createLink();
    }
}
