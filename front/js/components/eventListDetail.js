/**
 * ==========================================
 * МОДАЛКА ДЕТАЛЕЙ СОБЫТИЯ
 * ==========================================
 * 
 * Открытие/закрытие модалки с полной
 * информацией о событии.
 * ==========================================
 */

/** Открытие модалки с деталями события */
function openEventDetail(id) {
    const ev = State.events.find(e => e.id === id);
    if (!ev) return;

    currentDetailEventId = id;
    const cfg = getCategoryConfig(ev.type);
    const allStatuses = getAllStatuses();
    const currentStatus = allStatuses.find(s => s.key === ev.status) || { label: ev.status, color: CONFIG.DEFAULT_COLOR };

    const content = document.getElementById('event-detail-content');
    content.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
            <span style="width:14px;height:14px;border-radius:50%;background:${cfg.color};flex-shrink:0;"></span>
            <span style="font-size:14px;font-weight:600;color:${cfg.color};text-transform:uppercase;">${cfg.label}</span>
        </div>
        <div style="background:#0a0b0e;border:1px solid #252932;border-radius:10px;padding:16px;margin-bottom:16px;">
            <div style="font-size:15px;line-height:1.6;color:#e2e8f0;margin-bottom:16px;">${ev.description}</div>
            <div style="margin-bottom:16px;">
                <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Статус</div>
                <select id="detail-status-select" style="width:100%;background:#13151c;border:1px solid #252932;border-radius:8px;padding:8px 12px;font-size:13px;color:#e2e8f0;outline:none;cursor:pointer;">
                    ${allStatuses.map(s => `<option value="${s.key}" ${s.key === ev.status ? 'selected' : ''} style="background:#13151c;color:${s.color};">${s.label}</option>`).join('')}
                </select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div><div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Дата</div><div style="font-size:13px;color:#cbd5e1;">${ev.date}</div></div>
                <div><div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Источник</div><div style="font-size:13px;color:#cbd5e1;">${ev.source || '—'}</div></div>
                <div><div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Район</div><div style="font-size:13px;color:#cbd5e1;">${ev.district || '—'}</div></div>
                <div><div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">Координаты</div><div style="font-size:12px;color:#cbd5e1;">${ev.lat?.toFixed(4) || '—'}, ${ev.lng?.toFixed(4) || '—'}</div></div>
            </div>
            ${ev.tags && ev.tags.length > 0 ? `
            <div style="margin-top:16px;">
                <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Теги</div>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    ${ev.tags.map(t => `<span style="font-size:11px;padding:3px 8px;background:#1e293b;color:#94a3b8;border-radius:4px;">${t}</span>`).join('')}
                </div>
            </div>` : ''}
            <div style="margin-top:16px;">
                <button id="btn-show-on-map" style="width:100%;padding:10px 16px;background:${cfg.color}22;color:${cfg.color};border:1px solid ${cfg.color}44;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;" onmouseover="this.style.background='${cfg.color}33'" onmouseout="this.style.background='${cfg.color}22'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Показать на карте
                </button>
            </div>
        `;

    document.getElementById('detail-status-select').onchange = (e) => {
        changeEventStatus(ev.id, e.target.value);
    };

    // Кнопка "Показать на карте"
    document.getElementById('btn-show-on-map').onclick = () => {
        showEventOnMap(ev.id);
    };

    const deleteBtn = document.getElementById('btn-delete-event');
    deleteBtn.style.background = cfg.color + '33';
    deleteBtn.style.color = cfg.color;
    deleteBtn.style.border = `1px solid ${cfg.color}66`;

    document.getElementById('modal-event-detail').classList.remove('hidden');
}

/** Закрытие модалки деталей */
function closeEventDetail() {
    document.getElementById('modal-event-detail').classList.add('hidden');
    currentDetailEventId = null;
}
