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
    const showLabels = map.getZoom() >= CONFIG.LABEL_ZOOM_THRESHOLD;

    markersLayer.eachLayer(layer => {
        const tooltip = layer.getTooltip();
        if (tooltip) {
            tooltip.setOpacity(showLabels ? 1 : 0);
        }
    });
}
