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
    MapView.eventMarkers[ev.id] = marker;

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
        if (LinkMode.active) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            e.originalEvent.stopPropagation();
            e.originalEvent.preventDefault();
            LinkMode.addToSelection(marker, ev);
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
    // Guard: карта ещё не инициализирована
    if (!MapView.map) return;

    _getLayer(markersLayer).clearLayers();

    // Очистка кластеров-годов
    MapView.map.eachLayer(layer => {
        if (layer._isYearCluster) MapView.map.removeLayer(layer);
    });

    const mkl = _getLayer(markersLayer);
    const lkl = _getLayer(linksLayer);
    const htl = _getLayer(heatLayer);

    // Управление видимостью кластера
    if (LinkMode.active) {
        MapView.map.removeLayer(mkl);
    } else if (!MapView.map.hasLayer(mkl)) {
        MapView.map.addLayer(mkl);
    }

    // Скрытие обычных маркеров в режиме «По годам»
    if (State.viewMode === 'years') {
        MapView.map.removeLayer(mkl);
    }

    // Очищаем маппинг маркеров перед перерисовкой
    Object.keys(MapView.eventMarkers).forEach(id => delete MapView.eventMarkers[id]);

    const filtered = State.getFilteredEvents();

    filtered.forEach((ev, index) => {
        const marker = _createEventMarker(ev, index);

        // Размещение маркера
        if (LinkMode.active) {
            marker._isEventMarker = true;
            MapView.map.addLayer(marker);
        } else {
            mkl.addLayer(marker);
        }
    });

    updateLabelsVisibility();
    clearLinkHighlight();
    renderSavedLinks();

    if (State.viewMode === 'years') {
        renderYearClusters();
    }

    if (MapView.heatVisible) {
        updateHeatLayer();
    }
}
