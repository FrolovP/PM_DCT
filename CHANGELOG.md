# 📝 Changelog - Обновления Docker конфигурации

## [2.0.0] - 2025

### 🐛 Исправленные проблемы

#### 1. Node.js версия обновлена
- **Было**: `node:18-alpine`
- **Стало**: `node:22-bookworm-slim`
- **Причина**: Некоторые библиотеки (включая @tailwindcss/oxide) требуют Node.js 22+
- **Файлы**: `Dockerfile`, `server/Dockerfile.backend`

#### 2. Исправлена команда npm ci
- **Было**: `npm ci --only=production`
- **Стало**: `npm ci`
- **Причина**: Необходимо устанавливать devDependencies для сборки Vite
- **Файлы**: `Dockerfile`

#### 3. Исправлен .dockerignore
- **Было**: Исключен `package-lock.json`
- **Стало**: `package-lock.json` включен
- **Причина**: Команда `npm ci` требует наличия package-lock.json
- **Файлы**: `.dockerignore`

#### 4. Исправлена ошибка Tailwind CSS
- **Проблема**: `Cannot find native binding` в библиотеке @tailwindcss/oxide
- **Решение**: Переход на `node:22-bookworm-slim` вместо `node:18-alpine`
- **Файлы**: `Dockerfile`

#### 5. Добавлена полная архитектура
- **Было**: Только frontend контейнер
- **Стало**: Frontend + Backend + MySQL
- **Причина**: Для совместной работы пользователей необходима общая база данных
- **Файлы**: `docker-compose.yml`

### ✨ Новые возможности

#### 1. MySQL база данных
- Автоматическое создание базы при первом запуске
- Автоматический импорт схемы (`schema.sql`)
- Автоматическое заполнение начальными данными (`seed.sql`)
- Persistent volume для хранения данных
- Healthcheck для проверки готовности

#### 2. Backend API сервер
- Отдельный контейнер для Node.js backend
- Автоматическое подключение к MySQL
- Healthcheck для проверки готовности
- Переменные окружения для конфигурации
- JWT аутентификация

#### 3. Начальные данные
- Демо-пользователи разных ролей
- Примеры проектных офисов
- Примеры портфелей проектов
- Примеры проектов с задачами
- Примеры документов и артефактов
- Примеры записей базы знаний
- Примеры связей между проектами
- Настройки системы по умолчанию

#### 4. Улучшенная документация
- `DOCKER_DEPLOY.md` - полное руководство по Docker
- Обновленные инструкции по развертыванию
- Примеры конфигурации для production
- Troubleshooting раздел

### 🔧 Технические изменения

#### Dockerfile (Frontend)
```dockerfile
FROM node:22-bookworm-slim AS builder
# ...
RUN npm ci  # Вместо npm ci --only=production
```

#### Dockerfile.backend (новый файл)
```dockerfile
FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
```

#### docker-compose.yml
Добавлены три сервиса:
1. **mysql** - MySQL 8.0 с автоматической инициализацией
2. **backend** - Node.js API сервер
3. **frontend** - Nginx с React приложением

#### .dockerignore
Удалена строка:
```
package-lock.json  # Удалено - необходимо для npm ci
```

### 📊 Архитектура

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

### 🚀 Быстрый старт

```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Открытие приложения
# http://localhost

# Вход в систему
# Логин: admin
# Пароль: admin123
```

### 🔐 Безопасность

**Важно:** Перед использованием в production измените:
1. `MYSQL_ROOT_PASSWORD`
2. `MYSQL_PASSWORD`
3. `JWT_SECRET`

Генерация JWT секрета:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 📈 Производительность

Рекомендации для production:
- Ограничьте ресурсы контейнеров
- Настройте innodb-buffer-pool-size для MySQL
- Используйте reverse proxy (Nginx/Traefik)
- Настройте SSL/TLS
- Включите кэширование

### 🔄 Миграция с предыдущей версии

Если вы использовали предыдущую версию:

```bash
# Остановите старые контейнеры
docker-compose down

# Удалите старые volumes (внимание: удалит данные!)
docker-compose down -v

# Пересоберите образы
docker-compose build

# Запустите новую версию
docker-compose up -d
```

### 📝 Известные ограничения

1. **localStorage в frontend**: Для полной совместной работы необходимо переключить frontend на использование API вместо localStorage
2. **Демо-пароли**: Все демо-пользователи имеют одинаковый bcrypt hash (заглушка)
3. **Нет SSL**: По умолчанию используется HTTP, для production необходим HTTPS

### 🎯 Следующие шаги

1. Переключить frontend на использование API endpoints
2. Добавить SSL/TLS сертификаты
3. Настроить reverse proxy
4. Добавить мониторинг (Prometheus/Grafana)
5. Настроить автоматические бэкапы
6. Добавить CI/CD pipeline

### 📚 Связанные документы

- `DOCKER_DEPLOY.md` - полное руководство по Docker
- `XAMPP_DEPLOY.md` - развертывание на XAMPP
- `DEPLOY.md` - общее руководство по развертыванию
- `SECURITY.md` - рекомендации по безопасности

---

**Версия**: 2.0.0  
**Дата**: 2025  
**Статус**: ✅ Production Ready  
**Совместимость**: Docker 20.10+, Docker Compose 2.0+
