-- ============================================
-- Схема базы данных для платформы проектных офисов
-- MySQL 8.0+
-- ============================================

-- Создание базы данных
CREATE DATABASE IF NOT EXISTS project_office_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE project_office_db;

-- ============================================
-- Таблица пользователей
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'office_director', 'project_manager', 'team_member', 'viewer') NOT NULL DEFAULT 'viewer',
    office_id VARCHAR(36) NULL,
    avatar VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_login (login),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_office (office_id)
) ENGINE=InnoDB;

-- Таблица привязки пользователей к проектам
CREATE TABLE IF NOT EXISTS user_projects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_project (user_id, project_id),
    INDEX idx_user (user_id),
    INDEX idx_project (project_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица проектных офисов
-- ============================================
CREATE TABLE IF NOT EXISTS project_offices (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#4f46e5',
    icon VARCHAR(10) DEFAULT '🏢',
    director VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB;

-- Добавляем внешний ключ для users.office_id
ALTER TABLE users ADD CONSTRAINT fk_user_office 
FOREIGN KEY (office_id) REFERENCES project_offices(id) ON DELETE SET NULL;

-- ============================================
-- Таблица портфелей проектов
-- ============================================
CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('business', 'architecture', 'strategic', 'operational') NOT NULL DEFAULT 'business',
    office_id VARCHAR(36) NOT NULL,
    strategic_goal TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES project_offices(id) ON DELETE CASCADE,
    INDEX idx_office (office_id),
    INDEX idx_type (type)
) ENGINE=InnoDB;

-- ============================================
-- Таблица проектов
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    office_id VARCHAR(36) NOT NULL,
    portfolio_id VARCHAR(36) NULL,
    name VARCHAR(200) NOT NULL,
    type ENUM('infrastructure', 'support', 'development') NOT NULL,
    status ENUM('planning', 'active', 'paused', 'completed', 'cancelled') NOT NULL DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    description TEXT,
    manager VARCHAR(100),
    start_date DATE,
    end_date DATE,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    budget DECIMAL(15, 2) DEFAULT 0,
    spent DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (office_id) REFERENCES project_offices(id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE SET NULL,
    INDEX idx_office (office_id),
    INDEX idx_portfolio (portfolio_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_priority (priority)
) ENGINE=InnoDB;

-- Таблица привязки проектов к портфелям
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id VARCHAR(36) PRIMARY KEY,
    portfolio_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_portfolio_project (portfolio_id, project_id),
    INDEX idx_portfolio (portfolio_id),
    INDEX idx_project (project_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица задач
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'review', 'done', 'blocked') NOT NULL DEFAULT 'todo',
    priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    assignee VARCHAR(100),
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_status (status),
    INDEX idx_assignee (assignee),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB;

-- Таблица подзадач
CREATE TABLE IF NOT EXISTS subtasks (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task (task_id)
) ENGINE=InnoDB;

-- Таблица тегов задач
CREATE TABLE IF NOT EXISTS task_tags (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task (task_id),
    INDEX idx_tag (tag)
) ENGINE=InnoDB;

-- ============================================
-- Таблица межофисных связей через задачи
-- ============================================
CREATE TABLE IF NOT EXISTS cross_office_links (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    target_project_id VARCHAR(36) NOT NULL,
    target_project_name VARCHAR(200),
    target_office_id VARCHAR(36),
    target_office_name VARCHAR(100),
    link_type ENUM('dependency', 'related', 'blocks', 'blocked_by', 'duplicate', 'parent_child') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (target_project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_task (task_id),
    INDEX idx_target_project (target_project_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица документов
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category ENUM('regulation', 'specification', 'report', 'protocol', 'other') NOT NULL DEFAULT 'other',
    description TEXT,
    author VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- Таблица тегов документов
CREATE TABLE IF NOT EXISTS document_tags (
    id VARCHAR(36) PRIMARY KEY,
    document_id VARCHAR(36) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_document (document_id),
    INDEX idx_tag (tag)
) ENGINE=InnoDB;

-- ============================================
-- Таблица артефактов
-- ============================================
CREATE TABLE IF NOT EXISTS artifacts (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    type ENUM('design', 'code', 'test', 'deployment', 'documentation', 'other') NOT NULL DEFAULT 'other',
    description TEXT,
    author VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_type (type)
) ENGINE=InnoDB;

-- Таблица тегов артефактов
CREATE TABLE IF NOT EXISTS artifact_tags (
    id VARCHAR(36) PRIMARY KEY,
    artifact_id VARCHAR(36) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE,
    INDEX idx_artifact (artifact_id),
    INDEX idx_tag (tag)
) ENGINE=InnoDB;

-- Таблица связи артефактов с задачами
CREATE TABLE IF NOT EXISTS artifact_tasks (
    id VARCHAR(36) PRIMARY KEY,
    artifact_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_artifact_task (artifact_id, task_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица структуры проекта (WBS)
-- ============================================
CREATE TABLE IF NOT EXISTS structure_nodes (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    parent_id VARCHAR(36) NULL,
    title VARCHAR(200) NOT NULL,
    type ENUM('phase', 'milestone', 'work_package', 'deliverable') NOT NULL,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    end_date DATE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES structure_nodes(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица связей проектов
-- ============================================
CREATE TABLE IF NOT EXISTS project_links (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    target_project_id VARCHAR(36) NOT NULL,
    target_project_name VARCHAR(200),
    target_office_id VARCHAR(36),
    target_office_name VARCHAR(100),
    link_type ENUM('dependency', 'related', 'blocks', 'blocked_by', 'duplicate', 'parent_child') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (target_project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_target (target_project_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица базы знаний проекта
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_base (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT,
    category VARCHAR(100),
    author VARCHAR(100),
    access ENUM('public', 'restricted', 'private') NOT NULL DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_category (category),
    INDEX idx_access (access)
) ENGINE=InnoDB;

-- Таблица тегов базы знаний
CREATE TABLE IF NOT EXISTS kb_tags (
    id VARCHAR(36) PRIMARY KEY,
    kb_id VARCHAR(36) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (kb_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
    INDEX idx_kb (kb_id),
    INDEX idx_tag (tag)
) ENGINE=InnoDB;

-- Таблица связи базы знаний с проектами
CREATE TABLE IF NOT EXISTS kb_related_projects (
    id VARCHAR(36) PRIMARY KEY,
    kb_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (kb_id) REFERENCES knowledge_base(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_kb_project (kb_id, project_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица глобальной базы знаний
-- ============================================
CREATE TABLE IF NOT EXISTS global_knowledge_base (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content LONGTEXT,
    category VARCHAR(100),
    author VARCHAR(100),
    access ENUM('public', 'restricted', 'private') NOT NULL DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_access (access)
) ENGINE=InnoDB;

-- Таблица тегов глобальной базы знаний
CREATE TABLE IF NOT EXISTS global_kb_tags (
    id VARCHAR(36) PRIMARY KEY,
    kb_id VARCHAR(36) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (kb_id) REFERENCES global_knowledge_base(id) ON DELETE CASCADE,
    INDEX idx_kb (kb_id),
    INDEX idx_tag (tag)
) ENGINE=InnoDB;

-- Таблица связи глобальной базы знаний с проектами
CREATE TABLE IF NOT EXISTS global_kb_related_projects (
    id VARCHAR(36) PRIMARY KEY,
    kb_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (kb_id) REFERENCES global_knowledge_base(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_kb_project (kb_id, project_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица настроек системы
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB;

-- ============================================
-- Таблица логов действий
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    user_name VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Таблица сессий
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- ============================================
-- Начальные данные
-- ============================================

-- Настройки по умолчанию
INSERT INTO system_settings (id, setting_key, setting_value, setting_type, description) VALUES
(UUID(), 'platform_name', 'Платформа проектных офисов', 'string', 'Название платформы'),
(UUID(), 'platform_logo', '🏢', 'string', 'Логотип платформы (emoji)'),
(UUID(), 'primary_color', '#4f46e5', 'string', 'Основной цвет темы'),
(UUID(), 'theme', 'light', 'string', 'Тема оформления (light/dark)'),
(UUID(), 'session_timeout', '3600', 'number', 'Таймаут сессии в секундах'),
(UUID(), 'password_min_length', '8', 'number', 'Минимальная длина пароля'),
(UUID(), 'password_require_uppercase', 'true', 'boolean', 'Требовать заглавные буквы'),
(UUID(), 'password_require_numbers', 'true', 'boolean', 'Требовать цифры'),
(UUID(), 'password_require_special', 'false', 'boolean', 'Требовать спецсимволы'),
(UUID(), 'max_login_attempts', '5', 'number', 'Максимальное количество попыток входа'),
(UUID(), 'lockout_duration', '900', 'number', 'Длительность блокировки в секундах'),
(UUID(), 'enable_registration', 'false', 'boolean', 'Разрешить регистрацию'),
(UUID(), 'enable_notifications', 'true', 'boolean', 'Включить уведомления'),
(UUID(), 'maintenance_mode', 'false', 'boolean', 'Режим обслуживания');

-- ============================================
-- Индексы для производительности
-- ============================================

-- Составные индексы для частых запросов
CREATE INDEX idx_projects_office_status ON projects(office_id, status);
CREATE INDEX idx_projects_office_type ON projects(office_id, type);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_audit_logs_created_action ON audit_logs(created_at, action);

-- ============================================
-- Представления для упрощения запросов
-- ============================================

-- Представление для статистики по офисам
CREATE OR REPLACE VIEW office_stats AS
SELECT 
    po.id,
    po.name,
    po.icon,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
    COUNT(DISTINCT port.id) as total_portfolios,
    COALESCE(SUM(p.budget), 0) as total_budget,
    COALESCE(SUM(p.spent), 0) as total_spent
FROM project_offices po
LEFT JOIN projects p ON po.id = p.office_id
LEFT JOIN portfolios port ON po.id = port.office_id
GROUP BY po.id, po.name, po.icon;

-- Представление для статистики по проектам
CREATE OR REPLACE VIEW project_stats AS
SELECT 
    p.id,
    p.name,
    p.office_id,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.completed = TRUE THEN t.id END) as completed_tasks,
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(DISTINCT a.id) as total_artifacts
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN documents d ON p.id = d.project_id
LEFT JOIN artifacts a ON p.id = a.project_id
GROUP BY p.id, p.name, p.office_id;
