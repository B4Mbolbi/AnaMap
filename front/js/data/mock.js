/**
 * ==========================================
 * ТЕСТОВЫЕ ДАННЫЕ (MOCK)
 * ==========================================
 * 
 * Структура: массив проектов, каждый содержит
 * события, связи, метаданные.
 * Используется API при недоступности бэкенда.
 * ==========================================
 */

const TEST_DATA = [
    // ═══════════════════════════════════════════════════
    // ПРОЕКТ 1: Петропавловск-Камчатский — Центральный район
    // ═══════════════════════════════════════════════════
    {
        id: 'proj_1',
        name: 'Петропавловск-Камчатский',
        createdAt: '2024-01-15T10:00:00.000Z',
        description: 'Мониторинг городских событий и инфраструктуры',
        events: [
            // ── traffic ──────────────────────────────────────
            {
                id: 'e1',
                type: 'traffic',
                status: 'in_progress',
                date: '2024-06-15',
                description: 'Затор на проспекте Мира',
                tags: ['пробка', 'центр'],
                lat: 52.9495,
                lng: 158.6505,
                source: 'Яндекс.Пробки',
                district: 'Центральный',
                priority: 'high',
                severity: 4,
                comments: 'Движение затруднено в часы пик',
                images: []
            },
            {
                id: 'e2',
                type: 'traffic',
                status: 'in_progress',
                date: '2024-07-20',
                description: 'Пробка на ул. Океанской у ТЦ «Меридиан»',
                tags: ['пробка', 'торговый центр'],
                lat: 52.9472,
                lng: 158.6482,
                source: 'Яндекс.Пробки',
                district: 'Центральный',
                priority: 'medium',
                severity: 3,
                comments: 'Увеличенное движение из-за торгового центра',
                images: []
            },
            {
                id: 'e3',
                type: 'traffic',
                status: 'completed',
                date: '2024-08-10',
                description: 'Затор на ул. Нахимова из-за ДТП',
                tags: ['дтп', 'авария'],
                lat: 52.9458,
                lng: 158.6462,
                source: 'ДПС Камчатского края',
                district: 'Центральный',
                priority: 'high',
                severity: 5,
                comments: 'ДТП с участием 3 автомобилей, движение восстановлено',
                images: []
            },

            // ── roadwork ─────────────────────────────────────
            {
                id: 'e4',
                type: 'roadwork',
                status: 'in_progress',
                date: '2024-05-01',
                description: 'Ремонт дороги на ул. Ленинградской',
                tags: ['ремонт', 'асфальт'],
                lat: 52.9532,
                lng: 158.6518,
                source: 'Администрация ПК',
                district: 'Центральный',
                priority: 'medium',
                severity: 3,
                comments: 'Ямочный ремонт, срок до сентября',
                images: []
            },
            {
                id: 'e5',
                type: 'roadwork',
                status: 'planned',
                date: '2025-03-15',
                description: 'Замена водопровода на ул. Калинина',
                tags: ['коммуникации', 'водопровод'],
                lat: 52.9482,
                lng: 158.6548,
                source: 'Департамент ЖКХ',
                district: 'Центральный',
                priority: 'low',
                severity: 2,
                comments: 'Плановая замена труб, возможны перерывы воды',
                images: []
            },
            {
                id: 'e6',
                type: 'roadwork',
                status: 'in_progress',
                date: '2024-09-05',
                description: 'Ямы на ул. Пушкинской между 1 и 3 домами',
                tags: ['ямы', 'безопасность'],
                lat: 52.9442,
                lng: 158.6492,
                source: 'Жители',
                district: 'Центральный',
                priority: 'high',
                severity: 4,
                comments: 'Глубина ям до 10 см, риск повреждения авто',
                images: []
            },

            // ── safety ───────────────────────────────────────
            {
                id: 'e7',
                type: 'safety',
                status: 'in_progress',
                date: '2024-04-12',
                description: 'Отсутствие освещения на тротуаре у школы № 12',
                tags: ['освещение', 'безопасность', 'школа'],
                lat: 52.9512,
                lng: 158.6702,
                source: 'Родители учеников',
                district: 'Центральный',
                priority: 'critical',
                severity: 5,
                comments: 'Тёмный участок 200м, риск травматизма детей',
                images: []
            },
            {
                id: 'e8',
                type: 'safety',
                status: 'completed',
                date: '2024-02-28',
                description: 'Падает дерево на ул. Комарова',
                tags: ['деревья', 'ЧС'],
                lat: 52.9492,
                lng: 158.6582,
                source: 'МЧС Камчатского края',
                district: 'Центральный',
                priority: 'high',
                severity: 5,
                comments: 'Дерево срублено, участок очищен',
                images: []
            },

            // ── personal ─────────────────────────────────────
            {
                id: 'e9',
                type: 'personal',
                status: 'completed',
                date: '2024-10-01',
                description: 'Установлен новый пешеходный переход у парка',
                tags: ['инфраструктура', 'переход'],
                lat: 52.9462,
                lng: 158.6512,
                source: 'Пользователь',
                district: 'Центральный',
                priority: 'low',
                severity: 1,
                comments: 'Новый переход с разметкой и светофором',
                images: []
            },
            {
                id: 'e10',
                type: 'personal',
                status: 'planned',
                date: '2025-06-01',
                description: 'Планируемая остановка на ул. Океанской',
                tags: ['транспорт', 'остановка'],
                lat: 52.9477,
                lng: 158.6532,
                source: 'Пользователь',
                district: 'Центральный',
                priority: 'low',
                severity: 1,
                comments: 'Предложение жителям для маршрутов 3 и 7',
                images: []
            }
        ],
        links: [
            {
                id: 'l1',
                from: 'e1',
                to: 'e2',
                type: 'coincidence',
                comment: 'Обе пробки в центре города, связаны с высокой загруженностью маршрутов'
            },
            {
                id: 'l2',
                from: 'e3',
                to: 'e1',
                type: 'cause',
                comment: 'ДТП на Нахимова стало причиной пробки на пр. Мира'
            },
            {
                id: 'l3',
                from: 'e4',
                to: 'e6',
                type: 'effect',
                comment: 'Ремонт на Ленинградской привёл к ухудшению состояния Пушкинской'
            },
            {
                id: 'l4',
                from: 'e7',
                to: 'e8',
                type: 'coincidence',
                comment: 'Оба инцидента в районе школ — повышенный риск для детей'
            },
            {
                id: 'l5',
                from: 'e9',
                to: 'e10',
                type: 'cause',
                comment: 'Новый переход стимулирует предложение новой остановки'
            }
        ]
    },

    // ═══════════════════════════════════════════════════
    // ПРОЕКТ 2: Вулканы Камчатки — природные события
    // ═══════════════════════════════════════════════════
    {
        id: 'proj_2',
        name: 'Вулканы Камчатки',
        createdAt: '2024-03-01T08:00:00.000Z',
        description: 'Мониторинг вулканической активности и природных явлений',
        events: [
            {
                id: 'v1',
                type: 'safety',
                status: 'in_progress',
                date: '2024-11-01',
                description: 'Повышенная сейсмическая активность у Ключевской Сопки',
                tags: ['вулкан', 'сейсмика', 'ЧС'],
                lat: 56.09,
                lng: 160.66,
                source: 'Институт вулканологии',
                district: 'Ключевская группа',
                priority: 'critical',
                severity: 5,
                comments: 'Серия землетрясений магнитудой до 4.5',
                images: []
            },
            {
                id: 'v2',
                type: 'safety',
                status: 'planned',
                date: '2025-01-15',
                description: 'Планируемая эвакуация посёлка у Авачинского вулкана',
                tags: ['эвакуация', 'вулкан', 'план'],
                lat: 53.25,
                lng: 158.83,
                source: 'МЧС',
                district: 'Южно-Камчатский',
                priority: 'high',
                severity: 5,
                comments: 'Профилактическая мера при росте активности',
                images: []
            },
            {
                id: 'v3',
                type: 'personal',
                status: 'completed',
                date: '2024-07-20',
                description: 'Турмаршрут к вулкану Горелый',
                tags: ['туризм', 'вулкан'],
                lat: 54.02,
                lng: 159.43,
                source: 'Пользователь',
                district: 'Центральный',
                priority: 'low',
                severity: 1,
                comments: 'Успешный восхождение, погода отличная',
                images: []
            },
            {
                id: 'v4',
                type: 'traffic',
                status: 'completed',
                date: '2024-09-10',
                description: 'Закрытие трассы из-за паводка у вулкана Карымский',
                tags: ['дорога', 'паводок'],
                lat: 54.32,
                lng: 159.45,
                source: 'Дорожная служба',
                district: 'Камчатский район',
                priority: 'high',
                severity: 4,
                comments: 'Трасса восстановлена через 3 дня',
                images: []
            }
        ],
        links: [
            {
                id: 'vl1',
                from: 'v1',
                to: 'v2',
                type: 'cause',
                comment: 'Рост сейсмической активности привёл к планированию эвакуации'
            },
            {
                id: 'vl2',
                from: 'v1',
                to: 'v4',
                type: 'effect',
                comment: 'Сейсмическая активность вызвала паводок и закрытие трассы'
            }
        ]
    }
];

/**
 * Получить все события из всех проектов
 * @returns {Array} плоский массив событий
 */
function getAllMockEvents() {
    return TEST_DATA.flatMap(project => project.events || []);
}

/**
 * Получить все связи из всех проектов
 * @returns {Array} плоский массив связей
 */
function getAllMockLinks() {
    return TEST_DATA.flatMap(project => project.links || []);
}

/**
 * Имитация добавления события (mock)
 * @param {object} eventData - данные нового события
 * @returns {object} созданное событие
 */
function mockAddEvent(eventData) {
    return {
        id: 'e' + Date.now(),
        ...eventData,
        source: eventData.source || 'Пользователь',
        district: eventData.district || 'Новый',
        priority: eventData.priority || 'medium',
        severity: eventData.severity || 3,
        comments: eventData.comments || '',
        images: eventData.images || []
    };
}
