/**
 * ==========================================
    ВКЛАДКА «СВЯЗИ»
    ==========================================
    
    Рендеринг списка связей, удаление,
    экспорт JSON/CSV.
    ==========================================
    */

/**
 * Рендеринг панели связей
 */
function renderLinksPanel() {
    const container = document.getElementById('links-list');
    if (!container) return;

    if (!savedLinks || savedLinks.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:24px 12px;color:var(--text-dim);font-size:12px;">
                <div style="font-size:24px;margin-bottom:8px;">🔗</div>
                <div>Связей пока нет</div>
                <div style="margin-top:4px;font-size:10px;">Используйте режим связи на карте для создания</div>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    savedLinks.forEach((link, index) => {
        const fromEvent = State.events.find(e => e.id === link.from);
        const toEvent = State.events.find(e => e.id === link.to);

        if (!fromEvent || !toEvent) return;

        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:4px;background:var(--bg-body);border:1px solid var(--border-subtle);border-radius:var(--radius-md);transition:border-color var(--transition);';
        item.onmouseenter = () => item.style.borderColor = 'var(--border-hover)';
        item.onmouseleave = () => item.style.borderColor = 'var(--border-subtle)';

        const fromConfig = getCategoryConfig(fromEvent.type);
        const toConfig = getCategoryConfig(toEvent.type);

        item.innerHTML = `
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${fromConfig.color};flex-shrink:0;"></span>
                    <span style="font-size:11px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(fromEvent.description)}</span>
                </div>
                <div style="font-size:10px;color:var(--text-dim);text-align:center;">↓</div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${toConfig.color};flex-shrink:0;"></span>
                    <span style="font-size:11px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(toEvent.description)}</span>
                </div>
            </div>
            <button class="btn-remove-link-panel" data-index="${index}" title="Удалить связь" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:14px;padding:4px;border-radius:4px;transition:all var(--transition);flex-shrink:0;">✕</button>
        `;

        // Обработчик удаления
        item.querySelector('.btn-remove-link-panel').addEventListener('click', (e) => {
            e.stopPropagation();
            const linkToRemove = savedLinks[index];
            if (linkToRemove && confirm('Удалить эту связь?')) {
                removeLinkById(linkToRemove.id);
            }
        });

        container.appendChild(item);
    });
}

/**
 * Удалить связь по ID
 * @param {number} linkId 
 */
function removeLinkById(linkId) {
    savedLinks = savedLinks.filter(l => l.id !== linkId);
    saveLinks(savedLinks);

    // Удалить линию с карты
    if (linksLayer) {
        linksLayer.eachLayer(layer => {
            if (layer._linkId === linkId) {
                linksLayer.removeLayer(layer);
            }
        });
    }

    // Обновить UI
    renderLinksPanel();
    renderMap();
}

/**
 * Экспорт связей в CSV
 */
function exportLinksCSV(links = savedLinks) {
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
    Export.downloadFile(csv, `anemap_links_${Export.getDateString()}.csv`, 'text/csv');
}

// Обработчики кнопок экспорта связей
document.addEventListener('DOMContentLoaded', () => {
    const btnExportLinksJson = document.getElementById('btn-export-links-json');
    const btnExportLinksCsv = document.getElementById('btn-export-links-csv');

    if (btnExportLinksJson) {
        btnExportLinksJson.addEventListener('click', () => Export.exportLinksJSON(savedLinks));
    }
    if (btnExportLinksCsv) {
        btnExportLinksCsv.addEventListener('click', () => exportLinksCSV(savedLinks));
    }
});
