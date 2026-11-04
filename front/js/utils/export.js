/**
 * ==========================================
 * ЭКСПОРТ / ИМПОРТ / ВАЛИДАЦИЯ — КОНСОЛИДИРОВАННАЯ ВЕРСИЯ
 * ==========================================
 * 
 * Экспорт событий и связей в JSON/CSV.
 * Импорт из JSON с мерджингом.
 * Валидация структуры событий.
 * Экспорт/импорт проектов.
 * ==========================================
 */

const Export = {
    // ==========================================
    // ЭКСПОРТ СОБЫТИЙ
    // ==========================================

    /**
     * Экспорт событий в JSON
     * @param {Array} events - массив событий (по умолчанию State.events)
     */
    exportEventsJSON(events) {
        events = events || State.events;
        if (!events || events.length === 0) {
            console.warn('[Export] Нет данных для экспорта');
            return;
        }
        const data = JSON.stringify(events, null, 2);
        this.downloadFile(data, `anemap_events_${this.getDateString()}.json`, 'application/json');
    },

    /**
     * Экспорт событий в CSV
     * @param {Array} events - массив событий (по умолчанию State.events)
     */
    exportEventsCSV(events) {
        events = events || State.events;
        if (!events || events.length === 0) {
            console.warn('[Export] Нет данных для экспорта');
            return;
        }

        const headers = CONFIG.CSV_HEADERS;
        const rows = events.map(ev => [
            ev.id,
            ev.type,
            ev.status,
            ev.date,
            `"${(ev.description || '').replace(/"/g, '""')}"`,
            ev.source || '',
            ev.district || '',
            ev.lat || '',
            ev.lng || '',
            `"${(ev.tags || []).join(';')}"`
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        this.downloadFile(csv, `anemap_events_${this.getDateString()}.csv`, 'text/csv');
    },

    // ==========================================
    // ЭКСПОРТ СВЯЗЕЙ
    // ==========================================

    /**
     * Экспорт связей в JSON
     * @param {Array} links - массив связей (по умолчанию State.links)
     */
    exportLinksJSON(links) {
        links = links || State.links;
        const data = JSON.stringify(links, null, 2);
        this.downloadFile(data, `anemap_links_${this.getDateString()}.json`, 'application/json');
    },

    /**
     * Экспорт связей в CSV
     * @param {Array} links - массив связей
     */
    exportLinksCSV(links) {
        links = links || State.links;
        if (!links || links.length === 0) {
            console.warn('[Export] Нет связей для экспорта');
            return;
        }

        const headers = ['ID', 'From', 'To', 'FromDesc', 'ToDesc', 'FromType', 'ToType'];
        const rows = links.map(link => {
            const fromEvent = State.events.find(e => e.id === link.from);
            const toEvent = State.events.find(e => e.id === link.to);
            return [
                link.id,
                fromEvent?.id || '',
                toEvent?.id || '',
                `"${(fromEvent?.description || '').replace(/"/g, '""')}"`,
                `"${(toEvent?.description || '').replace(/"/g, '""')}"`,
                fromEvent?.type || '',
                toEvent?.type || ''
            ];
        });

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        this.downloadFile(csv, `anemap_links_${this.getDateString()}.csv`, 'text/csv');
    },

    // ==========================================
    // ИМПОРТ СОБЫТИЙ
    // ==========================================

    /**
     * Импорт событий из JSON-файла.
     * События с существующим id заменяются, новые — добавляются.
     * @param {File} file - файл .json
     * @returns {Promise<object>} результат импорта
     */
    async importFromJSON(file) {
        try {
            const text = await this._readFileAsText(file);
            const data = JSON.parse(text);

            // Поддержка массива или обёрнутого объекта
            let importedEvents = Array.isArray(data) ? data : (data.events || []);

            if (!Array.isArray(importedEvents) || importedEvents.length === 0) {
                return { imported: 0, updated: 0, skipped: 0, errors: ['Файл не содержит массив событий'] };
            }

            const existingIds = new Set(State.events.map(e => e.id));
            let imported = 0;
            let updated = 0;
            let skipped = 0;
            const errors = [];

            for (const ev of importedEvents) {
                const validation = this.validateEvent(ev);
                if (validation.errors.length > 0) {
                    skipped++;
                    errors.push(`#${skipped} "${ev.description || ev.title || ev.id}": ${validation.errors.join('; ')}`);
                    continue;
                }

                if (existingIds.has(ev.id)) {
                    const idx = State.events.findIndex(e => e.id === ev.id);
                    if (idx !== -1) {
                        State.events[idx] = { ...State.events[idx], ...ev };
                        updated++;
                    }
                } else {
                    State.events.push(ev);
                    imported++;
                }
            }

            // Перерисовка после импорта
            if (typeof renderMap === 'function') renderMap();
            if (typeof renderUI === 'function') renderUI();
            if (typeof renderEventList === 'function') renderEventList();
            Storage.saveEvents();

            return { imported, updated, skipped, errors };
        } catch (err) {
            console.error('[Export] Ошибка импорта:', err);
            return { imported: 0, updated: 0, skipped: 0, errors: [`Ошибка чтения файла: ${err.message}`] };
        }
    },

    // ==========================================
    // ВАЛИДАЦИЯ
    // ==========================================

    /**
     * Валидация одного события.
     * @param {object} event - событие для проверки
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validateEvent(event) {
        const errors = [];

        // Обязательные поля
        for (const field of CONFIG.REQUIRED_FIELDS) {
            if (event[field] === undefined || event[field] === null || event[field] === '') {
                errors.push(`Отсутствует обязательное поле: "${field}"`);
            }
        }

        // Валидация координат
        if (event.lat !== undefined && event.lat !== null && event.lat !== '') {
            const lat = Number(event.lat);
            if (isNaN(lat) || lat < CONFIG.LAT_RANGE[0] || lat > CONFIG.LAT_RANGE[1]) {
                errors.push(`Некорректная широта: "${event.lat}" (должно быть ${CONFIG.LAT_RANGE[0]}..${CONFIG.LAT_RANGE[1]})`);
            }
        }

        if (event.lng !== undefined && event.lng !== null && event.lng !== '') {
            const lng = Number(event.lng);
            if (isNaN(lng) || lng < CONFIG.LNG_RANGE[0] || lng > CONFIG.LNG_RANGE[1]) {
                errors.push(`Некорректная долгота: "${event.lng}" (должно быть ${CONFIG.LNG_RANGE[0]}..${CONFIG.LNG_RANGE[1]})`);
            }
        }

        // Тип — строка
        if (event.type !== undefined && typeof event.type !== 'string') {
            errors.push(`Поле "type" должно быть строкой`);
        }

        // Формат даты
        if (event.date) {
            if (!CONFIG.DATE_REGEX.test(String(event.date))) {
                errors.push(`Некорректный формат даты: "${event.date}" (ожидался YYYY-MM-DD)`);
            }
        }

        return { valid: errors.length === 0, errors };
    },

    /**
     * Валидация всех сохранённых событий.
     * @returns {{ valid: boolean, results: Array, total: number, invalid: number }}
     */
    validateAllEvents() {
        const results = [];
        let invalidCount = 0;

        for (const ev of State.events) {
            const validation = this.validateEvent(ev);
            if (!validation.valid) {
                invalidCount++;
            }
            results.push({
                id: ev.id,
                title: ev.description || ev.id,
                errors: validation.errors
            });
        }

        return {
            valid: invalidCount === 0,
            results,
            total: State.events.length,
            invalid: invalidCount
        };
    },

    // ==========================================
    // ЭКСПОРТ/ИМПОРТ ПРОЕКТОВ
    // ==========================================

    /**
     * Экспорт проекта в JSON
     * @param {object} project - объект проекта
     */
    exportProjectJSON(project) {
        if (!project) {
            console.warn('[Export] Нет проекта для экспорта');
            return;
        }
        const data = JSON.stringify(project, null, 2);
        const filename = `anemap_project_${project.name}_${this.getDateString()}.json`;
        this.downloadFile(data, filename, 'application/json');
    },

    /**
     * Импорт проекта из JSON-файла
     * @param {File} file - файл .json
     * @returns {Promise<object>} результат импорта
     */
    async importProjectJSON(file) {
        try {
            const text = await this._readFileAsText(file);
            const data = JSON.parse(text);

            if (!data.name || !Array.isArray(data.events)) {
                return { success: false, error: 'Некорректный формат файла проекта' };
            }

            return { success: true, data };
        } catch (err) {
            console.error('[Export] Ошибка импорта проекта:', err);
            return { success: false, error: `Ошибка чтения файла: ${err.message}` };
        }
    },

    // ==========================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ==========================================

    /**
     * Скачать файл
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Прочитать файл как текст
     */
    _readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    },

    /**
     * Получить строку даты для имени файла
     */
    getDateString() {
        const d = new Date();
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    }
};
