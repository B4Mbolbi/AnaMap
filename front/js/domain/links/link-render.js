/**
 * ==========================================
 * СВЯЗИ — РЕНДЕРИНГ (LINK RENDERING)
 * ==========================================
 * 
 * Создание связей, отрисовка линий,
 * попапы, модалка выбора типа.
 * ==========================================
 */

/**
 * Создать линию между выбранными маркерами
 */
function createLink() {
    if (linkSelection.length < 2) return;
    
    const from = linkSelection[linkSelection.length - 2];
    const to = linkSelection[linkSelection.length - 1];

    if (from.data.id === to.data.id) return;
    if (State.linkExists(from.data.id, to.data.id)) {
        console.warn('Связь между этими событиями уже существует');
        return;
    }

    showLinkTypeModal(from.data, to.data, (type, comment) => {
        if (!type) return;

        const polyline = L.polyline(
            [[from.data.lat, from.data.lng], [to.data.lat, to.data.lng]],
            _getLinkStyle(type)
        ).addTo(linksLayer);
        
        polyline.bindPopup(_createLinkPopup(from.data, to.data, polyline));
        
        const link = State.addLink({
            from: from.data.id,
            to: to.data.id,
            type: type,
            comment: comment
        });
        polyline._linkId = link.id;
        linkLines.push(polyline);
        
        if (typeof renderLinksPanel === 'function') {
            renderLinksPanel();
        }
        
        linkSelection.forEach(item => {
            if (item.marker && item.marker._icon) {
                item.marker._icon.classList.remove('link-selected');
            }
        });
        linkSelection = [to];
        updateLinkHint();
    });
}

/**
 * Получить стиль линии по типу связи
 */
function _getLinkStyle(type) {
    const linkType = CONFIG.LINK_TYPES[type] || CONFIG.LINK_TYPES.coincidence;
    const linkStyle = CONFIG.LINK_STYLES[type] || CONFIG.LINK_STYLES.coincidence;
    return {
        color: linkType.color,
        weight: linkStyle.weight,
        opacity: linkStyle.opacity,
        dashArray: linkStyle.dashArray,
        lineCap: 'round'
    };
}

/**
 * Создать попап для линии связи
 */
function _createLinkPopup(fromEvent, toEvent, polyline) {
    const link = State.links.find(l => l.id === polyline._linkId);
    if (!link) return '';

    const linkType = CONFIG.LINK_TYPES[link.type] || CONFIG.LINK_TYPES.coincidence;
    const escapedComment = escapeHtml(link.comment || '');

    return `
        <div style="padding:8px;font-size:12px;min-width:200px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span style="font-size:14px;">${linkType.icon}</span>
                <span style="font-weight:600;color:${linkType.color};">${linkType.label}</span>
            </div>
            <div style="color:#cbd5e1;font-size:11px;margin-bottom:2px;">${escapeHtml(fromEvent.description)}</div>
            <div style="color:#64748b;font-size:10px;">→</div>
            <div style="color:#cbd5e1;font-size:11px;margin-bottom:4px;">${escapeHtml(toEvent.description)}</div>
            ${escapedComment ? `<div style="color:#94a3b8;font-size:11px;font-style:italic;margin-bottom:6px;padding:4px 8px;background:#13151c;border-radius:4px;">${escapedComment}</div>` : ''}
            <div style="display:flex;gap:4px;margin-top:6px;">
                <button class="btn-edit-link" style="flex:1;padding:4px 8px;background:#3b82f6;color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;">✏️ Изменить</button>
                <button class="btn-remove-link" style="flex:1;padding:4px 8px;background:#ef4444;color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;">🗑 Удалить</button>
            </div>
        </div>
    `;
}

/**
 * Удалить связь
 */
function removeLink(polyline, linkId) {
    if (!polyline) return;
    
    linksLayer.removeLayer(polyline);
    linkLines = linkLines.filter(l => l !== polyline);
    State.removeLink(linkId);
}

/**
 * Отрисовка сохранённых связей на карте
 */
function renderSavedLinks() {
    linkLines.forEach(l => linksLayer.removeLayer(l));
    linkLines = [];
    
    const filteredLinks = State.getFilteredLinks();
    
    filteredLinks.forEach(link => {
        const fromEvent = State.events.find(e => e.id === link.from);
        const toEvent = State.events.find(e => e.id === link.to);
        
        if (!fromEvent || !toEvent) return;
        
        const polyline = L.polyline(
            [[fromEvent.lat, fromEvent.lng], [toEvent.lat, toEvent.lng]],
            _getLinkStyle(link.type)
        ).addTo(linksLayer);
        
        polyline._linkId = link.id;
        polyline.bindPopup(_createLinkPopup(fromEvent, toEvent, polyline));
        
        polyline.once('popupopen', () => {
            const btnRemove = document.querySelector('.btn-remove-link');
            if (btnRemove) {
                btnRemove.onclick = () => {
                    removeLink(polyline, link.id);
                    polyline.closePopup();
                    renderMap();
                    if (typeof renderLinksPanel === 'function') {
                        renderLinksPanel();
                    }
                };
            }
            const btnEdit = document.querySelector('.btn-edit-link');
            if (btnEdit) {
                btnEdit.onclick = () => {
                    showLinkTypeModal(fromEvent, toEvent, (type, comment) => {
                        if (!type) return;
                        State.updateLink(link.id, { type, comment });
                        polyline.closePopup();
                        renderMap();
                        if (typeof renderLinksPanel === 'function') {
                            renderLinksPanel();
                        }
                    }, link);
                };
            }
        });
        
        linkLines.push(polyline);
    });
}

/**
 * Показать модалку выбора типа и комментария для связи
 */
function showLinkTypeModal(fromEvent, toEvent, callback, existingLink) {
    const modal = document.getElementById('modal-link-type');
    if (!modal) return;

    const linkTypes = CONFIG.LINK_TYPES;
    const existingType = existingLink ? existingLink.type : 'coincidence';
    const existingComment = existingLink ? existingLink.comment : '';

    modal.querySelector('#link-from-desc').textContent = fromEvent.description;
    modal.querySelector('#link-to-desc').textContent = toEvent.description;

    const radioContainer = modal.querySelector('#link-type-options');
    radioContainer.innerHTML = Object.values(linkTypes).map(type => `
        <label class="link-type-option ${type.key === existingType ? 'selected' : ''}" data-type="${type.key}">
            <input type="radio" name="link-type" value="${type.key}" ${type.key === existingType ? 'checked' : ''}>
            <span class="link-type-icon">${type.icon}</span>
            <span class="link-type-label">${type.label}</span>
            <span class="link-type-dot" style="background:${type.color};"></span>
        </label>
    `).join('');

    const commentInput = modal.querySelector('#link-comment-input');
    commentInput.value = existingComment;

    const saveBtn = modal.querySelector('#btn-save-link-type');
    const cancelBtn = modal.querySelector('#btn-cancel-link-type');
    
    const newSaveBtn = saveBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newSaveBtn.onclick = () => {
        const selectedRadio = modal.querySelector('input[name="link-type"]:checked');
        const type = selectedRadio ? selectedRadio.value : 'coincidence';
        const comment = commentInput.value.trim();
        modal.classList.add('hidden');
        callback(type, comment);
    };

    newCancelBtn.onclick = () => {
        modal.classList.add('hidden');
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };

    modal.classList.remove('hidden');
}
