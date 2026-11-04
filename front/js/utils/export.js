/**
 * ==========================================
 * ЭКСПОРТ / ИМПОРТ / ВАЛИДАЦИЯ ДАННЫХ
 * ==========================================
 * 
 * Экспорт событий и связей в JSON/CSV форматах.
 * Импорт событий из JSON-файла с мерджингом.
 * Валидация структуры события.
 * ==========================================
 */

const Export = {
    /**
     * Экспорт событий в CSV
     * @param {Array} events - массив событий (по умолчанию State.events)
     */
    exportEventsCSV(events = State.events) {
        if (!events || events.length === 0) {
            alert('Нет данных для экспорта');
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

    /**
     * Экспорт связей в JSON
     * @param {Array} links - массив связей (по умолчанию savedLinks)
     */
    exportLinksJSON(links = savedLinks) {
        const data = JSON.stringify(links, null, 2);
        this.downloadFile(data, `anemap_links_${this.getDateString()}.json`, 'application/json');
    },

    /**
     * Экспорт связей в CSV
     * @param {Array} links - массив связей
     */
    exportLinksCSV(links = savedLinks) {
        if (!links || links.length === 0) {
            alert('Нет связей для экспорта');
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

    /**
     * Импорт событий из JSON-файла.
     * События с существующим id заменяются, новые — добавляются.
     * @param {File} file - файл .json
     * @returns {Promise<object>} результат импорта: { imported, updated, skipped, errors }
     */
    async importFromJSON(file) {
        try {
            const text = await this._readFileAsText(file);
            const data = JSON.parse(text);

            // Support both a single array and a wrapper object { events: [...] }
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
                // Validate each event
                const validation = this.validateEvent(ev);
                if (validation.errors.length > 0) {
                    skipped++;
                    errors.push(`#${skipped} "${ev.description || ev.title || ev.id}": ${validation.errors.join('; ')}`);
                    continue;
                }

                if (existingIds.has(ev.id)) {
                    // Update existing event
                    const idx = State.events.findIndex(e => e.id === ev.id);
                    if (idx !== -1) {
                        State.events[idx] = { ...State.events[idx], ...ev };
                        updated++;
                    }
                } else {
                    // Add new event
                    State.events.push(ev);
                    imported++;
                }
            }

            // Re-render everything after import
            renderMap();
            renderUI();
            renderEventList();
            Storage.saveEvents();

            return { imported, updated, skipped, errors };
        } catch (err) {
            console.error('[Export] Ошибка импорта:', err);
            return { imported: 0, updated: 0, skipped: 0, errors: [`Ошибка чтения файла: ${err.message}`] };
        }
    },

    /**
     * Валидация одного события.
     * @param {object} event - событие для проверки
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validateEvent(event) {
        const errors = [];

        // Check required fields exist and are non-empty
        for (const field of CONFIG.REQUIRED_FIELDS) {
            if (event[field] === undefined || event[field] === null || event[field] === '') {
                errors.push(`Отсутствует обязательное поле: "${field}"`);
            }
        }

        // Validate lat/lng are numbers in valid range
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

        // Validate type is a string
        if (event.type !== undefined && typeof event.type !== 'string') {
            errors.push(`Поле "type" должно быть строкой`);
        }

        // Validate date format YYYY-MM-DD
        if (event.date) {
            if (!CONFIG.DATE_REGEX.test(String(event.date))) {
                errors.push(`Некорректный формат даты: "${event.date}" (ожидался YYYY-MM-DD)`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Валидация всех сохранённых событий.
     * @returns {{ valid: boolean, results: Array<{ id, title, errors: string[] }>, total: number, invalid: number }}
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

    /**
     * Скачать файл
     * @param {string} content - содержимое файла
     * @param {string} filename - имя файла
     * @param {string} mimeType - MIME-тип
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
     * @param {File} file
     * @returns {Promise<string>}
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
     * @returns {string}
     */
    getDateString() {
        const d = new Date();
        return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    },

    /**
     * Экспорт проекта в JSON
     * @param {object} project - объект проекта
     */
    exportProjectJSON(project) {
        if (!project) {
            alert('Нет проекта для экспорта');
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
    }
};
