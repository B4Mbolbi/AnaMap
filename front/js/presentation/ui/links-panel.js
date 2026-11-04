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

    const links = State.links || [];

    if (links.length === 0) {
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

    links.forEach((link, index) => {
        const fromEvent = State.events.find(e => e.id === link.from);
        const toEvent = State.events.find(e => e.id === link.to);

        if (!fromEvent || !toEvent) return;

        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:4px;background:var(--bg-body);border:1px solid var(--border-subtle);border-radius:var(--radius-md);transition:border-color var(--transition);';
        item.onmouseenter = () => item.style.borderColor = 'var(--border-hover)';
        item.onmouseleave = () => item.style.borderColor = 'var(--border-subtle)';

        const fromConfig = getCategoryConfig(fromEvent.type);
        const toConfig = getCategoryConfig(toEvent.type);
        const linkType = CONFIG.LINK_TYPES[link.type] || CONFIG.LINK_TYPES.coincidence;

        item.innerHTML = `
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${fromConfig.color};flex-shrink:0;"></span>
                    <span style="font-size:11px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(fromEvent.description)}</span>
                </div>
                <div style="font-size:10px;color:var(--text-dim);text-align:center;">${linkType.icon}</div>
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
            const linkToRemove = links[index];
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
    State.removeLink(linkId);

    // Удалить линию с карты
    const lkl = _getLayer(linksLayer);
    if (lkl) {
        lkl.eachLayer(layer => {
            if (layer._linkId === linkId) {
                lkl.removeLayer(layer);
            }
        });
    }

    // Обновить UI
    renderLinksPanel();
    renderMap();
}

// Обработчики кнопок экспорта связей
document.addEventListener('DOMContentLoaded', () => {
    const btnExportLinksJson = document.getElementById('btn-export-links-json');
    const btnExportLinksCsv = document.getElementById('btn-export-links-csv');

    if (btnExportLinksJson) {
        btnExportLinksJson.addEventListener('click', () => Export.exportLinksJSON());
    }
    if (btnExportLinksCsv) {
        btnExportLinksCsv.addEventListener('click', () => Export.exportLinksCSV());
    }
});
