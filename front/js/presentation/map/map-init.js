/**
 * ==========================================
 * MAP INIT — ИНИЦИАЛИЗАЦИЯ КАРТЫ
 * ==========================================
 * 
 * Создание карты Leaflet через MapView.
 * Привязка базовых событий.
 * ==========================================
 */

/**
 * Инициализация карты Leaflet
 */
function initMap() {
    MapView.init();

    // Клик по карте — открытие модалки добавления или выбор координат
    MapView.map.on('click', (e) => {
        if (typeof MapPick !== 'undefined' && MapPick.active) {
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
    MapView.map.on('zoomend', updateLabelsVisibility);
}
