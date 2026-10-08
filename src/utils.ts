import { Project, ProjectType, ProjectStatus, DashboardStats } from './types';

const STORAGE_KEY = 'project-office-data';

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
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  critical: 'Критический',
};

export const TYPE_COLORS: Record<ProjectType, string> = {
  infrastructure: 'bg-blue-500',
  support: 'bg-amber-500',
  development: 'bg-emerald-500',
};

export const TYPE_BG_COLORS: Record<ProjectType, string> = {
  infrastructure: 'bg-blue-50 border-blue-200 text-blue-700',
  support: 'bg-amber-50 border-amber-200 text-amber-700',
  development: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  critical: 'bg-red-100 text-red-600',
};

const defaultProjects: Project[] = [
  {
    id: '1',
    name: 'Миграция ЦОД',
    type: 'infrastructure',
    status: 'active',
    priority: 'critical',
    description: 'Перенос серверной инфраструктуры в новый дата-центр с минимальным простоем',
    manager: 'Иванов А.С.',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    progress: 45,
    budget: 15000000,
    spent: 6750000,
    tasks: [
      { id: 't1', title: 'Аудит текущей инфраструктуры', completed: true },
      { id: 't2', title: 'Проектирование новой сети', completed: true },
      { id: 't3', title: 'Закупка оборудования', completed: true },
      { id: 't4', title: 'Монтаж серверных стоек', completed: false },
      { id: 't5', title: 'Миграция данных', completed: false },
      { id: 't6', title: 'Тестирование', completed: false },
    ],
    createdAt: '2025-01-10',
  },
  {
    id: '2',
    name: 'Обновление ERP-системы',
    type: 'development',
    status: 'active',
    priority: 'high',
    description: 'Модернизация модулей ERP для повышения производительности и добавления новых функций',
    manager: 'Петрова М.В.',
    startDate: '2025-02-01',
    endDate: '2025-09-15',
    progress: 30,
    budget: 8500000,
    spent: 2550000,
    tasks: [
      { id: 't7', title: 'Анализ требований', completed: true },
      { id: 't8', title: 'Разработка ТЗ', completed: true },
      { id: 't9', title: 'Разработка модуля отчётности', completed: false },
      { id: 't10', title: 'Интеграция с CRM', completed: false },
      { id: 't11', title: 'UAT тестирование', completed: false },
    ],
    createdAt: '2025-01-25',
  },
  {
    id: '3',
    name: 'Поддержка 1С:Предприятие',
    type: 'support',
    status: 'active',
    priority: 'medium',
    description: 'Техническая поддержка и сопровождение системы 1С:Предприятие 8.3',
    manager: 'Козлов Д.И.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    progress: 25,
    budget: 3600000,
    spent: 900000,
    tasks: [
      { id: 't12', title: 'Q1 — обновление конфигураций', completed: true },
      { id: 't13', title: 'Q2 — обновление конфигураций', completed: false },
      { id: 't14', title: 'Q3 — обновление конфигураций', completed: false },
      { id: 't15', title: 'Q4 — обновление конфигураций', completed: false },
    ],
    createdAt: '2024-12-20',
  },
  {
    id: '4',
    name: 'Внедрение системы мониторинга',
    type: 'infrastructure',
    status: 'planning',
    priority: 'high',
    description: 'Развёртывание комплексной системы мониторинга инфраструктуры (Zabbix + Grafana)',
    manager: 'Сидоров К.П.',
    startDate: '2025-04-01',
    endDate: '2025-08-31',
    progress: 5,
    budget: 4200000,
    spent: 210000,
    tasks: [
      { id: 't16', title: 'Выбор решений', completed: true },
      { id: 't17', title: 'Согласование бюджета', completed: false },
      { id: 't18', title: 'Установка и настройка', completed: false },
      { id: 't19', title: 'Настройка алертов', completed: false },
    ],
    createdAt: '2025-03-01',
  },
  {
    id: '5',
    name: 'Портал самообслуживания',
    type: 'development',
    status: 'completed',
    priority: 'medium',
    description: 'Разработка портала самообслуживания для сотрудников (заявки, справки, отпуска)',
    manager: 'Николаева Е.А.',
    startDate: '2024-06-01',
    endDate: '2025-01-31',
    progress: 100,
    budget: 5800000,
    spent: 5400000,
    tasks: [
      { id: 't20', title: 'Дизайн интерфейса', completed: true },
      { id: 't21', title: 'Backend разработка', completed: true },
      { id: 't22', title: 'Frontend разработка', completed: true },
      { id: 't23', title: 'Интеграция с AD', completed: true },
      { id: 't24', title: 'Промышленная эксплуатация', completed: true },
    ],
    createdAt: '2024-05-15',
  },
  {
    id: '6',
    name: 'Сопровождение сетевой инфраструктуры',
    type: 'support',
    status: 'active',
    priority: 'low',
    description: 'Регулярное обслуживание и мониторинг корпоративной сети',
    manager: 'Волков Р.Н.',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    progress: 20,
    budget: 2400000,
    spent: 480000,
    tasks: [
      { id: 't25', title: 'Плановое обслуживание Q1', completed: true },
      { id: 't26', title: 'Плановое обслуживание Q2', completed: false },
      { id: 't27', title: 'Плановое обслуживание Q3', completed: false },
      { id: 't28', title: 'Плановое обслуживание Q4', completed: false },
    ],
    createdAt: '2024-12-15',
  },
];

export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading projects:', e);
  }
  saveProjects(defaultProjects);
  return defaultProjects;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects:', e);
  }
}

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
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
