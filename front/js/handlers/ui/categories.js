/**
 * ==========================================
 * УПРАВЛЕНИЕ КАТЕГОРИЯМИ
 * ==========================================
 * 
 * Добавление пользовательских категорий,
 * обновление селекта типов.
 * ==========================================
 */

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
    const custom = Storage.loadCategories();
    if (custom.some(c => c.label.toLowerCase() === name.toLowerCase())) {
        alert('Такая категория уже существует');
        return;
    }

    // Генерация уникального ключа
    const key = CONFIG.CUSTOM_PREFIX + name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '_') + '_' + Date.now();

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
    const custom = Storage.loadCategories();

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
