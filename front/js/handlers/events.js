/**
 * ==========================================
 * ОБРАБОТКА СОБЫТИЙ
 * ==========================================
 * 
 * Обработчики UI-событий: фильтры, модалка,
 * переключение режимов.
 * ==========================================
 */

/**
 * Открытие модалки добавления события
 * @param {number} [lat] - широта (если не указана, используется дефолт)
 * @param {number} [lng] - долгота (если не указана, используется дефолт)
 */
function openAddModal(lat, lng) {
    const modal = document.getElementById('modal-add');
    const latInput = document.getElementById('add-lat');
    const lngInput = document.getElementById('add-lng');

    // Заполняем координаты из клика по карте или используем дефолтные
    if (lat !== undefined && lng !== undefined) {
        latInput.value = lat.toFixed(6);
        lngInput.value = lng.toFixed(6);
    } else {
        latInput.value = '55.7558';
        lngInput.value = '37.6173';
    }

    // Очищаем поля и открываем модалку
    document.getElementById('add-source').value = '';
    document.getElementById('add-desc').value = '';
    modal.classList.remove('hidden');
}

/**
 * Инициализация всех обработчиков событий
 */
function initEventHandlers() {
    // Фильтр по дате
    document.getElementById('filter-date-from').addEventListener('change', (e) => {
        State.setFilterDateFrom(e.target.value);
        renderMap();
    });

    // Переключатель режимов отображения
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            State.setViewMode(e.target.dataset.mode);
            renderMap();
        });
    });

    // Модалка: открыть/закрыть
    const modal = document.getElementById('modal-add');
    document.getElementById('btn-add-event').onclick = () => openAddModal();
    document.getElementById('modal-cancel').onclick = () => modal.classList.add('hidden');

    // Отправка формы добавления события
    document.getElementById('modal-submit').onclick = handleAddEvent;

    // --- УПРАВЛЕНИЕ КАТЕГОРИЯМИ ---

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

/**
 * Обработчик добавления новой категории
 */
async function handleAddCategory() {
    const nameInput = document.getElementById('cat-new-name');
    const colorInput = document.getElementById('cat-new-color');

    const name = nameInput.value.trim();
    const color = colorInput.value;

    // Валидация
    if (!name) {
        alert('Введите название категории');
        return;
    }

    // Проверка на дубликат
    const custom = loadCustomCategories();
    if (custom.some(c => c.label.toLowerCase() === name.toLowerCase())) {
        alert('Такая категория уже существует');
        return;
    }

    // Генерация уникального ключа
    const key = 'custom_' + name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '_') + '_' + Date.now();

    const newCategory = {
        key,
        label: name,
        color
    };

    // Сохраняем категорию (через API — сейчас это localStorage)
    try {
        await API.saveCategories([...custom, newCategory]);

        // Очищаем поля и обновляем UI
        nameInput.value = '';
        colorInput.value = CONFIG.CUSTOM_COLORS[custom.length % CONFIG.CUSTOM_COLORS.length];

        renderCategoriesModal();
        renderFilterButtons();
        renderStatsByTypes();

        // Обновляем селект в модалке добавления события
        updateEventTypeSelect();
    } catch (error) {
        console.error('Ошибка при добавлении категории:', error);
        alert('Ошибка при сохранении категории');
    }
}

/**
 * Обновление списка типов в селекте модалки добавления события
 */
function updateEventTypeSelect() {
    const select = document.getElementById('add-type');
    const custom = loadCustomCategories();

    // Сохраняем текущее значение
    const currentValue = select.value;

    // Очищаем и добавляем базовые типы
    select.innerHTML = '';
    Object.keys(CONFIG.BASE_LAYERS).forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = CONFIG.BASE_LAYERS[type].label;
        select.appendChild(option);
    });

    // Добавляем пользовательские типы
    custom.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.key;
        option.textContent = cat.label;
        select.appendChild(option);
    });

    // Восстанавливаем значение если возможно
    if ([...select.options].some(o => o.value === currentValue)) {
        select.value = currentValue;
    }
}

/**
 * Обработчик добавления нового события
 * Считывает данные из формы, валидирует и добавляет
 */
function handleAddEvent() {
    const type      = document.getElementById('add-type').value;
    const source    = document.getElementById('add-source').value.trim();
    const desc      = document.getElementById('add-desc').value;
    const lat       = parseFloat(document.getElementById('add-lat').value);
    const lng       = parseFloat(document.getElementById('add-lng').value);

    // Валидация
    if (!desc) {
        return alert('Введите описание');
    }

    // Формируем новое событие
    const newEvent = {
        id:        'e' + Date.now(),
        type,
        status:    'planned',
        date:      new Date().toISOString().substring(0, 10),
        description: desc,
        tags:      [],
        lat,
        lng,
        source:    source || 'Пользователь',
        district:  'Новый'
    };

    // Отправляем на сервер (или добавляем локально)
    API.addEvent(newEvent).then(() => {
        // Обновляем локальное состояние
        State.events.push(newEvent);

        // Закрываем модалку и очищаем форму
        document.getElementById('modal-add').classList.add('hidden');
        document.getElementById('add-source').value = '';
        document.getElementById('add-desc').value = '';

        // Перерисовываем карту и UI
        renderMap();
    }).catch(err => {
        console.error('Failed to add event:', err);
        alert('Ошибка при добавлении события');
    });
}
