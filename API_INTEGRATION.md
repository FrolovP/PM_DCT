# 📖 API и Интеграции

Полная документация по API платформы и интеграции с мессенджерами.

## 📋 Содержание

1. [REST API](#rest-api)
2. [API ключи](#api-ключи)
3. [Webhooks](#webhooks)
4. [Интеграция с MAX](#интеграция-с-max)
5. [Чат-бот MAX](#чат-бот-max)
6. [Примеры использования](#примеры-использования)

---

## REST API

### Базовый URL

```
https://your-domain.com/api/v1
```

### Аутентификация

Все запросы к API должны содержать заголовок `X-API-Key`:

```bash
curl -H "X-API-Key: pk_your_api_key_here" \
  https://your-domain.com/api/v1/projects
```

Или через query параметр:

```
GET /api/v1/projects?api_key=pk_your_api_key_here
```

### Endpoints

#### Health Check

```http
GET /api/v1/health
```

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

#### Офисы

##### Список офисов

```http
GET /api/v1/offices
```

**Права:** `read:offices`

**Ответ:**
```json
{
  "offices": [
    {
      "id": "office-1",
      "name": "ИТ-дирекция",
      "description": "Основной проектный офис",
      "color": "#4f46e5",
      "icon": "💻",
      "director": "Иванов А.С."
    }
  ]
}
```

---

#### Портфели

##### Список портфелей

```http
GET /api/v1/portfolios
GET /api/v1/portfolios?officeId=office-1
```

**Права:** `read:portfolios`

**Параметры:**
- `officeId` — фильтр по офису (опционально)

**Ответ:**
```json
{
  "portfolios": [
    {
      "id": "port-1",
      "name": "Инфраструктура и ЦОД",
      "description": "Проекты по развитию ИТ-инфраструктуры",
      "type": "architecture",
      "office_id": "office-1",
      "strategic_goal": "Обеспечение отказоустойчивости"
    }
  ]
}
```

---

#### Проекты

##### Список проектов

```http
GET /api/v1/projects
GET /api/v1/projects?officeId=office-1&status=active&type=infrastructure
```

**Права:** `read:projects`

**Параметры:**
- `officeId` — фильтр по офису
- `status` — фильтр по статусу (planning, active, paused, completed, cancelled)
- `type` — фильтр по типу (infrastructure, support, development)
- `limit` — количество записей (по умолчанию 100)
- `offset` — смещение для пагинации

**Ответ:**
```json
{
  "projects": [
    {
      "id": "abc123",
      "office_id": "office-1",
      "portfolio_id": "port-1",
      "name": "Миграция ЦОД",
      "type": "infrastructure",
      "status": "active",
      "priority": "critical",
      "description": "Перенос серверной инфраструктуры",
      "manager": "Иванов А.С.",
      "start_date": "2025-01-15",
      "end_date": "2025-06-30",
      "progress": 45,
      "budget": 15000000,
      "spent": 6750000
    }
  ]
}
```

##### Детали проекта

```http
GET /api/v1/projects/:id
```

**Права:** `read:projects`

**Ответ:**
```json
{
  "project": {
    "id": "abc123",
    "name": "Миграция ЦОД",
    "type": "infrastructure",
    "status": "active",
    "priority": "critical",
    "description": "Перенос серверной инфраструктуры",
    "manager": "Иванов А.С.",
    "start_date": "2025-01-15",
    "end_date": "2025-06-30",
    "progress": 45,
    "budget": 15000000,
    "spent": 6750000,
    "tasks": [
      {
        "id": "t1",
        "title": "Аудит текущей инфраструктуры",
        "status": "done",
        "priority": "high",
        "assignee": "Петров И.И.",
        "due_date": "2025-01-31",
        "completed": true
      }
    ],
    "documents": [...],
    "artifacts": [...],
    "tasksCount": 6,
    "completedTasks": 3
  }
}
```

---

#### Задачи

##### Задачи проекта

```http
GET /api/v1/projects/:id/tasks
```

**Права:** `read:tasks`

**Ответ:**
```json
{
  "tasks": [
    {
      "id": "t1",
      "title": "Аудит текущей инфраструктуры",
      "description": "Провести полный аудит",
      "status": "done",
      "priority": "high",
      "assignee": "Петров И.И.",
      "due_date": "2025-01-31",
      "completed": true
    }
  ]
}
```

##### Детали задачи

```http
GET /api/v1/tasks/:id
```

**Права:** `read:tasks`

##### Обновление статуса задачи

```http
PATCH /api/v1/tasks/:id/status
```

**Права:** `write:tasks`

**Тело запроса:**
```json
{
  "status": "in_progress",
  "completed": false
}
```

**Ответ:**
```json
{
  "message": "Задача обновлена"
}
```

---

#### Документы

##### Документы проекта

```http
GET /api/v1/projects/:id/documents
```

**Права:** `read:documents`

**Ответ:**
```json
{
  "documents": [
    {
      "id": "d1",
      "title": "Техническое задание",
      "category": "specification",
      "description": "Основной документ проекта",
      "author": "Иванов А.С.",
      "version": "2.1",
      "created_at": "2025-01-10T00:00:00.000Z"
    }
  ]
}
```

---

#### Статистика

##### Общая статистика

```http
GET /api/v1/stats/summary
```

**Права:** `read:stats`

**Ответ:**
```json
{
  "stats": {
    "total_projects": 6,
    "active_projects": 4,
    "completed_projects": 1,
    "total_tasks": 28,
    "completed_tasks": 15,
    "total_offices": 3,
    "total_portfolios": 7
  }
}
```

---

#### Пользователи

##### Список пользователей

```http
GET /api/v1/users
```

**Права:** `read:users`

**Ответ:**
```json
{
  "users": [
    {
      "id": "user-1",
      "login": "admin",
      "name": "Системный администратор",
      "email": "admin@company.ru",
      "role": "admin",
      "office_id": null
    }
  ]
}
```

---

## API ключи

### Создание API ключа

1. Войдите в систему под администратором
2. Перейдите в раздел **🔑 API**
3. Нажмите **"+ Создать ключ"**
4. Заполните форму:
   - **Название** — описание ключа (например, "Интеграция с CRM")
   - **Права доступа** — выберите необходимые разрешения
   - **Лимит запросов** — максимальное количество запросов в час
   - **Срок действия** — опционально, дней

### Доступные права

| Право | Описание |
|-------|----------|
| `read:offices` | Чтение офисов |
| `read:portfolios` | Чтение портфелей |
| `read:projects` | Чтение проектов |
| `read:tasks` | Чтение задач |
| `read:documents` | Чтение документов |
| `read:users` | Чтение пользователей |
| `read:stats` | Чтение статистики |
| `write:tasks` | Изменение статуса задач |

### Управление ключами

- **Деактивация** — временное отключение ключа
- **Активация** — повторное включение ключа
- **Удаление** — полное удаление ключа

---

## Webhooks

### Создание webhook'а

1. Перейдите в раздел **🔑 API** → **Webhooks**
2. Нажмите **"+ Создать webhook"**
3. Укажите:
   - **Название** — описание webhook'а
   - **URL** — endpoint для получения событий
   - **События** — типы событий для подписки

### Доступные события

| Событие | Описание |
|---------|----------|
| `project.created` | Создание проекта |
| `project.updated` | Обновление проекта |
| `project.completed` | Завершение проекта |
| `task.created` | Создание задачи |
| `task.updated` | Обновление задачи |
| `task.completed` | Выполнение задачи |
| `*` | Все события |

### Формат webhook'а

**Заголовок:**
```
POST /your-webhook-endpoint
Content-Type: application/json
X-Webhook-Secret: your_secret
X-Webhook-Event: project.created
```

**Тело:**
```json
{
  "event": "project.created",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "data": {
    "id": "abc123",
    "name": "Новый проект",
    "status": "planning",
    "office_id": "office-1"
  }
}
```

### Проверка подписи

Для безопасности проверяйте подпись webhook'а:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Интеграция с MAX

### Что такое MAX?

MAX — российский мессенджер от VK/Mail.ru Group. Интеграция позволяет создать чат-бота для работы с платформой прямо в мессенджере.

### Настройка интеграции

#### 1. Создание бота в MAX

1. Откройте MAX и найдите @MasterBot
2. Отправьте команду `/newbot`
3. Укажите имя бота (например, "ПроектныйОфисБот")
4. Получите токен бота

#### 2. Подключение к платформе

1. Войдите в систему под администратором
2. Перейдите в раздел **🤖 Боты**
3. Нажмите **"+ Подключить MAX"**
4. Заполните форму:
   - **Название** — описание интеграции
   - **Токен бота** — токен из @MasterBot
   - **Webhook URL** — опционально, по умолчанию используется `/api/messenger/max/webhook`

#### 3. Настройка webhook в MAX

1. Откройте @MasterBot в MAX
2. Отправьте команду `/setwebhook`
3. Укажите URL: `https://your-domain.com/api/messenger/max/webhook`

---

## Чат-бот MAX

### Команды бота

| Команда | Альтернатива | Описание |
|---------|--------------|----------|
| `/help` | `/помощь` | Список команд |
| `/projects [status] [type]` | `/проекты` | Список проектов |
| `/project <id>` | `/проект` | Детали проекта |
| `/tasks <project_id>` | `/задачи` | Задачи проекта |
| `/task <task_id>` | `/задача` | Детали задачи |
| `/stats` | `/статистика` | Общая статистика |

### Примеры использования

#### Список проектов

```
/projects active
/projects completed
/projects active infrastructure
```

**Ответ:**
```
📋 Список проектов:

1. 🟢 Миграция ЦОД
   Статус: active | Прогресс: 45%
   ID: abc123

2. 🟢 Обновление ERP-системы
   Статус: active | Прогресс: 30%
   ID: def456
```

#### Детали проекта

```
/project abc123
```

**Ответ:**
```
📊 Проект: Миграция ЦОД

📝 Описание: Перенос серверной инфраструктуры
👤 Руководитель: Иванов А.С.
📅 Период: 2025-01-15 - 2025-06-30
📈 Прогресс: 45%
💰 Бюджет: 15000000 ₽ | Освоено: 6750000 ₽
📋 Задачи: 3/6 выполнено
🏷️ Статус: active
🎯 Приоритет: critical
```

#### Задачи проекта

```
/tasks abc123
```

**Ответ:**
```
📋 Задачи проекта:

1. ✅ Аудит текущей инфраструктуры
   Статус: done | ID: t1
   👤 Петров И.И.

2. 🔄 Монтаж серверных стоек
   Статус: in_progress | ID: t4
   👤 Волков Р.Н.
```

#### Статистика

```
/stats
```

**Ответ:**
```
📊 Статистика платформы:

🏢 Офисов: 3
📋 Проектов: 6 (активных: 4)
✅ Задач: 28 (выполнено: 15)
📈 Выполнение задач: 54%
```

---

## Примеры использования

### Интеграция с CRM системой

```javascript
// Получение списка активных проектов
async function getActiveProjects() {
  const response = await fetch('https://your-domain.com/api/v1/projects?status=active', {
    headers: {
      'X-API-Key': 'pk_your_api_key_here'
    }
  });
  const data = await response.json();
  return data.projects;
}

// Обновление статуса задачи
async function updateTaskStatus(taskId, status) {
  const response = await fetch(`https://your-domain.com/api/v1/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'pk_your_api_key_here'
    },
    body: JSON.stringify({ status, completed: status === 'done' })
  });
  return response.json();
}
```

### Обработка webhook'ов

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

app.post('/webhook', express.json(), (req, res) => {
  const signature = req.headers['x-webhook-secret'];
  const event = req.headers['x-webhook-event'];
  const payload = JSON.stringify(req.body);
  
  // Проверка подписи
  const expectedSignature = crypto
    .createHmac('sha256', 'your_webhook_secret')
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Обработка события
  if (event === 'task.completed') {
    console.log('Задача выполнена:', req.body.data);
    // Отправка уведомления, обновление CRM и т.д.
  }
  
  res.json({ ok: true });
});

app.listen(3000);
```

### Python пример

```python
import requests

API_KEY = 'pk_your_api_key_here'
BASE_URL = 'https://your-domain.com/api/v1'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Получение списка проектов
response = requests.get(f'{BASE_URL}/projects', headers=headers)
projects = response.json()['projects']

for project in projects:
    print(f"{project['name']} - {project['status']}")

# Обновление задачи
task_id = 'abc123'
response = requests.patch(
    f'{BASE_URL}/tasks/{task_id}/status',
    headers=headers,
    json={'status': 'done', 'completed': True}
)
```

---

## Коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Ошибка валидации |
| 401 | Недействительный API ключ |
| 403 | Недостаточно прав |
| 404 | Ресурс не найден |
| 429 | Превышен лимит запросов |
| 500 | Ошибка сервера |

---

## Rate Limiting

По умолчанию лимит составляет 1000 запросов в час на один API ключ.

**Заголовки ответа:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642249200
```

При превышении лимита возвращается код 429:
```json
{
  "error": "Превышен лимит запросов",
  "retryAfter": 3600
}
```

---

## Безопасность

### Рекомендации

1. **Храните API ключи безопасно**
   - Используйте переменные окружения
   - Не коммитьте ключи в репозиторий
   - Регулярно ротируйте ключи

2. **Используйте HTTPS**
   - Все запросы должны идти по HTTPS
   - Проверка SSL сертификатов

3. **Ограничивайте права**
   - Давайте только необходимые права
   - Используйте отдельные ключи для разных интеграций

4. **Мониторьте использование**
   - Проверяйте логи API запросов
   - Настраивайте алерты на подозрительную активность

---

**Версия**: 1.0  
**Обновлено**: 2025
