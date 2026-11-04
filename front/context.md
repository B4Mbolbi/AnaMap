# AnaMap — Project Context

## 📋 Overview

**AnaMap** — интерактивное веб-приложение для визуализации и анализа событий на карте с использованием Leaflet.js.

- **Технологии**: HTML5, CSS3, JavaScript (ES6+), Leaflet.js
- **Архитектура**: Модульная (handlers, components, config, services, data, utils)
- **Управление состоянием**: Собственный state manager
- **Стили**: CSS переменные (design tokens), модульная структура
- **Хранение данных**: LocalStorage + TEST_DATA fallback

---

## 🏗️ Architecture

### Directory Structure

```
front/
├── index.html              # Main entry point
├── context.md              # This file
├── css/
│   ├── variables.css       # Design tokens (28 CSS variables)
│   ├── base.css            # Base styles, header, sidebar
│   ├── sidebar.css         # Timeline, stats, filters
│   ├── map.css             # Map controls, toggles, links
│   ├── leaflet.css         # Leaflet customization, markers, animations
│   ├── modal.css           # Modals, forms, validation
│   ├── tags.css            # Tag system
│   ├── panels.css          # Categories, event list
│   └── scrollbar.css       # Custom scrollbar
├── js/
│   ├── app.js              # Application initialization
│   ├── config.js           # Configuration constants
│   ├── state.js            # State management
│   ├── main.js             # Main script loader
│   ├── handlers/
│   │   ├── events.js       # Event orchestrator
│   │   ├── eventCreate.js  # Event creation handlers
│   │   ├── mapLinks.js     # Map link handlers
│   │   ├── validation.js   # Form validation
│   │   ├── tags.js         # Tag management
│   │   ├── modal.js        # Modal handlers
│   │   ├── mapPick.js      # Map picking
│   │   ├── categories.js   # Category management
│   │   └── statuses.js     # Status management
│   ├── components/
│   │   ├── map.js          # Global map variables
│   │   ├── ui.js           # UI orchestrator
│   │   ├── eventList.js    # Event list state
│   │   ├── mapInit.js      # Map initialization
│   │   ├── mapRender.js    # Map rendering
│   │   ├── mapLabels.js    # Map labels
│   │   ├── mapYearClusters.js # Year clustering
│   │   ├── mapHeat.js      # Heat map
│   │   ├── mapNavigate.js  # Map navigation
│   │   ├── uiCount.js      # UI counters
│   │   ├── uiFilters.js    # UI filters
│   │   ├── uiStatusFilter.js # Status filter
│   │   ├── uiStatsTypes.js # Stats by types
│   │   ├── uiStatsStatus.js # Stats by status
│   │   ├── uiTimeline.js   # Timeline UI
│   │   ├── uiModal.js      # Modal UI
│   │   ├── eventListRender.js # Event list rendering
│   │   ├── eventListActions.js # Event list actions
│   │   ├── eventListDetail.js # Event list detail view
│   │   ├── eventListStatuses.js # Event list statuses
│   │   └── eventListHandlers.js # Event list handlers
│   ├── services/
│   │   └── api.js          # API service, data loading
│   ├── data/
│   │   └── mock.js         # Mock data (TEST_DATA)
│   └── utils/
│       ├── storage.js      # LocalStorage utilities
│       ├── helpers.js      # Helper functions
│       └── export.js       # Data export utilities
└── assets/                 # Static assets (images, icons)
```

---

## 🎨 Design System

### CSS Variables (Design Tokens)

All styling is controlled through CSS custom properties defined in `css/variables.css`:

#### Colors
- `--color-primary` — Primary brand color
- `--color-primary-hover` — Primary hover state
- `--color-secondary` — Secondary brand color
- `--color-success` — Success state (green)
- `--color-warning` — Warning state (yellow/orange)
- `--color-danger` — Danger/error state (red)
- `--color-info` — Info state (blue)
- `--color-text` — Primary text color
- `--color-text-secondary` — Secondary text color
- `--color-bg` — Background color
- `--color-bg-secondary` — Secondary background
- `--color-border` — Border color
- `--color-overlay` — Overlay/blur background

#### Spacing & Sizing
- `--spacing-xs` — Extra small spacing
- `--spacing-sm` — Small spacing
- `--spacing-md` — Medium spacing
- `--spacing-lg` — Large spacing
- `--spacing-xl` — Extra large spacing
- `--radius-sm` — Small border radius
- `--radius-md` — Medium border radius
- `--radius-lg` — Large border radius
- `--radius-full` — Full rounded (circle)

#### Shadows
- `--shadow-sm` — Small shadow
- `--shadow-md` — Medium shadow
- `--shadow-lg` — Large shadow
- `--shadow-xl` — Extra large shadow

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#3b82f6` | Primary actions, links |
| `--color-success` | `#22c55e` | Success states |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-danger` | `#ef4444` | Error/danger states |
| `--color-info` | `#3b82f6` | Informational states |

---

## ⚙️ Configuration

### config.js

Centralized configuration file containing:

- **API endpoints** — Base URLs for API calls
- **Constants** — Application-wide constants
- **CONFIG object** — Accessible from all modules
- **Link templates** — URL patterns for external links

### state.js

State management with:

- **events** — Array of event objects
- **categories** — Category definitions
- **statuses** — Status definitions
- **filters** — Current filter state (status, dateTo, etc.)
- **selectedEvent** — Currently selected event
- **mapState** — Map position, zoom, layers

---

## 🔄 Data Flow

### Data Loading

1. **api.js** loads data from:
   - Remote API (if available)
   - LocalStorage (fallback)
   - TEST_DATA (final fallback)

2. **mock.js** provides mock data for development

3. **storage.js** handles LocalStorage operations

### State Updates

1. User interacts with UI
2. **handlers/** process user input
3. **state.js** updates application state
4. **components/** re-render affected UI parts
5. **map.js** updates map visualization

---

## 🧩 Module Responsibilities

### handlers/

User interaction logic:

- **events.js** — Event orchestrator, delegates to specific handlers
- **eventCreate.js** — Event creation form handling
- **mapLinks.js** — Map link interactions
- **validation.js** — Form validation rules
- **tags.js** — Tag management (add, remove, filter)
- **modal.js** — Modal open/close logic
- **mapPick.js** — Map coordinate picking
- **categories.js** — Category management
- **statuses.js** — Status management

### components/

UI rendering logic:

- **map.js** — Global map variables (L.map instance, layers)
- **ui.js** — UI orchestrator, calls all render functions
- **eventList.js** — Event list state (currentDetailEventId)
- **mapInit.js** — Map initialization
- **mapRender.js** — Map rendering (markers, clusters)
- **mapLabels.js** — Year labels on map
- **mapYearClusters.js** — Year-based clustering
- **mapHeat.js** — Heat map visualization
- **mapNavigate.js** — Map navigation (zoom, pan)
- **uiCount.js** — UI counters (event count, etc.)
- **uiFilters.js** — Filter UI rendering
- **uiStatusFilter.js** — Status filter UI
- **uiStatsTypes.js** — Statistics by event types
- **uiStatsStatus.js** — Statistics by status
- **uiTimeline.js** — Timeline visualization
- **uiModal.js** — Modal UI rendering
- **eventListRender.js** — Event list DOM rendering
- **eventListActions.js** — Event list action buttons
- **eventListDetail.js** — Event detail view
- **eventListStatuses.js** — Event status management in list
- **eventListHandlers.js** — Event list click handlers

### services/

External communication:

- **api.js** — API calls, data loading, fallback logic

### data/

Static data:

- **mock.js** — TEST_DATA for development/testing

### utils/

Helper functions:

- **storage.js** — LocalStorage read/write
- **helpers.js** — Utility functions (formatting, validation)
- **export.js** — Data export (CSV, JSON)

---

## 🚀 Initialization Order

### CSS Loading (in index.html)

1. `variables.css` — Design tokens (MUST be first)
2. `base.css` — Base styles
3. `sidebar.css` — Sidebar styles
4. `map.css` — Map styles
5. `leaflet.css` — Leaflet customization
6. `modal.css` — Modal styles
7. `tags.css` — Tag styles
8. `panels.css` — Panel styles
9. `scrollbar.css` — Scrollbar styles

### JavaScript Loading (in index.html)

1. `config.js` — Configuration
2. `state.js` — State management
3. `utils/storage.js` — Storage utilities
4. `utils/helpers.js` — Helper functions
5. `utils/export.js` — Export utilities
6. `services/api.js` — API service
7. `data/mock.js` — Mock data
8. `handlers/validation.js` — Validation
9. `handlers/tags.js` — Tags
10. `handlers/modal.js` — Modal
11. `handlers/mapPick.js` — Map picking
12. `handlers/categories.js` — Categories
13. `handlers/statuses.js` — Statuses
14. `handlers/eventCreate.js` — Event creation (MUST be before events.js)
15. `handlers/events.js` — Event handlers (MUST be after eventCreate.js)
16. `handlers/mapLinks.js` — Map links
17. `components/mapInit.js` — Map init
18. `components/mapRender.js` — Map render
19. `components/mapLabels.js` — Map labels
20. `components/mapYearClusters.js` — Year clusters
21. `components/mapHeat.js` — Heat map
22. `components/mapNavigate.js` — Map navigation
23. `components/map.js` — Map globals
24. `components/uiCount.js` — UI counters
25. `components/uiFilters.js` — UI filters
26. `components/uiStatusFilter.js` — Status filter
27. `components/uiStatsTypes.js` — Stats types
28. `components/uiStatsStatus.js` — Stats status
29. `components/uiTimeline.js` — Timeline
30. `components/uiModal.js` — Modal UI
31. `components/ui.js` — UI orchestrator
32. `components/eventListRender.js` — Event list render
33. `components/eventListActions.js` — Event list actions
34. `components/eventListDetail.js` — Event list detail
35. `components/eventListStatuses.js` — Event list statuses (MUST be after statuses.js)
36. `components/eventListHandlers.js` — Event list handlers
37. `components/eventList.js` — Event list state
38. `app.js` — Application initialization
39. `main.js` — Main script loader

### Critical Dependencies

- `eventCreate.js` → `events.js` (handleAddEvent)
- `statuses.js` → `eventListStatuses.js` (updateStatusSelect)

---

## 📝 Recent Changes (2026-11-04)

### CSS Refactoring
- Created `css/variables.css` with 28 CSS custom properties
- Split `styles.css` (1081 lines) into 9 modular CSS files
- All colors, radii, shadows, sizes now use design tokens

### JavaScript Refactoring (Previous Session)
- Split `handlers/` into 8 files by responsibility
- Split `components/` into 21 files by responsibility
- Rebuilt `config.js` — all constants in one place
- Fixed JavaScript loading order in `index.html`

### Documentation
- Created comprehensive `README.md`
- Created this `context.md` with full architecture

### Git
- All 51 files committed
- Pushed to `origin/main`
- Commit: `feat: полная реорганизация проекта — модульная архитектура, CSS-переменные, документация`

---

## 🔧 Development Notes

### Adding New Features

1. **New handler**: Add to `handlers/`, update `handlers/events.js` orchestrator
2. **New component**: Add to `components/`, update `components/ui.js` orchestrator
3. **New style**: Add CSS variable to `variables.css`, use in component
4. **New config**: Add to `config.js`, export via CONFIG object

### CSS Conventions

- Use CSS variables, never hardcoded colors
- Follow BEM naming for classes
- Keep component styles in their respective CSS files
- Base styles go in `base.css`

### JavaScript Conventions

- Use ES6+ syntax (arrow functions, const/let, template literals)
- Single responsibility per file
- Export functions explicitly
- Use CONFIG from `config.js` for constants
- Handle errors gracefully with try/catch

### Testing

- Mock data in `data/mock.js` for development
- LocalStorage for persistence testing
- TEST_DATA fallback for offline development

---

## 🌐 Deployment

### Static Hosting

AnaMap is a static web application:

1. Upload `front/` directory to static hosting
2. Configure server to serve `index.html` for all routes (SPA mode)
3. Ensure CORS headers for API calls (if using remote API)

### Environment Variables

Currently no environment variables. API endpoints are hardcoded in `config.js`.

---

## 📚 Additional Resources

- **Leaflet Docs**: https://leafletjs.com/
- **CSS Custom Properties**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **Local Storage API**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

*Last updated: 2026-11-04*
