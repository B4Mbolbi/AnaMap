/**
 * ==========================================
 * STATE — ОБРАТНАЯ СОВМЕСТИМОСТЬ
 * ==========================================
 * 
 * Тонкая обёртка над Store для обратной
 * совместимости с существующим кодом.
 * Все новые изменения — через Store.
 * ==========================================
 */

/**
 * @deprecated Используйте Store напрямую.
 * Этот объект обеспечивает обратную совместимость.
 */
const State = {
    // Прокси на Store.state для чтения
    get events() { return Store.state.events; },
    get links() { return Store.state.links; },
    get layers() { return Store.state.layers; },
    get filters() { return Store.state.filters; },
    get viewMode() { return Store.state.viewMode; },

    // Прокси на Store для мутаций (обратная совместимость)
    setEvents(events) { Store.setEvents(events); },
    setFilterTypes(types) { Store.setFilterTypes(types); },
    setFilterDateFrom(date) { Store.setFilterDateFrom(date); },
    setFilterDateTo(date) { Store.setFilterDateTo(date); },
    setFilterSearch(search) { Store.setFilterSearch(search); },
    setFilterSortBy(sortBy) { Store.setFilterSortBy(sortBy); },
    setViewMode(mode) { Store.setViewMode(mode); },
    addLink(linkData) { return Store.addLink(linkData); },
    removeLink(linkId) { Store.removeLink(linkId); },
    updateLink(linkId, updates) { Store.updateLink(linkId, updates); },
    getLinksForEvent(eventId) { return Store.getLinksForEvent(eventId); },
    linkExists(fromId, toId) { return Store.linkExists(fromId, toId); },
    getFilteredEvents() { return Store.getFilteredEvents(); },
    getFilteredLinks() { return Store.getFilteredLinks(); },
    
    // Слои
    setLayers(layers) { Store.setLayers(layers); },
    setActiveLayerId(id) { Store.setActiveLayerId(id); },
    toggleLayerVisibility(id) { Store.toggleLayerVisibility(id); }
};
