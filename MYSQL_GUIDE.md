# 🗄️ Руководство по MySQL и миграции

Полное руководство по настройке MySQL базы данных и миграции с localStorage.

## 📋 Содержание

1. [Установка MySQL](#установка-mysql)
2. [Создание базы данных](#создание-базы-данных)
3. [Настройка backend](#настройка-backend)
4. [Миграция данных из localStorage](#миграция-данных-из-localstorage)
5. [Мониторинг и оптимизация](#мониторинг-и-оптимизация)
6. [Резервное копирование](#резервное-копирование)

---

## Установка MySQL

### Ubuntu/Debian

```bash
# Установка MySQL 8.0
sudo apt update
sudo apt install mysql-server

# Запуск и автозагрузка
sudo systemctl start mysql
sudo systemctl enable mysql

# Настройка безопасности
sudo mysql_secure_installation
```

### CentOS/RHEL

```bash
# Установка MySQL
sudo yum install mysql-server

# Запуск
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Получение временного пароля
sudo grep 'temporary password' /var/log/mysqld.log

# Настройка
sudo mysql_secure_installation
```

### Проверка установки

```bash
mysql --version
sudo systemctl status mysql
```

---

## Создание базы данных

### 1. Вход в MySQL

```bash
sudo mysql -u root -p
```

### 2. Создание базы данных и пользователя

```sql
-- Создание базы данных
CREATE DATABASE project_office_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Создание пользователя для приложения
CREATE USER 'project_office'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';

-- Предоставление прав
GRANT SELECT, INSERT, UPDATE, DELETE ON project_office_db.* TO 'project_office'@'localhost';
GRANT CREATE, ALTER, DROP ON project_office_db.* TO 'project_office'@'localhost';

-- Применение изменений
FLUSH PRIVILEGES;

-- Выход
EXIT;
```

### 3. Импорт схемы

```bash
# Импорт схемы базы данных
mysql -u project_office -p project_office_db < server/database/schema.sql

# Проверка таблиц
mysql -u project_office -p -e "USE project_office_db; SHOW TABLES;"
```

---

## Настройка backend

### 1. Установка зависимостей

```bash
cd server
npm install
```

### 2. Создание файла .env

```bash
cp .env.example .env
nano .env
```

Заполните файл:

```env
# Сервер
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=project_office
DB_PASSWORD=YourSecurePassword123!
DB_NAME=project_office_db

# JWT (обязательно измените!)
JWT_SECRET=your-super-secret-key-min-256-bits-long-change-this
JWT_EXPIRES_IN=24h

# Безопасность
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
SESSION_TIMEOUT=86400
```

### 3. Генерация JWT секрета

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Скопируйте результат в `.env` как `JWT_SECRET`.

### 4. Заполнение начальными данными

```bash
npm run seed
```

Это создаст:
- Администратора (admin / admin123)
- 3 проектных офиса с директорами
- Дополнительные тестовые пользователи

### 5. Запуск сервера

```bash
# Разработка
npm run dev

# Продакшен
npm start
```

---

## Миграция данных из localStorage

### Скрипт миграции

Создайте файл `server/migrate-from-localstorage.js`:

```javascript
require('dotenv').config();
const db = require('./database/db');
const { v4: uuidv4 } = require('uuid');

// Данные из localStorage (скопируйте из браузера)
const localStorageData = {
  // Вставьте сюда данные из localStorage
  // Можно получить через консоль браузера:
  // JSON.stringify({
  //   users: JSON.parse(localStorage.getItem('platform_users')),
  //   offices: JSON.parse(localStorage.getItem('project-offices')),
  //   projects: JSON.parse(localStorage.getItem('project-office-data')),
  //   globalKB: JSON.parse(localStorage.getItem('global-knowledge-base'))
  // })
};

async function migrate() {
  console.log('🔄 Начинаем миграцию данных...');

  try {
    await db.testConnection();

    // Миграция офисов
    if (localStorageData.offices) {
      for (const office of localStorageData.offices) {
        await db.query(
          `INSERT INTO project_offices (id, name, description, color, icon, director, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [office.id, office.name, office.description, office.color, office.icon, office.director, office.createdAt]
        );
        console.log(`✅ Офис: ${office.name}`);
      }
    }

    // Миграция проектов
    if (localStorageData.projects) {
      for (const project of localStorageData.projects) {
        await db.query(
          `INSERT INTO projects (id, office_id, portfolio_id, name, type, status, priority, description, manager, start_date, end_date, progress, budget, spent, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [project.id, project.officeId, project.portfolioId, project.name, project.type, project.status, project.priority, project.description, project.manager, project.startDate, project.endDate, project.progress, project.budget, project.spent, project.createdAt]
        );

        // Миграция задач
        if (project.tasks) {
          for (const task of project.tasks) {
            await db.query(
              `INSERT INTO tasks (id, project_id, title, description, status, priority, assignee, due_date, completed)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [task.id, project.id, task.title, task.description, task.status, task.priority, task.assignee, task.dueDate, task.completed]
            );
          }
        }

        // Миграция документов
        if (project.documents) {
          for (const doc of project.documents) {
            await db.query(
              `INSERT INTO documents (id, project_id, title, category, description, author, version, content, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [doc.id, project.id, doc.title, doc.category, doc.description, doc.author, doc.version, doc.content, doc.createdAt, doc.updatedAt]
            );
          }
        }

        console.log(`✅ Проект: ${project.name}`);
      }
    }

    console.log('\n🎉 Миграция завершена успешно!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  }
}

migrate();
```

### Получение данных из localStorage

1. Откройте приложение в браузере
2. Откройте DevTools (F12)
3. Перейдите во вкладку Console
4. Выполните:

```javascript
const data = {
  users: JSON.parse(localStorage.getItem('platform_users') || '[]'),
  offices: JSON.parse(localStorage.getItem('project-offices') || '[]'),
  projects: JSON.parse(localStorage.getItem('project-office-data') || '[]'),
  globalKB: JSON.parse(localStorage.getItem('global-knowledge-base') || '[]')
};
console.log(JSON.stringify(data, null, 2));
copy(JSON.stringify(data));
```

5. Скопируйте данные и вставьте в скрипт миграции

### Запуск миграции

```bash
node migrate-from-localstorage.js
```

---

## Мониторинг и оптимизация

### Мониторинг MySQL

```bash
# Статус сервера
sudo systemctl status mysql

# Активные соединения
mysql -u root -p -e "SHOW PROCESSLIST;"

# Размер базы данных
mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables GROUP BY table_schema;"

# Медленные запросы
mysql -u root -p -e "SHOW VARIABLES LIKE 'slow_query_log';"
```

### Оптимизация

#### 1. Включение slow query log

```sql
-- В my.cnf или my.ini
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

#### 2. Оптимизация индексов

```sql
-- Анализ таблицы
ANALYZE TABLE projects;
ANALYZE TABLE tasks;

-- Проверка индексов
SHOW INDEX FROM projects;
```

#### 3. Оптимизация конфигурации

```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf

[mysqld]
# Буферный пул (50-70% RAM)
innodb_buffer_pool_size = 2G

# Логирование
innodb_log_file_size = 256M
innodb_log_buffer_size = 64M

# Соединения
max_connections = 200
wait_timeout = 60

# Кэширование
query_cache_type = 1
query_cache_size = 64M
```

---

## Резервное копирование

### Автоматический бэкап

Создайте скрипт `/usr/local/bin/backup-mysql.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="project_office_db"
RETENTION_DAYS=30

# Создание директории
mkdir -p $BACKUP_DIR

# Бэкап
mysqldump -u project_office -p'YourSecurePassword123!' \
  --single-transaction \
  --routines \
  --triggers \
  $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# Удаление старых бэкапов
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Бэкап создан: ${DB_NAME}_${DATE}.sql.gz"
```

```bash
chmod +x /usr/local/bin/backup-mysql.sh
```

### Добавление в cron

```bash
crontab -e

# Ежедневный бэкап в 2:00
0 2 * * * /usr/local/bin/backup-mysql.sh >> /var/log/mysql-backup.log 2>&1
```

### Восстановление из бэкапа

```bash
# Распаковка
gunzip /backup/mysql/project_office_db_20250101_020000.sql.gz

# Восстановление
mysql -u project_office -p project_office_db < /backup/mysql/project_office_db_20250101_020000.sql
```

---

## Troubleshooting

### Ошибка подключения

```bash
# Проверка статуса MySQL
sudo systemctl status mysql

# Проверка логов
sudo tail -f /var/log/mysql/error.log

# Проверка пользователя
mysql -u root -p -e "SELECT User, Host FROM mysql.user;"
```

### Ошибка прав доступа

```sql
-- Проверка прав
SHOW GRANTS FOR 'project_office'@'localhost';

-- Предоставление прав
GRANT ALL PRIVILEGES ON project_office_db.* TO 'project_office'@'localhost';
FLUSH PRIVILEGES;
```

### Медленная работа

```sql
-- Проверка медленных запросов
SHOW GLOBAL STATUS LIKE 'Slow_queries';

-- Оптимизация таблиц
OPTIMIZE TABLE projects;
OPTIMIZE TABLE tasks;
```

---

## Полезные команды

```bash
# Экспорт данных
mysqldump -u project_office -p project_office_db > backup.sql

# Импорт данных
mysql -u project_office -p project_office_db < backup.sql

# Проверка целостности
mysqlcheck -u project_office -p --all-databases

# Размер таблиц
SELECT table_name, 
       ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'project_office_db'
ORDER BY (data_length + index_length) DESC;
```

---

**Версия**: 1.0  
**Обновлено**: 2025
