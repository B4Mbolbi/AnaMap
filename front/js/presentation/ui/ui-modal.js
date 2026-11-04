/**
 * ==========================================
 * МОДАЛКА КАТЕГОРИЙ
 * ==========================================
 * 
 * Отрисовка списка категорий в модальном
 * окне управления с обработчиками удаления.
 * ==========================================
 */

/** Отрисовка списка категорий в модалке управления */
function renderCategoriesModal() {
    const container = document.getElementById('categories-list');
    container.innerHTML = '';

    getAllCategories().forEach(cat => {
        const div = document.createElement('div');
        div.className = `category-item ${cat.isBase ? 'base' : ''}`;

        let deleteBtn = '';
        if (!cat.isBase) {
            deleteBtn = `<button class="category-delete" data-key="${cat.key}">✕</button>`;
        }

        div.innerHTML = `
            <div class="category-color-preview" style="background:${cat.color}"></div>
            <div class="category-info">
                <span class="category-name">${cat.label}</span>
                <span class="category-badge">${cat.isBase ? 'базовая' : 'польз.'}</span>
            </div>
            ${deleteBtn}
        `;

        container.appendChild(div);
    });

    // Обработчики удаления
    container.querySelectorAll('.category-delete').forEach(btn => {
        btn.onclick = () => {
            // Удаляем категорию из Storage
            const custom = Storage.loadCategories().filter(c => c.key !== btn.dataset.key);
            Storage.saveCategories(custom);
            renderCategoriesModal();
            renderFilterButtons();
            renderStatsByTypes();
        };
    });
}
