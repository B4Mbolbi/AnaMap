/**
 * ==========================================
 * УПРАВЛЕНИЕ ПРОЕКТАМИ
 * ==========================================
 * 
 * Селектор проектов в шапке,
 * переключение, создание, удаление.
 * ==========================================
 */

/**
 * Обновить селектор проектов в шапке
 */
function updateProjectSelector() {
    const selector = document.getElementById('project-selector');
    if (!selector) return;
    
    const projects = Storage.loadProjects();
    const activeId = Storage.getActiveProjectId();
    
    selector.innerHTML = '';
    
    if (projects.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Нет проектов';
        selector.appendChild(option);
        return;
    }
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        if (project.id === activeId) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
}

/**
 * Инициализация селектора проектов
 */
function initProjectSelector() {
    const selector = document.getElementById('project-selector');
    if (!selector) return;
    
    // Обновить при изменении
    selector.addEventListener('change', (e) => {
        const projectId = e.target.value;
        if (projectId) {
            switchToProject(projectId);
        }
    });
    
    // Первичная инициализация
    updateProjectSelector();
}

/**
 * Создать новый проект и переключиться на него
 */
function createAndSwitchToProject(name) {
    const project = createProject(name);
    switchToProject(project.id);
    updateProjectSelector();
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initProjectSelector();
});
