/**
 * ==========================================
 * ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ
 * ==========================================
 * 
 * Оркестратор: привязка всех обработчиков
 * UI-событий к функциям из подмодулей.
 * Экспорт, импорт, валидация.
 * ==========================================
 */

/** Инициализация обработчиков для списка событий */
function initEventListHandlers() {
    // Закрытие списка событий
    document.getElementById('btn-close-event-list').onclick = () => {
        document.getElementById('event-list-panel').style.display = 'none';
    };

    // Закрытие модалки деталей
    document.getElementById('btn-close-detail').onclick = closeEventDetail;
    document.getElementById('btn-close-event-detail').onclick = closeEventDetail;

    // Удаление события из модалки деталей
    document.getElementById('btn-delete-event').onclick = () => {
        if (currentDetailEventId) deleteEvent(currentDetailEventId);
    };

    // Управление статусами — открытие/закрытие
    document.getElementById('btn-manage-statuses').onclick = () => {
        renderStatusesModal();
        document.getElementById('modal-statuses').classList.remove('hidden');
    };
    document.getElementById('btn-close-statuses').onclick = () => {
        document.getElementById('modal-statuses').classList.add('hidden');
    };
    document.getElementById('modal-statuses-cancel').onclick = () => {
        document.getElementById('modal-statuses').classList.add('hidden');
    };
    document.getElementById('btn-add-status').onclick = handleAddStatus;

    // Экспорт
    document.getElementById('btn-export-json').onclick = () => Export.exportEventsJSON();
    document.getElementById('btn-export-csv').onclick = () => Export.exportEventsCSV();

    // Импорт
    const fileImportInput = document.getElementById('file-import-json');
    document.getElementById('btn-import').onclick = () => {
        fileImportInput.value = ''; // сброс, чтобы можно было выбрать тот же файл повторно
        fileImportInput.click();
    };
    fileImportInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const result = await Export.importFromJSON(file);

        let msg = `Импорт завершён: +${result.imported} новых, ~${result.updated} обновлено`;
        if (result.skipped > 0) {
            msg += `, пропущено: ${result.skipped}`;
        }
        if (result.errors.length > 0) {
            msg += `\n\nОшибки:\n${result.errors.join('\n')}`;
            console.warn('[Export] Ошибки валидации при импорте:', result.errors);
        }
        alert(msg);
    };

    // Валидация всех событий
    document.getElementById('btn-validate').onclick = () => {
        const result = Export.validateAllEvents();

        let msg = `Проверено событий: ${result.total}\n`;
        msg += `Корректных: ${result.total - result.invalid}\n`;
        msg += `С ошибками: ${result.invalid}\n\n`;

        if (result.valid) {
            msg += 'Все события прошли валидацию ✓';
        } else {
            const invalidEvents = result.results.filter(r => r.errors.length > 0);
            msg += 'Проблемные события:\n';
            for (const ev of invalidEvents) {
                msg += `\n  • ${ev.title || ev.id}:\n`;
                for (const err of ev.errors) {
                    msg += `    - ${err}\n`;
                }
            }
        }

        alert(msg);
    };
}
