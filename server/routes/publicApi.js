const express = require('express');
const db = require('../database/db');
const { apiKeyAuth, requireApiPermission, logApiRequest } = require('../middleware/apiAuth');

const router = express.Router();

// Применяем middleware для всех маршрутов
router.use(apiKeyAuth);
router.use(logApiRequest);

// ============================================
// Health check
// ============================================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================
// Получение списка офисов
// ============================================
router.get('/offices', requireApiPermission('read:offices'), async (req, res) => {
  try {
    const offices = await db.query('SELECT id, name, description, color, icon, director FROM project_offices');
    res.json({ offices });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение списка портфелей
// ============================================
router.get('/portfolios', requireApiPermission('read:portfolios'), async (req, res) => {
  try {
    const { officeId } = req.query;
    let sql = 'SELECT id, name, description, type, office_id, strategic_goal FROM portfolios';
    const params = [];
    
    if (officeId) {
      sql += ' WHERE office_id = ?';
      params.push(officeId);
    }
    
    const portfolios = await db.query(sql, params);
    res.json({ portfolios });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение списка проектов
// ============================================
router.get('/projects', requireApiPermission('read:projects'), async (req, res) => {
  try {
    const { officeId, status, type, limit = 100, offset = 0 } = req.query;
    
    let sql = 'SELECT id, office_id, portfolio_id, name, type, status, priority, description, manager, start_date, end_date, progress, budget, spent FROM projects WHERE 1=1';
    const params = [];
    
    if (officeId) {
      sql += ' AND office_id = ?';
      params.push(officeId);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const projects = await db.query(sql, params);
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение проекта по ID
// ============================================
router.get('/projects/:id', requireApiPermission('read:projects'), async (req, res) => {
  try {
    const projects = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Проект не найден' });
    }
    
    const project = projects[0];
    
    // Загрузка связанных данных
    const [tasks, documents, artifacts] = await Promise.all([
      db.query('SELECT id, title, status, priority, assignee, due_date, completed FROM tasks WHERE project_id = ?', [project.id]),
      db.query('SELECT id, title, category, author, version FROM documents WHERE project_id = ?', [project.id]),
      db.query('SELECT id, title, type, author, version FROM artifacts WHERE project_id = ?', [project.id])
    ]);
    
    res.json({
      project: {
        ...project,
        tasks,
        documents,
        artifacts,
        tasksCount: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение задач проекта
// ============================================
router.get('/projects/:id/tasks', requireApiPermission('read:tasks'), async (req, res) => {
  try {
    const tasks = await db.query(
      'SELECT id, title, description, status, priority, assignee, due_date, completed FROM tasks WHERE project_id = ? ORDER BY created_at',
      [req.params.id]
    );
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение задачи по ID
// ============================================
router.get('/tasks/:id', requireApiPermission('read:tasks'), async (req, res) => {
  try {
    const tasks = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    
    res.json({ task: tasks[0] });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Обновление статуса задачи
// ============================================
router.patch('/tasks/:id/status', requireApiPermission('write:tasks'), async (req, res) => {
  try {
    const { status, completed } = req.body;
    
    if (!status && completed === undefined) {
      return res.status(400).json({ error: 'Укажите status или completed' });
    }
    
    let sql = 'UPDATE tasks SET ';
    const params = [];
    
    if (status) {
      sql += 'status = ?, ';
      params.push(status);
    }
    if (completed !== undefined) {
      sql += 'completed = ?, ';
      params.push(completed);
    }
    
    sql = sql.slice(0, -2); // Удаляем последнюю запятую
    sql += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.query(sql, params);
    
    res.json({ message: 'Задача обновлена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение документов проекта
// ============================================
router.get('/projects/:id/documents', requireApiPermission('read:documents'), async (req, res) => {
  try {
    const documents = await db.query(
      'SELECT id, title, category, description, author, version, created_at FROM documents WHERE project_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ documents });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение статистики
// ============================================
router.get('/stats/summary', requireApiPermission('read:stats'), async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM projects) as total_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'completed') as completed_projects,
        (SELECT COUNT(*) FROM tasks) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE completed = TRUE) as completed_tasks,
        (SELECT COUNT(*) FROM project_offices) as total_offices,
        (SELECT COUNT(*) FROM portfolios) as total_portfolios
    `);
    
    res.json({ stats: stats[0] });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============================================
// Получение пользователей
// ============================================
router.get('/users', requireApiPermission('read:users'), async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, login, name, email, role, office_id FROM users WHERE is_active = TRUE'
    );
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
