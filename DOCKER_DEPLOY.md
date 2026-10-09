# 🐳 Docker развертывание (обновленная версия)

Полное руководство по развертыванию платформы проектных офисов с использованием Docker Compose, включая MySQL базу данных и backend API сервер.

## 📋 Что изменилось

### Исправленные проблемы:
1. ✅ **Node.js версия**: обновлено с 18 на 22 (node:22-bookworm-slim)
2. ✅ **npm ci**: теперь устанавливает все зависимости (включая devDependencies для Vite)
3. ✅ **package-lock.json**: удален из .dockerignore (необходим для npm ci)
4. ✅ **Tailwind CSS**: исправлена ошибка с @tailwindcss/oxide благодаря новой версии Node.js
5. ✅ **Полная архитектура**: добавлены MySQL и backend сервер в docker-compose.yml
6. ✅ **Общая база данных**: все пользователи работают с единой БД

## 🏗️ Архитектура

```
┌─────────────────┐
│   Frontend      │  Port 80
│   (Nginx)       │
└────────┬────────┘
         │
         │ HTTP API
         ▼
┌─────────────────┐
│   Backend       │  Port 3001
│   (Node.js)     │
└────────┬────────┘
         │
         │ MySQL Protocol
         ▼
┌─────────────────┐
│   MySQL         │  Port 3306
│   Database      │
└─────────────────┘
```

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd project-office-platform
```

### 2. Запуск всех сервисов

```bash
docker-compose up -d
```

Это запустит:
- **MySQL** на порту 3306
- **Backend API** на порту 3001
- **Frontend** на порту 80

### 3. Проверка статуса

```bash
docker-compose ps
```

Ожидаемый вывод:
```
NAME                      STATUS
project-office-mysql      Up (healthy)
project-office-backend    Up (healthy)
project-office-frontend   Up (healthy)
```

### 4. Открытие приложения

Откройте браузер: http://localhost

### 5. Вход в систему

**Демо-пользователи:**
| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| director1 | director123 | Руководитель офиса |
| pm1 | pm123 | Руководитель проекта |
| member1 | member123 | Участник |
| viewer1 | viewer123 | Наблюдатель |

## 📊 Мониторинг

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Только frontend
docker-compose logs -f frontend

# Только backend
docker-compose logs -f backend

# Только MySQL
docker-compose logs -f mysql
```

### Проверка здоровья

```bash
# Frontend
curl http://localhost/

# Backend API
curl http://localhost:3001/api/health

# MySQL
docker-compose exec mysql mysqladmin ping -u root -proot_password
```

## 🔧 Управление сервисами

### Остановка

```bash
# Остановить все сервисы
docker-compose down

# Остановить и удалить volumes (внимание: удалит данные БД!)
docker-compose down -v
```

### Перезапуск

```bash
# Перезапустить все сервисы
docker-compose restart

# Перезапустить только backend
docker-compose restart backend
```

### Пересборка

```bash
# Пересобрать все образы
docker-compose build

# Пересобрать только frontend
docker-compose build frontend

# Пересобрать и перезапустить
docker-compose up -d --build
```

## 🗄️ Работа с базой данных

### Подключение к MySQL

```bash
# Через Docker
docker-compose exec mysql mysql -u project_user -pproject_password project_office_db

# Через внешний клиент
# Host: localhost
# Port: 3306
# User: project_user
# Password: project_password
# Database: project_office_db
```

### Резервное копирование

```bash
# Создать бэкап
docker-compose exec mysql mysqldump -u project_user -pproject_password project_office_db > backup.sql

# Восстановить из бэкапа
docker-compose exec -T mysql mysql -u project_user -pproject_password project_office_db < backup.sql
```

### Импорт схемы вручную

```bash
# Импортировать schema.sql
docker-compose exec -T mysql mysql -u root -proot_password project_office_db < server/database/schema.sql

# Импортировать seed.sql
docker-compose exec -T mysql mysql -u root -proot_password project_office_db < server/database/seed.sql
```

## 🔐 Безопасность

### Изменение паролей

**Важно:** Перед использованием в продакшене измените все пароли!

1. Отредактируйте `docker-compose.yml`:

```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: your_secure_root_password
    MYSQL_PASSWORD: your_secure_project_password

backend:
  environment:
    DB_PASSWORD: your_secure_project_password
    JWT_SECRET: your_super_secret_jwt_key_min_256_bits
```

2. Пересоздайте контейнеры:

```bash
docker-compose down -v
docker-compose up -d
```

### Генерация JWT секрета

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🌐 Доступ извне

### Локальная сеть

Для доступа с других устройств в локальной сети:

1. Узнайте IP адрес сервера:
```bash
hostname -I  # Linux
ipconfig     # Windows
```

2. Используйте IP вместо localhost:
- Frontend: http://192.168.1.100
- Backend API: http://192.168.1.100:3001

### Публичный доступ

Для публичного доступа необходимо:

1. Настроить reverse proxy (Nginx/Apache)
2. Получить SSL сертификат (Let's Encrypt)
3. Настроить доменное имя
4. Обновить FRONTEND_URL в backend

Пример Nginx конфигурации:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📦 Структура файлов

```
project-office-platform/
├── docker-compose.yml          # Оркестрация контейнеров
├── Dockerfile                  # Frontend образ
├── .dockerignore               # Исключения для Docker
├── nginx.conf                  # Конфигурация Nginx
├── server/
│   ├── Dockerfile.backend      # Backend образ
│   ├── package.json
│   ├── index.js                # Express сервер
│   ├── routes/                 # API маршруты
│   ├── middleware/             # Middleware
│   └── database/
│       ├── schema.sql          # Схема БД
│       └── seed.sql            # Начальные данные
├── src/                        # React приложение
└── public/                     # Статические файлы
```

## 🐛 Troubleshooting

### Проблема: MySQL не запускается

**Решение:**
```bash
# Проверьте логи
docker-compose logs mysql

# Удалите volume и пересоздайте
docker-compose down -v
docker-compose up -d
```

### Проблема: Backend не может подключиться к MySQL

**Решение:**
```bash
# Проверьте, что MySQL здоров
docker-compose ps mysql

# Подождите, пока MySQL станет healthy
docker-compose logs -f mysql

# Перезапустите backend
docker-compose restart backend
```

### Проблема: Порт уже занят

**Решение:**
```bash
# Найдите процесс, занимающий порт
sudo lsof -i :80
sudo lsof -i :3001
sudo lsof -i :3306

# Остановите процесс или измените порты в docker-compose.yml
```

### Проблема: Tailwind CSS ошибка @tailwindcss/oxide

**Решение:**
Эта проблема исправлена в обновленной версии! Используется node:22-bookworm-slim вместо node:18-alpine.

Если проблема все еще возникает:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Проблема: Изменения не применяются

**Решение:**
```bash
# Пересоберите образы
docker-compose build

# Перезапустите с удалением кэша
docker-compose up -d --force-recreate
```

## 📈 Производительность

### Оптимизация MySQL

Добавьте в `docker-compose.yml`:

```yaml
mysql:
  command: 
    - --innodb-buffer-pool-size=1G
    - --innodb-log-file-size=256M
    - --max-connections=200
```

### Оптимизация Backend

Добавьте в `docker-compose.yml`:

```yaml
backend:
  environment:
    NODE_OPTIONS: --max-old-space-size=4096
```

### Ресурсы контейнеров

Ограничьте ресурсы:

```yaml
services:
  mysql:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
  
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

## 🔄 Обновление

### Обновление кода

```bash
# Получите последние изменения
git pull

# Пересоберите образы
docker-compose build

# Перезапустите сервисы
docker-compose up -d
```

### Обновление зависимостей

```bash
# Frontend
docker-compose run --rm frontend npm update

# Backend
docker-compose run --rm backend npm update

# Пересоберите
docker-compose build
docker-compose up -d
```

## 📊 Мониторинг и логирование

### Просмотр использования ресурсов

```bash
docker stats
```

### Экспорт логов

```bash
# Все логи
docker-compose logs > all-logs.txt

# Логи за последний час
docker-compose logs --since 1h > recent-logs.txt
```

## 🎯 Production рекомендации

### 1. Используйте отдельные сети

```yaml
networks:
  frontend:
  backend:
  database:

services:
  frontend:
    networks:
      - frontend
      - backend
  
  backend:
    networks:
      - backend
      - database
  
  mysql:
    networks:
      - database
```

### 2. Добавьте reverse proxy

Используйте Traefik или Nginx для:
- SSL termination
- Load balancing
- Rate limiting

### 3. Настройте backup

```bash
# Автоматический бэкап каждый день
0 2 * * * cd /path/to/project && docker-compose exec -T mysql mysqldump -u project_user -pproject_password project_office_db > /backup/db-$(date +\%Y\%m\%d).sql
```

### 4. Используйте secrets

Для продакшена используйте Docker secrets вместо environment variables.

## 📚 Дополнительные ресурсы

- [Docker Compose documentation](https://docs.docker.com/compose/)
- [MySQL Docker image](https://hub.docker.com/_/mysql)
- [Node.js Docker best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Версия**: 2.0  
**Обновлено**: 2025  
**Node.js**: 22 (bookworm-slim)  
**MySQL**: 8.0  
**Статус**: ✅ Production Ready
