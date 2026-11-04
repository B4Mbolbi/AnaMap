/**
 * ==========================================
 * ФИЛЬТРЫ ПО ТИПАМ
 * ==========================================
 * 
 * Отрисовка кнопок-фильтров по типам событий,
 * переключение и удаление пользовательских
 * категорий.
 * ==========================================
 */

/** Отрисовка кнопок фильтров по типам */
function renderFilterButtons() {
    const container = document.getElementById('filter-types');
    container.innerHTML = '';

    getAllCategories().forEach(cat => {
        const isActive = Store.state.filters.types.has(cat.key);
        const isBaseCategory = CONFIG.BASE_LAYERS[cat.key];

        const btn = document.createElement('button');
        btn.className = `filter-btn ${isActive ? 'active' : ''}`;

        if (isActive) {
            btn.style.background = cat.color + '33';
            btn.style.borderColor = cat.color + '66';
        }

        let deleteBtn = '';
        if (!isBaseCategory) {
            deleteBtn = `<span class="filter-delete" data-key="${cat.key}" style="margin-left:6px;opacity:0.5;cursor:pointer;font-size:14px;line-height:1;transition:opacity 0.2s;" title="Удалить категорию">✕</span>`;
        }

        btn.innerHTML = `<span class="filter-dot" style="background:${isActive ? cat.color : CONFIG.DEFAULT_COLOR}"></span>${cat.label}${deleteBtn}`;

        // Переключение фильтра по клику
        btn.onclick = (e) => {
            if (e.target.classList.contains('filter-delete')) return;
            if (Store.state.filters.types.has(cat.key)) {
                Store.state.filters.types.delete(cat.key);
            } else {
                Store.state.filters.types.add(cat.key);
            }
            renderMap();
            renderUI();
            renderEventList();
        };

        container.appendChild(btn);
    });

    // Обработчики на ✕ (удаление категории)
    container.querySelectorAll('.filter-delete').forEach(btn => {
        btn.onmouseenter = () => btn.style.opacity = '1';
        btn.onmouseleave = () => btn.style.opacity = '0.5';
        btn.onclick = (e) => {
            e.stopPropagation();
            deleteCategory(btn.dataset.key);
        };
    });
}
