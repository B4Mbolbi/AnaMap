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
    const marker = _eventMarkers[eventId];
    if (!marker) {
        console.warn(`[Map] Маркер для события ${eventId} не найден`);
        return;
    }

    // Если маркер в кластере — сначала разворачиваем кластеры
    if (!map.hasLayer(marker)) {
        // Отключаем link mode чтобы не мешал
        if (window.linkMode) {
            window.exitLinkMode?.();
        }

        // Переводим карту в режим кластеров
        if (map.hasLayer(linksLayer)) {
            map.removeLayer(linksLayer);
        }
        map.addLayer(markersLayer);

        // Разворачиваем кластеры чтобы найти маркер
        map.setView([0, 0], 2); // временно уезжаем далеко
        markersLayer.eachLayer(layer => {
            if (layer.getChildCount && layer.getChildCount() > 0) {
                layer.zoomToBounds();
            }
        });
        // Возвращаемся к обычному виду
        map.invalidateSize();
    }

    // Перемещаем камеру к маркеру
    map.flyTo(marker.getLatLng(), 16, { duration: 0.8 });

    // Открываем попап через небольшую задержку
    setTimeout(() => {
        marker.openPopup();
    }, 900);
}
