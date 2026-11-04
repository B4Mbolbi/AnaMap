/**
 * ==========================================
 * LINK HANDLERS — ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ
 * ==========================================
 */

function initLinkHandlers() {
    document.getElementById('btn-link-mode').onclick = LinkMode.toggle.bind(LinkMode);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && LinkMode.active) {
            LinkMode.exit();
        }
        if (e.key === 'Escape' && _currentHighlightEventId) {
            clearLinkHighlight();
        }
    });
}
