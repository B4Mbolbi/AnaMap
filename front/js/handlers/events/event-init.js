/**
 * ==========================================
 * ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ СОБЫТИЙ
 * ==========================================
 * 
 * Оркестратор: привязка всех обработчиков
 * UI-событий к функциям из подмодулей.
 * Зависимости: validation, tags, modal,
 *              mapPick, categories, statuses,
 *              eventCreate.
 * ==========================================
 */

/**
 * Инициализация всех обработчиков событий
 */
function initEventHandlers() {
    // --- ФИЛЬТРЫ ---

    // Фильтр по дате (диапазон)
    document.getElementById('filter-date-from').addEventListener('change', (e) => {
        State.setFilterDateFrom(e.target.value);
        renderMap();
        renderUI();
        renderEventList();
    });
    document.getElementById('filter-date-to').addEventListener('change', (e) => {
        State.setFilterDateTo(e.target.value);
        renderMap();
        renderUI();
        renderEventList();
    });

    // Очистить все фильтры
    document.getElementById('btn-clear-filters').addEventListener('click', () => {
        clearAllFilters();
    });

    // Переключатель режимов отображения
    document.querySelectorAll('.view-btn[data-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn[data-mode]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            State.setViewMode(e.target.dataset.mode);
            renderMap();
            renderUI();
            renderEventList();
        });
    });

    // Тепловая карта
    document.getElementById('btn-heat-mode').addEventListener('click', () => {
        toggleHeatLayer();
    });

    // --- МОДАЛКА ---

    // Открыть модалку
    document.getElementById('btn-add-event').onclick = () => openAddModal();

    // Закрыть модалку
    document.getElementById('modal-cancel').onclick = () => {
        document.getElementById('modal-add').classList.add('hidden');
        if (mapPickMode) toggleMapPickMode();
        eventTags = [];
        clearValidation();
    };

    // Отправка формы добавления события
    document.getElementById('modal-submit').onclick = handleAddEvent;

    // --- ТЕГИ ---

    // Enter для добавления тега
    document.getElementById('add-tags').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(e.target.value);
            e.target.value = '';
        }
    });

    // Удаление тега по клику (делегирование)
    document.getElementById('tag-chips').addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-remove')) {
            removeTag(parseInt(e.target.dataset.index));
        }
    });

    // --- ВЫБОР КООРДИНАТ С КАРТЫ ---
    document.getElementById('btn-pick-from-map').addEventListener('click', () => {
        toggleMapPickMode();
    });

    // --- ВАЛИДАЦИЯ ПРИ ПОТЕРЕ ФОКУСА ---

    document.getElementById('add-desc').addEventListener('blur', () => {
        const val = document.getElementById('add-desc').value.trim();
        if (!val) {
            showFieldError('desc', 'Введите описание события');
        } else if (val.length < CONFIG.MIN_DESC_LENGTH) {
            showFieldError('desc', `Минимум ${CONFIG.MIN_DESC_LENGTH} символов`);
        } else {
            clearFieldError('desc');
        }
    });

    document.getElementById('add-source').addEventListener('blur', () => {
        const val = document.getElementById('add-source').value.trim();
        if (val && val.length > CONFIG.MAX_SOURCE_LENGTH) {
            showFieldError('source', `Максимум ${CONFIG.MAX_SOURCE_LENGTH} символов`);
        } else {
            clearFieldError('source');
        }
    });

    // --- КАТЕГОРИИ ---

    // Открыть модалку категорий
    document.getElementById('btn-manage-categories').onclick = () => {
        renderCategoriesModal();
        document.getElementById('modal-categories').classList.remove('hidden');
    };

    // Закрыть модалку категорий
    document.getElementById('modal-categories-cancel').onclick = () => {
        document.getElementById('modal-categories').classList.add('hidden');
    };

    // Добавить новую категорию
    document.getElementById('btn-add-category').onclick = handleAddCategory;
}
