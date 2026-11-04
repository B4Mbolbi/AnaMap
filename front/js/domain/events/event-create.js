/**
 * ==========================================
 * СОЗДАНИЕ СОБЫТИЯ
 * ==========================================
 * 
 * Обработчик добавления нового события:
 * чтение формы, валидация, отправка в API.
 * ==========================================
 */

/**
 * Обработчик добавления нового события
 * Считывает данные из формы, валидирует и добавляет
 */
function handleAddEvent() {
    // Сначала валидируем
    if (!validateForm()) return;

    const type      = document.getElementById('add-type').value;
    const source    = document.getElementById('add-source').value.trim();
    const desc      = document.getElementById('add-desc').value.trim();
    const date      = document.getElementById('add-date').value || new Date().toISOString().substring(0, 10);
    const status    = document.getElementById('add-status').value || CONFIG.DEFAULT_STATUS;
    const lat       = parseFloat(document.getElementById('add-lat').value);
    const lng       = parseFloat(document.getElementById('add-lng').value);

    // Формируем новое событие
    const newEvent = {
        id:        'e' + Date.now(),
        type,
        status:    status,
        date:      date,
        description: desc,
        tags:      [...eventTags],
        lat,
        lng,
        source:    source || 'Пользователь',
        district:  'Новый'
    };

    // Отправляем на сервер (или добавляем локально)
    API.addEvent(newEvent).then((created) => {
        // Обновляем локальное состояние из ответа API (с правильным id)
        State.events.push(created);

        // Закрываем модалку и очищаем форму
        document.getElementById('modal-add').classList.add('hidden');
        document.getElementById('add-source').value = '';
        document.getElementById('add-desc').value = '';
        eventTags = [];
        renderTagChips();
        clearValidation();

        // Сохраняем в localStorage
        Storage.saveEvents();

        // Перерисовываем карту и UI
        renderMap();
        renderUI();
        renderEventList();
    }).catch(err => {
        console.error('Failed to add event:', err);
        console.error('Ошибка при добавлении события');
    });
}
