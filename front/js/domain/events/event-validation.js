/**
 * ==========================================
 * ВАЛИДАЦИЯ ФОРМЫ
 * ==========================================
 * 
 * Проверка полей формы добавления события.
 * Отображение ошибок, очистка состояний.
 * ==========================================
 */

/**
 * Показать ошибку поля
 */
function showFieldError(field, message) {
    const group = document.getElementById('error-' + field)?.closest('.form-group');
    const errorEl = document.getElementById('error-' + field);
    if (group) group.classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
}

/**
 * Скрыть ошибку поля
 */
function clearFieldError(field) {
    const group = document.getElementById('error-' + field)?.closest('.form-group');
    const errorEl = document.getElementById('error-' + field);
    if (group) group.classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
}

/**
 * Очистить все ошибки
 */
function clearValidation() {
    ['type', 'source', 'desc', 'lat', 'lng', 'date', 'status'].forEach(f => clearFieldError(f));
}

/**
 * Валидация формы
 * @returns {boolean} — true если валидна
 */
function validateForm() {
    let valid = true;
    clearValidation();

    // Тип
    const type = document.getElementById('add-type').value;
    if (!type) {
        showFieldError('type', 'Выберите тип события');
        valid = false;
    }

    // Описание
    const desc = document.getElementById('add-desc').value.trim();
    if (!desc) {
        showFieldError('desc', 'Введите описание события');
        valid = false;
    } else if (desc.length < CONFIG.MIN_DESC_LENGTH) {
        showFieldError('desc', `Минимум ${CONFIG.MIN_DESC_LENGTH} символов`);
        valid = false;
    }

    // Источник
    const source = document.getElementById('add-source').value.trim();
    if (source && source.length > CONFIG.MAX_SOURCE_LENGTH) {
        showFieldError('source', `Максимум ${CONFIG.MAX_SOURCE_LENGTH} символов`);
        valid = false;
    }

    // Координаты
    const lat = parseFloat(document.getElementById('add-lat').value);
    const lng = parseFloat(document.getElementById('add-lng').value);
    if (isNaN(lat) || lat < CONFIG.LAT_RANGE[0] || lat > CONFIG.LAT_RANGE[1]) {
        showFieldError('lat', `Неверная широта (${CONFIG.LAT_RANGE[0]}…${CONFIG.LAT_RANGE[1]})`);
        valid = false;
    }
    if (isNaN(lng) || lng < CONFIG.LNG_RANGE[0] || lng > CONFIG.LNG_RANGE[1]) {
        showFieldError('lng', `Неверная долгота (${CONFIG.LNG_RANGE[0]}…${CONFIG.LNG_RANGE[1]})`);
        valid = false;
    }

    return valid;
}
