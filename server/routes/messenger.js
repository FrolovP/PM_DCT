const express = require('express');
const crypto = require('crypto');
const db = require('../database/db');
const { authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ============================================
// Получение интеграций с мессенджерами
// ============================================
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const integrations = await db.query('SELECT * FROM messenger_integrations ORDER BY created_at DESC');
    res.json({ integrations });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Создание интеграции с MAX
// ============================================
router.post('/max', authorize('admin'), [
  body('name').trim().notEmpty(),
  body('botToken').trim().notEmpty(),
  body('webhookUrl').optional().isURL()
], auditLog('create_max_integration', 'messenger_integrations'), async (req, res) => {
  try {
    const { name, botToken, webhookUrl } = req.body;
    const id = uuidv4();

    const config = {
      botToken,
      webhookUrl: webhookUrl || `${process.env.APP_URL || 'http://localhost:3001'}/api/messenger/max/webhook`,
      apiUrl: 'https://api.max.ru/bot/v1'
    };

    await db.query(
      'INSERT INTO messenger_integrations (id, name, type, config) VALUES (?, ?, ?, ?)',
      [id, name, 'max', JSON.stringify(config)]
    );

    res.status(201).json({ id, name, type: 'max', config });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Обновление интеграции
// ============================================
router.put('/:id', authorize('admin'), auditLog('update_integration', 'messenger_integrations'), async (req, res) => {
  try {
    const { name, config, is_active } = req.body;
    await db.query(
      'UPDATE messenger_integrations SET name = ?, config = ?, is_active = ? WHERE id = ?',
      [name, config ? JSON.stringify(config) : null, is_active !== undefined ? is_active : true, req.params.id]
    );
    res.json({ message: 'Интеграция обновлена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Удаление интеграции
// ============================================
router.delete('/:id', authorize('admin'), auditLog('delete_integration', 'messenger_integrations'), async (req, res) => {
  try {
    await db.query('DELETE FROM messenger_integrations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Интеграция удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Webhook для MAX бота
// ============================================
router.post('/max/webhook', express.json(), async (req, res) => {
  try {
    const { event, data } = req.body;
    
    // Проверка подписи (если настроена)
    const signature = req.headers['x-max-signature'];
    // TODO: Реализовать проверку подписи

    if (event === 'message_new') {
      await handleMaxMessage(data);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Ошибка webhook MAX:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Обработка сообщений от MAX
// ============================================
async function handleMaxMessage(data) {
  const { user_id, text, chat_id } = data;
  
  // Получение активной интеграции MAX
  const integrations = await db.query(
    "SELECT * FROM messenger_integrations WHERE type = 'max' AND is_active = TRUE LIMIT 1"
  );

  if (integrations.length === 0) {
    console.error('Нет активной интеграции MAX');
    return;
  }

  const integration = integrations[0];
  const config = JSON.parse(integration.config);

  // Парсинг команд
  const command = parseCommand(text);
  
  let responseText = '';

  switch (command.action) {
    case 'help':
      responseText = getHelpMessage();
      break;
    
    case 'projects':
      responseText = await getProjectsList(command.filters);
      break;
    
    case 'project':
      responseText = await getProjectDetails(command.projectId);
      break;
    
    case 'tasks':
      responseText = await getProjectTasks(command.projectId);
      break;
    
    case 'task':
      responseText = await getTaskDetails(command.taskId);
      break;
    
    case 'stats':
      responseText = await getStats();
      break;
    
    default:
      responseText = 'Неизвестная команда. Отправьте /help для списка доступных команд.';
  }

  // Отправка ответа
  await sendMaxMessage(config, chat_id || user_id, responseText);

  // Логирование сообщения
  await db.query(
    `INSERT INTO bot_messages (id, bot_id, user_id, message_text, message_type)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), integration.id, user_id, text, 'incoming']
  );

  await db.query(
    `INSERT INTO bot_messages (id, bot_id, user_id, message_text, message_type)
     VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), integration.id, user_id, responseText, 'outgoing']
  );
}

// ============================================
// Парсинг команд
// ============================================
function parseCommand(text) {
  const parts = text.trim().split(/\s+/);
  const command = parts[0].toLowerCase();

  if (command === '/help' || command === 'помощь') {
    return { action: 'help' };
  }

  if (command === '/projects' || command === 'проекты') {
    const filters = {};
    if (parts[1]) filters.status = parts[1];
    if (parts[2]) filters.type = parts[2];
    return { action: 'projects', filters };
  }

  if (command === '/project' || command === 'проект') {
    return { action: 'project', projectId: parts[1] };
  }

  if (command === '/tasks' || command === 'задачи') {
    return { action: 'tasks', projectId: parts[1] };
  }

  if (command === '/task' || command === 'задача') {
    return { action: 'task', taskId: parts[1] };
  }

  if (command === '/stats' || command === 'статистика') {
    return { action: 'stats' };
  }

  return { action: 'unknown' };
}

// ============================================
// Формирование сообщений
// ============================================
function getHelpMessage() {
  return `📋 Доступные команды:

/help - Список команд
/projects [status] [type] - Список проектов
/project <id> - Детали проекта
/tasks <project_id> - Задачи проекта
/task <task_id> - Детали задачи
/stats - Общая статистика

Примеры:
/projects active - Активные проекты
/projects active infrastructure - Инфраструктурные активные проекты
/project 123 - Проект с ID 123
/tasks 123 - Задачи проекта 123`;
}

async function getProjectsList(filters = {}) {
  try {
    let sql = 'SELECT id, name, status, priority, manager, progress FROM projects WHERE 1=1';
    const params = [];

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.type) {
      sql += ' AND type = ?';
      params.push(filters.type);
    }

    sql += ' ORDER BY created_at DESC LIMIT 10';

    const projects = await db.query(sql, params);

    if (projects.length === 0) {
      return '📭 Проекты не найдены';
    }

    let message = '📋 Список проектов:\n\n';
    projects.forEach((p, i) => {
      const statusEmoji = { planning: '📝', active: '🟢', paused: '⏸️', completed: '✅', cancelled: '❌' };
      message += `${i + 1}. ${statusEmoji[p.status] || '📌'} ${p.name}\n`;
      message += `   Статус: ${p.status} | Прогресс: ${p.progress}%\n`;
      message += `   ID: ${p.id}\n\n`;
    });

    return message;
  } catch (error) {
    return '❌ Ошибка получения списка проектов';
  }
}

async function getProjectDetails(projectId) {
  try {
    const projects = await db.query(
      'SELECT * FROM projects WHERE id = ? OR name LIKE ?',
      [projectId, `%${projectId}%`]
    );

    if (projects.length === 0) {
      return '❌ Проект не найден';
    }

    const project = projects[0];
    const tasks = await db.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed FROM tasks WHERE project_id = ?',
      [project.id]
    );

    return `📊 Проект: ${project.name}

📝 Описание: ${project.description || 'Не указано'}
👤 Руководитель: ${project.manager || 'Не указан'}
📅 Период: ${project.start_date || '?'} - ${project.end_date || '?'}
📈 Прогресс: ${project.progress}%
💰 Бюджет: ${project.budget} ₽ | Освоено: ${project.spent} ₽
📋 Задачи: ${tasks[0].completed}/${tasks[0].total} выполнено
🏷️ Статус: ${project.status}
🎯 Приоритет: ${project.priority}`;
  } catch (error) {
    return '❌ Ошибка получения деталей проекта';
  }
}

async function getProjectTasks(projectId) {
  try {
    const tasks = await db.query(
      'SELECT id, title, status, priority, assignee, completed FROM tasks WHERE project_id = ? ORDER BY created_at LIMIT 20',
      [projectId]
    );

    if (tasks.length === 0) {
      return '📭 Задачи не найдены';
    }

    let message = '📋 Задачи проекта:\n\n';
    tasks.forEach((t, i) => {
      const statusEmoji = { todo: '⬜', in_progress: '🔄', review: '👀', done: '✅', blocked: '🚫' };
      const checkmark = t.completed ? '✅' : '⬜';
      message += `${i + 1}. ${checkmark} ${t.title}\n`;
      message += `   Статус: ${t.status} | ID: ${t.id}\n`;
      if (t.assignee) message += `   👤 ${t.assignee}\n`;
      message += '\n';
    });

    return message;
  } catch (error) {
    return '❌ Ошибка получения задач';
  }
}

async function getTaskDetails(taskId) {
  try {
    const tasks = await db.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (tasks.length === 0) {
      return '❌ Задача не найдена';
    }

    const task = tasks[0];
    return `📋 Задача: ${task.title}

📝 Описание: ${task.description || 'Не указано'}
👤 Исполнитель: ${task.assignee || 'Не указан'}
📅 Срок: ${task.due_date || 'Не указан'}
🏷️ Статус: ${task.status}
🎯 Приоритет: ${task.priority}
${task.completed ? '✅ Выполнена' : '⬜ Не выполнена'}`;
  } catch (error) {
    return '❌ Ошибка получения деталей задачи';
  }
}

async function getStats() {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM projects) as total_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
        (SELECT COUNT(*) FROM tasks) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE completed = TRUE) as completed_tasks,
        (SELECT COUNT(*) FROM project_offices) as total_offices
    `);

    const s = stats[0];
    return `📊 Статистика платформы:

🏢 Офисов: ${s.total_offices}
📋 Проектов: ${s.total_projects} (активных: ${s.active_projects})
✅ Задач: ${s.total_tasks} (выполнено: ${s.completed_tasks})
📈 Выполнение задач: ${s.total_tasks > 0 ? Math.round((s.completed_tasks / s.total_tasks) * 100) : 0}%`;
  } catch (error) {
    return '❌ Ошибка получения статистики';
  }
}

// ============================================
// Отправка сообщения в MAX
// ============================================
async function sendMaxMessage(config, chatId, text) {
  try {
    const response = await fetch(`${config.apiUrl}/messages.send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.botToken}`
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });

    if (!response.ok) {
      console.error('Ошибка отправки сообщения в MAX:', await response.text());
    }
  } catch (error) {
    console.error('Ошибка отправки сообщения в MAX:', error);
  }
}

module.exports = router;
