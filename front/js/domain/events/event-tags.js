/**
 * ==========================================
 * СИСТЕМА ТЕГОВ
 * ==========================================
 * 
 * Управление тегами событий: добавление,
 * удаление, рендеринг чипсов.
 * ==========================================
 */

// --- Состояние системы тегов ---
let eventTags = [];

/**
 * Рендеринг чипсов тегов
 */
function renderTagChips() {
    const container = document.getElementById('tag-chips');
    if (!container) return;
    container.innerHTML = '';

    eventTags.forEach((tag, index) => {
        const chip = document.createElement('span');
        chip.className = 'tag-chip';
        chip.innerHTML = `
            ${escapeHtml(tag)}
            <button class="tag-remove" data-index="${index}" title="Удалить тег">×</button>
        `;
        container.appendChild(chip);
    });
}

/**
 * Добавление тега
 */
function addTag(text) {
    const tag = text.trim().toLowerCase();
    if (!tag) return;
    if (eventTags.includes(tag)) return;
    if (eventTags.length >= CONFIG.MAX_TAGS) {
        showFieldError('tags', `Максимум ${CONFIG.MAX_TAGS} тегов`);
        return;
    }
    eventTags.push(tag);
    renderTagChips();
    clearFieldError('tags');
}

/**
 * Удаление тега по индексу
 */
function removeTag(index) {
    eventTags.splice(index, 1);
    renderTagChips();
}
