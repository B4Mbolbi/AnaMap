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
let map;
let markersLayer;
let linksLayer;
let heatLayer;
let heatVisible = false;

// --- Маппинг eventId -> marker (для поиска маркера по ID события) ---
const _eventMarkers = {};
