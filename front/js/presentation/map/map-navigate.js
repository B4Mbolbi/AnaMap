/**
 * ==========================================
 * НАВИГАЦИЯ ПО СОБЫТИЯМ
 * ==========================================
 * 
 * Перемещение камеры к маркеру события
 * и открытие попапа.
 * ==========================================
 */

/**
 * Показать событие на карте: перемещает камеру к маркеру и открывает попап
 * @param {string|number} eventId 
 */
function showEventOnMap(eventId) {
    const marker = MapView.eventMarkers[eventId];
    if (!marker) {
        console.warn(`[Map] Маркер для события ${eventId} не найден`);
        return;
    }

    const mkl = _getLayer(markersLayer);
    const lkl = _getLayer(linksLayer);

    // Если маркер в кластере — сначала разворачиваем кластеры
    if (!MapView.map.hasLayer(marker)) {
        // Отключаем link mode чтобы не мешал
        if (LinkMode.active) {
            LinkMode.exit();
        }

        // Переводим карту в режим кластеров
        if (MapView.map.hasLayer(lkl)) {
            MapView.map.removeLayer(lkl);
        }
        MapView.map.addLayer(mkl);

        // Разворачиваем кластеры чтобы найти маркер
        MapView.map.setView([0, 0], 2); // временно уезжаем далеко
        mkl.eachLayer(layer => {
            if (layer.getChildCount && layer.getChildCount() > 0) {
                layer.zoomToBounds();
            }
        });
        // Возвращаемся к обычному виду
        MapView.map.invalidateSize();
    }

    // Перемещаем камеру к маркеру
    MapView.map.flyTo(marker.getLatLng(), 16, { duration: 0.8 });

    // Открываем попап через небольшую задержку
    setTimeout(() => {
        marker.openPopup();
    }, 900);
}
