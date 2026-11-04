/**
 * ==========================================
 * КЛАСТЕРЫ ПО ГОДАМ
 * ==========================================
 * 
 * Группировка событий по годам и
 * отображение кластерных маркеров.
 * ==========================================
 */

/**
 * Отрисовка кластеров по годам
 */
function renderYearClusters() {
    const filtered = State.getFilteredEvents();
    const years = {};

    filtered.forEach(ev => {
        const year = ev.date ? ev.date.substring(0, 4) : 'Н/Д';
        if (!years[year]) years[year] = [];
        years[year].push(ev);
    });

    Object.keys(years).forEach(year => {
        const events = years[year];
        let avgLat = 0, avgLng = 0;
        events.forEach(ev => { avgLat += ev.lat; avgLng += ev.lng; });
        avgLat /= events.length;
        avgLng /= events.length;

        const icon = L.divIcon({
            html: `<div class="year-cluster" style="width:${CONFIG.YEAR_CLUSTER.SIZE}px;height:${CONFIG.YEAR_CLUSTER.SIZE}px;border-radius:50%;background:linear-gradient(135deg,${CONFIG.YEAR_CLUSTER.COLOR_FROM},${CONFIG.YEAR_CLUSTER.COLOR_TO});color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(99,102,241,0.4);">${year}</div>`,
            className: '',
            iconSize: [CONFIG.YEAR_CLUSTER.SIZE, CONFIG.YEAR_CLUSTER.SIZE],
            iconAnchor: [CONFIG.YEAR_CLUSTER.SIZE / 2, CONFIG.YEAR_CLUSTER.SIZE / 2]
        });

        const marker = L.marker([avgLat, avgLng], { icon });
        marker._isYearCluster = true;
        marker.bindPopup(`
            <div style="padding:12px;">
                <div style="font-size:14px;font-weight:700;color:#6366f1;margin-bottom:8px;">${year} (${events.length} событий)</div>
                <div style="font-size:12px;color:#64748b;">${events.map(e => e.description).join(' • ')}</div>
            </div>
        `);

        MapView.map.addLayer(marker);
    });
}
