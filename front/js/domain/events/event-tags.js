/**
 * ==========================================
 * TAG EDITOR — OBJECT ENCAPSULATION
 * ==========================================
 * 
 * Инкапсуляция системы тегов в объект.
 * ==========================================
 */

const TagEditor = {
    /** Массив текущих тегов */
    tags: [],

    /** Рендеринг чипсов тегов */
    render() {
        const container = document.getElementById('tag-chips');
        if (!container) return;
        container.innerHTML = '';

        this.tags.forEach((tag, index) => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.innerHTML = `
                ${escapeHtml(tag)}
                <button class="tag-remove" data-index="${index}" title="Удалить тег">×</button>
            `;
            container.appendChild(chip);
        });
    },

    /** Добавить тег */
    add(text) {
        const tag = text.trim().toLowerCase();
        if (!tag) return;
        if (this.tags.includes(tag)) return;
        if (this.tags.length >= CONFIG.MAX_TAGS) {
            showFieldError('tags', `Максимум ${CONFIG.MAX_TAGS} тегов`);
            return;
        }
        this.tags.push(tag);
        this.render();
        clearFieldError('tags');
    },

    /** Удалить тег по индексу */
    remove(index) {
        this.tags.splice(index, 1);
        this.render();
    },

    /** Сбросить все теги */
    reset() {
        this.tags = [];
        this.render();
    }
};

// Backward compatibility
var eventTags = TagEditor.tags;
var renderTagChips = () => TagEditor.render();
var addTag = (text) => TagEditor.add(text);
var removeTag = (index) => TagEditor.remove(index);
