/**
 * ==========================================
 * LINK MODE — OBJECT ENCAPSULATION
 * ==========================================
 * 
 * Инкапсуляция режима связей в объект.
 * Устраняет гонки порядка скриптов.
 * ==========================================
 */

const LinkMode = {
    /** Активен ли режим связи */
    active: false,
    /** Выбранные маркеры [{marker, data}] */
    selection: [],
    /** Отрисованные линии связи L.polyline[] */
    lines: [],

    /** Войти в режим связи */
    enter() {
        this.active = true;
        this.selection = [];

        const mkl = _getLayer(markersLayer);
        const htl = _getLayer(heatLayer);

        MapView.map.removeLayer(mkl);

        if (MapView.heatVisible) {
            MapView.map.removeLayer(htl);
        }

        renderMap();

        const btn = document.getElementById('btn-link-mode');
        btn.classList.add('active');
        btn.style.background = '#3b82f633';
        btn.style.borderColor = '#3b82f666';
        btn.style.color = '#3b82f6';
        MapView.map.getContainer().style.cursor = 'crosshair';
        showLinkHint();
        this.updateHint();
    },

    /** Выйти из режима связи */
    exit() {
        this.active = false;

        MapView.map.eachLayer(layer => {
            if (layer._isEventMarker) {
                MapView.map.removeLayer(layer);
            }
        });

        this.clearSelection();
        MapView.map.addLayer(_getLayer(markersLayer));
        renderMap();

        if (MapView.heatVisible) {
            _getLayer(heatLayer).addTo(MapView.map);
            updateHeatLayer();
        }

        const btn = document.getElementById('btn-link-mode');
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        MapView.map.getContainer().style.cursor = '';
        hideLinkHint();
    },

    /** Переключить режим */
    toggle() {
        if (this.active) {
            this.exit();
        } else {
            this.enter();
        }
    },

    /** Показать подсказку */
    updateHint() {
        const hint = document.getElementById('link-hint');
        if (!hint) return;
        
        const count = this.selection.length;
        hint.innerHTML = `
            <div style="font-weight:600;margin-bottom:4px;">🔗 Режим связи</div>
            <div style="color:#94a3b8;">Выбрано: ${count} ${count === 1 ? 'маркер' : count < 5 ? 'маркера' : 'маркеров'}</div>
            ${count >= 2 ? '<div style="color:#3b82f6;font-size:10px;margin-top:2px;">Нажмите на следующий маркер для связи</div>' : ''}
            <div style="color:#64748b;font-size:10px;margin-top:4px;">Esc — отмена</div>
        `;
    },

    /** Очистить выбор */
    clearSelection() {
        this.selection.forEach(item => {
            if (item.marker && item.marker._icon) {
                item.marker._icon.classList.remove('link-selected');
            }
        });
        this.selection = [];

        const lkl = _getLayer(linksLayer);
        this.lines.forEach(l => lkl.removeLayer(l));
        this.lines = [];

        this.updateHint();
    },

    /** Добавить маркер в выборку */
    addToSelection(marker, eventData) {
        const exists = this.selection.some(item => item.data.id === eventData.id);
        if (exists) {
            this.selection = this.selection.filter(item => item.data.id !== eventData.id);
            if (marker._icon) {
                marker._icon.classList.remove('link-selected');
            }
            this.updateHint();
            return;
        }

        this.selection.push({ marker, data: eventData });
        
        if (marker._icon) {
            marker._icon.classList.add('link-selected');
        }
        
        this.updateHint();
        
        if (this.selection.length >= 2) {
            createLink();
        }
    }
};

/**
 * Показать подсказку режима связи
 */
function showLinkHint() {
    if (document.getElementById('link-hint')) return;
    
    const hint = document.createElement('div');
    hint.id = 'link-hint';
    hint.style.cssText = `
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        background: rgba(13, 15, 20, 0.95);
        border: 1px solid #3b82f6;
        border-radius: 10px;
        padding: 10px 16px;
        font-size: 12px;
        color: #e2e8f0;
        text-align: center;
        backdrop-filter: blur(8px);
        pointer-events: none;
    `;
    hint.innerHTML = `
        <div style="font-weight:600;margin-bottom:4px;">🔗 Режим связи</div>
        <div style="color:#94a3b8;">Кликайте по маркерам для создания связей</div>
        <div style="color:#64748b;font-size:10px;margin-top:4px;">Esc — отмена</div>
    `;
    
    document.querySelector('.map-container').appendChild(hint);
}

/**
 * Скрыть подсказку
 */
function hideLinkHint() {
    const hint = document.getElementById('link-hint');
    if (hint) hint.remove();
}
