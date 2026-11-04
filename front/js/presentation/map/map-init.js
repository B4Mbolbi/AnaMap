/**
 * ==========================================
 * ИНИЦИАЛИЗАЦИЯ КАРТЫ
 * ==========================================
 * 
 * Создание карты Leaflet, тайлов,
 * кластеризации, слоёв связей и тепловой
 * карты. Привязка базовых событий.
 * ==========================================
 */

/**
 * Инициализация карты Leaflet
 */
function initMap() {
    map = L.map('map', { zoomControl: true })
        .setView(CONFIG.MAP.center, CONFIG.MAP.zoom);

    L.tileLayer(CONFIG.MAP.TILE_URL, {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: CONFIG.MAP.MAX_ZOOM
    }).addTo(map);

    markersLayer = L.markerClusterGroup({
        maxClusterRadius: CONFIG.CLUSTER_MAX_RADIUS,
        iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount();
            let size = CONFIG.CLUSTER_SIZES.DEFAULT;
            if (count > 5)  size = CONFIG.CLUSTER_SIZES.OVER_5;
            if (count > 10) size = CONFIG.CLUSTER_SIZES.OVER_10;

            return L.divIcon({
                html: `<div class="cluster-marker" style="width:${size}px;height:${size}px;">${count}</div>`,
                className: '',
                iconSize: [size, size]
            });
        }
    });

    map.addLayer(markersLayer);
    linksLayer = L.layerGroup().addTo(map);
    heatLayer = L.heatLayer([], CONFIG.HEAT_LAYER);
    heatVisible = false;

    setTimeout(() => map.invalidateSize(), CONFIG.MAP.INVALIDATE_DELAY);

    // Клик по карте — открытие модалки добавления или выбор координат
    map.on('click', (e) => {
        if (typeof mapPickMode !== 'undefined' && mapPickMode) {
            setCoordinatesFromMap(e.latlng.lat, e.latlng.lng);
        } else {
            openAddModal(e.latlng.lat, e.latlng.lng);
        }
        
        // Сброс подсветки связей при клике на пустое место
        if (typeof clearLinkHighlight === 'function' && typeof _currentHighlightEventId !== 'undefined' && _currentHighlightEventId) {
            clearLinkHighlight();
        }
    });

    // Обновление видимости лейблов при зуме
    map.on('zoomend', updateLabelsVisibility);
}
