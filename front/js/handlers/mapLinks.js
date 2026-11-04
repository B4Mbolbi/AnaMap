/**
 * ==========================================
 * СВЯЗИ МЕЖДУ МАРКЕРАМИ (ЛИНИИ)
 * ==========================================
 * 
 * Режим связывания маркеров линиями.
 * Клик по маркерам в режиме связи создаёт
 * полилинию между выбранными событиями.
 * ==========================================
 */

let linkMode = false;
let linkSelection = []; // Выбранные маркеры для связи [{marker, data}]
let linkLines = []; // Массив L.polyline
let savedLinks = []; // Сохранённые связи [{from, to, id}]

/**
 * Загрузить сохранённые связи из Storage
 */
function loadSavedLinks() {
    return Storage.loadLinks();
}

/**
 * Сохранить связи в Storage
 * @param {Array} links 
 */
function saveLinks(links) {
    Storage.saveLinks(links);
}

/**
 * Войти в режим связи
 */
function enterLinkMode() {
    linkMode = true;
    linkSelection = [];

    // Убираем кластер
    map.removeLayer(markersLayer);

    // Скрываем тепловую карту если активна
    if (heatVisible) {
        map.removeLayer(heatLayer);
    }

    // Перерисовываем карту — маркеры идут напрямую на map
    renderMap();

    // UI
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

    // Удаляем все маркеры с флагом _isEventMarker
    map.eachLayer(layer => {
        if (layer._isEventMarker) {
            map.removeLayer(layer);
        }
    });

    // Очищаем выбор и линии
    clearSelection();

    // Возвращаем кластер
    map.addLayer(markersLayer);

    // Перерисовываем маркеры в кластер
    renderMap();

    // Возвращаем тепловую карту если была активна
    if (heatVisible) {
        heatLayer.addTo(map);
        updateHeatLayer();
    }

    // UI
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
    // Сбрасываем подсветку маркеров
    linkSelection.forEach(item => {
        if (item.marker && item.marker._icon) {
            item.marker._icon.classList.remove('link-selected');
        }
    });
    linkSelection = [];

    // Удаляем временные линии
    linkLines.forEach(l => linksLayer.removeLayer(l));
    linkLines = [];

    updateLinkHint();
}

/**
 * Добавить маркер в выборку
 * @param {L.Marker} marker 
 * @param {object} eventData 
 */
function addMarkerToSelection(marker, eventData) {
    // Проверяем, не выбран ли уже
    const exists = linkSelection.some(item => item.data.id === eventData.id);
    if (exists) {
        // Снимаем выбор
        linkSelection = linkSelection.filter(item => item.data.id !== eventData.id);
        if (marker._icon) {
            marker._icon.classList.remove('link-selected');
        }
        updateLinkHint();
        return;
    }

    linkSelection.push({ marker, data: eventData });
    
    // Подсветка выбранного маркера
    if (marker._icon) {
        marker._icon.classList.add('link-selected');
    }
    
    updateLinkHint();
    
    // Если выбрано >= 2 маркера, создаём линию
    if (linkSelection.length >= 2) {
        createLink();
    }
}

/**
 * Проверить, существует ли связь между двумя событиями
 * @param {string} fromId 
 * @param {string} toId 
 * @returns {boolean}
 */
function linkExists(fromId, toId) {
    return savedLinks.some(link => 
        (link.from === fromId && link.to === toId) ||
        (link.from === toId && link.to === fromId)
    );
}

/**
 * Создать линию между выбранными маркерами
 */
function createLink() {
    if (linkSelection.length < 2) return;
    
    const from = linkSelection[linkSelection.length - 2];
    const to = linkSelection[linkSelection.length - 1];

    // Проверяем, что маркеры разные
    if (from.data.id === to.data.id) return;

    // Проверяем дубликат связи
    if (linkExists(from.data.id, to.data.id)) {
        console.warn('Связь между этими событиями уже существует');
        return;
    }
    
    // Создаём полилинию
    const polyline = L.polyline(
        [[from.data.lat, from.data.lng], [to.data.lat, to.data.lng]],
        {
            color: CONFIG.LINK.COLOR,
            weight: CONFIG.LINK.WEIGHT,
            opacity: CONFIG.LINK.OPACITY,
            dashArray: CONFIG.LINK.DASH_ARRAY,
            lineCap: 'round'
        }
    ).addTo(linksLayer);
    
    // Попап с информацией
    polyline.bindPopup(`
        <div style="padding:8px;font-size:12px;">
            <div style="font-weight:600;margin-bottom:4px;">Связь</div>
            <div style="color:#94a3b8;">${from.data.description}</div>
            <div style="color:#94a3b8;">→</div>
            <div style="color:#94a3b8;">${to.data.description}</div>
            <button class="btn-remove-link" style="margin-top:8px;padding:4px 8px;background:#ef4444;color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;">Удалить связь</button>
        </div>
    `);
    
    // Обработчик удаления связи
    polyline.once('popupopen', () => {
        const btn = document.querySelector('.btn-remove-link');
        if (btn) {
            btn.onclick = () => {
                removeLink(polyline, polyline._linkId);
            };
        }
    });
    
    // Сохраняем id связи на polyline для удаления
    const linkId = Date.now();
    polyline._linkId = linkId;
    linkLines.push(polyline);
    
    // Сохраняем связь
    const link = {
        from: from.data.id,
        to: to.data.id,
        id: linkId
    };
    savedLinks.push(link);
    saveLinks(savedLinks);
    
    // Снимаем выделение, оставляем последний для цепочки
    linkSelection.forEach(item => {
        if (item.marker && item.marker._icon) {
            item.marker._icon.classList.remove('link-selected');
        }
    });
    linkSelection = [to];
    updateLinkHint();
}

/**
 * Удалить связь
 * @param {L.Polyline} polyline 
 * @param {number} linkId 
 */
function removeLink(polyline, linkId) {
    if (!polyline) return;
    
    // Удаляем линию с карты
    linksLayer.removeLayer(polyline);
    
    // Удаляем из массива временных линий
    linkLines = linkLines.filter(l => l !== polyline);
    
    // Удаляем из сохранённых связей
    savedLinks = savedLinks.filter(l => l.id !== linkId);
    saveLinks(savedLinks);
}

/**
 * Отрисовка сохранённых связей на карте
 */
function renderSavedLinks() {
    // Очищаем старые линии
    linkLines.forEach(l => linksLayer.removeLayer(l));
    linkLines = [];
    
    savedLinks.forEach(link => {
        const fromEvent = State.events.find(e => e.id === link.from);
        const toEvent = State.events.find(e => e.id === link.to);
        
        if (!fromEvent || !toEvent) return;
        
        const polyline = L.polyline(
            [[fromEvent.lat, fromEvent.lng], [toEvent.lat, toEvent.lng]],
            {
                color: CONFIG.LINK.COLOR,
                weight: CONFIG.LINK.WEIGHT,
                opacity: CONFIG.LINK.OPACITY,
                dashArray: CONFIG.LINK.DASH_ARRAY,
                lineCap: 'round'
            }
        ).addTo(linksLayer);
        
        // Сохраняем id связи
        polyline._linkId = link.id;
        
        polyline.bindPopup(`
            <div style="padding:8px;font-size:12px;">
                <div style="font-weight:600;margin-bottom:4px;">Связь</div>
                <div style="color:#94a3b8;">${fromEvent.description}</div>
                <div style="color:#94a3b8;">→</div>
                <div style="color:#94a3b8;">${toEvent.description}</div>
                <button class="btn-remove-link" style="margin-top:8px;padding:4px 8px;background:#ef4444;color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;">Удалить связь</button>
            </div>
        `);
        
        polyline.once('popupopen', () => {
            const btn = document.querySelector('.btn-remove-link');
            if (btn) {
                btn.onclick = () => {
                    removeLink(polyline, link.id);
                };
            }
        });
        
        linkLines.push(polyline);
    });
}

/**
 * Инициализация обработчиков для связей
 */
function initLinkHandlers() {
    // Кнопка режима связи
    document.getElementById('btn-link-mode').onclick = toggleLinkMode;
    
    // Esc — выход из режима связи (не toggle, а именно выход)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && linkMode) {
            exitLinkMode();
        }
    });
}
