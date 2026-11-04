/**
 * ==========================================
 * EVENT LIST STATE — OBJECT ENCAPSULATION
 * ==========================================
 * 
 * Инкапсуляция состояния списка событий.
 * ==========================================
 */

const EventListState = {
    /** ID события в детальном просмотре */
    currentDetailId: null
};

// Backward compatibility: currentDetailEventId как геттер/сеттер
Object.defineProperty(globalThis, 'currentDetailEventId', {
    get() { return EventListState.currentDetailId; },
    set(v) { EventListState.currentDetailId = v; },
    configurable: true
});
