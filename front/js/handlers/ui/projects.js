/**
 * ==========================================
 * PROJECT HANDLERS — HANDLERS СЛОЙ
 * ==========================================
 * 
 * Только привязка DOM-событий к domain-функциям.
 * ==========================================
 */

/**
 * Инициализация обработчиков проектов
 */
function initProjectHandlers() {
    const btnNewProject = document.getElementById('btn-new-project');
    const btnImportProject = document.getElementById('btn-import-project');
    const fileImportProject = document.getElementById('file-import-project');

    if (btnNewProject) {
        btnNewProject.addEventListener('click', () => {
            const name = prompt('Название нового проекта:');
            if (!name || name.trim() === '') return;
            createAndSwitchToProject(name.trim());
        });
    }

    if (btnImportProject) {
        btnImportProject.addEventListener('click', () => {
            fileImportProject?.click();
        });
    }

    if (fileImportProject) {
        fileImportProject.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importProjectFromJSON(file).then((switchedProject) => {
                    // switchProject уже вызывает App.refresh('all') — дублировать не нужно
                    if (switchedProject) {
                        console.log('[Projects] Импорт завершён:', switchedProject.name, '| событий:', switchedProject.events.length);
                    }
                });
                e.target.value = '';
            }
        });
    }
}

/**
 * Инициализация селектора проектов в шапке
 */
function initProjectSelector() {
    const selector = document.getElementById('project-selector');
    if (!selector) return;
    
    selector.addEventListener('change', (e) => {
        const projectId = e.target.value;
        if (projectId) {
            switchProject(projectId);
        }
    });
    
    updateProjectSelector();
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initProjectHandlers();
    initProjectSelector();
});
