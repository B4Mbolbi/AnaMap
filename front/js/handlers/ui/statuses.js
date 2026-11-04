/**
 * ==========================================
 * УПРАВЛЕНИЕ СТАТУСАМИ
 * ==========================================
 * 
 * Обновление списка статусов в селекте
 * модалки добавления события.
 * ==========================================
 */

/**
 * Обновление списка статусов в селекте модалки добавления события
 */
function updateStatusSelect() {
    const select = document.getElementById('add-status');
    const allStatuses = getAllStatuses();

    // Сохраняем текущее значение
    const currentValue = select.value;

    // Очищаем и добавляем все статусы
    select.innerHTML = '';
    allStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.key;
        option.textContent = status.label;
        select.appendChild(option);
    });

    // Восстанавливаем значение если возможно
    if ([...select.options].some(o => o.value === currentValue)) {
        select.value = currentValue;
    }
}
