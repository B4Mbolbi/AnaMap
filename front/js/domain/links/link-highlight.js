/**
 * ==========================================
 * LINK HIGHLIGHT — ПОДСВЕТКА СВЯЗЕЙ
 * ==========================================
 * 
 * Подсветка связей при клике на маркер.
 * Использует MapView.eventMarkers и getLinkStyle.
 * ==========================================
 */

var _highlightedLines = [];
var _highlightedMarkers = [];
var _currentHighlightEventId = null;

/**
 * Подсветить связи события на карте и в сайдбаре
 */
function highlightEventLinks(eventId) {
    if (_currentHighlightEventId === eventId) {
        clearLinkHighlight();
        return;
    }
    
    clearLinkHighlight();
    _currentHighlightEventId = eventId;
    
    const eventLinks = State.getLinksForEvent(eventId);
    if (eventLinks.length === 0) return;
    
    const linkedEventIds = new Set();
    
    // Подсвечиваем линии
    LinkMode.lines.forEach(polyline => {
        const link = State.links.find(l => l.id === polyline._linkId);
        if (!link) return;
        
        const isRelated = link.from === eventId || link.to === eventId;
        
        if (isRelated) {
            polyline.setStyle({ weight: 5, opacity: 1 });
            _highlightedLines.push(polyline);
            linkedEventIds.add(link.from === eventId ? link.to : link.from);
        } else {
            polyline.setStyle({ opacity: 0.15 });
        }
    });
    
    // Подсвечиваем маркеры
    Object.keys(MapView.eventMarkers).forEach(id => {
        const marker = MapView.eventMarkers[id];
        if (!marker || !marker._icon) return;
        
        if (linkedEventIds.has(id)) {
            marker._icon.style.filter = 'brightness(1.5) drop-shadow(0 0 8px currentColor)';
            marker._icon.style.transform = 'scale(1.3)';
            _highlightedMarkers.push({ id, marker });
        } else {
            marker._icon.style.opacity = '0.25';
        }
    });
    
    highlightEventInSidebar(eventId, linkedEventIds);
}

/**
 * Сбросить подсветку связей
 */
function clearLinkHighlight() {
    _highlightedLines.forEach(polyline => {
        const link = State.links.find(l => l.id === polyline._linkId);
        if (link) {
            polyline.setStyle(getLinkStyle(link.type));
        }
    });
    _highlightedLines = [];
    
    _highlightedMarkers.forEach(({ id, marker }) => {
        if (marker && marker._icon) {
            marker._icon.style.filter = '';
            marker._icon.style.transform = '';
        }
    });
    _highlightedMarkers = [];
    
    Object.keys(MapView.eventMarkers).forEach(id => {
        const marker = MapView.eventMarkers[id];
        if (marker && marker._icon) {
            marker._icon.style.opacity = '';
        }
    });
    
    clearSidebarHighlight();
    _currentHighlightEventId = null;
}

/**
 * Подсветить событие и связанные в сайдбаре
 */
function highlightEventInSidebar(eventId, linkedEventIds) {
    const items = document.querySelectorAll('.event-list-item');
    items.forEach(item => {
        const deleteBtn = item.querySelector('.btn-delete-event');
        if (!deleteBtn) return;
        
        const itemId = deleteBtn.dataset.id;
        if (itemId === eventId) {
            item.style.background = '#3b82f622';
            item.style.borderLeft = '3px solid #3b82f6';
            item.style.paddingLeft = '9px';
        } else if (linkedEventIds.has(itemId)) {
            item.style.background = '#3b82f611';
            item.style.borderLeft = '2px solid #3b82f688';
            item.style.paddingLeft = '10px';
        } else {
            item.style.opacity = '0.3';
        }
    });
}

/**
 * Сбросить подсветку в сайдбаре
 */
function clearSidebarHighlight() {
    const items = document.querySelectorAll('.event-list-item');
    items.forEach(item => {
        item.style.background = '';
        item.style.borderLeft = '';
        item.style.paddingLeft = '';
        item.style.opacity = '';
    });
}
