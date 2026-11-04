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
    const filtered = State.getFilteredEvents();
    const points = filtered.map(ev => [ev.lat, ev.lng, 0.6]);
    heatLayer.setLatLngs(points);
    heatLayer.redraw();
}

/** Переключить видимость тепловой карты */
function toggleHeatLayer() {
    heatVisible = !heatVisible;
    const btn = document.getElementById('btn-heat-mode');

    if (heatVisible) {
        heatLayer.addTo(map);
        updateHeatLayer();
        btn.classList.add('active');
    } else {
        map.removeLayer(heatLayer);
        btn.classList.remove('active');
    }
}
