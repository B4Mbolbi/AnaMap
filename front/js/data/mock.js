/**
 * ==========================================
 * ТЕСТОВЫЕ ДАННЫЕ (MOCK)
 * ==========================================
 * 
 * Замените TEST_DATA на реальные данные с API.
 * 
 * ПРИМЕРА ДЛЯ ПОДСТАВКИ РЕАЛЬНЫХ ДАННЫХ:
 * ========================================
 * 
 * 1. Получите данные с API (например, через fetch):
 *    const realData = await fetch('/api/events').then(r => r.json());
 * 
 * 2. Замените TEST_DATA:
 *    const TEST_DATA = [ /* ваши данные из API *\/ ];
 * 
 * 3. Убедитесь, что каждый объект имеет поля:
 *    { id, type, status, date, description, tags, lat, lng, source, district }
 * 
 * 4. Поля tags, source, district могут быть undefined — они необязательны.
 * ==========================================
 */

const TEST_DATA = [
    {
        id: 'e1',
        type: 'traffic',
        status: 'in_progress',
        date: '2024-06-15',
        description: 'Затор на проспекте Мира',
        tags: ['дтп'],
        lat: 55.7558,
        lng: 37.6173,
        source: 'Яндекс',
        district: 'Центральный'
    },
    {
        id: 'e2',
        type: 'roadwork',
        status: 'in_progress',
        date: '2024-07-01',
        description: 'Ремонт асфальта',
        tags: ['асфальт'],
        lat: 55.7620,
        lng: 37.6090,
        source: 'Дептранс',
        district: 'Центральный'
    },
    {
        id: 'e3',
        type: 'safety',
        status: 'completed',
        date: '2024-05-20',
        description: 'Установка камер',
        tags: ['камеры'],
        lat: 55.7500,
        lng: 37.6300,
        source: 'МВД',
        district: 'Центральный'
    },
    {
        id: 'e4',
        type: 'personal',
        status: 'planned',
        date: '2024-08-10',
        description: 'Встреча у метро',
        tags: ['встреча'],
        lat: 55.7400,
        lng: 37.6100,
        source: 'Пользователь',
        district: 'Центральный'
    },
    {
        id: 'e5',
        type: 'traffic',
        status: 'completed',
        date: '2024-06-18',
        description: 'Пробка из-за переезда',
        tags: ['переезд'],
        lat: 55.7350,
        lng: 37.6250,
        source: 'Яндекс',
        district: 'Центральный'
    },
    {
        id: 'e6',
        type: 'roadwork',
        status: 'planned',
        date: '2024-09-01',
        description: 'Замена бордюра',
        tags: ['бордюр'],
        lat: 55.7600,
        lng: 37.6200,
        source: 'Дептранс',
        district: 'Центральный'
    },
    {
        id: 'e7',
        type: 'safety',
        status: 'in_progress',
        date: '2024-07-15',
        description: 'Ремонт светофора',
        tags: ['светофор'],
        lat: 55.7480,
        lng: 37.6150,
        source: 'МВД',
        district: 'Центральный'
    },
    {
        id: 'e8',
        type: 'personal',
        status: 'completed',
        date: '2024-04-10',
        description: 'Наблюдение',
        tags: ['наблюдение'],
        lat: 55.7520,
        lng: 37.6280,
        source: 'Пользователь',
        district: 'Центральный'
    }
];

/**
 * Имитация добавления события (mock)
 * @param {object} eventData - данные нового события
 * @returns {object} созданное событие
 */
function mockAddEvent(eventData) {
    return {
        id: 'e' + Date.now(),
        ...eventData,
        date: new Date().toISOString().substring(0, 10),
        source: eventData.source || 'Пользователь',
        district: eventData.district || 'Новый'
    };
}
