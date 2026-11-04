/**
 * ==========================================
 * ДЕЙСТВИЯ СО СЛУЧАЯМИ
 * ==========================================
 * 
 * Удаление категории, изменение статуса,
 * удаление события.
 * ==========================================
 */

/** Удаление категории */
function deleteCategory(key) {
    // Удаляем категорию из Storage
    const custom = Storage.loadCategories().filter(c => c.key !== key);
    Storage.saveCategories(custom);
    
    // Удаляем события этой категории и фильтры через Store
    Store.commit(state => {
        state.events = state.events.filter(e => e.type !== key);
        state.filters.types.delete(key);
    }, 'events');
}

/** Изменение статуса события */
function changeEventStatus(eventId, newStatus) {
    Store.commit(state => {
        const ev = state.events.find(e => e.id === eventId);
        if (ev) ev.status = newStatus;
    }, 'events');
}

/** Удаление события */
function deleteEvent(id) {
    Store.commit(state => {
        state.events = state.events.filter(e => e.id !== id);
    }, 'events');
    if (EventListState.currentDetailId === id) closeEventDetail();
}
