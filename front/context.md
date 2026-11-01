# Контекст проекта AnaMap

## Общая информация
- **Название:** Аналитическая карта реальности
- **Тип:** Vanilla JS dashboard для мониторинга событий
- **Карта:** Leaflet 1.9.4 + OpenStreetMap + MarkerCluster
- **Хранение:** localStorage (пока нет бэкенда)
- **Технологии:** HTML, CSS, Vanilla JavaScript

## Архитектура

### Структура файлов
```
front/
├── index.html          # Главная страница
├── css/
│   └── styles.css      # Все стили
└── js/
    ├── config.js       # Конфигурация (API, константы, цвета)
    ├── state.js        # Централизованное состояние
    ├── services/
    │   └── api.js      # Слой API (mock + real)
    ├── components/
    │   ├── map.js      # Карта, кластеризация, маркеры
    │   ├── ui.js       # Боковая панель, фильтры, статистика
    │   └── eventList.js # Список событий, статусы, модалки
    ├── handlers/
    │   ├── mapLinks.js # Связи между маркерами
    │   └── events.js   # Обработчики добавления событий
    └── app.js          # Точка входа
```

### Порядок загрузки (index.html)
1. config.js — базовая конфигурация
2. state.js — состояние приложения
3. services/api.js — API слой (зависит от config)
4. components/map.js — карта (зависит от config, state)
5. components/ui.js — боковая панель (зависит от state, config, api)
6. components/eventList.js — список событий (зависит от state, config, api, map, ui)
7. handlers/mapLinks.js — связи (зависит от state, map)
8. handlers/events.js — обработчики (зависит от state, config, api, map, ui)
9. app.js — точка входа

### Зависимости между модулями
| Файл | Зависит от |
|------|-----------|
| config.js | — (нет зависимостей) |
| state.js | — (нет зависимостей) |
| services/api.js | config.js |
| components/map.js | config.js, state.js |
| components/ui.js | state.js, config.js, api.js |
| components/eventList.js | state.js, config.js, api.js, map.js, ui.js |
| handlers/mapLinks.js | state.js, map.js |
| handlers/events.js | state.js, config.js, api.js, map.js, ui.js |
| app.js | все вышеперечисленные |

## Ключевые функции

### config.js
- CONFIG — глобальный объект конфигурации
- loadCustomCategories() / saveCustomCategories()
- loadCustomStatuses() / saveCustomStatuses()

### state.js
- State.events — массив событий
- State.filters — фильтры (types, dateFrom)
- State.viewMode — режим отображения
- State.getFilteredEvents()
- State.setFilterTypes() / State.setFilterDateFrom() / State.setViewMode() / State.setEvents()

### services/api.js
- API._request() — базовый метод запросов
- API.getEvents() — получение событий
- API.addEvent() — добавление события
- API.saveCategories() — сохранение категорий
- API.getCategories() — получение категорий
- API.deleteEvent() — удаление события
- API.deleteCategory() — удаление категории
- API.getAllStatuses() — получение статусов
- API.saveStatuses() — сохранение статусов
- API.deleteStatus() — удаление статуса
- API._getMockData() — mock данные

### components/map.js
- map — глобальная переменная карты
- markersLayer — кластер маркеров
- linksLayer — слой связей
- initMap() — инициализация карты
- getCategoryConfig(type) — получение конфигурации категории
- renderMap() — рендеринг маркеров
- updateLabelsVisibility() — видимость лейблов

### components/ui.js
- renderUI() — главная функция рендеринга
- updateEventCount() — счётчик событий
- renderFilterButtons() — кнопки фильтров
- renderStatsByTypes() — статистика по типам
- renderStatsByStatus() — статистика по статусам
- renderCategoriesModal() — модалка категорий
- getAllCategories() — все категории

### components/eventList.js
- getAllStatuses() — все статусы
- getEventCategoryConfig(type) — конфигурация категории
- groupEventsByCategory() — группировка событий
- renderEventList() — рендеринг списка
- deleteCategory(key) — удаление категории
- changeEventStatus(eventId, newStatus) — изменение статуса
- deleteEvent(id) — удаление события
- openEventDetail(id) — открытие деталей
- closeEventDetail() — закрытие деталей
- renderStatusesModal() — модалка статусов
- handleAddStatus() — добавление статуса
- initEventListHandlers() — инициализация обработчиков

### handlers/mapLinks.js
- linkMode — булево, режим связи
- linkSelection[] — выбранные маркеры
- linkLines[] — текущие линии
- savedLinks[] — сохранённые связи
- loadSavedLinks() / saveLinks()
- toggleLinkMode() — переключение режима
- showLinkHint() / hideLinkHint() / updateLinkHint()
- clearSelection() — очистка выбора
- addMarkerToSelection(marker, eventData) — добавление в выборку
- createLink() — создание линии
- removeLink(polyline, fromId, toId) — удаление связи
- renderSavedLinks() — рендеринг сохранённых связей
- initLinkHandlers() — инициализация обработчиков

### handlers/events.js
- openAddModal(lat, lng) — открытие модалки
- initEventHandlers() — инициализация обработчиков
- handleAddCategory() — добавление категории
- updateEventTypeSelect() — обновление селекта
- handleAddEvent() — добавление события

### app.js
- init() — точка входа
- Запуск при DOMContentLoaded

## История изменений

| Дата | Изменение |
|------|-----------|
| 2026-11-01 | Создание проекта AnaMap |
| 2026-11-01 | Добавление Leaflet + MarkerCluster |
| 2026-11-01 | Реализация карты, маркеров, кластеризации |
| 2026-11-01 | Реализация связей между маркерами |
| 2026-11-01 | Реализация фильтров, статистики, категорий |
| 2026-11-01 | Реализация добавления событий, статусов |
| 2026-11-01 | API слой с mock-данными |
| 2026-11-02 | Увеличение размера иконок кластеров (36→60, 44→68, 52→76) |
| 2026-11-02 | Рефакторинг структуры: services/, components/, handlers/ |
| 2026-11-02 | Создание Context Agent (context.md) |

## Статус

### Выполнено
- [x] Базовая карта Leaflet
- [x] Кластеризация маркеров
- [x] Связи между маркерами
- [x] Фильтры и статистика
- [x] Добавление событий
- [x] Категории и статусы
- [x] API слой (mock)
- [x] Рефакторинг структуры
- [x] Система агентов GigaCode

### В процессе
- [ ] Создание Context Agent

### Запланировано
- [ ] Подключение реального API (бэкенд)
- [ ] Папка utils/ для утилит
- [ ] JSDoc комментарии
- [ ] Тесты
- [ ] Адаптивная вёрстка
- [ ] Экспорт данных

## Агенты проекта

| Файл | Роль |
|------|------|
| orchestrator.md | Главный — координирует всех |
| map.md | Карта Leaflet |
| marker.md | Метки и кластеризация |
| link.md | Связи между маркерами |
| filter.md | Фильтры и статистика |
| add-event.md | Добавление событий |
| api.md | Настройка API |
| frontend.md | HTML/CSS/верстка |
| agent-creator.md | Создание новых агентов |
| structagent.md | Рефакторинг и структурирование |
| context.md | Поддержание контекста проекта |
