# Промпт для реализации «Проекты в AnaMap»

Ниже — готовый промпт. Я разбил его на **контекст → цель → требования → схема данных → пошаговый план → критерии приёмки → ограничения**. Такой формат нейросеть (Cursor/Claude/ChatGPT) выполняет точнее, чем «сделай проекты».

---

## ПРОМПТ (копировать целиком)

```
# Задача: добавить систему «Проекты» в AnaMap (vanilla JS, без сборщика)

## Контекст проекта

AnaMap — SPA на vanilla JS + Leaflet, без фреймворков и сборщиков.
Открывается как `front/index.html` (можно через `python -m http.server`).
Архитектура модульная: config / state / services / utils / data / components / handlers.
Все скрипты подключаются в `index.html` вручную, порядок важен (см. комментарии в index.html).
Состояние — глобальный объект `State` (js/state.js). Хранение — `Storage` (js/utils/storage.js) поверх localStorage.
Связи между маркерами хранятся в `savedLinks` (js/handlers/mapLinks.js), события — в `State.events`.

Текущие ключи localStorage:
- `anemap_events` — массив событий
- `event_links` — массив связей {from, to, id}
- `custom_event_categories` — пользовательские категории
- `custom_event_statuses` — пользовательские статусы

## Цель

Ввести сущность «Проект» — контейнер, внутри которого живут свои события и свои связи.
Пользователь может:
1. Видеть список проектов и переключаться между ними (дропдаун в шапке).
2. Создавать новый проект (имя задаётся).
3. Удалять проект (с подтверждением).
4. Переименовывать проект.
5. Экспортировать проект целиком в JSON (события + связи + метаданные).
6. Импортировать проект из JSON как НОВЫЙ проект (не мерджить в текущий).
7. Видеть, что изменения сохраняются автоматически (автосохранение).

Категории и статусы остаются ГЛОБАЛЬНЫМИ (общая библиотека).
В проекте хранится только подмножество активных категорий — `activeCategories: string[]`.
Если `activeCategories` пуст или отсутствует — считать активными все категории.

## Схема данных

Объект проекта:
```js
{
  id: 'p_' + Date.now(),        // уникальный
  name: 'Пробки Москвы',        // отображаемое имя
  createdAt: 1730000000000,     // timestamp
  updatedAt: 1730000000000,     // timestamp, обновляется при каждом сохранении
  events: [ /* массив событий, как сейчас в State.events */ ],
  links: [ /* массив связей, как сейчас в savedLinks: {from, to, id} */ ],
  activeCategories: ['traffic', 'roadwork'] // ключи категорий; пусто = все
}
```

Ключи localStorage (новые):
- `anemap_projects` — массив метаданных проектов БЕЗ events/links:
  `[{ id, name, createdAt, updatedAt, eventsCount, linksCount }]`
- `anemap_project_<id>` — полный объект проекта (events + links + activeCategories)
- `anemap_active_project` — id текущего активного проекта

Старые ключи (`anemap_events`, `event_links`) после миграции можно оставить как бэкап, но код должен читать только новые.

## Пошаговый план

### Шаг 1. Миграция (js/utils/storage.js)

Добавить метод `Storage.migrateToProjects()`:
- Если `anemap_projects` уже существует — ничего не делать.
- Иначе: взять `anemap_events` и `event_links` (если есть), создать проект `{ id: 'p_default', name: 'Мой проект', events, links, activeCategories: [] }`, сохранить его под `anemap_project_p_default`, добавить метаданные в `anemap_projects`, установить `anemap_active_project = 'p_default'`.
- Вызвать один раз в `App.init()` ДО загрузки событий.

### Шаг 2. Storage API (js/utils/storage.js)

Добавить методы:
- `loadProjects()` → массив метаданных
- `saveProjects(projects)` → записать метаданные
- `loadProject(id)` → полный объект проекта (или null)
- `saveProject(project)` → записать `anemap_project_<id>` + обновить `updatedAt` + обновить метаданные (eventsCount, linksCount)
- `createProject(name)` → создать новый, сохранить, вернуть объект
- `deleteProject(id)` → удалить `anemap_project_<id>` и метаданные; если удалён активный — переключить на первый доступный или создать дефолтный
- `getActiveProjectId()` / `setActiveProjectId(id)`
- Существующие `loadEvents/saveEvents/loadLinks/saveLinks` ПЕРЕПИСАТЬ: они должны читать/писать в активный проект через `State.currentProject`, а не в старые ключи. Либо удалить их и заменить на работу через проект.

### Шаг 3. State (js/state.js)

Добавить:
- `currentProjectId: null`
- `currentProject: null`
- `projects: []` (метаданные)
- Геттер/сеттер для `events`: читает/пишет `currentProject.events`. ВАЖНО: существующий код обращается к `State.events` напрямую (например, `State.events.push(...)` в eventCreate.js). Геттер должен возвращать реальный массив (ссылку), чтобы `push` работал. Сеттер заменяет массив.
- `links` — аналогично для `currentProject.links`
- `loadProject(id)` — загружает проект из Storage, ставит `currentProject`, `currentProjectId`, вызывает `Storage.setActiveProjectId(id)`
- `createProject(name)` — создаёт через Storage, переключается на него
- `deleteProject(id)`
- `renameProject(id, name)`
- `getActiveCategories()` — возвращает Set: если `currentProject.activeCategories` пуст — все ключи `getAllCategories()`, иначе — только указанные
- `setActiveCategories(keys)` — сохраняет в проект и в Storage

### Шаг 4. UI: дропдаун проектов в шапке (index.html + css/base.css)

В `<header>`, перед блоком `.header-right`, добавить:
```html
<div class="project-switcher">
  <select id="project-select" title="Текущий проект"></select>
  <button id="btn-new-project" title="Новый проект">+</button>
  <button id="btn-rename-project" title="Переименовать">✎</button>
  <button id="btn-delete-project" title="Удалить проект">🗑</button>
</div>
```
Стили — в `css/base.css` через существующие переменные (`--bg-card`, `--border-default`, `--text-primary`, `--radius-md`). Не хардкодить цвета.

### Шаг 5. Компонент переключателя (js/components/projectSwitcher.js — новый файл)

Функции:
- `renderProjectSelect()` — заполнить `<select>` из `State.projects`, выбрать текущий
- `initProjectSwitcher()` — навесить обработчики:
  - `change` на select → `State.loadProject(id)` → полный ререндер (`renderMap(); renderUI(); renderEventList();`)
  - `btn-new-project` → `prompt('Название проекта:')` → если не пусто → `State.createProject(name)` → ререндер + `renderProjectSelect()`
  - `btn-rename-project` → `prompt` с текущим именем → `State.renameProject(...)` → `renderProjectSelect()`
  - `btn-delete-project` → `confirm('Удалить проект "X"?')` → `State.deleteProject(id)` → ререндер + `renderProjectSelect()`
- Подключить файл в `index.html` ПОСЛЕ `state.js` и `storage.js`, ДО `app.js`. Вызвать `initProjectSwitcher()` в `App.init()`.

### Шаг 6. Связи (js/handlers/mapLinks.js)

- Убрать глобальную `savedLinks` как источник истины. Оставить её как кэш, синхронизируемый с `State.links`.
- `loadSavedLinks()` → `return State.links || []`
- `saveLinks(links)` → `State.links = links; Storage.saveProject(State.currentProject)`
- При переключении проекта — `savedLinks` пересоздаётся из нового `State.links`. Убедиться, что `renderMap()` перерисовывает связи.

### Шаг 7. События и категории

- `eventCreate.js`: после `State.events.push(created)` вызвать `Storage.saveProject(State.currentProject)` (или `Storage.saveEvents()` — если он переписан на проект).
- `eventListActions.js` (`deleteEvent`, `changeEventStatus`, `deleteCategory`): после мутации — `Storage.saveProject(State.currentProject)`.
- `categories.js` / `statuses.js`: пользовательские категории/статусы остаются глобальными, не трогать.
- `uiFilters.js` / `uiStatusFilter.js`: фильтры типов инициализировать из `State.getActiveCategories()`, а не из всех категорий.

### Шаг 8. Экспорт/импорт проекта (js/utils/export.js + js/components/eventListHandlers.js)

Добавить в `Export`:
- `exportProjectJSON()` — собрать `{ name, createdAt, events, links, activeCategories }` из `State.currentProject`, скачать как `<name>_<date>.json`.
- `importProjectJSON(file)` — прочитать файл, валидировать структуру, создать НОВЫЙ проект через `Storage.createProject`, записать в него events/links, переключиться на него, ререндер. Не мерджить в текущий.

В UI (js/components/eventListHandlers.js):
- Кнопка «Экспорт проекта» (JSON) — новая, рядом с существующими JSON/CSV. Существующие JSON/CSV оставить как экспорт ТОЛЬКО событий текущего проекта (для Excel).
- Кнопка «Импорт проекта» — новая, отдельный `<input type="file">`. Существующий «Import» оставить для импорта событий в текущий проект.

### Шаг 9. Порядок подключения скриптов (index.html)

Проверить и при необходимости поправить:
- `storage.js` — до `state.js`? Сейчас `state.js` идёт раньше. Если `State.loadProject` вызывает `Storage` только в рантайме (не при объявлении) — порядок не критичен. Но `App.init()` должен вызывать `Storage.migrateToProjects()` ДО `State.loadProject(...)`.
- `projectSwitcher.js` — после `state.js`, `storage.js`, `helpers.js`, до `app.js`.
- `export.js` — до `eventListHandlers.js` (там будут новые кнопки).

### Шаг 10. App.init() (js/app.js)

Новый порядок:
1. `Storage.migrateToProjects()`
2. `State.projects = Storage.loadProjects()`
3. Если активного проекта нет — создать дефолтный через `Storage.createProject('Мой проект')`
4. `State.loadProject(Storage.getActiveProjectId())`
5. `initMap()`
6. Загрузка событий: если в проекте есть events — использовать их; иначе — загрузить из API/mock как раньше и записать в проект.
7. `savedLinks = State.links` (синхронизация кэша)
8. `initEventHandlers()`, `initEventListHandlers()`, `initLinkHandlers()`, `initProjectSwitcher()`
9. `renderProjectSelect()`
10. `updateEventTypeSelect()`, `updateStatusSelect()`
11. `renderMap(); renderUI(); renderEventList();`
12. `window.addEventListener('resize', () => map.invalidateSize())`

## Критерии приёмки

1. При первом запуске на чистом localStorage создаётся проект «Мой проект», приложение работает как раньше.
2. При первом запуске со старыми ключами (`anemap_events`, `event_links`) события и связи мигрируют в проект «Мой проект», ничего не теряется.
3. В шапке виден дропдаун с проектами. Переключение мгновенно меняет события на карте, связи, статистику, таймлайн, список событий.
4. «+» создаёт проект с заданным именем, переключается на него. Пустой проект: карта пустая, счётчик 0.
5. «✎» переименовывает. «🗑» удаляет с подтверждением; если удалён активный — переключается на первый доступный.
6. Добавление события / удаление / смена статуса / создание связи — сохраняются в текущий проект. После перезагрузки страницы — на месте.
7. Переключение проекта НЕ теряет изменения в предыдущем (автосохранение работает).
8. «Экспорт проекта» скачивает JSON с `{ name, events, links, activeCategories }`.
9. «Импорт проекта» создаёт НОВЫЙ проект из файла и переключается на него. Существующие проекты не затрагиваются.
10. Категории/статусы остаются глобальными: созданная в проекте A категория видна в проекте B (в фильтрах и селектах).
11. Фильтры типов учитывают `activeCategories` проекта: если в проекте только `traffic` — в фильтрах только «Пробки».
12. Старые кнопки «JSON»/«CSV» экспортируют только события текущего проекта. «Import» (старый) импортирует события в текущий проект с мерджем по id.
13. Никаких `alert()` для штатных операций (кроме подтверждений удаления и ошибок импорта). Для уведомлений — если есть время, сделать простой тост; иначе оставить `confirm`/`prompt`, но НЕ `alert` на успех.
14. Код соответствует стилю проекта: ES6+, `const/let`, без сборщика, без новых зависимостей, глобальные функции в стиле существующих модулей, комментарии-заголовки в стиле проекта.

## Ограничения

- НЕ вводить сборщик, ES-модули, npm-зависимости. Всё остаётся на глобальных скриптах.
- НЕ переписывать существующие модули целиком без необходимости — минимальные точечные правки.
- НЕ менять схему события (`{id, type, status, date, description, tags, lat, lng, source, district}`) — она используется в экспорте/валидации.
- НЕ трогать `config.js` без необходимости; новые константы (например, `PROJECTS_KEY`) можно добавить в `CONFIG`.
- Не хардкодить цвета в новом CSS — использовать переменные из `variables.css`.
- Не ломать существующие фичи: связи, тепловая карта, кластеры по годам, импорт/экспорт событий, кастомные категории/статусы.

