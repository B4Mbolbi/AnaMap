/**
 * ==========================================
 * УПРАВЛЕНИЕ СТАТУСАМИ
 * ==========================================
 * 
 * Рендеринг списка статусов в модалке
 * управления и добавление новых.
 * ==========================================
 */

/** Рендеринг списка статусов в модалке управления */
function renderStatusesModal() {
    const container = document.getElementById('statuses-list');
    container.innerHTML = '';

    getAllStatuses().forEach(status => {
        const div = document.createElement('div');
        div.className = `category-item ${status.isBase ? 'base' : ''}`;

        let deleteBtn = '';
        if (!status.isBase) {
            deleteBtn = `<button class="category-delete" data-status-key="${status.key}">✕</button>`;
        }

        div.innerHTML = `
            <div class="category-color-preview" style="background:${status.color};"></div>
            <div class="category-info">
                <span class="category-name">${status.label}</span>
                <span class="category-badge">${status.isBase ? 'базовый' : 'польз.'}</span>
            </div>
            ${deleteBtn}
        `;

        container.appendChild(div);
    });

    container.querySelectorAll('.category-delete').forEach(btn => {
        btn.onclick = async () => {
            await API.deleteStatus(btn.dataset.statusKey);
            renderStatusesModal();
        };
    });
}

/** Добавление нового пользовательского статуса */
async function handleAddStatus() {
    const nameInput = document.getElementById('status-new-name');
    const colorInput = document.getElementById('status-new-color');
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) { alert('Введите название статуса'); return; }

    const custom = Storage.loadStatuses();
    if (custom.some(s => s.label.toLowerCase() === name.toLowerCase())) {
        alert('Такой статус уже существует'); return;
    }

    const key = CONFIG.CUSTOM_PREFIX + name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '_') + '_' + Date.now();
    const newStatus = { key, label: name, color };

    try {
        await API.saveStatuses([...custom, newStatus]);
        nameInput.value = '';
        colorInput.value = CONFIG.CUSTOM_COLORS[custom.length % CONFIG.CUSTOM_COLORS.length];
        renderStatusesModal();
        updateStatusSelect();
    } catch (error) {
        console.error('[EventList] Ошибка при добавлении статуса:', error);
        alert('Ошибка при сохранении статуса');
    }
}
