/**
 * ==========================================
 * ТЕПЛОВАЯ КАРТА
 * ==========================================
 * 
 * Обновление и переключение слоя
 * тепловой карты (Leaflet.heat).
 * ==========================================
 */

/** Обновить слой тепловой карты */
function updateHeatLayer() {
    if (!MapView.map) return;
    const htl = _getLayer(heatLayer);
    if (!htl) return;
    const filtered = State.getFilteredEvents();
    const points = filtered.map(ev => [ev.lat, ev.lng, 0.6]);
    htl.setLatLngs(points);
    htl.redraw();
}

/** Переключить видимость тепловой карты */
function toggleHeatLayer() {
    MapView.heatVisible = !MapView.heatVisible;
    const btn = document.getElementById('btn-heat-mode');
    const htl = _getLayer(heatLayer);

    if (MapView.heatVisible) {
        htl.addTo(MapView.map);
        updateHeatLayer();
        btn.classList.add('active');
    } else {
        MapView.map.removeLayer(htl);
        btn.classList.remove('active');
    }
}
