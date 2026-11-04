/**
 * ==========================================
 * MAP PICK — OBJECT ENCAPSULATION
 * ==========================================
 * 
 * Инкапсуляция режима выбора координат с карты.
 * ==========================================
 */

const MapPick = {
    /** Активен ли режим выбора */
    active: false,
    /** Маркер выбора на карте */
    marker: null,

    /** Переключить режим */
    toggle() {
        this.active = !this.active;
        const btn = document.getElementById('btn-pick-from-map');
        const mapContainer = document.querySelector('.map-container');

        if (this.active) {
            btn.classList.add('active');
            btn.textContent = '⏹ Отменить выбор';
            mapContainer.style.cursor = 'crosshair';

            if (this.marker) {
                MapView.map.removeLayer(this.marker);
                this.marker = null;
            }
        } else {
            btn.classList.remove('active');
            btn.textContent = '📍 Выбрать на карте';
            mapContainer.style.cursor = '';

            if (this.marker) {
                MapView.map.removeLayer(this.marker);
                this.marker = null;
            }
        }
    },

    /** Установить координаты из клика по карте */
    setFromMap(lat, lng) {
        if (!this.active) return;

        document.getElementById('add-lat').value = lat.toFixed(6);
        document.getElementById('add-lng').value = lng.toFixed(6);

        // Отменяем режим выбора
        this.toggle();

        // Очищаем поля и открываем модалку
        document.getElementById('add-source').value = '';
        document.getElementById('add-desc').value = '';
        document.getElementById('add-type').value = CONFIG.DEFAULT_TYPE;
        document.getElementById('add-status').value = CONFIG.DEFAULT_STATUS;
        if (!document.getElementById('add-date').value) {
            document.getElementById('add-date').value = new Date().toISOString().substring(0, 10);
        }
        TagEditor.reset();
        clearValidation();
        document.getElementById('modal-add').classList.remove('hidden');

        // Ставим маркер на карту
        if (this.marker) {
            this.marker.setLatLng([lat, lng]);
        } else {
            this.marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    html: `<div style="width:${CONFIG.MARKER.PICK_SIZE[0]}px;height:${CONFIG.MARKER.PICK_SIZE[1]}px;background:${CONFIG.MARKER.PICK_COLOR};border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.6);"></div>`,
                    className: '',
                    iconSize: CONFIG.MARKER.PICK_SIZE,
                    iconAnchor: CONFIG.MARKER.PICK_ANCHOR
                })
            }).addTo(MapView.map);
        }
    }
};

// Backward compatibility
var mapPickMode = MapPick;
var mapPickMarker = () => MapPick.marker;
var toggleMapPickMode = () => MapPick.toggle();
var setCoordinatesFromMap = (lat, lng) => MapPick.setFromMap(lat, lng);
