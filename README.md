# 🗺️ Аналитическая карта реальности

> **Vanilla JS dashboard** для мониторинга и визуализации событий на интерактивной карте.

[![Vanilla JS](https://img.shields.io/badge/JS-Vanilla-F7DF1E?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Leaflet](https://img.shields.io/badge/Map-Leaflet-199900?style=flat-square)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📖 О проекте

AnaMap — это одностраничное веб-приложение (SPA) без фреймворков и зависимостей от сборщиков. Оно позволяет:

- **Отслеживать события** на интерактивной карте
- **Фильтровать** по типам, статусам и датам
- **Связывать** маркеры линиями для анализа зависимостей
- **Экспортировать / импортировать** данные (JSON, CSV)
- **Кастомизировать** категории и статусы под себя

---

## 🚀 Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone https://github.com/B4MBOLBI/AnaMap.git
cd AnaMap/front
```

### 2. Открыть в браузере

Откройте `front/index.html` в браузере.

> **Совет:** Для корректной работы без предупреждений `file://` запустите локальный сервер:
> ```bash
> python -m http.server 8000
> ```
> Затем откройте `http://localhost:8000/front/index.html`

### 3. Готово! 🎉

Приложение загружает mock-данные и сразу готово к работе.

---

## 📁 Структура проекта

```
front/
├── index.html                    # Главная страница
├── css/
│   ├── variables.css             # 🎨 Design tokens (CSS-переменные)
│   ├── base.css                  # Базовые стили, шапка, сайдбар
│   ├── sidebar.css               # Таймлайн, статистика, фильтры
│   ├── map.css                   # Карта, переключатели, связи
│   ├── leaflet.css               # Кастомизация Leaflet, маркеры
│   ├── modal.css                 # Модалки, формы, валидация
│   ├── tags.css                  # Система тегов
│   ├── panels.css                # Категории, список событий
│   └── scrollbar.css             # Кастомный скроллбар
└── js/
    ├── config.js                 # ⚙️ Конфигурация (API, константы, цвета)
    ├── state.js                  # 🧠 Централизованное состояние
    ├── app.js                    # 🏁 Точка входа
    ├── services/
    │   └── api.js                # Слой API (mock + real)
    ├── utils/
    │   ├── storage.js            # localStorage обёртка
    │   ├── helpers.js            # Вспомогательные функции
    │   └── export.js             # Экспорт/импорт/валидация
    ├── data/
    │   └── mock.js               # Тестовые данные
    ├── components/               # 🖼️ UI-компоненты
    │   ├── map.js                # Глобальное состояние карты
    │   ├── mapInit.js            # Инициализация Leaflet
    │   ├── mapRender.js          # Рендеринг маркеров
    │   ├── mapLabels.js          # Видимость лейблов
    │   ├── mapYearClusters.js    # Кластеры по годам
    │   ├── mapHeat.js            # Тепловая карта
    │   ├── mapNavigate.js        # Навигация по событиям
    │   ├── ui.js                 # Оркестратор UI
    │   ├── uiCount.js            # Счётчик событий
    │   ├── uiFilters.js          # Фильтры по типам
    │   ├── uiStatusFilter.js     # Фильтр по статусу
    │   ├── uiStatsTypes.js       # Статистика по типам
    │   ├── uiStatsStatus.js      # Статистика по статусам
    │   ├── uiTimeline.js         # Таймлайн
    │   ├── uiModal.js            # Модалка категорий
    │   ├── eventList.js          # Глобальное состояние списка
    │   ├── eventListRender.js    # Рендеринг списка
    │   ├── eventListActions.js   # Удаление, статус
    │   ├── eventListDetail.js    # Модалка деталей
    │   └── eventListStatuses.js  # Управление статусами
    └── handlers/                 # ⚡ Обработчики событий
        ├── validation.js         # Валидация формы
        ├── tags.js               # Система тегов
        ├── modal.js              # Модалка добавления
        ├── mapPick.js            # Выбор координат с карты
        ├── categories.js         # Управление категориями
        ├── statuses.js           # Обновление селекта статусов
        ├── eventCreate.js        # Создание события
        ├── events.js             # Оркестратор обработчиков
        └── mapLinks.js           # Связи между маркерами
```

---

## ⚙️ Конфигурация

Все настройки в одном месте — `js/config.js`:

| Раздел | Описание |
|--------|----------|
| `API_ENABLED` | Вкл/выкл API (true = реальный сервер, false = mock) |
| `BASE_URL` | URL API-сервера |
| `BASE_LAYERS` | Базовые типы событий (Личное, Пробки, Ремонт, Безопасность) |
| `STATUS_LABELS` | Метки статусов |
| `STATUS_COLORS` | Цвета статусов |
| `MAP.center` | Центр карты [широта, долгота] |
| `MAP.zoom` | Начальный зум |
| `REQUIRED_FIELDS` | Обязательные поля для валидации |

---

## 🗂️ Состояние (State)

Централизованное хранилище — `js/state.js`:

```javascript
State.events        // Массив всех событий
State.filters.types // Set активных типов
State.filters.status // Текущий статус (пусто = все)
State.filters.dateFrom // Фильтр даты "С"
State.filters.dateTo   // Фильтр даты "По"
State.viewMode      // 'types' | 'years'
```

**Методы:**

| Метод | Описание |
|-------|----------|
| `State.getFilteredEvents()` | Получить отфильтрованные события |
| `State.setFilterTypes(types)` | Установить типы |
| `State.setFilterDateFrom(date)` | Установить дату "С" |
| `State.setFilterDateTo(date)` | Установить дату "По" |
| `State.setViewMode(mode)` | Переключить режим |
| `State.setEvents(events)` | Загрузить события |

---

## 🎨 Дизайн-токены (CSS)

Все цвета, радиусы, тени управляются через CSS-переменные в `css/variables.css`:

```css
:root {
    --bg-body: #0a0b0e;          /* Фон страницы */
    --bg-surface: #0d0f14;       /* Фон панелей */
    --bg-card: #13151c;          /* Фон карточек */
    --text-primary: #e2e8f0;     /* Основной текст */
    --text-muted: #64748b;       /* Приглушённый текст */
    --accent-blue: #3b82f6;      /* Основной акцент */
    --accent-red: #ef4444;       /* Ошибка / удаление */
    --accent-green: #4ade80;     /* Статус онлайн */
    --border-default: #252932;   /* Границы */
    --radius-md: 8px;            /* Стандартный радиус */
}
```

> **Изменить тему** — достаточно переопределить переменные в `variables.css`.

---

## 📦 Хранение данных

Все данные сохраняются в `localStorage`:

| Ключ | Содержимое |
|------|-----------|
| `anemap_events` | Массив событий |
| `custom_event_categories` | Пользовательские категории |
| `custom_event_statuses` | Пользовательские статусы |
| `event_links` | Связи между маркерами |

---

## 🔌 API слой

`js/services/api.js` автоматически переключается между реальным сервером и mock-данными:

```
API_ENABLED = true  →  fetch → http://localhost:3000/api
API_ENABLED = false →  mock → localStorage
```

**Эндпоинты:**

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/events` | Все события |
| POST | `/api/events` | Добавить событие |
| DELETE | `/api/events/:id` | Удалить событие |
| GET | `/api/categories` | Категории |
| POST | `/api/categories` | Добавить категорию |
| DELETE | `/api/categories/:key` | Удалить категорию |
| GET | `/api/statuses` | Статусы |
| POST | `/api/statuses` | Сохранить статусы |
| DELETE | `/api/statuses/:key` | Удалить статус |

---

## 🗺️ Карта

### Режимы отображения

| Режим | Описание |
|-------|----------|
| **По типам** | Маркеры сгруппированы по категориям, статистика в сайдбаре |
| **По годам** | Кластеры-годы на карте, список скрыт |

### Функции

| Функция | Описание |
|---------|----------|
| `initMap()` | Инициализация карты Leaflet |
| `renderMap()` | Рендеринг маркеров с анимацией |
| `toggleHeatLayer()` | Вкл/выкл тепловую карту |
| `showEventOnMap(id)` | Навигация к событию |
| `renderYearClusters()` | Кластеры по годам |
| `enterLinkMode()` | Режим связей (линии между маркерами) |

---

## 📊 Фильтры

| Фильтр | Описание |
|--------|----------|
| **Типы** | Чипы-переключатели (Личное, Пробки, Ремонт, Безопасность) |
| **Статус** | Выпадающий список (Запланировано, В процессе, Завершено) |
| **Дата** | Диапазон "С" — "По" |
| **Очистить** | Сброс всех фильтров одной кнопкой |

---

## 🏷️ Теги

- Введите тег в поле и нажмите **Enter**
- Удалите тег кликом на **×**
- Максимум: **10 тегов** на событие
- Теги отображаются в списке событий и в деталях

---

## 📤 Экспорт / Импорт

### Экспорт

| Формат | Кнопка | Описание |
|--------|--------|----------|
| JSON | `JSON` | Полный дамп событий |
| CSV | `CSV` | Таблица для Excel |

### Импорт

- Нажмите **Import** и выберите `.json` файл
- События с существующим `id` обновляются
- Новые события добавляются
- Недействительные события пропускаются с сообщением об ошибке

### Валидация

Нажмите **Validate** для проверки всех событий:

- Обязательные поля: `id`, `description`, `lat`, `lng`, `type`, `status`, `date`
- Проверка диапазона координат (lat: -90..90, lng: -180..180)
- Проверка формата даты (YYYY-MM-DD)

---

## 🎛️ Кастомизация

### Категории

1. Нажмите **+ Категория**
2. Введите название и выберите цвет
3. Новая категория появится в фильтрах и селекте типов

### Статусы

1. Нажмите **+ Статус**
2. Введите название и выберите цвет
3. Новый статус появится в фильтрах и селекте статусов

---

## 🔗 Режим связей

1. Нажмите **🔗** в панели карты
2. Кликайте по маркерам для создания связей
3. Линия сохраняется в localStorage
4. Нажмите **Esc** для выхода из режима
5. Удалить связь — клик по линии → кнопка «Удалить связь»

---

## 🛠️ Технологии

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Vanilla JavaScript** | ES2020 | Вся логика приложения |
| **Leaflet** | 1.9.4 | Интерактивная карта |
| **Leaflet.markercluster** | 1.5.3 | Кластеризация маркеров |
| **Leaflet.heat** | 0.2.0 | Тепловая карта |
| **OpenStreetMap** | — | Тайлы карты |
| **CSS Variables** | — | Дизайн-токены |
| **localStorage** | — | Хранение данных |

---

## 📋 API Reference

### Тип события (Event)

```typescript
interface Event {
    id: string;           // Уникальный ID
    type: string;         // Тип (personal, traffic, roadwork, safety)
    status: string;       // Статус (planned, in_progress, completed)
    date: string;         // Дата (YYYY-MM-DD)
    description: string;  // Описание
    tags: string[];       // Теги
    lat: number;          // Широта
    lng: number;          // Долгота
    source: string;       // Источник
    district: string;     // Район
}
```

### Фильтр (Filter)

```typescript
interface Filters {
    types: Set<string>;    // Активные типы
    status: string;        // Текущий статус
    dateFrom: string;      // Дата "С"
    dateTo: string;        // Дата "По"
}
```

---

## 🧪 Запуск

### Локальный сервер (рекомендуется)

```bash
# Python
python -m http.server 8000

# Node.js
npx serve front

# PHP
php -S localhost:8000
```

Затем откройте `http://localhost:8000/front/index.html`

### Без сервера

Просто откройте `front/index.html` в браузере. Некоторые функции (API, CORS) могут не работать.

---

## 📝 Переменные состояния (Global)

| Переменная | Описание |
|------------|----------|
| `map` | Экземпляр L.map |
| `markersLayer` | L.markerClusterGroup |
| `linksLayer` | L.layerGroup для связей |
| `heatLayer` | L.heatLayer |
| `heatVisible` | Видимость тепловой карты |
| `linkMode` | Режим связей |
| `linkSelection` | Выбранные маркеры |
| `savedLinks` | Сохранённые связи |
| `mapPickMode` | Режим выбора координат |
| `mapPickMarker` | Маркер выбора |
| `currentDetailEventId` | ID события в деталях |
| `eventTags` | Теги текущего события |

---

## 🤝 Вклад

1. Форкните репозиторий
2. Создайте ветку (`feature/awesome-feature`)
3. Закоммитьте изменения (`git commit -m 'Add awesome feature'`)
4. Запушьте в ветку (`git push origin feature/awesome-feature`)
5. Откройте Pull Request

---

## 📄 License

MIT
