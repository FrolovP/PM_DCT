import {
  Project, ProjectType, ProjectStatus, DashboardStats, OfficeStats,
  Task, TaskStatus, TaskPriority, ProjectOffice, Portfolio, PortfolioType,
} from './types';

const OFFICES_KEY = 'project-offices';
const STORAGE_KEY = 'project-office-data';
const GKB_KEY = 'global-knowledge-base';

// ─── Labels ───
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  infrastructure: 'Инфраструктурные',
  support: 'Сопровождение',
  development: 'Проекты развития',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Планирование',
  active: 'В работе',
  paused: 'Приостановлен',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const PROJECT_PRIORITY_LABELS: Record<string, string> = {
  low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'К выполнению', in_progress: 'В работе', review: 'На проверке', done: 'Выполнено', blocked: 'Заблокировано',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-purple-100 text-purple-700', done: 'bg-green-100 text-green-700', blocked: 'bg-red-100 text-red-700',
};

export const PORTFOLIO_TYPE_LABELS: Record<PortfolioType, string> = {
  business: 'Бизнес-направление',
  architecture: 'Архитектура',
  strategic: 'Стратегический',
  operational: 'Операционный',
};

export const PORTFOLIO_TYPE_COLORS: Record<PortfolioType, string> = {
  business: 'bg-blue-100 text-blue-700 border-blue-200',
  architecture: 'bg-purple-100 text-purple-700 border-purple-200',
  strategic: 'bg-amber-100 text-amber-700 border-amber-200',
  operational: 'bg-teal-100 text-teal-700 border-teal-200',
};

export const DOC_CATEGORY_LABELS: Record<string, string> = {
  regulation: 'Регламент', specification: 'Спецификация', report: 'Отчёт', protocol: 'Протокол', other: 'Прочее',
};

export const ARTIFACT_TYPE_LABELS: Record<string, string> = {
  design: 'Проектирование', code: 'Код', test: 'Тестирование', deployment: 'Развёртывание', documentation: 'Документация', other: 'Прочее',
};

export const LINK_TYPE_LABELS: Record<string, string> = {
  dependency: 'Зависимость', related: 'Связанный', blocks: 'Блокирует', blocked_by: 'Блокируется', duplicate: 'Дубликат', parent_child: 'Родительский/Дочерний',
};

export const STRUCTURE_TYPE_LABELS: Record<string, string> = {
  phase: 'Фаза', milestone: 'Веха', work_package: 'Рабочий пакет', deliverable: 'Результат',
};

export const STRUCTURE_TYPE_COLORS: Record<string, string> = {
  phase: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  milestone: 'bg-amber-100 text-amber-700 border-amber-200',
  work_package: 'bg-blue-100 text-blue-700 border-blue-200',
  deliverable: 'bg-green-100 text-green-700 border-green-200',
};

export const TYPE_COLORS: Record<ProjectType, string> = {
  infrastructure: 'bg-blue-500', support: 'bg-amber-500', development: 'bg-emerald-500',
};

export const TYPE_BG_COLORS: Record<ProjectType, string> = {
  infrastructure: 'bg-blue-50 border-blue-200 text-blue-700',
  support: 'bg-amber-50 border-amber-200 text-amber-700',
  development: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-700', active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600', critical: 'bg-red-100 text-red-600',
};

// ─── Helpers ───
function makeTask(id: string, title: string, completed: boolean, status: TaskStatus, priority: TaskPriority = 'medium', assignee: string = ''): Task {
  return { id, title, description: '', status, priority, assignee, dueDate: '', completed, tags: [], subtasks: [], crossOfficeLinks: [] };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ─── Default Data ───
const defaultOffices: ProjectOffice[] = [
  {
    id: 'office-1',
    name: 'ИТ-дирекция',
    description: 'Основной проектный офис по управлению ИТ-проектами компании',
    color: '#4f46e5',
    icon: '💻',
    director: 'Иванов А.С.',
    createdAt: '2024-01-01',
    portfolios: [
      { id: 'port-1', name: 'Инфраструктура и ЦОД', description: 'Проекты по развитию ИТ-инфраструктуры', type: 'architecture', officeId: 'office-1', projectIds: ['1', '4'], createdAt: '2024-01-15', strategicGoal: 'Обеспечение отказоустойчивости ИТ-инфраструктуры' },
      { id: 'port-2', name: 'Корпоративные системы', description: 'Развитие корпоративных информационных систем', type: 'business', officeId: 'office-1', projectIds: ['2', '5'], createdAt: '2024-01-15', strategicGoal: 'Цифровая трансформация бизнес-процессов' },
      { id: 'port-3', name: 'Операционная поддержка', description: 'Проекты сопровождения и поддержки', type: 'operational', officeId: 'office-1', projectIds: ['3', '6'], createdAt: '2024-02-01', strategicGoal: 'Обеспечение непрерывности бизнес-операций' },
    ],
  },
  {
    id: 'office-2',
    name: 'Офис цифровой трансформации',
    description: 'Стратегические проекты цифровой трансформации бизнеса',
    color: '#059669',
    icon: '🚀',
    director: 'Петрова М.В.',
    createdAt: '2024-06-01',
    portfolios: [
      { id: 'port-4', name: 'Цифровые продукты', description: 'Разработка цифровых продуктов для клиентов', type: 'business', officeId: 'office-2', projectIds: [], createdAt: '2024-06-15', strategicGoal: 'Создание новых цифровых каналов взаимодействия' },
      { id: 'port-5', name: 'Данные и аналитика', description: 'Проекты по работе с данными', type: 'architecture', officeId: 'office-2', projectIds: [], createdAt: '2024-07-01', strategicGoal: 'Построение data-driven культуры' },
    ],
  },
  {
    id: 'office-3',
    name: 'Офис безопасности',
    description: 'Проекты в области информационной безопасности',
    color: '#dc2626',
    icon: '🛡️',
    director: 'Сидоров К.П.',
    createdAt: '2024-03-01',
    portfolios: [
      { id: 'port-6', name: 'Защита периметра', description: 'Проекты по защите сетевой инфраструктуры', type: 'architecture', officeId: 'office-3', projectIds: [], createdAt: '2024-03-15', strategicGoal: 'Обеспечение кибербезопасности' },
      { id: 'port-7', name: 'Соответствие требованиям', description: 'Проекты по compliance', type: 'strategic', officeId: 'office-3', projectIds: [], createdAt: '2024-04-01', strategicGoal: 'Соответствие регуляторным требованиям' },
    ],
  },
];

const defaultProjects: Project[] = [
  {
    id: '1', officeId: 'office-1', portfolioId: 'port-1',
    name: 'Миграция ЦОД', type: 'infrastructure', status: 'active', priority: 'critical',
    description: 'Перенос серверной инфраструктуры в новый дата-центр с минимальным простоем',
    manager: 'Иванов А.С.', startDate: '2025-01-15', endDate: '2025-06-30', progress: 45,
    budget: 15000000, spent: 6750000,
    tasks: [
      makeTask('t1', 'Аудит текущей инфраструктуры', true, 'done', 'high', 'Петров И.И.'),
      makeTask('t2', 'Проектирование новой сети', true, 'done', 'high', 'Сидоров К.П.'),
      makeTask('t3', 'Закупка оборудования', true, 'done', 'critical', 'Козлов Д.И.'),
      makeTask('t4', 'Монтаж серверных стоек', false, 'in_progress', 'high', 'Волков Р.Н.'),
      makeTask('t5', 'Миграция данных', false, 'todo', 'critical', 'Иванов А.С.'),
      makeTask('t6', 'Тестирование', false, 'todo', 'high', 'Петров И.И.'),
    ],
    documents: [
      { id: 'd1', title: 'Техническое задание на миграцию', category: 'specification', description: 'Основной документ проекта', author: 'Иванов А.С.', createdAt: '2025-01-10', updatedAt: '2025-02-15', version: '2.1', tags: ['ТЗ', 'миграция'], content: 'Документ описывает требования к миграции ЦОД...' },
      { id: 'd2', title: 'Протокол совещания от 15.02', category: 'protocol', description: 'Результаты совещания', author: 'Петров И.И.', createdAt: '2025-02-15', updatedAt: '2025-02-15', version: '1.0', tags: ['протокол'], content: 'Присутствовали: Иванов А.С., Петров И.И...' },
    ],
    artifacts: [
      { id: 'a1', title: 'Схема новой сети', type: 'design', description: 'Архитектурная схема нового ЦОД', author: 'Сидоров К.П.', createdAt: '2025-02-01', version: '1.2', tags: ['архитектура', 'сеть'], relatedTasks: ['t2'] },
      { id: 'a2', title: 'Акт аудита', type: 'documentation', description: 'Результаты аудита', author: 'Петров И.И.', createdAt: '2025-01-20', version: '1.0', tags: ['аудит'], relatedTasks: ['t1'] },
    ],
    structure: [
      { id: 's1', title: 'Фаза 1: Подготовка', type: 'phase', progress: 100, startDate: '2025-01-15', endDate: '2025-02-28', children: [
        { id: 's1-1', title: 'Аудит инфраструктуры', type: 'work_package', progress: 100, startDate: '2025-01-15', endDate: '2025-01-31', children: [] },
        { id: 's1-2', title: 'Проектирование', type: 'work_package', progress: 100, startDate: '2025-02-01', endDate: '2025-02-28', children: [] },
      ]},
      { id: 's2', title: 'Фаза 2: Реализация', type: 'phase', progress: 30, startDate: '2025-03-01', endDate: '2025-05-31', children: [
        { id: 's2-1', title: 'Закупка оборудования', type: 'work_package', progress: 100, startDate: '2025-03-01', endDate: '2025-03-31', children: [] },
        { id: 's2-2', title: 'Монтаж', type: 'work_package', progress: 40, startDate: '2025-04-01', endDate: '2025-04-30', children: [] },
        { id: 's2-3', title: 'Миграция данных', type: 'work_package', progress: 0, startDate: '2025-05-01', endDate: '2025-05-31', children: [] },
      ]},
      { id: 's3', title: 'Фаза 3: Тестирование', type: 'phase', progress: 0, startDate: '2025-06-01', endDate: '2025-06-30', children: [
        { id: 's3-1', title: 'Приёмочные испытания', type: 'deliverable', progress: 0, startDate: '2025-06-01', endDate: '2025-06-30', children: [] },
      ]},
    ],
    links: [
      { id: 'l1', targetProjectId: '4', targetProjectName: 'Внедрение системы мониторинга', targetOfficeId: 'office-1', targetOfficeName: 'ИТ-дирекция', linkType: 'dependency', description: 'Мониторинг необходим после миграции' },
    ],
    knowledgeBase: [
      { id: 'kb1', title: 'Порядок миграции серверов', content: '1. Создать резервную копию\n2. Отключить сервисы\n3. Перенести оборудование\n4. Подключить и настроить\n5. Проверить работоспособность', category: 'Инструкции', tags: ['миграция', 'серверы'], author: 'Иванов А.С.', createdAt: '2025-01-20', updatedAt: '2025-02-10', access: 'public', relatedProjects: ['1'] },
    ],
    createdAt: '2025-01-10',
  },
  {
    id: '2', officeId: 'office-1', portfolioId: 'port-2',
    name: 'Обновление ERP-системы', type: 'development', status: 'active', priority: 'high',
    description: 'Модернизация модулей ERP для повышения производительности',
    manager: 'Петрова М.В.', startDate: '2025-02-01', endDate: '2025-09-15', progress: 30,
    budget: 8500000, spent: 2550000,
    tasks: [
      makeTask('t7', 'Анализ требований', true, 'done', 'high', 'Петрова М.В.'),
      makeTask('t8', 'Разработка ТЗ', true, 'done', 'high', 'Николаева Е.А.'),
      makeTask('t9', 'Разработка модуля отчётности', false, 'in_progress', 'high', 'Козлов Д.И.'),
      makeTask('t10', 'Интеграция с CRM', false, 'todo', 'medium', 'Волков Р.Н.'),
      makeTask('t11', 'UAT тестирование', false, 'todo', 'high', 'Петрова М.В.'),
    ],
    documents: [
      { id: 'd3', title: 'Бизнес-требования ERP', category: 'specification', description: 'Сбор бизнес-требований', author: 'Петрова М.В.', createdAt: '2025-02-05', updatedAt: '2025-03-01', version: '1.3', tags: ['ERP', 'требования'], content: 'Бизнес-требования к обновлению ERP...' },
    ],
    artifacts: [
      { id: 'a3', title: 'Макеты интерфейса', type: 'design', description: 'UI/UX макеты нового модуля', author: 'Николаева Е.А.', createdAt: '2025-02-20', version: '2.0', tags: ['дизайн', 'UI'], relatedTasks: ['t9'] },
    ],
    structure: [
      { id: 's4', title: 'Аналитика', type: 'phase', progress: 100, startDate: '2025-02-01', endDate: '2025-03-15', children: [
        { id: 's4-1', title: 'Сбор требований', type: 'work_package', progress: 100, startDate: '2025-02-01', endDate: '2025-02-28', children: [] },
        { id: 's4-2', title: 'ТЗ', type: 'deliverable', progress: 100, startDate: '2025-03-01', endDate: '2025-03-15', children: [] },
      ]},
      { id: 's5', title: 'Разработка', type: 'phase', progress: 20, startDate: '2025-03-16', endDate: '2025-07-31', children: [
        { id: 's5-1', title: 'Модуль отчётности', type: 'work_package', progress: 40, startDate: '2025-03-16', endDate: '2025-05-31', children: [] },
        { id: 's5-2', title: 'Интеграция CRM', type: 'work_package', progress: 0, startDate: '2025-06-01', endDate: '2025-07-31', children: [] },
      ]},
    ],
    links: [
      { id: 'l2', targetProjectId: '5', targetProjectName: 'Портал самообслуживания', targetOfficeId: 'office-1', targetOfficeName: 'ИТ-дирекция', linkType: 'related', description: 'Использует API портала' },
    ],
    knowledgeBase: [
      { id: 'kb2', title: 'Архитектура ERP', content: 'Система построена на микросервисной архитектуре. Основные модули: финансы, HR, склад, CRM.', category: 'Архитектура', tags: ['ERP', 'архитектура'], author: 'Петрова М.В.', createdAt: '2025-02-15', updatedAt: '2025-03-01', access: 'restricted', relatedProjects: ['2'] },
    ],
    createdAt: '2025-01-25',
  },
  {
    id: '3', officeId: 'office-1', portfolioId: 'port-3',
    name: 'Поддержка 1С:Предприятие', type: 'support', status: 'active', priority: 'medium',
    description: 'Техническая поддержка и сопровождение системы 1С:Предприятие 8.3',
    manager: 'Козлов Д.И.', startDate: '2025-01-01', endDate: '2025-12-31', progress: 25,
    budget: 3600000, spent: 900000,
    tasks: [
      makeTask('t12', 'Q1 — обновление конфигураций', true, 'done', 'medium', 'Козлов Д.И.'),
      makeTask('t13', 'Q2 — обновление конфигураций', false, 'todo', 'medium', 'Козлов Д.И.'),
      makeTask('t14', 'Q3 — обновление конфигураций', false, 'todo', 'medium', 'Козлов Д.И.'),
      makeTask('t15', 'Q4 — обновление конфигураций', false, 'todo', 'medium', 'Козлов Д.И.'),
    ],
    documents: [
      { id: 'd4', title: 'Регламент поддержки 1С', category: 'regulation', description: 'Порядок оказания поддержки', author: 'Козлов Д.И.', createdAt: '2025-01-05', updatedAt: '2025-01-05', version: '1.0', tags: ['1С', 'регламент'], content: 'Регламент описывает SLA и порядок...' },
    ],
    artifacts: [], structure: [
      { id: 's6', title: 'Q1 2025', type: 'milestone', progress: 100, startDate: '2025-01-01', endDate: '2025-03-31', children: [] },
      { id: 's7', title: 'Q2 2025', type: 'milestone', progress: 0, startDate: '2025-04-01', endDate: '2025-06-30', children: [] },
      { id: 's8', title: 'Q3 2025', type: 'milestone', progress: 0, startDate: '2025-07-01', endDate: '2025-09-30', children: [] },
      { id: 's9', title: 'Q4 2025', type: 'milestone', progress: 0, startDate: '2025-10-01', endDate: '2025-12-31', children: [] },
    ],
    links: [], knowledgeBase: [], createdAt: '2024-12-20',
  },
  {
    id: '4', officeId: 'office-1', portfolioId: 'port-1',
    name: 'Внедрение системы мониторинга', type: 'infrastructure', status: 'planning', priority: 'high',
    description: 'Развёртывание комплексной системы мониторинга (Zabbix + Grafana)',
    manager: 'Сидоров К.П.', startDate: '2025-04-01', endDate: '2025-08-31', progress: 5,
    budget: 4200000, spent: 210000,
    tasks: [
      makeTask('t16', 'Выбор решений', true, 'done', 'high', 'Сидоров К.П.'),
      makeTask('t17', 'Согласование бюджета', false, 'in_progress', 'critical', 'Сидоров К.П.'),
      makeTask('t18', 'Установка и настройка', false, 'todo', 'high', 'Волков Р.Н.'),
      makeTask('t19', 'Настройка алертов', false, 'todo', 'medium', 'Петров И.И.'),
    ],
    documents: [], artifacts: [],
    structure: [
      { id: 's10', title: 'Подготовка', type: 'phase', progress: 50, startDate: '2025-04-01', endDate: '2025-05-15', children: [] },
      { id: 's11', title: 'Развёртывание', type: 'phase', progress: 0, startDate: '2025-05-16', endDate: '2025-07-31', children: [] },
      { id: 's12', title: 'Ввод в эксплуатацию', type: 'milestone', progress: 0, startDate: '2025-08-01', endDate: '2025-08-31', children: [] },
    ],
    links: [
      { id: 'l3', targetProjectId: '1', targetProjectName: 'Миграция ЦОД', targetOfficeId: 'office-1', targetOfficeName: 'ИТ-дирекция', linkType: 'blocked_by', description: 'Зависит от завершения миграции' },
    ],
    knowledgeBase: [], createdAt: '2025-03-01',
  },
  {
    id: '5', officeId: 'office-1', portfolioId: 'port-2',
    name: 'Портал самообслуживания', type: 'development', status: 'completed', priority: 'medium',
    description: 'Разработка портала самообслуживания для сотрудников',
    manager: 'Николаева Е.А.', startDate: '2024-06-01', endDate: '2025-01-31', progress: 100,
    budget: 5800000, spent: 5400000,
    tasks: [
      makeTask('t20', 'Дизайн интерфейса', true, 'done', 'medium', 'Николаева Е.А.'),
      makeTask('t21', 'Backend разработка', true, 'done', 'high', 'Козлов Д.И.'),
      makeTask('t22', 'Frontend разработка', true, 'done', 'high', 'Волков Р.Н.'),
      makeTask('t23', 'Интеграция с AD', true, 'done', 'high', 'Петров И.И.'),
      makeTask('t24', 'Промышленная эксплуатация', true, 'done', 'medium', 'Николаева Е.А.'),
    ],
    documents: [
      { id: 'd5', title: 'Руководство пользователя', category: 'other', description: 'Инструкция для пользователей портала', author: 'Николаева Е.А.', createdAt: '2025-01-20', updatedAt: '2025-01-25', version: '1.0', tags: ['руководство', 'портал'], content: 'Руководство по использованию портала...' },
    ],
    artifacts: [
      { id: 'a4', title: 'Исходный код портала', type: 'code', description: 'Репозиторий проекта', author: 'Козлов Д.И.', createdAt: '2024-06-15', version: '3.2.1', tags: ['код', 'git'], relatedTasks: ['t21'] },
      { id: 'a5', title: 'Отчёт о тестировании', type: 'test', description: 'Результаты QA', author: 'Петров И.И.', createdAt: '2025-01-10', version: '1.0', tags: ['тестирование', 'QA'], relatedTasks: ['t24'] },
    ],
    structure: [{ id: 's13', title: 'Завершён', type: 'milestone', progress: 100, startDate: '2024-06-01', endDate: '2025-01-31', children: [] }],
    links: [
      { id: 'l4', targetProjectId: '2', targetProjectName: 'Обновление ERP-системы', targetOfficeId: 'office-1', targetOfficeName: 'ИТ-дирекция', linkType: 'related', description: 'Предоставляет API для ERP' },
    ],
    knowledgeBase: [
      { id: 'kb3', title: 'API портала самообслуживания', content: 'REST API v2. Авторизация через OAuth2. Основные эндпоинты: /api/requests, /api/documents, /api/vacations', category: 'API', tags: ['API', 'REST', 'портал'], author: 'Козлов Д.И.', createdAt: '2025-01-15', updatedAt: '2025-01-20', access: 'public', relatedProjects: ['5', '2'] },
    ],
    createdAt: '2024-05-15',
  },
  {
    id: '6', officeId: 'office-1', portfolioId: 'port-3',
    name: 'Сопровождение сетевой инфраструктуры', type: 'support', status: 'active', priority: 'low',
    description: 'Регулярное обслуживание и мониторинг корпоративной сети',
    manager: 'Волков Р.Н.', startDate: '2025-01-01', endDate: '2025-12-31', progress: 20,
    budget: 2400000, spent: 480000,
    tasks: [
      makeTask('t25', 'Плановое обслуживание Q1', true, 'done', 'low', 'Волков Р.Н.'),
      makeTask('t26', 'Плановое обслуживание Q2', false, 'todo', 'low', 'Волков Р.Н.'),
      makeTask('t27', 'Плановое обслуживание Q3', false, 'todo', 'low', 'Волков Р.Н.'),
      makeTask('t28', 'Плановое обслуживание Q4', false, 'todo', 'low', 'Волков Р.Н.'),
    ],
    documents: [], artifacts: [],
    structure: [
      { id: 's14', title: 'Q1', type: 'milestone', progress: 100, startDate: '2025-01-01', endDate: '2025-03-31', children: [] },
      { id: 's15', title: 'Q2', type: 'milestone', progress: 0, startDate: '2025-04-01', endDate: '2025-06-30', children: [] },
      { id: 's16', title: 'Q3', type: 'milestone', progress: 0, startDate: '2025-07-01', endDate: '2025-09-30', children: [] },
      { id: 's17', title: 'Q4', type: 'milestone', progress: 0, startDate: '2025-10-01', endDate: '2025-12-31', children: [] },
    ],
    links: [], knowledgeBase: [], createdAt: '2024-12-15',
  },
];

const defaultGlobalKB = [
  { id: 'gkb1', title: 'Стандарт оформления проектной документации', content: 'Все проекты должны следовать единому стандарту:\n1. Титульный лист по шаблону\n2. Структура: Введение, Описание, Требования, Приложение\n3. Шрифт: Arial 12pt\n4. Нумерация страниц обязательна', category: 'Стандарты', tags: ['документация', 'стандарт', 'шаблон'], author: 'Проектный офис', createdAt: '2024-01-01', updatedAt: '2025-01-15', access: 'public' as const, relatedProjects: [] },
  { id: 'gkb2', title: 'Методология управления проектами', content: 'В проектном офисе используется гибридная методология:\n- Инфраструктурные проекты — Waterfall\n- Проекты развития — Agile/Scrum\n- Сопровождение — ITIL\n\nВсе проекты проходят через этапы: Инициация → Планирование → Реализация → Завершение', category: 'Методология', tags: ['методология', 'управление', 'процессы'], author: 'Проектный офис', createdAt: '2024-01-01', updatedAt: '2025-02-01', access: 'public' as const, relatedProjects: [] },
  { id: 'gkb3', title: 'Порядок согласования изменений', content: 'Изменения в проекте согласуются через CCB (Change Control Board):\n1. Подача заявки на изменение\n2. Оценка влияния на сроки/бюджет\n3. Рассмотрение на CCB (еженедельно)\n4. Утверждение/отклонение\n5. Обновление плана проекта', category: 'Процессы', tags: ['изменения', 'CCB', 'процесс'], author: 'Проектный офис', createdAt: '2024-06-01', updatedAt: '2024-12-01', access: 'public' as const, relatedProjects: [] },
  { id: 'gkb4', title: 'Lessons Learned: Миграция ЦОД 2022', content: 'Ключевые уроки:\n- Всегда иметь план отката\n- Резервное копирование перед миграцией обязательно\n- Выделять буфер 20% на непредвиденные работы\n- Коммуникация с бизнесом — критический фактор успеха', category: 'Опыт', tags: ['lessons learned', 'миграция', 'опыт'], author: 'Иванов А.С.', createdAt: '2024-03-15', updatedAt: '2024-03-15', access: 'public' as const, relatedProjects: ['1'] },
  { id: 'gkb5', title: 'Матрица компетенций команды', content: 'Распределение компетенций:\n- Инфраструктура: Иванов А.С., Сидоров К.П., Волков Р.Н.\n- Разработка: Петрова М.В., Козлов Д.И., Николаева Е.А.\n- Тестирование: Петров И.И.\n- Управление: Проектный офис', category: 'Команда', tags: ['компетенции', 'команда', 'ресурсы'], author: 'Проектный офис', createdAt: '2024-01-15', updatedAt: '2025-01-10', access: 'restricted' as const, relatedProjects: [] },
];

// ─── Storage ───
export function loadOffices(): ProjectOffice[] {
  try {
    const data = localStorage.getItem(OFFICES_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { console.error(e); }
  saveOffices(defaultOffices);
  return defaultOffices;
}

export function saveOffices(offices: ProjectOffice[]): void {
  try { localStorage.setItem(OFFICES_KEY, JSON.stringify(offices)); } catch (e) { console.error(e); }
}

export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { console.error(e); }
  saveProjects(defaultProjects);
  return defaultProjects;
}

export function saveProjects(projects: Project[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch (e) { console.error(e); }
}

export function loadGlobalKB() {
  try {
    const data = localStorage.getItem(GKB_KEY);
    if (data) return JSON.parse(data);
  } catch (e) { console.error(e); }
  localStorage.setItem(GKB_KEY, JSON.stringify(defaultGlobalKB));
  return defaultGlobalKB;
}

export function saveGlobalKB(entries: any[]): void {
  try { localStorage.setItem(GKB_KEY, JSON.stringify(entries)); } catch (e) { console.error(e); }
}

// ─── Stats ───
export function getDashboardStats(projects: Project[]): DashboardStats {
  return {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    byType: {
      infrastructure: projects.filter(p => p.type === 'infrastructure').length,
      support: projects.filter(p => p.type === 'support').length,
      development: projects.filter(p => p.type === 'development').length,
    },
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
    totalSpent: projects.reduce((s, p) => s + p.spent, 0),
  };
}

export function getOfficeStats(office: ProjectOffice, projects: Project[]): OfficeStats {
  const officeProjects = projects.filter(p => p.officeId === office.id);
  let crossLinks = 0;
  officeProjects.forEach(p => {
    p.links.forEach(l => { if (l.targetOfficeId !== office.id) crossLinks++; });
    p.tasks.forEach(t => { crossLinks += (t.crossOfficeLinks?.length || 0); });
  });
  return {
    totalProjects: officeProjects.length,
    activeProjects: officeProjects.filter(p => p.status === 'active').length,
    totalPortfolios: office.portfolios.length,
    totalBudget: officeProjects.reduce((s, p) => s + p.budget, 0),
    totalSpent: officeProjects.reduce((s, p) => s + p.spent, 0),
    crossOfficeLinks: crossLinks,
  };
}
