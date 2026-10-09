-- ============================================
-- Начальные данные для платформы проектных офисов
-- ============================================

USE project_office_db;

-- Создание администратора
-- Пароль: admin123 (bcrypt hash)
INSERT INTO users (id, login, password_hash, name, email, role, is_active, created_at) VALUES
('user-admin-001', 'admin', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Системный администратор', 'admin@company.ru', 'admin', TRUE, NOW());

-- Создание директоров офисов
INSERT INTO users (id, login, password_hash, name, email, role, office_id, is_active, created_at) VALUES
('user-director-001', 'director1', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Иванов Иван Иванович', 'director1@company.ru', 'office_director', 'office-001', TRUE, NOW()),
('user-director-002', 'director2', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Петров Петр Петрович', 'director2@company.ru', 'office_director', 'office-002', TRUE, NOW());

-- Создание руководителей проектов
INSERT INTO users (id, login, password_hash, name, email, role, office_id, is_active, created_at) VALUES
('user-pm-001', 'pm1', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Сидоров Сидор Сидорович', 'pm1@company.ru', 'project_manager', 'office-001', TRUE, NOW()),
('user-pm-002', 'pm2', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Кузнецов Кузьма Кузьмич', 'pm2@company.ru', 'project_manager', 'office-002', TRUE, NOW());

-- Создание участников команды
INSERT INTO users (id, login, password_hash, name, email, role, office_id, is_active, created_at) VALUES
('user-member-001', 'member1', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Попов Павел Павлович', 'member1@company.ru', 'team_member', 'office-001', TRUE, NOW()),
('user-member-002', 'member2', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Волков Виктор Викторович', 'member2@company.ru', 'team_member', 'office-001', TRUE, NOW());

-- Создание наблюдателей
INSERT INTO users (id, login, password_hash, name, email, role, is_active, created_at) VALUES
('user-viewer-001', 'viewer1', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Соколов Сергей Сергеевич', 'viewer1@company.ru', 'viewer', TRUE, NOW()),
('user-viewer-002', 'viewer2', '$2b$10$rKvZx8Jx5Z5Z5Z5Z5Z5Z5OxKxKxKxKxKxKxKxKxKxKxKxKxKx', 'Лебедев Леонид Леонидович', 'viewer2@company.ru', 'viewer', TRUE, NOW());

-- Создание проектных офисов
INSERT INTO project_offices (id, name, description, color, icon, director, created_at) VALUES
('office-001', 'ИТ-дирекция', 'Основной проектный офис по управлению ИТ-проектами', '#4f46e5', '💻', 'Иванов Иван Иванович', NOW()),
('office-002', 'Офис цифровой трансформации', 'Стратегические проекты цифровой трансформации', '#059669', '🚀', 'Петров Петр Петрович', NOW()),
('office-003', 'Офис безопасности', 'Проекты в области информационной безопасности', '#dc2626', '🛡️', 'Сидоров Сидор Сидорович', NOW());

-- Создание портфелей проектов
INSERT INTO portfolios (id, name, description, type, office_id, strategic_goal, created_at) VALUES
('portfolio-001', 'Инфраструктура и ЦОД', 'Проекты по развитию ИТ-инфраструктуры', 'architecture', 'office-001', 'Обеспечение отказоустойчивости ИТ-инфраструктуры', NOW()),
('portfolio-002', 'Корпоративные системы', 'Развитие корпоративных информационных систем', 'business', 'office-001', 'Цифровая трансформация бизнес-процессов', NOW()),
('portfolio-003', 'Операционная поддержка', 'Проекты сопровождения и поддержки', 'operational', 'office-001', 'Обеспечение непрерывности бизнес-операций', NOW()),
('portfolio-004', 'Цифровые продукты', 'Разработка цифровых продуктов для клиентов', 'business', 'office-002', 'Создание новых цифровых каналов взаимодействия', NOW()),
('portfolio-005', 'Данные и аналитика', 'Проекты по работе с данными', 'architecture', 'office-002', 'Построение data-driven культуры', NOW()),
('portfolio-006', 'Защита периметра', 'Проекты по защите сетевой инфраструктуры', 'architecture', 'office-003', 'Обеспечение кибербезопасности', NOW()),
('portfolio-007', 'Соответствие требованиям', 'Проекты по compliance', 'strategic', 'office-003', 'Соответствие регуляторным требованиям', NOW());

-- Создание примеров проектов
INSERT INTO projects (id, office_id, portfolio_id, name, type, status, priority, description, manager, start_date, end_date, progress, budget, spent, created_at) VALUES
('project-001', 'office-001', 'portfolio-001', 'Миграция ЦОД', 'infrastructure', 'active', 'critical', 'Перенос серверной инфраструктуры в новый дата-центр с минимальным простоем', 'Иванов Иван Иванович', '2025-01-15', '2025-06-30', 45, 15000000.00, 6750000.00, NOW()),
('project-002', 'office-001', 'portfolio-002', 'Обновление ERP-системы', 'development', 'active', 'high', 'Модернизация модулей ERP для повышения производительности', 'Петров Петр Петрович', '2025-02-01', '2025-09-15', 30, 8500000.00, 2550000.00, NOW()),
('project-003', 'office-001', 'portfolio-003', 'Поддержка 1С:Предприятие', 'support', 'active', 'medium', 'Техническая поддержка и сопровождение системы 1С:Предприятие 8.3', 'Сидоров Сидор Сидорович', '2025-01-01', '2025-12-31', 25, 3600000.00, 900000.00, NOW()),
('project-004', 'office-001', 'portfolio-001', 'Внедрение системы мониторинга', 'infrastructure', 'planning', 'high', 'Развёртывание комплексной системы мониторинга инфраструктуры', 'Кузнецов Кузьма Кузьмич', '2025-04-01', '2025-08-31', 5, 4200000.00, 210000.00, NOW()),
('project-005', 'office-001', 'portfolio-002', 'Портал самообслуживания', 'development', 'completed', 'medium', 'Разработка портала самообслуживания для сотрудников', 'Попов Павел Павлович', '2024-06-01', '2025-01-31', 100, 5800000.00, 5400000.00, NOW()),
('project-006', 'office-001', 'portfolio-003', 'Сопровождение сетевой инфраструктуры', 'support', 'active', 'low', 'Регулярное обслуживание и мониторинг корпоративной сети', 'Волков Виктор Викторович', '2025-01-01', '2025-12-31', 20, 2400000.00, 480000.00, NOW());

-- Создание примеров задач
INSERT INTO tasks (id, project_id, title, description, status, priority, assignee, due_date, completed, created_at) VALUES
('task-001', 'project-001', 'Аудит текущей инфраструктуры', 'Провести полный аудит существующей ИТ-инфраструктуры', 'done', 'high', 'Петров Иван Петрович', '2025-01-31', TRUE, NOW()),
('task-002', 'project-001', 'Проектирование новой сети', 'Разработать архитектуру новой сетевой инфраструктуры', 'done', 'high', 'Сидоров Сидор Сидорович', '2025-02-28', TRUE, NOW()),
('task-003', 'project-001', 'Закупка оборудования', 'Закупить серверное и сетевое оборудование', 'done', 'critical', 'Кузнецов Кузьма Кузьмич', '2025-03-31', TRUE, NOW()),
('task-004', 'project-001', 'Монтаж серверных стоек', 'Установить и подключить серверные стойки', 'in_progress', 'high', 'Волков Виктор Викторович', '2025-04-30', FALSE, NOW()),
('task-005', 'project-001', 'Миграция данных', 'Перенести данные в новый ЦОД', 'todo', 'critical', 'Иванов Иван Иванович', '2025-05-31', FALSE, NOW()),
('task-006', 'project-001', 'Тестирование', 'Провести полное тестирование новой инфраструктуры', 'todo', 'high', 'Петров Иван Петрович', '2025-06-30', FALSE, NOW()),
('task-007', 'project-002', 'Анализ требований', 'Собрать и проанализировать бизнес-требования', 'done', 'high', 'Петров Петр Петрович', '2025-02-28', TRUE, NOW()),
('task-008', 'project-002', 'Разработка ТЗ', 'Подготовить техническое задание', 'done', 'high', 'Попов Павел Павлович', '2025-03-15', TRUE, NOW()),
('task-009', 'project-002', 'Разработка модуля отчётности', 'Реализовать новый модуль отчётности', 'in_progress', 'high', 'Кузнецов Кузьма Кузьмич', '2025-05-31', FALSE, NOW()),
('task-010', 'project-002', 'Интеграция с CRM', 'Интегрировать ERP с CRM системой', 'todo', 'medium', 'Волков Виктор Викторович', '2025-07-31', FALSE, NOW());

-- Создание примеров документов
INSERT INTO documents (id, project_id, title, category, description, author, version, content, created_at, updated_at) VALUES
('doc-001', 'project-001', 'Техническое задание на миграцию', 'specification', 'Основной документ проекта миграции ЦОД', 'Иванов Иван Иванович', '2.1', 'Документ описывает требования к миграции ЦОД...', NOW(), NOW()),
('doc-002', 'project-001', 'Протокол совещания от 15.02', 'protocol', 'Результаты совещания по проекту', 'Петров Иван Петрович', '1.0', 'Присутствовали: Иванов А.С., Петров И.И...', NOW(), NOW()),
('doc-003', 'project-002', 'Бизнес-требования ERP', 'specification', 'Сбор бизнес-требований', 'Петров Петр Петрович', '1.3', 'Бизнес-требования к обновлению ERP...', NOW(), NOW()),
('doc-004', 'project-003', 'Регламент поддержки 1С', 'regulation', 'Порядок оказания поддержки', 'Сидоров Сидор Сидорович', '1.0', 'Регламент описывает SLA и порядок...', NOW(), NOW());

-- Создание примеров артефактов
INSERT INTO artifacts (id, project_id, title, type, description, author, version, created_at) VALUES
('artifact-001', 'project-001', 'Схема новой сети', 'design', 'Архитектурная схема нового ЦОД', 'Сидоров Сидор Сидорович', '1.2', NOW()),
('artifact-002', 'project-001', 'Акт аудита', 'documentation', 'Результаты аудита текущей инфраструктуры', 'Петров Иван Петрович', '1.0', NOW()),
('artifact-003', 'project-002', 'Макеты интерфейса', 'design', 'UI/UX макеты нового модуля', 'Попов Павел Павлович', '2.0', NOW()),
('artifact-004', 'project-005', 'Исходный код портала', 'code', 'Репозиторий проекта', 'Кузнецов Кузьма Кузьмич', '3.2.1', NOW());

-- Создание примеров записей базы знаний
INSERT INTO knowledge_base (id, project_id, title, content, category, author, access, created_at, updated_at) VALUES
('kb-001', 'project-001', 'Порядок миграции серверов', '1. Создать резервную копию\n2. Отключить сервисы\n3. Перенести оборудование\n4. Подключить и настроить\n5. Проверить работоспособность', 'Инструкции', 'Иванов Иван Иванович', 'public', NOW(), NOW()),
('kb-002', 'project-002', 'Архитектура ERP', 'Система построена на микросервисной архитектуре. Основные модули: финансы, HR, склад, CRM.', 'Архитектура', 'Петров Петр Петрович', 'restricted', NOW(), NOW()),
('kb-003', 'project-005', 'API портала самообслуживания', 'REST API v2. Авторизация через OAuth2. Основные эндпоинты: /api/requests, /api/documents, /api/vacations', 'API', 'Кузнецов Кузьма Кузьмич', 'public', NOW(), NOW());

-- Создание примеров записей глобальной базы знаний
INSERT INTO global_knowledge_base (id, title, content, category, author, access, created_at, updated_at) VALUES
('gkb-001', 'Стандарт оформления проектной документации', 'Все проекты должны следовать единому стандарту:\n1. Титульный лист по шаблону\n2. Структура: Введение, Описание, Требования, Приложение\n3. Шрифт: Arial 12pt\n4. Нумерация страниц обязательна', 'Стандарты', 'Проектный офис', 'public', NOW(), NOW()),
('gkb-002', 'Методология управления проектами', 'В проектном офисе используется гибридная методология:\n- Инфраструктурные проекты — Waterfall\n- Проекты развития — Agile/Scrum\n- Сопровождение — ITIL\n\nВсе проекты проходят через этапы: Инициация → Планирование → Реализация → Завершение', 'Методология', 'Проектный офис', 'public', NOW(), NOW()),
('gkb-003', 'Порядок согласования изменений', 'Изменения в проекте согласуются через CCB (Change Control Board):\n1. Подача заявки на изменение\n2. Оценка влияния на сроки/бюджет\n3. Рассмотрение на CCB (еженедельно)\n4. Утверждение/отклонение\n5. Обновление плана проекта', 'Процессы', 'Проектный офис', 'public', NOW(), NOW());

-- Создание связей между проектами
INSERT INTO project_links (id, project_id, target_project_id, target_project_name, target_office_id, target_office_name, link_type, description, created_at) VALUES
('link-001', 'project-001', 'project-004', 'Внедрение системы мониторинга', 'office-001', 'ИТ-дирекция', 'dependency', 'Мониторинг необходим после миграции', NOW()),
('link-002', 'project-002', 'project-005', 'Портал самообслуживания', 'office-001', 'ИТ-дирекция', 'related', 'Использует API портала', NOW()),
('link-003', 'project-004', 'project-001', 'Миграция ЦОД', 'office-001', 'ИТ-дирекция', 'blocked_by', 'Зависит от завершения миграции', NOW()),
('link-004', 'project-005', 'project-002', 'Обновление ERP-системы', 'office-001', 'ИТ-дирекция', 'related', 'Предоставляет API для ERP', NOW());

-- Создание структуры проектов (WBS)
INSERT INTO structure_nodes (id, project_id, parent_id, title, type, progress, start_date, end_date, sort_order, created_at) VALUES
('struct-001', 'project-001', NULL, 'Фаза 1: Подготовка', 'phase', 100, '2025-01-15', '2025-02-28', 1, NOW()),
('struct-002', 'project-001', 'struct-001', 'Аудит инфраструктуры', 'work_package', 100, '2025-01-15', '2025-01-31', 1, NOW()),
('struct-003', 'project-001', 'struct-001', 'Проектирование', 'work_package', 100, '2025-02-01', '2025-02-28', 2, NOW()),
('struct-004', 'project-001', NULL, 'Фаза 2: Реализация', 'phase', 30, '2025-03-01', '2025-05-31', 2, NOW()),
('struct-005', 'project-001', 'struct-004', 'Закупка оборудования', 'work_package', 100, '2025-03-01', '2025-03-31', 1, NOW()),
('struct-006', 'project-001', 'struct-004', 'Монтаж', 'work_package', 40, '2025-04-01', '2025-04-30', 2, NOW()),
('struct-007', 'project-001', 'struct-004', 'Миграция данных', 'work_package', 0, '2025-05-01', '2025-05-31', 3, NOW());

-- Привязка пользователей к проектам
INSERT INTO user_projects (id, user_id, project_id, created_at) VALUES
('up-001', 'user-pm-001', 'project-001', NOW()),
('up-002', 'user-pm-001', 'project-002', NOW()),
('up-003', 'user-member-001', 'project-001', NOW()),
('up-004', 'user-member-001', 'project-002', NOW()),
('up-005', 'user-member-002', 'project-003', NOW()),
('up-006', 'user-pm-002', 'project-004', NOW());

-- Создание API ключей (пример)
INSERT INTO api_keys (id, user_id, name, api_key, permissions, rate_limit, is_active, created_at) VALUES
('apikey-001', 'user-admin-001', 'Тестовый API ключ', 'pk_test_1234567890abcdef', '["read:projects","read:tasks","read:offices"]', 1000, TRUE, NOW());

-- Настройки системы по умолчанию
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description, created_at, updated_at) VALUES
('setting-001', 'platform_name', 'Платформа проектных офисов', 'string', 'Название платформы', NOW(), NOW()),
('setting-002', 'platform_logo', '🏢', 'string', 'Логотип платформы (emoji)', NOW(), NOW()),
('setting-003', 'primary_color', '#4f46e5', 'string', 'Основной цвет темы', NOW(), NOW()),
('setting-004', 'theme', 'light', 'string', 'Тема оформления (light/dark)', NOW(), NOW()),
('setting-005', 'session_timeout', '3600', 'number', 'Таймаут сессии в секундах', NOW(), NOW()),
('setting-006', 'password_min_length', '8', 'number', 'Минимальная длина пароля', NOW(), NOW()),
('setting-007', 'max_login_attempts', '5', 'number', 'Максимальное количество попыток входа', NOW(), NOW()),
('setting-008', 'lockout_duration', '900', 'number', 'Длительность блокировки в секундах', NOW(), NOW());
