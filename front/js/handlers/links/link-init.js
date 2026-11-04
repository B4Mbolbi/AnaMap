/**
 * ==========================================
 * СВЯЗИ — ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ
 * ==========================================
 */

function initLinkHandlers() {
    document.getElementById('btn-link-mode').onclick = toggleLinkMode;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && linkMode) {
            exitLinkMode();
        }
        if (e.key === 'Escape' && _currentHighlightEventId) {
            clearLinkHighlight();
        }
    });
}
