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
async function deleteCategory(key) {
    await API.deleteCategory(key);
    State.events = State.events.filter(e => e.type !== key);
    State.filters.types.delete(key);
    renderMap();
    renderUI();
    renderEventList();
    renderFilterButtons();
}

/** Изменение статуса события */
function changeEventStatus(eventId, newStatus) {
    const ev = State.events.find(e => e.id === eventId);
    if (!ev) return;
    ev.status = newStatus;
    renderMap();
    renderUI();
    renderEventList();
}

/** Удаление события */
async function deleteEvent(id) {
    await API.deleteEvent(id);
    State.events = State.events.filter(e => e.id !== id);
    if (currentDetailEventId === id) closeEventDetail();
    renderMap();
    renderUI();
    renderEventList();
}
