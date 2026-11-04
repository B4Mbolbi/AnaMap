/**
 * ==========================================
 * ОТРИСОВКА МАРКЕРОВ
 * ==========================================
 * 
 * Рендеринг маркеров событий с попапами,
 * тултипами, обработчиками кликов.
 * Управление видимостью слоёв.
 * ==========================================
 */

/**
 * Создать маркер события
 */
function _createEventMarker(ev, index) {
    const cfg = getCategoryConfig(ev.type);
    const delay = index * 30;

    const icon = L.divIcon({
        html: `<div class="event-marker-dot pulse-active" style="background:${cfg.color};color:${cfg.color};animation-delay:0s,${delay}ms;"></div>`,
        className: '',
        iconSize: CONFIG.MARKER.EVENT_SIZE,
        iconAnchor: CONFIG.MARKER.EVENT_ANCHOR
    });

    const marker = L.marker([ev.lat, ev.lng], { icon });

    // Сохраняем маппинг eventId -> marker
    _eventMarkers[ev.id] = marker;

    // Попап события
    marker.bindPopup(`
        <div style="padding:12px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span style="width:8px;height:8px;border-radius:50%;background:${cfg.color};"></span>
                <span style="font-size:11px;font-weight:700;color:${cfg.color};text-transform:uppercase;">${cfg.label}</span>
            </div>
            <div style="font-size:13px;margin-bottom:8px;color:#cbd5e1;">${ev.description}</div>
            <div style="font-size:11px;color:#94a3b8;">${CONFIG.STATUS_LABELS[ev.status]} • ${ev.date}</div>
        </div>
    `);

    // Лейбл (показывается при зуме >= LABEL_ZOOM_THRESHOLD)
    marker.bindTooltip(ev.description, {
        permanent: true,
        direction: 'top',
        offset: [0, -12],
        className: 'event-tooltip',
        opacity: 0
    });

    // Клик для режима связи
    marker.on('click', (e) => {
        if (linkMode) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            e.originalEvent.stopPropagation();
            e.originalEvent.preventDefault();
            addMarkerToSelection(marker, ev);
        } else {
            // Подсветка связей события
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            highlightEventLinks(ev.id);
        }
    });

    return marker;
}

/**
 * Отрисовка маркеров событий на карте
 */
function renderMap() {
    markersLayer.clearLayers();

    // Очистка кластеров-годов
    map.eachLayer(layer => {
        if (layer._isYearCluster) map.removeLayer(layer);
    });

    // Управление видимостью кластера
    if (linkMode) {
        map.removeLayer(markersLayer);
    } else if (!map.hasLayer(markersLayer)) {
        map.addLayer(markersLayer);
    }

    // Скрытие обычных маркеров в режиме «По годам»
    if (State.viewMode === 'years') {
        map.removeLayer(markersLayer);
    }

    // Очищаем маппинг маркеров перед перерисовкой
    Object.keys(_eventMarkers).forEach(id => delete _eventMarkers[id]);

    const filtered = State.getFilteredEvents();

    filtered.forEach((ev, index) => {
        const marker = _createEventMarker(ev, index);

        // Размещение маркера
        if (linkMode) {
            marker._isEventMarker = true;
            map.addLayer(marker);
        } else {
            markersLayer.addLayer(marker);
        }
    });

    updateLabelsVisibility();
    clearLinkHighlight();
    renderSavedLinks();

    if (State.viewMode === 'years') {
        renderYearClusters();
    }

    if (heatVisible) {
        updateHeatLayer();
    }
}
