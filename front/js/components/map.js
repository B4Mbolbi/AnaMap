/**
 * ==========================================
 * РАБОТА С КАРТОЙ
 * ==========================================
 * 
 * Инициализация Leaflet, кластеризация маркеров,
 * рендеринг событий на карте.
 * ==========================================
 */

// Глобальная переменная карты (инициализируется в initMap)
let map;
let markersLayer;
let linksLayer;
const LABEL_ZOOM_THRESHOLD = 14; // Уровень зума для показа лейблов

/**
 * Инициализация карты Leaflet
 */
function initMap() {
    // Создаём карту с центром и зумом из конфигурации
    map = L.map('map', { zoomControl: true })
        .setView(CONFIG.MAP.center, CONFIG.MAP.zoom);

    // Добавляем тайлы OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Создаём группу кластеров с кастомной иконкой
    markersLayer = L.markerClusterGroup({
        maxClusterRadius: CONFIG.CLUSTER_MAX_RADIUS,
        iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount();
            let size = 60;
            if (count > 5)  size = 68;
            if (count > 10) size = 76;

            return L.divIcon({
                html: `<div class="cluster-marker" style="width:${size}px;height:${size}px;">${count}</div>`,
                className: '',
                iconSize: [size, size]
            });
        }
    });

    map.addLayer(markersLayer);

    // Создаём слой для линий связей
    linksLayer = L.layerGroup().addTo(map);

    // Пересчет размеров карты после загрузки (критично для flex-контейнера)
    setTimeout(() => map.invalidateSize(), CONFIG.MAP_INVALIDATE_DELAY);

    // Клик по карте — установка координат для нового маркера
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // Передаём координаты в функцию открытия модалки
        openAddModal(lat, lng);
    });

    // Обновляем видимость лейблов при изменении зума
    map.on('zoomend', updateLabelsVisibility);
}

/**
 * Получить конфигурацию категории по ключу
 * @param {string} type - ключ категории
 * @returns {object} конфигурация {label, color}
 */
function getCategoryConfig(type) {
    // Сначала ищем в базовых
    if (CONFIG.BASE_LAYERS[type]) {
        return CONFIG.BASE_LAYERS[type];
    }

    // Затем в пользовательских
    const custom = loadCustomCategories();
    const found = custom.find(c => c.key === type);
    if (found) {
        return { label: found.label, color: found.color };
    }

    // Дефолтная конфигурация
    return { label: type, color: '#64748b' };
}

/**
 * Отрисовка маркеров событий на карте
 * Очищает старые маркеры и добавляет новые по фильтру
 */
function renderMap() {
    markersLayer.clearLayers();
    
    // В режиме связи убираем маркеры из кластера и скрываем его
    if (linkMode) {
        map.removeLayer(markersLayer);
    } else if (!map.hasLayer(markersLayer)) {
        map.addLayer(markersLayer);
    }

    const filtered = State.getFilteredEvents();

    filtered.forEach(ev => {
        // Получаем конфигурацию категории (базовая или пользовательская)
        const cfg = getCategoryConfig(ev.type);

        // Создаём кастомный маркер-точка
        const icon = L.divIcon({
            html: `<div class="event-marker-dot" style="background:${cfg.color};color:${cfg.color};"></div>`,
            className: '',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        const marker = L.marker([ev.lat, ev.lng], { icon });

        // Добавляем попап с информацией о событии
        marker.bindPopup(`
            <div style="padding:12px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${cfg.color};"></span>
                    <span style="font-size:11px;font-weight:700;color:${cfg.color};text-transform:uppercase;">${cfg.label}</span>
                </div>
                <div style="font-size:13px;margin-bottom:8px;color:#cbd5e1;">${ev.description}</div>
                <div style="font-size:11px;color:#94a3b8;">${CONFIG.STATUS_LABELS[ev.status]} • ${ev.date}</div>
            </div>
        `);

        // Лейбл над маркером — показывается только при зуме >= LABEL_ZOOM_THRESHOLD
        marker.bindTooltip(ev.description, {
            permanent: true,
            direction: 'top',
            offset: [0, -12],
            className: 'event-tooltip',
            opacity: 0
        });

        // Обработчик клика для режима связи
        marker.on('click', (e) => {
            if (linkMode) {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                e.originalEvent.stopPropagation();
                e.originalEvent.preventDefault();
                addMarkerToSelection(marker, ev);
            }
        });

        if (linkMode) {
            marker._isEventMarker = true;
            map.addLayer(marker);
        } else {
            markersLayer.addLayer(marker);
        }
    });

    // Обновляем видимость лейблов в зависимости от зума
    updateLabelsVisibility();

    // Перерисовываем линии поверх маркеров
    renderSavedLinks();

    // Обновляем боковую панель после отрисовки карты
    renderUI();
    renderEventList();
}

/**
 * Обновить видимость лейблов в зависимости от зума
 */
function updateLabelsVisibility() {
    const currentZoom = map.getZoom();
    const showLabels = currentZoom >= LABEL_ZOOM_THRESHOLD;

    markersLayer.eachLayer(layer => {
        const tooltip = layer.getTooltip();
        if (tooltip) {
            if (showLabels) {
                tooltip.setOpacity(1);
            } else {
                tooltip.setOpacity(0);
            }
        }
    });
}
