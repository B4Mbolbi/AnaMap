/**
 * ==========================================
 * КАРТА (Leaflet + MarkerCluster)
 * ==========================================
 * 
 * Оркестратор: глобальные переменные,
 * зависимость от всех подмодулей.
 * Зависимости: mapInit, mapRender, mapLabels,
 *              mapYearClusters, mapHeat, mapNavigate.
 * ==========================================
 */

// --- Глобальные слои карты ---
var map;
var markersLayer;
var linksLayer;
var heatLayer;
var heatVisible = false;

// --- Маппинг eventId -> marker (для поиска маркера по ID события) ---
var _eventMarkers = {};
