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
let linkSelection = []; // Выбранные маркеры для связи
let linkLines = []; // Массив L.polyline
let savedLinks = []; // Сохранённые связи [{from, to}]
const LINKS_STORAGE_KEY = 'event_links';

/**
 * Загрузить сохранённые связи из localStorage
 */
function loadSavedLinks() {
    try {
        const data = localStorage.getItem(LINKS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Ошибка загрузки связей:', error);
        return [];
    }
}

/**
 * Сохранить связи в localStorage
 * @param {Array} links 
 */
function saveLinks(links) {
    try {
        localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
    } catch (error) {
        console.error('Ошибка сохранения связей:', error);
    }
}

/**
 * Переключить режим связи
 */
function toggleLinkMode() {
    linkMode = !linkMode;
    linkSelection = [];
    
    // Очищаем временные линии при выходе из режима
    if (!linkMode) {
        clearTempLinks();
    }
    
    const btn = document.getElementById('btn-link-mode');
    if (linkMode) {
        btn.classList.add('active');
        btn.style.background = '#3b82f633';
        btn.style.borderColor = '#3b82f666';
        btn.style.color = '#3b82f6';
        map.getContainer().style.cursor = 'crosshair';
        showLinkHint();
        // Перерисовываем карту — маркеры переходят из кластера на карту
        renderMap();
    } else {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        map.getContainer().style.cursor = '';
        hideLinkHint();
        clearSelection();
        
        // Удаляем все маркеры, добавленные напрямую на карту
        map.eachLayer((layer) => {
            if (layer._isEventMarker) {
                map.removeLayer(layer);
            }
        });
        
        // renderMap() сам добавит кластер и перерисует маркеры
        renderMap();
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
 * Очистить выбор
 */
function clearSelection() {
    linkSelection.forEach(item => {
        if (item.marker) {
            item.marker.setStyle({ weight: 2, opacity: 1 });
        }
    });
    linkLines.forEach(l => linksLayer.removeLayer(l));
    linkLines = [];
    linkSelection = [];
    updateLinkHint();
}

/**
 * Добавить маркер в выборку
 * @param {L.Marker} marker 
 * @param {object} eventData 
 */
function addMarkerToSelection(marker, eventData) {
    linkSelection.push({ marker, data: eventData });
    
    // Подсветка выбранного маркера
    marker.setStyle({ 
        weight: 4, 
        opacity: 1,
        fillOpacity: 1
    });
    
    updateLinkHint();
    
    // Если выбрано >= 2 маркера, создаём линию
    if (linkSelection.length >= 2) {
        createLink();
    }
}

/**
 * Создать линию между выбранными маркерами
 */
function createLink() {
    if (linkSelection.length < 2) return;
    
    // Берём последние 2 маркера
    const from = linkSelection[linkSelection.length - 2];
    const to = linkSelection[linkSelection.length - 1];
    
    // Создаём полилинию
    const polyline = L.polyline(
        [[from.data.lat, from.data.lng], [to.data.lat, to.data.lng]],
        {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.6,
            dashArray: '8, 6',
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
                removeLink(polyline, from.data.id, to.data.id);
            };
        }
    });
    
    linkLines.push(polyline);
    
    // Сохраняем связь
    const link = {
        from: from.data.id,
        to: to.data.id,
        id: Date.now()
    };
    savedLinks.push(link);
    saveLinks(savedLinks);
    
    // Очищаем выбор и добавляем последний маркер для продолжения цепочки
    const lastMarker = linkSelection[linkSelection.length - 1];
    linkSelection.forEach(item => {
        if (item.marker) {
            item.marker.setStyle({ weight: 2, opacity: 1 });
        }
    });
    linkSelection = [lastMarker];
    updateLinkHint();
}

/**
 * Удалить все временные линии
 */
function clearTempLinks() {
    linkLines.forEach(l => linksLayer.removeLayer(l));
    linkLines = [];
}

/**
 * Удалить связь
 * @param {L.Polyline} polyline 
 * @param {string} fromId 
 * @param {string} toId 
 */
function removeLink(polyline, fromId, toId) {
    linksLayer.removeLayer(polyline);
    linkLines = linkLines.filter(l => l !== polyline);
    savedLinks = savedLinks.filter(l => !(l.from === fromId && l.to === toId));
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
                color: '#3b82f6',
                weight: 2,
                opacity: 0.6,
                dashArray: '8, 6',
                lineCap: 'round'
            }
        ).addTo(linksLayer);
        
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
                    removeLink(polyline, link.from, link.to);
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
    
    // Esc — отмена режима связи
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && linkMode) {
            toggleLinkMode();
        }
    });
}
