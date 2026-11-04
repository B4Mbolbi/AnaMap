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
        selector.innerHTML = '<option value="">Нет проектов</option>';
        var btnNew = document.getElementById('btn-new-project');
        if (btnNew) btnNew.style.display = 'block';
        return;
    }
    
    selector.innerHTML = '';
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        if (project.id === activeId) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
    
    // Скрыть кнопку "+ Новый проект" когда есть проекты
    var btnNew = document.getElementById('btn-new-project');
    if (btnNew) btnNew.style.display = 'none';
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
