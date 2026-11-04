/**
 * ==========================================
 * МОДАЛКА ДОБАВЛЕНИЯ СОБЫТИЯ
 * ==========================================
 * 
 * Открытие/закрытие модалки, заполнение
 * значений по умолчанию.
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
        latInput.value = String(CONFIG.DEFAULT_COORDS.LAT);
        lngInput.value = String(CONFIG.DEFAULT_COORDS.LNG);
    }

    // Очищаем поля и открываем модалку
    document.getElementById('add-source').value = '';
    document.getElementById('add-desc').value = '';
    document.getElementById('add-type').value = CONFIG.DEFAULT_TYPE;
    document.getElementById('add-status').value = CONFIG.DEFAULT_STATUS;
    if (!document.getElementById('add-date').value) {
        document.getElementById('add-date').value = new Date().toISOString().substring(0, 10);
    }

    // Сбрасываем теги и валидацию
    eventTags = [];
    renderTagChips();
    clearValidation();

    modal.classList.remove('hidden');
}
