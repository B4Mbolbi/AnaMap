/**
 * ==========================================
 * ВИДИМОСТЬ ЛЕЙБЛОВ
 * ==========================================
 * 
 * Управление видимостью тултипов
 * в зависимости от уровня зума.
 * ==========================================
 */

/** Обновить видимость лейблов в зависимости от зума */
function updateLabelsVisibility() {
    if (!MapView.map) return;

    const showLabels = MapView.map.getZoom() >= CONFIG.LABEL_ZOOM_THRESHOLD;

    const mkl = _getLayer(markersLayer);
    if (mkl) {
        mkl.eachLayer(layer => {
            const tooltip = layer.getTooltip();
            if (tooltip) {
                tooltip.setOpacity(showLabels ? 1 : 0);
            }
        });
    }
}
