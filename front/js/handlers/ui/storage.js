/**
 * ==========================================
 * ОБРАБОТЧИКИ ХРАНИЛИЩА (STORAGE HANDLERS)
 * ==========================================
 * 
 * Кнопки «Экспорт всего», «Импорт всего»,
 * «Очистить localStorage».
 * ==========================================
 */

/**
 * Инициализация обработчиков кнопок хранилища
 */
function initStorageHandlers() {
    document.getElementById('btn-export-backup')?.addEventListener('click', () => {
        Export.exportFullBackup();
    });

    document.getElementById('btn-import-backup')?.addEventListener('click', () => {
        document.getElementById('file-import-backup')?.click();
    });

    document.getElementById('file-import-backup')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const result = await Export.importFullBackup(file);
        if (result.success) {
            alert('Импортировано проектов: ' + result.count);
            location.reload();
        } else {
            alert('Ошибка: ' + result.error);
        }
        e.target.value = '';
    });

    document.getElementById('btn-clear-storage')?.addEventListener('click', () => {
        if (!confirm('Удалить ВСЕ данные? Это необратимо. Сначала сделайте экспорт.')) return;
        localStorage.clear();
        location.reload();
    });
}
