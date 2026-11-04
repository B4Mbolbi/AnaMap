/**
 * ==========================================
 * ВЫБОР КООРДИНАТ С КАРТЫ
 * ==========================================
 * 
 * Режим выбора точки на карте для
 * привязки координат к событию.
 * ==========================================
 */

// --- Состояние режима выбора координат с карты ---
let mapPickMode = false;
let mapPickMarker = null;

/**
 * Переключение режима выбора координат с карты
 */
function toggleMapPickMode() {
    mapPickMode = !mapPickMode;
    const btn = document.getElementById('btn-pick-from-map');
    const mapContainer = document.querySelector('.map-container');

    if (mapPickMode) {
        btn.classList.add('active');
        btn.textContent = '⏹ Отменить выбор';
        mapContainer.style.cursor = 'crosshair';

        // Удаляем старый маркер если есть
        if (mapPickMarker) {
            map.removeLayer(mapPickMarker);
            mapPickMarker = null;
        }
    } else {
        btn.classList.remove('active');
        btn.textContent = '📍 Выбрать на карте';
        mapContainer.style.cursor = '';

        if (mapPickMarker) {
            map.removeLayer(mapPickMarker);
            mapPickMarker = null;
        }
    }
}

/**
 * Установка координат из клика по карте (режим выбора)
 */
function setCoordinatesFromMap(lat, lng) {
    if (!mapPickMode) return;

    document.getElementById('add-lat').value = lat.toFixed(6);
    document.getElementById('add-lng').value = lng.toFixed(6);

    // Отменяем режим выбора
    toggleMapPickMode();

    // Очищаем поля и открываем модалку с подставленными координатами
    document.getElementById('add-source').value = '';
    document.getElementById('add-desc').value = '';
    document.getElementById('add-type').value = CONFIG.DEFAULT_TYPE;
    document.getElementById('add-status').value = CONFIG.DEFAULT_STATUS;
    if (!document.getElementById('add-date').value) {
        document.getElementById('add-date').value = new Date().toISOString().substring(0, 10);
    }
    eventTags = [];
    renderTagChips();
    clearValidation();
    document.getElementById('modal-add').classList.remove('hidden');

    // Ставим маркер на карту
    if (mapPickMarker) {
        mapPickMarker.setLatLng([lat, lng]);
    } else {
        mapPickMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                html: `<div style="width:${CONFIG.MARKER.PICK_SIZE[0]}px;height:${CONFIG.MARKER.PICK_SIZE[1]}px;background:${CONFIG.MARKER.PICK_COLOR};border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.6);"></div>`,
                className: '',
                iconSize: CONFIG.MARKER.PICK_SIZE,
                iconAnchor: CONFIG.MARKER.PICK_ANCHOR
            })
        }).addTo(map);
    }
}
