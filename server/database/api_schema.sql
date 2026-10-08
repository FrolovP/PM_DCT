-- ============================================
-- Таблицы для API и интеграций
-- ============================================

USE project_office_db;

-- ============================================
-- Таблица API ключей
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    permissions JSON,
    rate_limit INT DEFAULT 1000,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    last_used DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_key (api_key),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- Таблица webhook'ов
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255),
    events JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- Таблица логов API запросов
-- ============================================
CREATE TABLE IF NOT EXISTS api_logs (
    id VARCHAR(36) PRIMARY KEY,
    api_key_id VARCHAR(36),
    method VARCHAR(10),
    endpoint VARCHAR(255),
    status_code INT,
    request_body JSON,
    response_body JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    duration_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE SET NULL,
    INDEX idx_api_key (api_key_id),
    INDEX idx_endpoint (endpoint),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Таблица логов webhook'ов
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    id VARCHAR(36) PRIMARY KEY,
    webhook_id VARCHAR(36),
    event VARCHAR(50),
    payload JSON,
    response_status INT,
    response_body TEXT,
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    INDEX idx_webhook (webhook_id),
    INDEX idx_event (event),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Таблица интеграций с мессенджерами
-- ============================================
CREATE TABLE IF NOT EXISTS messenger_integrations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('max', 'telegram', 'slack', 'teams') NOT NULL,
    config JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- Таблица чат-ботов
-- ============================================
CREATE TABLE IF NOT EXISTS chat_bots (
    id VARCHAR(36) PRIMARY KEY,
    integration_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bot_token VARCHAR(255),
    webhook_url VARCHAR(500),
    commands JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (integration_id) REFERENCES messenger_integrations(id) ON DELETE CASCADE,
    INDEX idx_integration (integration_id)
) ENGINE=InnoDB;

-- ============================================
-- Таблица сообщений бота
-- ============================================
CREATE TABLE IF NOT EXISTS bot_messages (
    id VARCHAR(36) PRIMARY KEY,
    bot_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(100),
    message_text TEXT,
    message_type ENUM('incoming', 'outgoing') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bot_id) REFERENCES chat_bots(id) ON DELETE CASCADE,
    INDEX idx_bot (bot_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================
-- Таблица внешних систем
-- ============================================
CREATE TABLE IF NOT EXISTS external_systems (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    config JSON,
    sync_interval INT DEFAULT 3600,
    last_sync DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- Таблица логов синхронизации
-- ============================================
CREATE TABLE IF NOT EXISTS sync_logs (
    id VARCHAR(36) PRIMARY KEY,
    system_id VARCHAR(36),
    status ENUM('success', 'error', 'partial') NOT NULL,
    records_synced INT DEFAULT 0,
    error_message TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (system_id) REFERENCES external_systems(id) ON DELETE CASCADE,
    INDEX idx_system (system_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;
