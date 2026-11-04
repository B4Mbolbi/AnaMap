/**
 * ==========================================
 * MAP VIEW — OBJECT ENCAPSULATION
 * ==========================================
 * 
 * Инкапсуляция переменных карты в объект.
 * Устраняет гонки порядка скриптов.
 * ==========================================
 */

const MapView = {
    /** Leaflet map instance */
    map: null,
    /** Слой кластеров маркеров */
    markersLayer: null,
    /** Слой связей */
    linksLayer: null,
    /** Слой тепловой карты */
    heatLayer: null,
    /** Видима ли тепловая карта */
    heatVisible: false,
    /** Маппинг eventId -> marker */
    eventMarkers: {},

    /** Инициализация */
    init() {
        this.map = L.map('map', { zoomControl: true })
            .setView(CONFIG.MAP.center, CONFIG.MAP.zoom);

        L.tileLayer(CONFIG.MAP.TILE_URL, {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: CONFIG.MAP.MAX_ZOOM
        }).addTo(this.map);

        this.markersLayer = L.markerClusterGroup({
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

        this.map.addLayer(this.markersLayer);
        this.linksLayer = L.layerGroup().addTo(this.map);
        this.heatLayer = L.heatLayer([], CONFIG.HEAT_LAYER);
        this.heatVisible = false;

        setTimeout(() => this.map.invalidateSize(), CONFIG.MAP.INVALIDATE_DELAY);
    }
};

// ==========================================
// Backward compatibility: proxy-функции
// ==========================================
// Алиасы — функции, возвращающие актуальное значение из MapView.
// Это решает проблему: при старте MapView.map = null, но
// когда initMap() вызывает MapView.init(), map = MapView.map
// всегда возвращает текущее значение.
//
// Использование в коде: map.map, map.markersLayer, etc.
// Но для полной обратной совместимости создаём глобальные функции:

var map = MapView; // map — сам объект, map.map — Leaflet instance

var markersLayer = function() { return MapView.markersLayer; };
var linksLayer = function() { return MapView.linksLayer; };
var heatLayer = function() { return MapView.heatLayer; };
var heatVisible = { _val: false };
var _eventMarkers = MapView.eventMarkers;

// Helper: получить слой (может быть функцией-алиасом или объектом)
function _getLayer(alias) {
    if (typeof alias === 'function') return alias();
    return alias;
}
